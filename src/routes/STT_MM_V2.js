import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
//import { vorname, nachname, email } from './OnBoardingExtended';
import { vorname, nachname, email } from './UploadForm';

import TrafficLight from '../components/TrafficLight';

import { allowSpeaking, currentPersonaAnswer } from '../store/sm/index';
import { current } from '@reduxjs/toolkit';

let currentLight = 'yellow'; // Initial value

export const getCurrentLight = () => currentLight;
export const setCurrentLight = (newLight) => {
  currentLight = newLight;
};

function SpeechToTextMMV2() {
  const {
    intermediateUserUtterance,
    userSpeaking,
    lastUserUtterance,
    transcript,
  } = useSelector(({ sm }) => ({ ...sm }));
  const [responseText, setResponseText] = useState('');
  const [convHistory, setConvHistory] = useState([]);

  const [currentTranscript, setCurrentTranscript] = useState('');
  const [cvUploaded, setCvUploaded] = useState(false);
  const [lastUpdateTimestamp, setLastUpdateTimestamp] = useState(Date.now()); // State to store the last update timestamp
  const [elapsedTime, setElapsedTime] = useState(0); // State to store elapsed time in seconds
  const [blockUserSpeaking, setBlockUserSpeaking] = useState(true);
  //const [currentLight, setCurrentLight] = useState('yellow');


  const handleNewSpeechRecognitionResult = (newText) => {
    // Regex to check if a string starts with an uppercase letter and ends with a punctuation
    const sentenceRegex = /^[A-Z].*[.!?]$/;

    if (sentenceRegex.test(newText)) {
      setCurrentTranscript((prev) => `${prev} ${newText}`.trim());
    }
  };

   // Monitor `allowSpeaking` and set `setBlockUserSpeaking(false)` when it becomes 'speaking'
   useEffect(() => {
    const checkAllowSpeaking = () => {
      if (allowSpeaking === 'speaking') {
        setBlockUserSpeaking(false);
      }
    };
    
    const intervalId = setInterval(checkAllowSpeaking, 100); // Check every 100ms for the value of `allowSpeaking`

    return () => clearInterval(intervalId); // Cleanup on unmount
  }, [allowSpeaking]);  // Re-run this effect when `allowSpeaking` changes

  useEffect(() => {
    if (blockUserSpeaking === false && allowSpeaking === 'idle' && currentPersonaAnswer === '') {
      setCurrentLight('green');
      //currentLight = 'green';
    } else {
      setCurrentLight('yellow');
      //currentLight = 'yellow';
    };
  }, [elapsedTime]);

  useEffect(() => {
    if (currentTranscript === '' && blockUserSpeaking === false) {
      //setCurrentLight('green');
      handleNewSpeechRecognitionResult(lastUserUtterance);
    }
  }, [lastUserUtterance]);

  useEffect(() => {
    if (lastUserUtterance.length > 0 && currentTranscript !== '' && blockUserSpeaking === false) {
      //setCurrentLight('green');
      handleNewSpeechRecognitionResult(intermediateUserUtterance);
    }
  }, [intermediateUserUtterance]);

  // Update timestamp when currentTranscript changes
  useEffect(() => {
    setLastUpdateTimestamp(Date.now());
  }, [intermediateUserUtterance, lastUserUtterance]);

  // Calculate elapsed time since last update
  useEffect(() => {
    const intervalId = setInterval(() => {
      const currentTime = Date.now();
      setElapsedTime(((currentTime - lastUpdateTimestamp) / 1000).toFixed(2)); // In seconds, rounded to 2 decimal places
    }, 100); // Update every 0.5 seconds = 500

    return () => clearInterval(intervalId);
  }, [lastUpdateTimestamp]);

  // Check if elapsedTime exceeds the threshold elapsed time = 3.0
  useEffect(() => {
    const checkThreshold = () => {
      if (elapsedTime > 1.5 && cvUploaded && currentTranscript !== '' && allowSpeaking === 'idle' && blockUserSpeaking === false) {
        //setCurrentLight('red');
        setBlockUserSpeaking(true);
        stopSTTListening();
      }
    };

    const intervalId = setInterval(checkThreshold, 100); // Check every 0.5 seconds 500

    return () => clearInterval(intervalId);
  }, [elapsedTime]);

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
      const timestamp = Date.now();
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
              timestamp: timestamp
            },
          }),
        });
                
        //if (!response.ok) {
        //  throw new Error('Network response was not ok');
        //}

      } catch (error) {
        console.error('Error:', error);
      }

      //setBlockUserSpeaking(false);
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

  const addItemConvHist = (newItem) => {
    setConvHistory((prevItems) => [...prevItems, newItem]);
  };

  const stopSTTListening = async () => {
    addItemConvHist(`User: ${currentTranscript}`);
    // const jsonPayload = JSON.stringify({ body: transcript });
    const text = currentTranscript;
    setCurrentTranscript('');
    setElapsedTime(0);
    const timestamp = Date.now();
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
            timestamp: timestamp
          },
        }),
      });
      
      //const responseData = await response.json();
      //console.log(responseData);
      //console.log(responseData.body.output.text);
      //setResponseText(responseData.body.output.text);

      //if (!response.ok) {
      //  throw new Error('Network response was not ok');
      //}

      //addItemConvHist(`Chat GPT: ${responseData.body.text}`);
    } catch (error) {
      console.error('Error:', error);
    }
    //setBlockUserSpeaking(false);
  };

  return (
    <div>
      {/*<p>Current light: {currentLight}</p>
      <p>Block user speaking: {blockUserSpeaking.toString()}</p>
      <p>Soulmachines persona status: {allowSpeaking}</p>
      <p>elapsedTime: {elapsedTime}</p>
      <p>Current Persona Answer: {currentPersonaAnswer}</p>
      <div>
        <h1>Traffic Light </h1>
        <TrafficLight />
      </div>
      <p>elapsedTime: {elapsedTime}</p>
      <p>currentTranscript: {currentTranscript}</p>
      <p>Conv History: {convHistory}</p>
      <p>Soulmachines persona status: {allowSpeaking}</p>
      <p>Response: {responseText}</p>
      <p>Mic Signal Buffer: {micSignalBuffer.join(', ')}</p>
      <p>Conversation History: </p>
      <ul>
        {convHistory.map((item, index) => (
          <li key={index}>{item}</li>
        ))}
      </ul> */}
    </div>
  );
}


export default SpeechToTextMMV2;