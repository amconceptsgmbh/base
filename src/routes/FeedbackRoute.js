import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import PropTypes from 'prop-types';
import { Link, useHistory } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { XCircle } from 'react-bootstrap-icons';
import Header from '../components/Header';
import FeedbackModal from '../components/FeedbackModal';

function Feedback({ className }) {
  const { presumeTimeout } = useSelector(({ sm }) => ({ ...sm }));

  const [alertModal, setAlertModal] = useState(null);

  /*useEffect(() => {
    if (presumeTimeout === true) {
      setAlertModal(
        <div className="alert-modal-card text-center">
          <div className="d-flex justify-content-end">
            <button type="button" style={{ border: 'none', background: 'none' }} onClick={() => setAlertModal(null)}>
              <XCircle size={20} />
            </button>
          </div>
          <h4 className="mb-3">
            Die Sitzung wurde aufgrund von Inaktivität beendet.
          </h4>
          <p>
            Sie können gerne wieder anfangen.
            Oder geben Sie uns Feedback, damit wir diese aufregende neue Plattform verbessern können.
          </p>
          <div className="mt-2">
            <Link className="btn primary-accent me-2" to="/loading">Neu anfangen</Link>
            <button
              className="btn btn-outline-dark"
              onClick={() => { setAlertModal(null); }}
              type="button"
            >
              Feedback geben
            </button>
          </div>
        </div>,
      );
    }
  }, [presumeTimeout]);*/

  const history = useHistory();

  return (
    <div className={className}>
      {
        alertModal !== null
          ? (
            <div className="alert-modal">
              { alertModal }
            </div>
          )
          : null
      }
      <Header />
      <div className="container">
        <FeedbackModal onClose={() => history.push('/loading')} closeText="Neu anfangen" />
      </div>
    </div>
  );
}

Feedback.propTypes = {
  className: PropTypes.string.isRequired,
};
export default styled(Feedback)`


  .alert-modal {
    position: absolute;
    z-index: 1000;
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100vw;
    min-height: 100vh;
    background: rgba(0,0,0,0.3);
  }
  .alert-modal-card {
    background: #FFF;
    padding: 1.3rem;
    max-width: 25rem;
    border-radius: 5px;
  }
`;
