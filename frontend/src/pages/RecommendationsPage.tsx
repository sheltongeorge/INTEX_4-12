import { useState } from 'react';
import ContentRecommendation from '../components/RecommendationContent';
import AuthorizeView, { AuthorizedUser } from '../components/AuthorizeView';
import Logout from '../components/Logout';
import Header from '../components/Header';

const RecommendationsPage = () => {
  const [contentId, setContentId] = useState('');
  const [recommendations, setRecommendations] = useState<string[]>([]);
  const [error, setError] = useState('');

  const fetchRecommendations = async () => {
    setRecommendations([]);
    setError('');

    try {
      const response = await fetch(
        'https://intex-group-4-12-backend-hqhrgeg0acc9hyhb.eastus-01.azurewebsites.net/api/recommendations/AllRecommendations',
        {
          credentials: 'include',
        }
      );
      if (!response.ok) throw new Error('Failed to fetch recommendations');

      const data = await response.json();
      const match = data.find((item: any) => item.contentId === contentId);

      if (match) {
        setRecommendations([
          match.recommendation1,
          match.recommendation2,
          match.recommendation3,
          match.recommendation4,
          match.recommendation5,
        ]);
      } else {
        setError('No recommendations found for the provided content ID.');
      }
    } catch (err) {
      setError(
        'Error fetching recommendations. Make sure the backend is running.'
      );
    }
  };

  return (
    <AuthorizeView>
      <Header/>
      <span>
        <Logout>
          Logout <AuthorizedUser value="email" />
        </Logout>
      </span>
      <div className="max-w-xl mx-auto p-6">
        <h1 className="text-2xl font-bold mb-4">
          News Article Recommendations
        </h1>
        <input
          type="text"
          className="border border-gray-300 rounded px-3 py-2 w-full mb-4"
          placeholder="Enter content ID"
          value={contentId}
          onChange={(e) => setContentId(e.target.value)}
        />
        <button
          onClick={fetchRecommendations}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Get Recommendations
        </button>

        {error && <p className="text-red-500 mt-4">{error}</p>}

        {recommendations.length > 0 && (
          <div className="mt-6">
            <h3 className="font-semibold text-lg mb-2">
              Recommended Articles (Collaborative Filtering)
            </h3>
            <ul className="list-disc list-inside">
              {recommendations.map((rec, idx) => (
                <li key={idx}>{rec}</li>
              ))}
            </ul>
          </div>
        )}

        <div className="mt-8">
          <h3 className="font-semibold text-lg mb-2">
            Recommended Articles (Content-Based Filtering)
          </h3>
          <ContentRecommendation inputContentId={contentId} />
        </div>
        
      </div>
    </AuthorizeView>
  );
};

export default RecommendationsPage;
