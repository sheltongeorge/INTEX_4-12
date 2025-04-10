import PrivacyPolicy from "../components/gdpr-policy";
import { useNavigate } from 'react-router-dom';
import './gdpr-policy.css';

function PrivacyPolicyPage() {
  const navigate = useNavigate();

  const handleBack = () => {
    navigate('/');
  };

  return (
    <div className="privacy-policy-page d-flex flex-column min-vh-100">
      <header className="d-flex justify-content-between align-items-center p-4">
        <h1 className="fw-bold">CineNiche</h1>
        <button className="btn btn-outline-primary" onClick={handleBack}>
          Back to Home
        </button>
      </header>

      <main className="flex-grow-1 d-flex flex-column justify-content-center align-items-center text-center px-3">
        <PrivacyPolicy />
      </main>
    </div>
  );
}

export default PrivacyPolicyPage;