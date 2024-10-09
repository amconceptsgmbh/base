import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import styled from 'styled-components';
import PropTypes from 'prop-types';
import {
  CameraVideoFill,
  CameraVideoOffFill,
  ChatSquareTextFill,
  Escape,
  Link45deg,
  Megaphone,
  MicFill,
  MicMuteFill,
  Share,
  SkipEndFill,
  ThreeDotsVertical,
  VolumeMuteFill,
  VolumeUpFill,
  X,
} from 'react-bootstrap-icons';
import ReactTooltip from 'react-tooltip';
import {
  stopSpeaking,
  setShowTranscript,
  disconnect,
  setOutputMute,
  setMicOn,
  setCameraOn,
  allowSpeaking, sessionIsFinished,
} from '../store/sm/index';
import mic from '../img/mic.svg';
import micFill from '../img/mic-fill.svg';
import breakpoints from '../utils/breakpoints';
import { primaryAccent } from '../globalStyle';
import FeedbackModal from './FeedbackModal';

///import { vorname, nachname, email } from '../routes/OnBoardingExtended';
import { vorname, nachname, email } from '../routes/UploadForm';

const sessionClosed = false;

const volumeMeterHeight = 24;
const volumeMeterMultiplier = 1.2;
const smallHeight = volumeMeterHeight;
const largeHeight = volumeMeterHeight * volumeMeterMultiplier;

