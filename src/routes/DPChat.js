import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import PropTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';
import PersonaVideo from '../components/PersonaVideo';
import CameraPreview from '../components/CameraPreview';
import Captions from '../components/Captions';
import ContentCardDisplay from '../components/ContentCardDisplay';

import {
  disconnect,
  sendEvent,
  setMicOn,
  setVideoDimensions,
  allowSpeaking, sessionIsFinished,
} from '../store/sm/index';

import Header from '../components/Header';
import {
  disconnectPage,
  disconnectRoute,
} from '../config';
import TextInput from '../components/TextInput';
import STTFeedback from '../components/STTFeedback';

import SpeechToTextMM from './STT_MM';
import SpeechToTextMMV2 from './STT_MM_V2';

import { vorname, nachname, email } from './OnBoardingExtended';

function DPChat({
  className,
}) {
  const {
    connected,
    loading,
    disconnected,
    error,
    showTranscript,
    micOn,
    cameraOn,
    isOutputMuted,
    sessionID,
  } = useSelector(({ sm }) => ({ ...sm }));

  const dispatch = useDispatch();

  const history = useHistory();

  if (disconnected === true) {
    if (disconnectPage) {
      history.push(disconnectRoute);
    } else history.push('/');
  } else if (error !== null) history.push('/loading?error=true');
  else if (connected !== true) history.push('/');

  const handleResize = () => {
    if (connected) {
      dispatch(setVideoDimensions({
        videoWidth: window.innerWidth,
        videoHeight: window.innerHeight,
      }));
    }
  };

  const cleanup = () => {
    window.removeEventListener('resize', handleResize);
    if (connected === true && loading === false) dispatch(disconnect());
  };

  useEffect(() => {
    dispatch(sendEvent({ eventName: '', payload: {}, kind: 'init' }));
    handleResize();
    window.addEventListener('resize', handleResize);

    return () => cleanup();
  }, []);

  window.onbeforeunload = () => {
    cleanup();
  };

  return (
    <div className={className}>
      <div className="video-overlay">
        {/* Top row */}
        <div className="row">
          <Header />
          { cameraOn ? (
            <div className="row d-flex justify-content-end">
              <div className="col-auto">
                <div className="camera-preview">
                  <CameraPreview />
                </div>
              </div>
            </div>
          ) : <div /> }
        </div>
        {/* Middle row */}
        <div className="row d-flex justify-content-end align-items-center flex-grow-1 ps-3 pe-3" style={{ overflow: 'scroll' }}>
          {/* <div className="col col-md-5 d-flex align-items-end align-items-md-center">
            <div>
              <ContentCardDisplay />
            </div>
          </div> */}
          <div className="d-flex justify-content-center m-2">
            <SpeechToTextMMV2 />
          </div>
        </div>
        {/* Bottom row */}
        {/* <div>
          {isOutputMuted ? (
            <div className="row">
              <div className="col text-center">
                <Captions />
              </div>
            </div>
          ) : null}
          <div className="row">
            <div className="d-flex justify-content-center m-2">
              <STTFeedback />
            </div>
          </div>
          {(showTranscript === true || micOn === false) && (
            <div className="row justify-content-center">
              <div className="col-md-8 col-lg-5 p-3">
                <TextInput />
              </div>
            </div>
          )}
        </div> */}
      </div>
      {connected && <PersonaVideo />}
    </div>
  );
}

DPChat.propTypes = {
  className: PropTypes.string.isRequired,
};

export default styled(DPChat)`
  height: 100vh;

  .video-overlay {
    overflow: hidden;
    position: absolute;
    top: 0;
    right: 0;
    left: 0;

    z-index: 10;

    width: 100%;
    height: 100vh;
    display: flex;
    flex-direction: column;
  }

  .vertical-fit-container {
    flex: 0 1 auto;
    overflow-y: scroll;

    scrollbar-width: none;
    &::-webkit-scrollbar {
      display: none;
    }
  }

  /* Media query for small screens (smartphones) */
  @media screen and (max-width: 768px) {
    .camera-preview {
      /* Adjust position for smartphones */
      position: absolute; /* Or 'fixed' based on your layout */
      bottom: 5%;
      left: 12%;
      width: 100%; /* Stretch full width */
      height: auto; /* Adjust height as needed */
      z-index: 10; /* Ensure it stays on top if necessary */
    }

    /* Additional styling to make the layout mobile-friendly */
    .row {
      flex-direction: column; /* Stack elements vertically on mobile */
    }

}
`;
