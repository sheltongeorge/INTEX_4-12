import PrivacyPolicy from "../components/gdpr-policy";
// import { useNavigate } from 'react-router-dom';
import '../components/gdpr-policy.css';
import Header from "../components/Header";

function PrivacyPolicyPage() {
 

  

  return (
    <>
    <Header/>
    <div className="privacy-policy-page d-flex flex-column min-vh-100">
      

      <main className="flex-grow-1 d-flex flex-column justify-content-center align-items-center text-center px-3">
        <PrivacyPolicy />
      </main>
    </div>
    </>
  );
}

export default PrivacyPolicyPage;