import React, {useEffect, useRef, useState } from "react";

const useTexttoSpeech = () => {
    const [language, setLanguage] = useState('de-DE');
    const [voices, setVoices] = useState();
    const [isSpeaking, setIsSpeaking] = useState(false);
    const utterance = useRef(null);
    const synth = window.speechSynthesis
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

    }, [])

    const speak = (text) => {
        utterance = new SpeechSynthesisUtterance(text);
    
        if ( activeVoice ) {
            utterance.voice = activeVoice;
        };

        synth.speak(utterance);
    }

    const speakingStatus = () => {
        setIsSpeaking(synth.speaking)
    }

    return {
        speak,
        speakingStatus,
        isSpeaking
    }
}

export default useTexttoSpeech;
