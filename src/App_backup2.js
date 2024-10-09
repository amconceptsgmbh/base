import logo from './logo.svg';
import './App.css';

import { useState, useEffect, useRef } from 'react';

import { default as languageCodesData } from './data/language-codes.json';
import { default as countryCodesData } from './data/country-codes.json';

const languageCodes = languageCodesData;
const countryCodes = countryCodesData;
//https://www.youtube.com/watch?v=JFfCDvKiJqU
//https://stackoverflow.com/questions/63644932/web-speech-recognition-automatically-disconnects

function App() {
    
  const recognitionRef = useRef();

  const [isActive, setIsActive] = useState(false);
  const [text, setText] = useState();
  const [batchText, setBatchText] = useState("");

  const [translation, setTranslation] = useState();
  const [voices, setVoices] = useState();
  const [language, setLanguage] = useState('de-DE');
  const [response, setResponse] = useState(null);


  const isSpeechDetected = false;

  const availableLanguages = Array.from(new Set(voices?.map(({ lang }) => lang)))
    .map(lang => {
      const split = lang.split('-');
      const languageCode = split[0];
      const countryCode = split[1];
      return {
        lang,
        label: languageCodes[languageCode] || lang,
        dialect: countryCodes[countryCode]
      }
    })
    .sort((a, b) => a.label.localeCompare(b.label));
  const activeLanguage = availableLanguages.find(({ lang }) => language === lang);

  const availableVoices = voices?.filter(({ lang }) => lang === language);
  const activeVoice =
    availableVoices?.find(({ name }) => name.includes('Google'))
    || availableVoices?.find(({ name }) => name.includes('Luciana'))
    || availableVoices?.[0];

  useEffect(() => {
    const voices = window.speechSynthesis.getVoices();
    if ( Array.isArray(voices) && voices.length > 0 ) {
      setVoices(voices);
      return;
    }
    if ( 'onvoiceschanged' in window.speechSynthesis ) {
      window.speechSynthesis.onvoiceschanged = function() {
        const voices = window.speechSynthesis.getVoices();
        setVoices(voices);
      }
    }
  }, []);

  function handleOnRecord() {
    if ( isActive ) {
      recognitionRef.current?.stop();
      setIsActive(false);
      return;
    }

    speak(' ');

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognitionRef.current = new SpeechRecognition();
    //recognitionRef.current.continuous = true;
    recognitionRef.current.lang = "de-DE";

    recognitionRef.current.onstart = function() {
      setIsActive(true);
    }

    recognitionRef.current.onend = function() {
      setIsActive(false);
    }

    recognitionRef.current.addEventListener('end', () => {
        // if user is still speaking continue/restart listening
        // else send message to server and mute your mic
        recognitionRef.current.start();
        if (condition) {
            recognitionRef.current.start();
        } else {
            handlePostBatchText();
        };
      });

    recognitionRef.current.onresult = async function(event) {
      const transcript = event.results[0][0].transcript;

      setText(transcript);

      // Append the new transcript to batchText
      setBatchText(prevBatchText => prevBatchText ? `${prevBatchText} ${transcript}` : transcript);

      //const results = {text: "Keine Antwort"};

      //setTranslation(results.text);

      //speak(results.text);
    }

    recognitionRef.current.start();
  }

  function speak(text) {
    const utterance = new SpeechSynthesisUtterance(text);
    
    if ( activeVoice ) {
      utterance.voice = activeVoice;
    };

    window.speechSynthesis.speak(utterance);
  }

  async function handlePostBatchText() {
    const jsonPayload = JSON.stringify({ body: batchText });

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
      setResponse(responseData);  // Update the state with the response data

    } catch (error) {
      console.error('Error:', error);
    }
  }

  // Use useEffect to trigger the speak function whenever response changes
  useEffect(() => {
    if (response?.body?.text) {
      speak(response.body.text);
    }
  }, [response]);

  return (
    <div className="mt-12 px-4">

      <div className="max-w-lg rounded-xl overflow-hidden mx-auto">
        
        <div className="bg-zinc-800 p-4 border-b-4 border-zinc-950">
          <p className="flex items-center gap-3">
            <span className={`block rounded-full w-5 h-5 flex-shrink-0 flex-grow-0 ${isActive ? 'bg-red-500' : 'bg-red-900'} `}>
              <span className="sr-only">{ isActive ? 'Actively recording' : 'Not actively recording' }</span>
            </span>
            <span className={`block rounded w-full h-5 flex-grow-1 ${isSpeechDetected ? 'bg-green-500' : 'bg-green-900'}`}>
              <span className="sr-only">{ isSpeechDetected ? 'Speech is being recorded' : 'Speech is not being recorded' }</span>
            </span>
          </p>
        </div>

        <div className="bg-zinc-800 p-4">
          <div className="grid sm:grid-cols-2 gap-4 max-w-lg bg-zinc-200 rounded-lg p-5 mx-auto">
            <p>
              <button
                className={`w-full h-full uppercase font-semibold text-sm  ${isActive ? 'text-white bg-red-500' : 'text-zinc-400 bg-zinc-900'} color-white py-3 rounded-sm`}
                onClick={handleOnRecord}
              >
                { isActive ? 'Stop' : 'Record' }
              </button>
            </p>
          </div>
        </div>
      </div>


      <div className="max-w-lg mx-auto mt-12">
        <p className="mb-4">
          Spoken Text: { text }
        </p>
        <p>
          Translation: { translation }
        </p>
        <p>
          Batch Text: {batchText}
        </p>
        <button
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded"
          onClick={handlePostBatchText}
        >
          Post Batch Text
        </button>
        {response && (
          <div className="mt-4">
            <p>Response from Backend:</p>
            <pre>{JSON.stringify(response, null, 2)}</pre>
            <p>Text to read: {JSON.stringify(response.body.text, null, 2)}</p>
          </div>
        )}
      </div>

    </div>
  )
}

export default App;
