import React, { useState } from 'react';

export let vorname = '';
export let nachname = '';
export let email = '';

function UploadForm() {
  const [fileName, setFileName] = useState('');
  const [datenschutzChecked, setDatenschutzChecked] = useState(false);

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
      alert('Bitte akzeptieren Sie die Datenschutzerklärung.');
      return;
    }

    // Getting form values
    vorname = document.getElementById('vorname').value;
    nachname = document.getElementById('nachname').value;
    email = document.getElementById('email').value;
    const stelle = document.getElementById('stelle').value;

    console.log('Form Values:');
    console.log('Vorname:', vorname);
    console.log('Nachname:', nachname);
    console.log('Email:', email);
    console.log('Stelle:', stelle);

    // File upload to S3
    const fileInput = document.getElementById('fileInput');
    const file = fileInput.files[0];

    if (!file) {
      alert('Bitte wählen Sie eine Datei aus.');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    // Assume you have the '/get-signed-url' endpoint available
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

    console.log(url);

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
        // Redirect or perform any other action upon successful upload
      } else {
        alert('Error uploading file:', uploadResponse.statusText);
        console.error('Error uploading file:', uploadResponse.statusText);
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      alert('Error uploading file:', error.message);
    }
  }

  return (
    <>
      <style>
        {`
                .visually-hidden {
                    position: absolute;
                    width: 1px;
                    height: 1px;
                    padding: 0;
                    margin: -1px;
                    overflow: hidden;
                    clip: rect(0, 0, 0, 0);
                    border: 0;
                }
                `}
      </style>
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
          <button type="submit">Submit</button>
        </div>
      </form>
    </>
  );
}

export default UploadForm;
