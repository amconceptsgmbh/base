import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import PropTypes from 'prop-types';
import { useHistory } from 'react-router-dom';
import styled from 'styled-components';
import { ArrowLeftCircleFill, ArrowRightCircleFill, MicFill } from 'react-bootstrap-icons';
import { createScene } from '../store/sm';
import Header from '../components/Header';
import { headerHeight, landingBackgroundColor, landingBackgroundImage } from '../config';

export let vorname = '';
export let nachname = '';
export let email = '';

function Loading({
  className,
}) {
  const [fileName, setFileName] = useState('');
  const [datenschutzChecked, setDatenschutzChecked] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const history = useHistory();

  const {
    connected,
    // loading,
    // error,
    requestedMediaPerms,
    connectionState,
  } = useSelector(({ sm }) => (sm));

  const dispatch = useDispatch();

  const {
    percentageLoaded, name, currentStep, totalSteps,
  } = connectionState;

  const stateNameMap = {
    SearchingForDigitalPerson: 'Sucht nach Isabel',
    DownloadingAssets: 'Lädt Assets herunter',
    ConnectingToDigitalPerson: 'Verbinden mit Isabel',
  };
  // map name vals to plain english if we know the state name, otherwise just display the name as is
  const stateName = (name in stateNameMap) ? stateNameMap[name] : name;

  // // pull querystring to see if we are displaying an error
  // // (app can redirect to /loading on fatal err)
  // const useQuery = () => new URLSearchParams(useLocation().search);
  // const query = useQuery();

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
            console.log('Hello from if');
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

  function allFieldsFilled() {
    const hasfilename = fileName;
    return hasfilename && datenschutzChecked;
  }
  // Function to recursively check connection until connected or timeout
  const checkConnection = () => {
    setTimeout(() => {
      if (connected) {
        setLoading(false);
        console.log('Hello from if');
        console.log('Pushing to video');
        history.push('/video');
      } else {
        // Retry after a delay if not connected yet
        console.log('Hello from else');
        checkConnection();
      }
    }, 1000); // Retry every 1 second
  };
  const iconSize = 66;
  const [page, setPage] = useState(0);
  const pages = [
    <div>
      <div className="row justify-content-center">
        <div className="tutorial-icon mb-2">
          <MicFill size={iconSize} />
        </div>
      </div>
      <div className="row">
        <div className="d-flex align-items-center justify-content-between">
          <button className="btn-unstyled" type="button" style={{ opacity: 0, width: '44px' }}>
            {' '}
          </button>
          <h4>
            Bevor wir beginnen.
          </h4>
          <button className="btn-unstyled" type="button" onClick={() => setPage(page + 1)}>
            <ArrowRightCircleFill size={32} />
          </button>
        </div>
        <div className="mt-0 mb-2">
          {
            // show different modal if mic is off or if mic perms are denied
            requestedMediaPerms.mic === true && requestedMediaPerms.micDenied === false
              ? (
                <div>
                  <p>
                    Die Digital Person funktioniert am besten in einer ruhigen Umgebung, wenn Sie sich in der Nähe Ihres Mikrofons befinden und Ihre Kamera eingeschaltet ist.
                  </p>
                  <p>
                    Sprechen Sie klar und deutlich und geben Sie kurze Antworten.
                  </p>
                </div>
              )
              : (
                <div>
                  <p>
                    Die digitale Person funktioniert am besten, wenn Ihr Mikrofon eingeschaltet ist. Aktivieren Sie Ihr Mikrofon zu einem beliebigen Zeitpunkt während des Erlebnisses, indem Sie auf das Mikrofon-Symbol klicken und die Berechtigungen zulassen.
                  </p>
                  <p>
                    Denken Sie daran, deutlich und in kurzen Antworten zu sprechen.
                  </p>
                </div>
              )
          }
        </div>
      </div>
    </div>,
    <div>
      <div className="row justify-content-center">
        <div className="tutorial-icon mb-2">
          <div className="fs-4 fw-bold mt-2">
            &ldquo;Welche Erfahrung haben Sie bisher?&rdquo;
          </div>
        </div>
      </div>
      <div className="row">
        <div className="d-flex align-items-center justify-content-between">
          <button className="btn-unstyled" type="button" onClick={() => setPage(page - 1)}>
            <ArrowLeftCircleFill size={32} />
          </button>
          <h4>
            Über den Ablauf.
          </h4>
          <button className="btn-unstyled" type="button" onClick={() => setPage(page + 1)}>
            <ArrowRightCircleFill size={32} />
          </button>
        </div>
        <div className="mt-0 mb-2">
          Isabel wird mit Ihnen gleich ein Job Interview simulieren und Ihnen dabei verschiedene Fragen zu Ihrem Lebenslauf stellen.
        </div>
      </div>
    </div>,
    <div>
      <div className="row justify-content-center">
        <div className="tutorial-icon mb-2">
          <div className="fs-4 fw-bold mt-2">
            &ldquo;Welche Erfahrung haben Sie bisher?&rdquo;
          </div>
        </div>
      </div>
      <div className="row">
        <div className="d-flex align-items-center justify-content-between">
          <button className="btn-unstyled" type="button" onClick={() => setPage(page - 1)}>
            <ArrowLeftCircleFill size={32} />
          </button>
          <h4>
            Über den Ablauf.
          </h4>
          <button className="btn-unstyled" type="button" onClick={() => setPage(page + 1)}>
            <ArrowRightCircleFill size={32} />
          </button>
        </div>
        <div className="mt-0 mb-2">
          Isabel wird mit Ihnen gleich ein Job Interview simulieren und Ihnen dabei verschiedene Fragen zu Ihrem Lebenslauf stellen.
        </div>
      </div>
    </div>,
    <div>
      <div className="row justify-content-center">
        <div className="tutorial-icon tutorial-icon-dp mb-2" />
      </div>
      <div className="row">
        <div className="d-flex align-items-center justify-content-between">
          <button className="btn-unstyled" type="button" onClick={() => setPage(page - 1)}>
            <ArrowLeftCircleFill size={32} />
          </button>
          <h4>
            Sind Sie bereit?
          </h4>
          <button className="btn-unstyled" type="button" onClick={() => setPage(page + 1)}>
            <ArrowRightCircleFill size={32} />
          </button>
        </div>
        <div className="mt-0 mb-2">
          Dann lassen Sie uns beginnen - ich freue mich auf das Interview mit Ihnen!
        </div>
      </div>
    </div>,
    <div>
      <div className="row justify-content-center">
        <div className="tutorial-icon mb-2">
          <div className="fs-4 fw-bold mt-2">
            &ldquo;Bitte laden Sie hier Ihren Lebenslauf hoch.&rdquo;
          </div>
        </div>
      </div>
      <div className="row">
        <div className="d-flex align-items-center justify-content-between">
          <button className="btn-unstyled" type="button" onClick={() => setPage(page - 1)}>
            <ArrowLeftCircleFill size={32} />
          </button>
          <h4>
            Bitte laden Sie in dieser Form Ihren Lebenslauf hoch.
          </h4>
          <button className="btn-unstyled" type="button" style={{ opacity: 0, width: '44px' }}>
            {' '}
          </button>
        </div>
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
            <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'start' }}>
              <input
                type="checkbox"
                id="datenschutz"
                name="datenschutz"
                value="1"
                style={{ marginRight: '10px' }}
                onChange={(e) => setDatenschutzChecked(e.target.checked)}
              />
              <label htmlFor="datenschutz">
                Ich habe die
                <a href="https://www.amconcepts.de/impressum-datenschutz" target="_blank" rel="noopener noreferrer">Datenschutzerklärung</a>
                {' '}
                gelesen und akzeptiert
              </label>
            </div>
            <div>
              <button className="btn primary-accent m-2" type="submit" style={{ backgroundColor: '#3C3C3C', border: '2px solid #3C3C3C' }} disabled={!allFieldsFilled()}>{loading ? 'Startet Simulation...' : 'Simulation starten'}</button>
            </div>
          </form>
        </div>
      </div>
    </div>,
  ];

  // const [skip, setSkip] = useState(false);
  // const redirectToVideoOnConnect = () => {
  //  setSkip(true);
  // };
  // useEffect(() => {
  //  if (skip === true && connected === true) history.push('/video');
  // }, [connected, skip]);

  return (
    <div className={className}>
      <Header />
      <div className="container">
        <div className="row justify-content-center align-items-center">
          <div className="col-11 col-md-6 text-center mobile">
            <div className="row">
              {pages[page]}
            </div>
            <div className="row justify-content-center">
              <div>
                {
                  page < pages.length - 1
                    ? (
                      <button
                        className="btn primary-accent m-2"
                        type="button"
                        onClick={() => setPage(page + 1)}
                        style={{ backgroundColor: '#3C3C3C', border: '2px solid #3C3C3C' }}
                      >
                        Weiter
                      </button>
                    )
                    : null
                }
              </div>
            </div>
            <div className="row">
              <div />
            </div>
            <div className="row justify-content-center">
              <div>
                {/* eslint-disable-next-line react/no-array-index-key */}
                {pages.map((_, i) => (<div key={`${i}-${i === page}`} className="d-inline-block p-1">{i === page ? <div className="closed-dot" /> : <div className="open-dot" />}</div>))}
              </div>
            </div>
            {
              percentageLoaded < 100
                ? (
                  <div>
                    <div className="progress mt-1">
                      <div
                        className="progress-bar"
                        role="progressbar"
                        style={{ width: `${percentageLoaded}%` }}
                        aria-label={`${stateName} (${currentStep} von ${totalSteps - 1})`}
                        aria-valuenow={percentageLoaded}
                        aria-valuemin="0"
                        aria-valuemax="100"
                      />
                    </div>
                    { stateName !== ''
                      ? (
                        <pre>
                          {`${stateName} (${currentStep} von ${totalSteps - 1} Schritten)`}
                        </pre>
                      )
                      : null}
                  </div>
                )
                : null
            }
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
