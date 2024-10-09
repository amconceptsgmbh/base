import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import PropTypes from 'prop-types';
import { useHistory } from 'react-router-dom';
import styled from 'styled-components';
import { ArrowLeftCircleFill, ArrowRightCircleFill, MicFill } from 'react-bootstrap-icons';
import { createScene } from '../store/sm';
import Header from '../components/Header';
import { headerHeight, landingBackgroundColor, landingBackgroundImage } from '../config';

import UploadForm from '../components/MMForm';

export let vorname = '';
export let nachname = '';
export let email = '';

function Loading({
  className,
}) {
  const [fileName, setFileName] = useState('');
  const [datenschutzChecked, setDatenschutzChecked] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [skip, setSkip] = useState(false);
  const history = useHistory();

  const {
    connected,
    loading: smLoading,
    error: smError,
    requestedMediaPerms,
    connectionState,
  } = useSelector(({ sm }) => (sm));
  const dispatch = useDispatch();
  // create persona scene on button press on on mount, depending on device size
  const createSceneIfNotStarted = () => {
    if (loading === false && connected === false && error === null) {
      console.log('Creating scence...');
      dispatch(createScene());
    }
  };

  useEffect(() => {
    console.log('Loading, connected, error from createScenceIfNotStarted');
    console.log(loading);
    console.log(connected);
    console.log(error);
    createSceneIfNotStarted();
  }, []);

  useEffect(() => {
    if (connected) {
      history.push('/video');
    }
  }, [connected, history]);

  function toggleLabelVisibility(input) {
    const label = input.nextElementSibling;
    if (input.value) {
      label.classList.add('input-not-empty');
    } else {
      label.classList.remove('input-not-empty');
    }
  }

  function handleLebenslaufButtonClick() {
    document.getElementById('fileInput').click();
  }

  function handleFileInputChange(event) {
    const file = event.target.files[0];
    if (file) {
      setFileName(`Ausgewählte Datei: ${file.name}`);
    } else {
      setFileName('');
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (!datenschutzChecked) {
      setError('Bitte akzeptieren Sie die Datenschutzerklärung.');
      return;
    }

    vorname = document.getElementById('vorname').value;
    nachname = document.getElementById('nachname').value;
    email = document.getElementById('email').value;
    const stelle = document.getElementById('stelle').value;

    setLoading(true);
    setError('');

    const fileInput = document.getElementById('fileInput');
    const file = fileInput.files[0];

    if (!file) {
      setError('Bitte wählen Sie eine Datei aus.');
      setLoading(false);
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    const getUrlResponse = await fetch('https://2l2yala1ci.execute-api.eu-central-1.amazonaws.com/prod/getPreSignedURL', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        filename: file.name,
        vorname,
        nachname,
        email,
        stelle,
        contentType: file.type || 'application/octet-stream; charset=binary',
      }),
    });

    const { url } = await getUrlResponse.json();

    try {
      const uploadResponse = await fetch(url, {
        method: 'PUT',
        body: file,
        headers: {
          'Content-Type': file.type,
        },
      });

      if (uploadResponse.ok) {
        console.log('File uploaded successfully');
        // Start connection check after successful upload
        // createSceneIfNotStarted();
        dispatch(createScene());
        console.log('Loading, connected, error from form upload');
        console.log(loading);
        console.log(connected);
        console.log(error);

        let count = 0;
        const timeoutId = setInterval(() => {
          count++;
          if (connected) {
            // console.log("Hello from if");
            clearInterval(timeoutId);
            setLoading(false);
            history.push('/video');
          } else if (count >= 20) {
            // console.log("Hello from else");
            clearInterval(timeoutId);
            setLoading(false);
            setError('Error: Unable to establish connection');
          }
        }, 1000);
      } else {
        setError('Error uploading file:', uploadResponse.statusText);
        console.error('Error uploading file:', uploadResponse.statusText);
        setLoading(false);
      }
    } catch (error) {
      setError('Error uploading file:', error.message);
      console.error('Error uploading file:', error);
      setLoading(false);
    }
  }

  return (
    <div className={className}>
      <Header />
      <div className="container">
        <div className="row justify-content-center align-items-center">
          <div className="col-11 col-md-6 text-center mobile">
            <div className="row">
              <div>
                <h1>Form starts here</h1>
                <form id="uploadForm" onSubmit={handleSubmit}>
                  <div className="input-element-container">
                    <label htmlFor="vorname">Vorname</label>
                    <input
                      type="text"
                      id="vorname"
                      name="vorname"
                      required
                      placeholder=" "
                      onInput={(e) => toggleLabelVisibility(e.target)}
                    />
                  </div>
                  <div className="input-element-container">
                    <label htmlFor="nachname">Nachname</label>
                    <input
                      type="text"
                      id="nachname"
                      name="nachname"
                      required
                      placeholder=" "
                      onInput={(e) => toggleLabelVisibility(e.target)}
                    />
                  </div>
                  <div className="input-element-container">
                    <label htmlFor="vorname">Email</label>
                    <input
                      type="text"
                      id="email"
                      name="email"
                      required
                      placeholder=" "
                      onInput={(e) => toggleLabelVisibility(e.target)}
                    />
                  </div>
                  <div className="input-element-container">
                    <label htmlFor="vorname">Stelle</label>
                    <input
                      type="text"
                      id="stelle"
                      name="stelle"
                      required
                      placeholder="Für welche Stelle bewerben Sie sich?"
                      onInput={(e) => toggleLabelVisibility(e.target)}
                    />
                  </div>
                  {/* Other input fields */}
                  <div className="blockS-container">
                    <button type="button" id="LebenslaufButton" className="cv-button" onClick={handleLebenslaufButtonClick}>
                      Lebenslauf hochladen
                    </button>
                    <span id="fileName">{fileName}</span>
                    <input
                      type="file"
                      id="fileInput"
                      className="visually-hidden"
                      accept="application/pdf"
                      onChange={handleFileInputChange}
                    />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'start' }}>
                    <input
                      type="checkbox"
                      id="datenschutz"
                      name="datenschutz"
                      value="1"
                      style={{ marginRight: '10px' }}
                      onChange={(e) => setDatenschutzChecked(e.target.checked)}
                    />
                    <label htmlFor="datenschutz">Ich habe die Datenschutzerklärung gelesen und akzeptiert</label>
                  </div>
                  <div>
                    <button type="submit" disabled={loading}>{loading ? 'Loading...' : 'Submit'}</button>
                  </div>
                </form>
                {error && <div>{error}</div>}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

Loading.propTypes = {
  className: PropTypes.string.isRequired,
};

export default styled(Loading)`
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
