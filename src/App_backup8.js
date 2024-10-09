import logo from './logo.svg';
import './App.css';

import React, { useState, useEffect, useRef } from 'react';

import useSpeechToText from './components/STT';
import useTexttoSpeech from './components/TTS';

//https://www.youtube.com/watch?v=JFfCDvKiJqU
//https://stackoverflow.com/questions/63644932/web-speech-recognition-automatically-disconnects
//https://www.youtube.com/watch?v=xJ_V55awyIo

function App() {
  const [responseText, setResponseText] = useState('');

  const {isListening, transcript, startListening, stopListening} = useSpeechToText({continuous: true})
  const {speak, isSpeaking} = useTexttoSpeech()
  

  const startStopSTT = () => {
    isListening ? stopSTTListening() : startSTTListening()
  }

  const startSTTListening = () => {
    startListening()
  }

  const stopSTTListening = async () => {
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
      
      // Assuming responseData has a property you want to display, like 'message'
      setResponseText(responseData.body.text);  // Update the state with a specific property
      speak(responseData.body.text);
    } catch (error) {
      console.error('Error:', error);
    }
    
  }

  return (
    <div>
      <button onClick={() => {startSTTListening()}}>Start</button>
      <button onClick={() => {stopSTTListening()}}>Stop</button>

      <p>Transcript: { transcript }</p>
      <p>Response: { responseText }</p>
      <p>Computer is Listening: { isListening.toString() }</p>
      <p>Computer is Speaking: { isSpeaking.toString() }</p>
    </div>
  )
}

export default App;
