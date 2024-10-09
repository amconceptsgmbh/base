import React, { useState, useEffect } from 'react';
import useSpeechToText from '../components/STTComponentMM';
import { vorname, nachname, email } from './OnBoardingExtended';
import { allowSpeaking, sessionIsFinished } from '../store/sm/index';

function SpeechToTextMM() {
  const [responseText, setResponseText] = useState('');
  const [micHasSignal, setMicHasSignal] = useState(false);
  const {
    isListening, transcript, startListening, stopListening,
  } = useSpeechToText({ continuous: true });
  // const { speak, isSpeaking } = useTexttoSpeech();
  // const { speak } = useTexttoSpeech();
  // const [isSpeaking, setIsSpeaking] = useState(false);
  const [micSignalBuffer, setMicSignalBuffer] = useState([false, false, false, false, false, false]);
  const [userStartedSpeaking, setUserStartedSpeaking] = useState(false);
  const [userStoppedSpeaking, setUserStoppedSpeaking] = useState(false);
  const [convHistory, setConvHistory] = useState([]);
  const [calledAI, setCalledAI] = useState(false);

  const [cvUploaded, setCvUploaded] = useState(false);
  const [calledSMPersonaInitial, setCalledSMPersonaInitial] = useState(false);

  let monitorInterval = null;
  const monitorUserSpeakingActivity = null;

  useEffect(() => {
    const postUrl = 'https://6mfdcjsjxk5pxkszgmrgk2mea40ycxpw.lambda-url.eu-central-1.on.aws/';

    const makePostRequest = async () => {
      const postData = {
        body: {
          email,
        },
      };

      try {
        const response = await fetch(postUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(postData),
        });

        if (response.ok) {
          const jsonResponse = await response.json();
          // console.log('Response received:', jsonResponse);
          // console.log('cv_uploaded: ' + jsonResponse.cv_uploaded);
          const { cv_uploaded } = jsonResponse;

          if (cv_uploaded) {
            // console.log('cvUploaded set to true');
            setCvUploaded(true);
          }
        } else {
          console.error('Failed to post data', response.status, response.statusText);
        }
      } catch (error) {
        console.error('Error posting data:', error);
      }
    };

    const makeInitialRequest = async () => {
      try {
        const response = await fetch('https://mlumt3ynqesbfmahzoqddakjqi0moxvf.lambda-url.eu-central-1.on.aws/', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            body: {
              text: '',
              vorname,
              nachname,
              email,
            },
          }),
        });

        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
      } catch (error) {
        console.error('Error:', error);
      }
    };

    const intervalId = setInterval(() => {
      // console.log('Value of cv uploaded is: ' + cvUploaded);
      if (!cvUploaded) {
        // console.log('(if) Value of cv uploaded is: ' + cvUploaded);
        makePostRequest();
      } else {
        // console.log('(else) Value of cv uploaded is: ' + cvUploaded);
        clearInterval(intervalId); // Clear the interval when cvUploaded is true
        makeInitialRequest(); // Make the initial request when cvUploaded is true
      }
    }, 2000);

    return () => clearInterval(intervalId); // Cleanup on unmount or when cvUploaded changes
  }, [cvUploaded]);

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
          const threshold = 10; // 10
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
      if (micStream) micStream.getTracks().forEach((track) => track.stop());
      if (audioContext) audioContext.close();
    };
  }, []);

  const updateMicSignalBuffer = (newSignal) => {
    setMicSignalBuffer((prevBuffer) => {
      const updatedBuffer = [...prevBuffer.slice(1), newSignal];
      return updatedBuffer;
    });
  };

  const addItemConvHist = (newItem) => {
    setConvHistory((prevItems) => [...prevItems, newItem]);
  };

  useEffect(() => {
    const checkUserSpeakingStatus = () => {
      if (micHasSignal && allowSpeaking == 'idle' && calledSMPersonaInitial) {
        setUserStartedSpeaking(true);
        setUserStoppedSpeaking(false);
      } else if (userStartedSpeaking) {
        if (micSignalBuffer.every((signal) => signal === false)) {
          setUserStoppedSpeaking(true);
          setUserStartedSpeaking(false);
        }
      }
    };

    const intervalId = setInterval(() => {
      // console.log('cvUploaded: ' + cvUploaded);
      // console.log('Soulmachines persona status: ' + allowSpeaking);
      if (allowSpeaking == 'speaking') {
        setCalledSMPersonaInitial(true);
      }
      updateMicSignalBuffer(micHasSignal);
      checkUserSpeakingStatus();
      // console.log('Iteration finished.');
      if (!isListening && userStartedSpeaking) {
        // console.log('Started listening.');
        startListening();
        setCalledAI(false);
      }
      if (userStoppedSpeaking && !calledAI) {
        // console.log('Stop listening executed.');
        stopSTTListening();
        setCalledAI(true);
      }
    }, 350); // Every 0.5 seconds 500

    return () => clearInterval(intervalId);
  }, [micHasSignal, micSignalBuffer, isListening, userStartedSpeaking, userStoppedSpeaking]);

  const stopSTTListening = async () => {
    if (isListening) {
      addItemConvHist(`User: ${transcript}`);
      // const jsonPayload = JSON.stringify({ body: transcript });
      const text = transcript;
      stopListening();
      try {
        const response = await fetch('https://mlumt3ynqesbfmahzoqddakjqi0moxvf.lambda-url.eu-central-1.on.aws/', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            body: {
              text,
              vorname,
              nachname,
              email,
            },
          }),
        });

        if (!response.ok) {
          throw new Error('Network response was not ok');
        }

        const responseData = await response.json();
        setResponseText(responseData.body.text);
        addItemConvHist(`Chat GPT: ${responseData.body.text}`);
        // setIsSpeaking(true);
        // speak(responseData.body.text);
        // setIsSpeaking(false);
      } catch (error) {
        console.error('Error:', error);
      }
    }
  };

  return (
    <div>
      <p>
        Transcript:
        {transcript}
      </p>
      <p>
        Response:
        {responseText}
      </p>
      <p>
        Computer is Listening:
        {isListening.toString()}
      </p>
      <p>Computer is Speaking: not recorded atm</p>
      <p>
        Mic Has Signal:
        {micHasSignal.toString()}
      </p>
      <p>
        Soulmachines persona status:
        {allowSpeaking}
      </p>
      <p>
        User Started Speaking:
        {userStartedSpeaking.toString()}
      </p>
      <p>
        User Stopped Speaking:
        {userStoppedSpeaking.toString()}
      </p>
      <p>
        Mic Signal Buffer:
        {micSignalBuffer.join(', ')}
      </p>
      <p>Conversation History: </p>
      <ul>
        {convHistory.map((item, index) => (
          <li key={index}>{item}</li>
        ))}
      </ul>
    </div>
  );
}

export default SpeechToTextMM;

// Verabschiedung + redirect + micro richtig aus
// Report
// Speechtime wieder etwas runter
// Server wieder endless run aufbauen
