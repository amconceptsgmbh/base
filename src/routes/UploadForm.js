import React from 'react';
import styled from 'styled-components';
import PropTypes from 'prop-types';
import Color from 'color';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { CameraVideoFill, MicFill } from 'react-bootstrap-icons';
import breakpoints from '../utils/breakpoints';
import Header from '../components/Header';
import { landingBackgroundImage, landingBackgroundColor } from '../config';
import { setRequestedMediaPerms } from '../store/sm';
import micFill from '../img/mic-fill.svg';
import videoFill from '../img/camera-video-fill.svg';

import { useHistory } from 'react-router-dom';
import { useEffect, useState } from 'react';


export let vorname = '';
export let nachname = '';
export let email = '';

function UploadForm({ className }) {
    const [fileName, setFileName] = useState('');
    const [datenschutzChecked, setDatenschutzChecked] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const history = useHistory();

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
        history.push('/onboarding');

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

    function allFieldsFilled() {
    const hasfilename = fileName;
    return hasfilename && datenschutzChecked;
    }

  return (
    <div className={className}>
      <div className="landing-wrapper">
        <Header />
        <div className="container d-flex">
          <div className="landing-container flex-grow-1">
            <div className="col-12 col-lg-6">
            <div className="row" style={{ marginBottom: '60px' }}>
                <div className="mt-0 mb-2">
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
                        <div className="checkbox-container">
                          <input
                            type="checkbox"
                            id="datenschutz"
                            name="datenschutz"
                            value="1"
                            onChange={(e) => setDatenschutzChecked(e.target.checked)}
                          />
                          <label htmlFor="datenschutz">
                            Ich habe die &nbsp;
                            <a href="https://www.amconcepts.de/impressum-datenschutz" target="_blank" rel="noopener noreferrer">Datenschutzerklärung</a>
                            {' '}
                            gelesen und akzeptiert.
                          </label>
                        </div>
                        <div>
                        <button className="btn primary-accent" type="submit" style={{ backgroundColor: '#3C3C3C', border: '2px solid #3C3C3C', padding: '10px 20px' }} disabled={!allFieldsFilled()}>{loading ? 'Startet Onboarding...' : 'Onboarding starten'}</button>
                        </div>
                    </form>
                </div>
            </div>

            </div>
          </div>
        </div>
      </div>
    </div> 
  );
}

UploadForm.propTypes = {
  className: PropTypes.string.isRequired,
};

export default styled(UploadForm)`
  .landing-wrapper {
    min-height: 100vh;

    background: ${landingBackgroundImage ? `url(${landingBackgroundImage})` : ''} ${landingBackgroundColor ? `${landingBackgroundColor};` : ''};
    background-size: auto 60%;
    background-repeat: no-repeat;
    background-position: bottom center;

    @media (min-width: ${breakpoints.lg}px) {
      background-size: 60% auto;
      background-position: right bottom;
    }
  }
  .landing-container {
    padding-top: 1rem;
    display: flex;

    &>div {
      background-color: ${Color(landingBackgroundColor).alpha(0.5)};
      backdrop-filter: blur(10px);
      border: 1px solid rgba(0,0,0,0.1);
      padding: 1rem;
      border-radius: 5px;

      @media (min-width: ${breakpoints.lg}px) {
        border: none;
      }
    }
  }
  .form-switch .form-check-input {
    min-width: 7rem;
    height: 3rem;
    display: flex;
    align-items: center;
    justify-content: space-between;


    &.mic-switch::before, &.mic-switch.status-checked::after {
        background-image: url(${micFill});
    }
    &.video-switch::before, &.video-switch.status-checked::after {
        background-image: url(${videoFill});
    }
    &.mic-switch.status-checked::before, &.video-switch.status-checked::before {
      background-image: none;
    }

    &.status-unchecked {
      &::after {
        content: 'OFF';
        color: #000;
        margin-right: 18%;
      }
      &::before {
        background-size: 60%;
        background-repeat: no-repeat;
        background-color: rgb(220, 220, 220);
        background-position: 45% center;
        content: '';
        display: block;

        border-radius: 50%;

        height: 80%;
        margin-left: 5%;
        aspect-ratio: 1;
        float: right;
      }
    }

    &.status-checked {
      &::before {
        content: 'ON';
        color: #FFF;
        margin-left: 22%;
      }

      &::after {
        background-size: 60%;
        background-repeat: no-repeat;
        background-color: #FFF;
        background-position: 55% center;
        content: '';
        display: block;

        border-radius: 50%;

        height: 80%;
        margin-right: 5%;
        aspect-ratio: 1;
        float: right;
      }
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
  .input-element-container {
  margin-bottom: 20px;
}

label {
  font-size: 16px;
  color: #3C3C3C;
}

input[type="text"],
input[type="file"],
input[type="checkbox"] {
  width: 100%;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 5px;
  font-size: 16px;
}

.blockS-container {
  margin-bottom: 20px;
}

.cv-button {
  background-color: #3C3C3C;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.cv-button:hover {
  background-color: #555;
}

#fileName {
  display: block;
  margin-top: 10px;
}

.checkbox-container {
    display: flex;
    align-items: center; /* Aligns the checkbox and label vertically */
    margin-bottom: 20px; /* Adds margin below for spacing */
    margin-top: 20px; /* Adds margin above to align with the input fields */
  }

.checkbox-container input[type="checkbox"] {
  margin-right: 10px; /* Space between checkbox and label */
  width: 20px; /* Width of checkbox */
  height: 20px; /* Height of checkbox */
}

.checkbox-container label {
  font-size: 14px;
  color: #3C3C3C;
  line-height: 1.5; /* Aligns label text vertically with checkbox */
}

.btn-primary {
  background-color: #3C3C3C;
  border: 2px solid #3C3C3C;
  color: white;
  padding: 10px 20px;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.btn-primary:disabled {
  background-color: #ccc;
  border-color: #ccc;
  cursor: not-allowed;
}

.btn-primary:hover {
  background-color: #555;
}

.input-element-container {
    margin-bottom: 20px;
  }
  
  label {
    font-size: 16px;
    color: #3C3C3C;
  }
  
  input[type="text"],
  input[type="file"],
  input[type="checkbox"] {
    width: 100%;
    padding: 10px;
    border: 1px solid #ccc;
    border-radius: 5px;
    font-size: 16px;
  }
  
  .blockS-container {
    margin-bottom: 20px;
  }
  
  .cv-button {
    background-color: #3C3C3C;
    color: white;
    border: none;
    padding: 10px 20px;
    border-radius: 5px;
    cursor: pointer;
    transition: background-color 0.3s ease;
  }
  
  .cv-button:hover {
    background-color: #555;
  }
  
  #fileName {
    display: block;
    margin-top: 10px;
  }
  
  .checkbox-container {
    display: flex;
    align-items: center;
    margin-bottom: 20px;
  }
  
  .checkbox-container input[type="checkbox"] {
    margin-right: 10px;
  }
  
  .checkbox-container label {
    font-size: 14px;
    color: #3C3C3C;
  }
  
  .btn-primary {
    background-color: #3C3C3C;
    border: 2px solid #3C3C3C;
    color: white;
    padding: 10px 20px;
    border-radius: 5px;
    cursor: pointer;
    transition: background-color 0.3s ease;
  }
  
  .btn-primary:disabled {
    background-color: #ccc;
    border-color: #ccc;
    cursor: not-allowed;
  }
  
  .btn-primary:hover {
    background-color: #555;
  }

`;
