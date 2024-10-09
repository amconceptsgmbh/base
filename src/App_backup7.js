import logo from './logo.svg';
import './App.css';

import React, { useState, useEffect, useRef } from 'react';

import useSpeechToText from './components/STT';

//https://www.youtube.com/watch?v=JFfCDvKiJqU
//https://stackoverflow.com/questions/63644932/web-speech-recognition-automatically-disconnects
//https://www.youtube.com/watch?v=xJ_V55awyIo

function App() {
  const [textInput, setTextInput] = useState('');

  const {isListening, transcript, startListening, stopListening} = useSpeechToText({continuous: true})
  
  const startStopListening = () => {
    isListening ? StopVoiceInput() : startListening()
  }

  const StopVoiceInput = () => {
    setTextInput(prevVal => prevVal + (transcript.length ? (prevVal.length ? ' ' : '') + transcript : ''))
    stopListening()
}

  return (
    <div style={{ display: 'block', margin:'0 auto', width: '400px', textAlign: 'center'}}>
        <button onClick={() => {startStopListening()}}>
           {isListening ? 'Stop Listening' : 'Speak'} 
        </button>
        <textarea 
        disabled={isListening}
        value={ isListening ? textInput + (transcript.length ? (textInput.length ? ' ' : '') + transcript : '') : textInput} onChange={(e) => { setTextInput(e.target.value) }}>

        </textarea>
    </div>
  )
}

export default App;
