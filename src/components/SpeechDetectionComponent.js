import React, { useEffect } from 'react';

const SpeechDetectionComponent = () => {

  useEffect(() => {
    let isSpeaking = false; // Flag to track speaking status
    let logInterval = null; // Interval for logging
    let audioContext = null; // AudioContext instance

    const startSpeechDetection = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        console.log('Microphone access granted.');

        // Create AudioContext and nodes
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const source = audioContext.createMediaStreamSource(stream);
        const scriptProcessor = audioContext.createScriptProcessor(2048, 1, 1);

        // Connect nodes
        source.connect(scriptProcessor);
        scriptProcessor.connect(audioContext.destination);

        // Callback function to process audio data
        scriptProcessor.onaudioprocess = function(event) {
          const inputData = event.inputBuffer.getChannelData(0);
          const bufferLength = inputData.length;
          let totalAmplitude = 0;

          // Calculate the total amplitude of the audio signal
          for (let i = 0; i < bufferLength; i++) {
            totalAmplitude += Math.abs(inputData[i]);
          }

          // Calculate the average amplitude
          const averageAmplitude = totalAmplitude / bufferLength;

          // If average amplitude exceeds threshold, consider speaking
          const threshold = 0.01; // Adjust as needed
          isSpeaking = averageAmplitude > threshold;
        };

        // Start logging every 1 second
        logInterval = setInterval(() => {
          console.log('Speaking into the microphone:', isSpeaking);
        }, 1000); // Log every 1 second

      } catch (error) {
        console.error('Error accessing microphone:', error);
      }
    };

    // Check if getUserMedia is supported
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      console.log('getUserMedia supported.');
      startSpeechDetection();
    } else {
      console.error('getUserMedia not supported in this browser.');
    }

    // Clean up function
    return () => {
      // Clear interval and close audio context when component unmounts
      clearInterval(logInterval);
      if (audioContext) {
        audioContext.close().then(() => {
          console.log('Audio context closed.');
        }).catch((error) => {
          console.error('Error closing audio context:', error);
        });
      }
    };

  }, []);

  return (
    <div>
      <h1>Speech Detection</h1>
      {/* Add any UI components here */}
    </div>
  );
};

export default SpeechDetectionComponent;
