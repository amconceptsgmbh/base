import React, { useEffect, useRef, useState } from "react";

const useTexttoSpeech = () => {
  const [language, setLanguage] = useState('de-DE');
  const [voices, setVoices] = useState([]);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const utterance = useRef(null);
  const synth = useRef(window.speechSynthesis);

  useEffect(() => {
    const initVoices = () => {
      const voices = synth.current.getVoices();
      setVoices(voices);
    };

    initVoices();

    if ('onvoiceschanged' in window.speechSynthesis) {
      synth.current.onvoiceschanged = initVoices;
    }

    return () => {
      synth.current.onvoiceschanged = null;
    };
  }, []);

  const speak = (text) => {
    if (!synth.current) return; // Guard against synth not being initialized

    utterance.current = new SpeechSynthesisUtterance(text);

    const activeVoice =
      voices.find(({ name }) => name.includes('Google')) ||
      voices.find(({ name }) => name.includes('Luciana')) ||
      voices[0];

    if (activeVoice) {
      utterance.current.voice = activeVoice;
    }

    utterance.current.onstart = () => {
      setIsSpeaking(true);
    };

    utterance.current.onend = () => {
      setIsSpeaking(false);
    };

    synth.current.speak(utterance.current);
  };

  const speakingStatus = () => {
    return isSpeaking;
  };

  return {
    speak,
    speakingStatus,
    isSpeaking,
  };
};

export default useTexttoSpeech;
