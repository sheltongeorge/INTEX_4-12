import React, { useEffect, useState } from 'react';
import './CookieConsent.css';

const CookieConsent = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Check if user has already given consent
    const consentGiven = localStorage.getItem('cookie_consent');
    if (!consentGiven) {
      setVisible(true);
    }
  }, []);

  const acceptCookies = () => {
    // Set consent in localStorage
    localStorage.setItem('cookie_consent', 'accepted');
    // Set a demo cookie to show functionality
    document.cookie = 'gdpr_demo=accepted; max-age=31536000; path=/';
    setVisible(false);
  };

  const rejectCookies = () => {
    localStorage.setItem('cookie_consent', 'rejected');
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="cookie-banner">
      <div className="cookie-content">
        <p>
          This website uses cookies to enhance your experience. By continuing to
          visit this site you agree to our use of cookies.
        </p>
        <div className="cookie-buttons">
          <button onClick={acceptCookies} className="accept-btn">
            Accept
          </button>
          <button onClick={rejectCookies} className="reject-btn">
            Reject
          </button>
        </div>
      </div>
    </div>
  );
};

export default CookieConsent;
