import ReactGA from 'react-ga4';
import React, { useEffect, useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import {
  BrowserRouter as Router,
  Switch,
  Route,
  withRouter,
  Link,
} from 'react-router-dom';
import { useSelector } from 'react-redux';
import { XCircle } from 'react-bootstrap-icons';
import DPChat from './routes/DPChat';
import Landing from './routes/Landing';
import UploadForm from './routes/UploadForm';
import Loading from './routes/Loading';
import Feedback from './routes/FeedbackRoute';
import ContentCardTest from './routes/ContentCardTest';
import OnBoarding from './routes/OnBoarding';
import LoadingSession from './routes/LoadingSession';

import BasicOnBoarding from './routes/BasicOnBoarding';
import OnBoardingExtended from './routes/OnBoardingExtended';
import OnBoardingv2 from './routes/OnBoardingv2';

// only init google analytics if a tracking ID is defined in env
const { REACT_APP_GA_TRACKING_ID } = process.env;
if (REACT_APP_GA_TRACKING_ID) {
  ReactGA.initialize(REACT_APP_GA_TRACKING_ID, { debug: true });
  console.log(`initializing google analytics with tracking ID ${REACT_APP_GA_TRACKING_ID}`);
} else console.warn('no google analytics tracking ID provided!');

// make GA aware of what pages people navigate to in react router
const LinkGAtoRouter = withRouter(({ history }) => {
  history.listen((location) => {
    ReactGA.set({ page: location.pathname });
  });
  return null;
});

function App() {
  const { error } = useSelector(({ sm }) => ({ ...sm }));
  const [ignoreError, setIgnoreError] = useState(false);
  // every time error changes, set ignore error to false
  useEffect(() => setIgnoreError(false), [error]);

  // send SM session ID to google analytics when we connect
  if (REACT_APP_GA_TRACKING_ID) {
    const sessionID = useSelector(({ sm }) => sm.sessionID);
    useEffect(() => {
      if (sessionID !== '') ReactGA.gtag('event', 'sm_session_id', { sm_session_id: sessionID });
    }, [sessionID]);
  }

  return (
    <Router>
      { error && !ignoreError
        ? (
          <div className="error-modal">
            <div className="error-modal-card">
              <div className="d-flex justify-content-end">
                <button className="btn-unstyled" type="button" onClick={() => setIgnoreError(true)}>
                  <XCircle size={22} />
                </button>
              </div>
              <div className="error-modal-inner">
                <h2 className="text-center mb-4">
                  Etwas ist schief gelaufen!
                </h2>
                <p className="mb-4">
                  Entschuldigung für die Unterbrechung.
                  Sie können gerne neu anfangen, oder geben Sie uns Feedback, damit wir uns verbessern können!
                </p>
                <div className="d-flex justify-content-center mb-4">
                  <Link to="/onboarding" className="btn btn-dark me-2">Neu verbinden</Link>
                  <Link to="/" className="btn btn-outline-dark">Zurück zur Hauptseite</Link>
                </div>
                <div className="d-flex justify-content-center">
                  <code className="text-danger">{error.msg}</code>
                </div>
              </div>
            </div>
          </div>
        ) : null}
      <Switch>
        <Route path="/content-card-test">
          <ContentCardTest />
        </Route>
        <Route path="/personal-data">
          <UploadForm />
        </Route>
        <Route path="/onboarding">
          {/* <OnBoarding /> */}
          {/* <BasicOnBoarding /> */}
          {/* <OnBoardingExtended /> */}
          <OnBoardingv2 />
        </Route>
        <Route path="/video">
          <DPChat />
        </Route>
        <Route path="/feedback">
          <Feedback />
        </Route>
        {/* / goes at the bottom */}
        <Route path="/">
          <Landing />
        </Route>
      </Switch>
      <LinkGAtoRouter />
    </Router>
  );
}

export default App;
