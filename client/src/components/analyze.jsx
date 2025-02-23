import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Analyze = () => {
  const [result, setResult] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true); // To track loading state

  // Function to fetch the analysis data
  const fetchAnalysis = async () => {
    try {
      const response = await axios.get('http://127.0.0.1:5000/compare-audio');
      if (response.data.error) {
        setError(response.data.error);
        setResult('');
      } else {
        setResult(response.data.result);
        setError('');
      }
    } catch (err) {
      setError('Error fetching analysis: ' + err.message);
      console.error(err);
    } finally {
      setLoading(false); // Stop loading after the request finishes
    }
  };

  // useEffect to run the fetchAnalysis function when the component mounts
  useEffect(() => {
    fetchAnalysis(); // Run immediately on page load
  }, []);

  // Function to handle "Analyze Again" button click
  const handleAnalyzeAgain = () => {
    setLoading(true); // Set loading to true to show loading state
    setResult(''); // Clear previous result
    setError(''); // Clear any previous error
    fetchAnalysis(); // Re-fetch the data
  };

  return (
    <div>
      <h1>Audio Analysis</h1>
      {loading && <p>Loading...</p>} {/* Display loading message */}
      {result && (
        <div>
          <p>Result: {result}</p>
          <button onClick={handleAnalyzeAgain}>Analyze Again</button>
        </div>
      )}
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
};

export default Analyze;
