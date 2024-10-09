import React from 'react';
import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';
import styled from 'styled-components';
import { Link, useLocation } from 'react-router-dom';
import {
  logo, logoAltText, transparentHeader, headerHeight, logoLink,
} from '../config';
import Controls from './Controls';
import ReloadButton from './ReloadButton';

function Header({
  className,
}) {
  const { pathname } = useLocation();
  const { connected, loading } = useSelector(({ sm }) => ({ ...sm }));
  return (
    <div className={className}>
      <div className="container">
        <div className="row">
          <div className="d-flex align-items-center justify-content-between w-100">
            <div className="d-flex align-items-center">
              {/* left align */}
              <Link to={logoLink} className="d-flex align-items-center logo-container">
                <img src={logo} className="logo position-relative" alt={logoAltText} />
              </Link>
              <h2 className="beta-text"><em>Beta &beta;</em></h2>
            </div>
            <div>
              {/* middle align */}
              <Controls />
            </div>
            <div>
              {/* right align */}
              <ReloadButton />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
Header.propTypes = {
  className: PropTypes.string.isRequired,
};

export default styled(Header)`
  position: relative;
  z-index: 20;
  top: 0;
  width: 100%;
  background-color: ${transparentHeader ? 'none' : '#FFFFFF'};

  & > .container > .row {
    height: ${headerHeight};
  }

  .logo-container {
    display: flex;
    align-items: center;
    text-decoration: none; /* Remove underline from the link */
  }

  .logo {
    margin-top: 9px;
    height: calc(0.7 * ${headerHeight}); /* Adjusted to lower the logo slightly */
    max-width: 30vw;

    @media (min-width: 768px) {
      height: calc(0.7 * ${headerHeight});
    }
  }

  .beta-text {
    margin-left: 8px; /* Spacing between logo and Beta text */
    margin-top: 0;
    font-size: calc(0.4 * ${headerHeight});
    color: inherit; /* Ensures the text color matches the surrounding text */
    text-decoration: none; /* Removes underline */
  }

  h2 {
    margin: 0;
    line-height: calc(0.8 * ${headerHeight}); /* Align text vertically */
  }

  .row {
    align-items: center;
  }
`;
