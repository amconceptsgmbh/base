import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import PropTypes from 'prop-types';
import { useHistory } from 'react-router-dom';
import styled from 'styled-components';
import { createScene } from '../store/sm';
import Header from '../components/Header';
import { headerHeight, landingBackgroundColor, landingBackgroundImage } from '../config';

function LoadingSession({
  className,
}) {
  const {
    connected,
    loading,
    error,
    requestedMediaPerms,
    connectionState,
  } = useSelector(({ sm }) => (sm));
  const dispatch = useDispatch();

  // // pull querystring to see if we are displaying an error
  // // (app can redirect to /loading on fatal err)
  // const useQuery = () => new URLSearchParams(useLocation().search);
  // const query = useQuery();

  // create persona scene on button press on on mount, depending on device size
  const createSceneIfNotStarted = () => {
    console.log('Loading, connected, error from createScenceIfNotStarted');
    console.log(loading);
    console.log(connected);
    console.log(error);

    console.log('It works!!!');
    dispatch(createScene());
    // Inserting a brief time delay of 1 second (1000 milliseconds)

    setTimeout(() => {
      history.push('/video');
      console.log('/video got called!!!');
    }, 2000); // Change the delay time as needed 1000 = 1 second
  };

  const history = useHistory();

  useEffect(() => {
    createSceneIfNotStarted();
  }, []);

  useEffect(() => {
    console.log('Loading, connected, error from useEffect after history');
    console.log(loading);
    console.log(connected);
    console.log(error);
    history.push('/video');
  }, [connected]);

  return (
    <div><h4>Hello World</h4></div>
  );
}

LoadingSession.propTypes = {
  className: PropTypes.string.isRequired,
};

export default styled(LoadingSession)`
  background: ${landingBackgroundColor};
  background-size: contain;
  background-repeat: no-repeat;
  background-position: center bottom;

  width: 100vw;
  height: 100vh;
  color: #3C3C3C;

  &>.container>.row {
    height: calc(100vh - ${headerHeight});
  }
  .mobile {
    @media (max-width: 400px) {
      width: 300px;
    }
  .connected-button {
    background-color: #3C3C3C;
    border: 2px solid #3C3C3C;
  }

  .unconnected-button {
    font-size: 14px;
    font-family: "Helvetica Neue";
  }

  .tutorial-icon {
    width: 180px;
    height: 180px;
    aspect-ratio: 1;
    border-radius: 50%;

    display: flex;
    align-items: center;
    justify-content: center;

    background-color: #EAEAEA;
  }
  .tutorial-icon-dp {
    background-image: url(${landingBackgroundImage});
    background-size: cover;
    background-position: bottom center;
  }
  .open-dot {
    border: 2px solid #3C3C3C;
    width: 8px;
    height: 8px;
    border-radius: 50%;
  }
  .closed-dot {
    border: 2px solid #3C3C3C;
    background: #3C3C3C;
    width: 8px;
    height: 8px;
    border-radius: 50%;
  }
`;
