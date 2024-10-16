import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import styled from 'styled-components';
import PropTypes from 'prop-types';
// import { CameraVideoOff } from 'react-bootstrap-icons';
import Webcam from 'react-webcam';
import { mediaStreamProxy } from '../proxyVideo';

import ReloadButton from './ReloadButton'; // Adjust the path as needed
import TrafficLight from './TrafficLight';


function CameraPreview({ connected, className, cameraOn }) {
  const videoRef = React.createRef();
  const stream = mediaStreamProxy.getUserMediaStream();

  console.log(stream);

  //const [currentLight, setCurrentLight] = useState('yellow');


  useEffect(() => {
    if (stream !== null && mediaStreamProxy.videoOff === false) {
      // display webcam preview in video elem
      console.log('Hello from useEffect video elem');
      videoRef.current.srcObject = stream;
    }
  }, [connected]);

  // disable camera preview if camera is off
  // in the future, if smwebsdk supports toggling the camera on and off, remove this line
  if (cameraOn === false) return null;

  return (
    <div className={className}>
      {/* NOTE: toggleVideo behavior is not supported by smwebsdk so it's not recommended */}
      {/* <button onClick={mediaStreamProxy.toggleVideo} type="button" className="video-button"> */}
      {/* <div className="video-button">
        <video
          ref={videoRef}
          muted
          autoPlay
          playsInline
          className={cameraOn ? null : 'd-none'}
        />
        { cameraOn ? null : <CameraVideoOff /> }
      </div>/*}
      {/*</button> */}
      <Webcam />
      <div>
        <TrafficLight />
      </div>
    </div>
  );
}

CameraPreview.propTypes = {
  connected: PropTypes.bool.isRequired,
  className: PropTypes.string.isRequired,
  cameraOn: PropTypes.bool.isRequired,
};

const StyledCameraPreview = styled(CameraPreview)`
  display: ${({ connected }) => (connected ? '' : 'none')};
  align-items: center;
  height: ${({ size }) => size || 10}rem;

  .video-button {
    display: flex;
    justify-content: center;
    align-items: center;

    padding: 0;
    height: ${({ size }) => size || 10}rem;
    aspect-ratio: ${({ cameraWidth, cameraHeight }) => cameraWidth / cameraHeight};

    border-radius: 3px;
    background: rgba(0,0,0,0.2);
    border: ${({ cameraOn }) => (cameraOn ? 'none' : '1px solid gray')};
  }

  video {
    height: ${({ size }) => size || 10}rem;
    transform: rotateY(180deg);
    aspect-ratio: ${({ cameraWidth, cameraHeight }) => cameraWidth / cameraHeight};
    border-radius: 10px;
    z-index: 20;
  }
`;

const mapStateToProps = ({ sm }) => ({
  connected: sm.connected,
  cameraOn: sm.cameraOn,
  cameraWidth: sm.cameraWidth,
  cameraHeight: sm.cameraHeight,
});

export default connect(mapStateToProps)(StyledCameraPreview);
