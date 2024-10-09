import React, { useState, useEffect } from 'react';
import useSpeechToText from './components/STT';
import useTexttoSpeech from './components/TTS';

function App() {
  const [responseText, setResponseText] = useState('');
  const [micHasSignal, setMicHasSignal] = useState(false); // State to track microphone signal
  const { isListening, transcript, startListening, stopListening } = useSpeechToText({ continuous: true });
  const { speak, isSpeaking } = useTexttoSpeech();

  let monitorInterval = null; // Define monitorInterval outside of useEffect

  useEffect(() => {
    let micStream = null;
    let audioContext = null;
    let analyser = null;
    let microphoneNode = null;

    // Function to handle microphone access and input level monitoring
    const monitorMicrophone = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        micStream = stream;

        // Setup audio context and nodes for input level monitoring
        audioContext = new AudioContext();
        analyser = audioContext.createAnalyser();
        microphoneNode = audioContext.createMediaStreamSource(stream);
        microphoneNode.connect(analyser);

        // Monitor microphone input level
        analyser.fftSize = 256; // Adjust FFT size as needed
        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);

        monitorInterval = setInterval(() => {
          analyser.getByteFrequencyData(dataArray);

          // Example: Calculate average volume level
          const averageVolume = dataArray.reduce((acc, val) => acc + val, 0) / bufferLength;

          // Example threshold: Adjust as per your needs
          const threshold = 10;

          // Determine if microphone signal is above threshold
          const hasSignal = averageVolume > threshold;
          setMicHasSignal(hasSignal);

        }, 100); // Check every 0.1 seconds

      } catch (error) {
        console.error('Error accessing microphone:', error);
      }
    };

    // Start monitoring microphone
    monitorMicrophone();

    return () => {
      // Cleanup function to stop monitoring and release resources
      clearInterval(monitorInterval);
      if (micStream) micStream.getTracks().forEach(track => track.stop());
      if (audioContext) audioContext.close();
    };

  }, []);

  const startConversationProcess = () => {
    console.log('Test');
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
        console.log('Success:', responseData);

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
    </div>
  );
}

export default App;
