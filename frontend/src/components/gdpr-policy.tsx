import './gdpr-policy.css';

const PrivacyPolicy = () => {
  return (
    <div className="privacy-container">
      <div className="privacy-header">
        <div className="header-overlay">
          <h1>CineNiche Privacy Policy</h1>
          <p className="last-updated">Last updated: April 9, 2025</p>
        </div>
      </div>
      
      <div className="privacy-content">
        <div className="intro-box">
          <p>
            At CineNiche, we value your privacy and are committed to protecting
            your personal data. This privacy policy explains how we collect,
            use, and safeguard your information when you use our platform.
          </p>
        </div>

        <section>
          <h2>1. Information We Collect</h2>
          <div className="section-content">
            <ul>
              <li>
                <span className="highlight">Personal details:</span> Name, email
                address, username
              </li>
              <li>
                <span className="highlight">Usage data:</span> Browsing history
                on our website
              </li>
              <li>
                <span className="highlight">Preferences:</span> Movie ratings
                and favorites
              </li>
              <li>
                <span className="highlight">Content:</span> Comments and reviews
                you post
              </li>
            </ul>
          </div>
        </section>

        <section>
          <h2>2. How We Collect Your Data</h2>
          <div className="section-content">
            <ul>
              <li>When you register an account</li>
              <li>When you rate or review movies</li>
              <li>Through your interactions with other users</li>
              <li>Via cookies and similar technologies</li>
            </ul>
          </div>
        </section>

        <section>
          <h2>3. How We Use Your Data</h2>
          <div className="section-content">
            <ul>
              <li>To provide personalized movie recommendations</li>
              <li>To improve our platform and services</li>
              <li>To analyze user behavior and enhance content</li>
            </ul>
          </div>
        </section>

        <section>
          <h2>4. Your Privacy Rights</h2>
          <div className="section-content">
            <div className="rights-grid">
              <div className="rights-item">
                <h3>Access</h3>
                <p>Request copies of your personal data</p>
              </div>
              <div className="rights-item">
                <h3>Rectification</h3>
                <p>Correct inaccurate information</p>
              </div>
              <div className="rights-item">
                <h3>Erasure</h3>
                <p>Request deletion of your data</p>
              </div>
              <div className="rights-item">
                <h3>Restriction</h3>
                <p>Limit how we process your data</p>
              </div>
            </div>
          </div>
        </section>

        <section>
          <h2>5. Contact Us</h2>
          <div className="section-content contact-section">
            <p>If you have questions about this privacy policy or your data:</p>
            <div className="contact-info">
              <p>
                <span className="highlight">Email:</span> privacy@cineniche.com
              </p>
              <p>
                <span className="highlight">Address:</span> CineNiche
                Headquarters, Provo, UT
              </p>
            </div>
          </div>
        </section>
      </div>

      <footer>
        <p>© 2025 CineNiche. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default PrivacyPolicy;
