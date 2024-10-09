import React, { useState, useEffect } from 'react';
import { getCurrentLight } from '../routes/STT_MM_V2';

const TrafficLight = () => {
  const [currentLight, setCurrentLightState] = useState(getCurrentLight()); // Initialize with the current value
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768); // Determine if it's mobile

  useEffect(() => {
    const intervalId = setInterval(() => {
      setCurrentLightState(getCurrentLight()); // Update the local state based on the latest value
    }, 100); // Check every 100ms or adjust as needed

    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768); // Update based on screen width
    };

    window.addEventListener('resize', handleResize); // Listen to resize events

    return () => {
      clearInterval(intervalId); // Cleanup on component unmount
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const greenColor = currentLight === 'green' ? 'green' : 'grey';
  const yellowColor = currentLight === 'yellow' ? 'yellow' : 'grey';

  const containerStyle = {
    display: 'flex',
    flexDirection: isMobile ? 'column' : 'row', // Stack vertically on mobile
    position: isMobile ? 'absolute' : 'relative',
    right: isMobile ? '25%' : 'auto',
    top: isMobile ? '50%' : 'auto',
    transform: isMobile ? 'translateY(-50%)' : 'none',
    justifyContent: 'center',
    alignItems: 'center',
    gap: '10px',
  };

  return (
    <div style={containerStyle}>
      <div style={{ ...styles.circle, backgroundColor: greenColor, boxShadow: greenColor !== 'grey' ? '0 0 10px green' : 'none' }} />
      <div style={{ ...styles.circle, backgroundColor: yellowColor, boxShadow: yellowColor !== 'grey' ? '0 0 10px yellow' : 'none' }} />
    </div>
  );
};

const styles = {
  circle: {
    width: '30px',
    height: '30px',
    borderRadius: '50%',
    border: 'none', //border: '2px solid black',
    transition: 'background-color 0.3s, box-shadow 0.3s', // Smooth transitions when switching colors
  },
};

export default TrafficLight;
