import React, { useState } from 'react';
import axios from 'axios';

const Analyze = () => {
  const [result, setResult] = useState('');
  const [error, setError] = useState('');

  const handleAnalyzeClick = async () => {
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
    }
  };

  return (
    <div>
      <h1>Audio Analysis</h1>
      <button onClick={handleAnalyzeClick}>Analyze Audio</button>
      {result && <p>Result: {result}</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
};

export default Analyze;
