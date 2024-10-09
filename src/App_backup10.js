import React, { useState, useEffect } from 'react';
import useSpeechToText from './components/STT';
import useTexttoSpeech from './components/TTS';

function App() {
  const [responseText, setResponseText] = useState('');
  const [micHasSignal, setMicHasSignal] = useState(false);
  const { isListening, transcript, startListening, stopListening } = useSpeechToText({ continuous: true });
  const { speak, isSpeaking } = useTexttoSpeech();
  const [micSignalArray, setMicSignalArray] = useState([false, false, false, false, false]);
  const [userStartedSpeaking, setUserStartedSpeaking] = useState(false);
  const [userStoppedSpeaking, setUserStoppedSpeaking] = useState(false);

  let monitorInterval = null;
  let monitorUserSpeakingActivity = null;

  useEffect(() => {
    let micStream = null;
    let audioContext = null;
    let analyser = null;
    let microphoneNode = null;

    const monitorMicrophone = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        micStream = stream;

        audioContext = new AudioContext();
        analyser = audioContext.createAnalyser();
        microphoneNode = audioContext.createMediaStreamSource(stream);
        microphoneNode.connect(analyser);

        analyser.fftSize = 256;
        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);

        monitorInterval = setInterval(() => {
          analyser.getByteFrequencyData(dataArray);

          const averageVolume = dataArray.reduce((acc, val) => acc + val, 0) / bufferLength;
          const threshold = 10;
          const hasSignal = averageVolume > threshold;
          setMicHasSignal(hasSignal);

        }, 100);

      } catch (error) {
        console.error('Error accessing microphone:', error);
      }
    };

    monitorMicrophone();

    return () => {
      clearInterval(monitorInterval);
      if (micStream) micStream.getTracks().forEach(track => track.stop());
      if (audioContext) audioContext.close();
    };

  }, []);

  const updateMicSignalArray = (newSignal) => {
    setMicSignalArray(prevArray => {
      const updatedArray = [...prevArray.slice(1), newSignal];
      return updatedArray;
    });
  };

  useEffect(() => {
    const checkUserSpeakingStatus = () => {
      if (isListening && micHasSignal) {
        setUserStartedSpeaking(true);
        setUserStoppedSpeaking(false);
      } else if (userStartedSpeaking && !micSignalArray.includes(true)) {
        setUserStoppedSpeaking(true);
        setUserStartedSpeaking(false);
      }
    };

    checkUserSpeakingStatus();
  }, [micSignalArray, isSpeaking, micHasSignal, userStartedSpeaking]);

  const startConversationProcess = () => {
    if (!isSpeaking && !isListening) {
      startListening();
      monitorUserSpeakingActivity = setInterval(() => {
        if (isListening) {
          updateMicSignalArray(micHasSignal);
        }
      }, 1000);
    }
  };

  const startSTTListening = () => {
    startListening();
  };

  const stopSTTListening = async () => {
    if (isListening) {
      const jsonPayload = JSON.stringify({ body: transcript });
      stopListening();
      try {
        const response = await fetch('http://localhost:8000/call-chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: jsonPayload
        });

        if (!response.ok) {
          throw new Error('Network response was not ok');
        }

        const responseData = await response.json();
        setResponseText(responseData.body.text);
        speak(responseData.body.text);
      } catch (error) {
        console.error('Error:', error);
      }
    }
  };

  return (
    <div>
      <button onClick={startConversationProcess}>Start conversation process</button>
      <button onClick={startSTTListening}>Start</button>
      <button onClick={stopSTTListening}>Stop</button>

      <p>Transcript: {transcript}</p>
      <p>Response: {responseText}</p>
      <p>Computer is Listening: {isListening.toString()}</p>
      <p>Computer is Speaking: {isSpeaking.toString()}</p>
      <p>Mic Has Signal: {micHasSignal.toString()}</p>
      <p>User Started Speaking: {userStartedSpeaking.toString()}</p>
      <p>User Stopped Speaking: {userStoppedSpeaking.toString()}</p>
    </div>
  );
}

export default App;