function Controls({
  className,
}) {
  const {
    micOn,
    cameraOn,
    isOutputMuted,
    speechState,
    showTranscript,
    transcript,
    requestedMediaPerms,
    highlightMic,
    highlightMute,
    highlightChat,
    highlightCamera,
    highlightSkip,
    highlightMenu,
  } = useSelector((state) => ({ ...state.sm }));

  const dispatch = useDispatch();

  const [showFeedback, setShowFeedback] = useState(false);
  const [final, setFinal] = useState(false);

  // mic level visualizer
  // TODO: fix this
  // const typingOnly = requestedMediaPerms.mic !== true;
  // const [volume, setVolume] = useState(0);
  // useEffect(async () => {
  //   if (connected && typingOnly === false) {
  //     // credit: https://stackoverflow.com/a/64650826
  //     let volumeCallback = null;
  //     let audioStream;
  //     let audioContext;
  //     let audioSource;
  //     let unmounted = false;
  //     // Initialize
  //     try {
  //       audioStream = mediaStreamProxy.getUserMediaStream();
  //       audioContext = new AudioContext();
  //       audioSource = audioContext.createMediaStreamSource(audioStream);
  //       const analyser = audioContext.createAnalyser();
  //       analyser.fftSize = 512;
  //       analyser.minDecibels = -127;
  //       analyser.maxDecibels = 0;
  //       analyser.smoothingTimeConstant = 0.4;
  //       audioSource.connect(analyser);
  //       const volumes = new Uint8Array(analyser.frequencyBinCount);
  //       volumeCallback = () => {
  //         analyser.getByteFrequencyData(volumes);
  //         let volumeSum = 0;
  //         volumes.forEach((v) => { volumeSum += v; });
  //         // multiply value by 2 so the volume meter appears more responsive
  //         // (otherwise the fill doesn't always show)
  //         const averageVolume = (volumeSum / volumes.length) * 2;
  //         // Value range: 127 = analyser.maxDecibels - analyser.minDecibels;
  //         setVolume(averageVolume > 127 ? 127 : averageVolume);
  //       };
  //       // runs every time the window paints
  //       const volumeDisplay = () => {
  //         window.requestAnimationFrame(() => {
  //           if (!unmounted) {
  //             volumeCallback();
  //             volumeDisplay();
  //           }
  //         });
  //       };
  //       volumeDisplay();
  //     } catch (e) {
  //       console.error('Failed to initialize volume visualizer!', e);
  //     }

  //     return () => {
  //       console.log('closing down the audio stuff');
  //       // FIXME: tracking #79
  //       unmounted = true;
  //       audioContext.close();
  //       audioSource.close();
  //     };
  //   } return false;
  // }, [connected]);

  // bind transcrpt open and mute func to each other, so that
  // when we open the transcript we mute the mic
  const toggleKeyboardInput = () => {
    dispatch(setShowTranscript(!showTranscript));
    dispatch(setMicOn({ micOn: showTranscript }));
  };

  const makeSessionCloseRequest = async () => {
    try {
      const response = await fetch('https://mlumt3ynqesbfmahzoqddakjqi0moxvf.lambda-url.eu-central-1.on.aws/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          body: {
            text: 'This is the session close request',
            vorname,
            nachname,
            email,
          },
        }),
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const delay = async (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  const handleCloseSession = async () => {
    console.log('Starting 20 sec delay');
    await delay(5000);
    console.log('5 secs');
    await delay(5000);
    console.log('10 secs');
    await delay(5000);
    console.log('15 secs');
    await delay(5000);

    console.log('Finished 20 sec delay');
    makeSessionCloseRequest();
    dispatch(setMicOn({ micOn: false }));
    dispatch(setCameraOn({ cameraOn: false }));
    dispatch(disconnect());


  };

  useEffect(async () => {
    ReactTooltip.rebuild();
    // console.log('Session is finished:')
    // console.log(sessionIsFinished);

    if (sessionIsFinished && sessionClosed !== true && allowSpeaking === 'idle' && final === false) {
      console.log('Session finished. Redirecting from Controls!');
      setFinal(true);
      console.log('Not delay');
      await delay(5000);
      console.log('5 sec delay');
      handleCloseSession();
    }

    if (allowSpeaking === 'idle' && sessionClosed !== true) {
      // Do something when the term is "idle"
      // console.log("The term is 'idle'. You are allowed to talk.");
      // thunk.dispatch(actions.setMicOn({ micOn: true }));
      // allowSpeaking = true;
      dispatch(setMicOn({ micOn: true }));
      // console.log("Mic should be turned on.");
    } else if (allowSpeaking === 'speaking' && sessionClosed !== true) {
      // Do something else when the term is not "idle"
      // console.log("Mic should be turned off here.");
      // allowSpeaking = false;
      // thunk.dispatch(actions.setMicOn({ micOn: false }));
      dispatch(setMicOn({ micOn: false }));
      // console.log("Mic should be turned off.");
    }
  }, [sessionIsFinished, sessionClosed]);

  const iconSize = 24;

  const [showContextMenu, setShowContextMenu] = useState(false);

  const originalShareCopy = 'Share Experience';
  const [shareCopy, setShareCopy] = useState(originalShareCopy);

  const shareDP = async () => {
    const url = window.location;
    try {
      await navigator.share({ url });
    } catch {
      const type = 'text/plain';
      const blob = new Blob([url], { type });
      const data = [new window.ClipboardItem({ [type]: blob })];
      navigator.clipboard.write(data);
      setShareCopy('Link copied!');
      setTimeout(() => setShareCopy(originalShareCopy), 3000);
    }
  };

  return (<p></p>);
}

Controls.propTypes = { className: PropTypes.string.isRequired };

export default styled(Controls)`
  .context-controls {
    position: absolute;
    z-index: 100;
    background: rgba(0,0,0,0.3);
    left: 0;
    top: 0;

    &>div {
      width: 100vw;
      height: 100vh;

      margin-top: 4rem;
    }

    ul {
      padding: 1rem;

      list-style-type: none;

      background: #FFF;
      border: 1px solid rgba(0,0,0,0.1);
      border-radius: 5px;
      border-top-right-radius: 0;
      border-bottom-right-radius: 0;
      border-right: none;

      &>li {
        border-bottom: 1px solid rgba(0,0,0,0.4);
        padding: 0.5rem;
      }
      &>li:last-child {
        border: none;
        padding-bottom: 0;
      }
    }
  }
  .context-controls-trigger {
    position: relative;
    border: 1px solid red;
    z-index: 105;
  }
  .control-icon {
    border: none;
    background: none;

    padding: .4rem;
  }
  .form-control {
    opacity: 0.8;
    &:focus {
      opacity: 1;
    }
  }

  .interrupt {
    opacity: 1;
    transition: opacity 0.1s;
  }
  .interrupt-active {
    opacity: 0;
  }

  .volume-display {
    position: relative;
    top: ${volumeMeterHeight * 0.5}px;
    display: flex;
    align-items: flex-end;
    justify-content: start;
    min-width: ${({ videoWidth }) => (videoWidth <= breakpoints.md ? 21 : 32)}px;
    .meter-component {
      /* don't use media queries for this since we need to write the value
      in the body of the component */
      height: ${({ videoWidth }) => (videoWidth >= breakpoints.md ? largeHeight : smallHeight)}px;
      background-size: ${({ videoWidth }) => (videoWidth >= breakpoints.md ? largeHeight : smallHeight)}px;
      background-position: bottom;
      background-repeat: no-repeat;
      min-width: ${({ videoWidth }) => (videoWidth <= breakpoints.md ? 21 : 28)}px;
      position: absolute;
    }
    .meter-component-1 {
      background-image: url(${mic});
      z-index: 10;
    }
    .meter-component-2 {
      background-image: url(${micFill});
      z-index: 20;
    }
  }
  .alert-modal {
    position: absolute;
    z-index: 1000;
    display: flex;
    top: 0;
    left: 0;
    justify-content: center;
    align-items: center;
    width: 100vw;
    min-height: 100vh;
    background: rgba(0,0,0,0.3);
  }
  .alert-modal-card {
    background: #FFF;
    padding: 1.3rem;
    border-radius: 5px;
  }
`;
