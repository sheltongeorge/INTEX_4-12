import React, { useState, useEffect } from "react";
import Papa from "papaparse";

interface Recommendation {
  contentId: string;
  recommendations: string[];
}

interface ContentRecommendationProps {
  inputContentId: string;
}

const ContentRecommendation: React.FC<ContentRecommendationProps> = ({ inputContentId }) => {
  const [recommendations, setRecommendations] = useState<string[]>([]);
  const [data, setData] = useState<Recommendation[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/Recommendations2.csv")
      .then((response) => response.text())
      .then((csvString) => {
        Papa.parse(csvString, {
            header: true,
            skipEmptyLines: true,
            complete: (results) => {
              // Assign a proper key name to the unnamed first column
              const rawData = results.data as any[];
              const parsedData = rawData.map((row) => {
                const keys = Object.keys(row);
                const contentIdKey = keys.find((key) => key.trim() === "") || keys[0];
          
                return {
                  contentId: row[contentIdKey],
                  recommendations: [
                    row.Recommendation_1,
                    row.Recommendation_2,
                    row.Recommendation_3,
                    row.Recommendation_4,
                    row.Recommendation_5,
                  ],
                };
              });
          
              setData(parsedData);
            },
          });          
      })
      .catch(() => setError("Error loading CSV file"));
  }, []);

  useEffect(() => {
    if (!inputContentId || data.length === 0) return;

    const found = data.find((item) => item.contentId === inputContentId);
    if (found) {
      setRecommendations(found.recommendations);
      setError("");
    } else {
      setRecommendations([]);
      setError("Content ID not found in content-based recommendations");
    }
  }, [inputContentId, data]);

  return (
    <div>
      {error && <p className="text-red-500 mt-4">{error}</p>}
      {recommendations.length > 0 && (
        <ul className="list-disc list-inside">
          {recommendations.map((rec, index) => (
            <li key={index}>{rec}</li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default ContentRecommendation;
