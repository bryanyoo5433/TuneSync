import React, { useState, useRef } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const Record = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [countdown, setCountdown] = useState(null); 
  const [audioURL, setAudioURL] = useState(null);
  const [waveformData, setWaveformData] = useState(null);
  const [processedData, setProcessedData] = useState(null);  // To store processed data for graph rendering
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  const startCountdown = () => {
    setCountdown(3); // Start from 3 seconds
    let count = 3;
  
    const interval = setInterval(() => {
      count -= 1;
      setCountdown(count);
  
      if (count === 0) {
        clearInterval(interval);
        setCountdown(null); // Hide countdown after finishing
        startRecording(); // Start recording after countdown
      }
    }, 1000);
  };

  const startRecording = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    mediaRecorderRef.current = new MediaRecorder(stream);
    
    mediaRecorderRef.current.ondataavailable = (event) => {
      if (event.data.size > 0) {
        audioChunksRef.current.push(event.data);
      }
    };

    mediaRecorderRef.current.onstop = async () => {
      const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/mp3' });
      const url = URL.createObjectURL(audioBlob);
      setAudioURL(url);
      audioChunksRef.current = [];

      // Send the audio file to the Flask backend
      await uploadAudio(audioBlob);
    };

    mediaRecorderRef.current.start();
    setIsRecording(true);
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const uploadAudio = async (audioBlob) => {
    const formData = new FormData();
    formData.append('file', audioBlob, 'recording.wav');

    try {
      const response = await fetch('http://127.0.0.1:5000/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await response.json();
      if (response.ok) {
        // Set the waveform data directly from the backend response
        setWaveformData(data.waveform_data);  // Save raw waveform data
        const processed = processData(data.waveform_data);  // Process it for graphing
        setProcessedData(processed);  // Store the processed data for graphing
      } else {
        console.error('Error uploading file:', data.error);
      }
    } catch (error) {
      console.error('Error uploading file:', error);
    }
  };

  // Process data function to format it for the graph
  const processData = (waveformData) => {
    if (!waveformData || !waveformData.times || !waveformData.dynamics) return [];

    return waveformData.times.map((time, index) => ({
      time,
      dynamics: waveformData.dynamics[index],
    }));
  };

  return (
    <div className="flex flex-col items-center space-y-4">
      {/* Display Waveform Graph Above the Record Button */}
      {processedData && (
        <div className="mt-6 p-6 rounded-lg shadow-md w-full max-w-5xl mx-auto">
          <h2 className="text-2xl font-bold mb-4 text-center">Dynamics Over Time</h2>
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={processedData} margin={{ bottom: 30 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#d1d5db" />
              <XAxis dataKey="time" tick={{ fill: "#4b5563" }}
                label={{
                  value: "Time (s)",
                  position: "insideBottom",
                  offset: -15,
                  fill: "#4b5563"
                }}
              />
              <YAxis tick={{ fill: "#4b5563" }}
                label={{
                  value: "Loudness",
                  angle: -90,
                  position: "insideLeft",
                  fill: "#4b5563"
                }}
              />
              <Tooltip wrapperStyle={{ color: "black" }} />
              <Line type="monotone" dataKey="dynamics" stroke="#4b5563" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      <div className="text-center flex flex-row items-center space-x-4 px-6 py-3">
        {/* Countdown Display */}
        {countdown !== null ? (
          <div className="text-4xl font-bold text-red-600">{countdown}</div> // Shows 3,2,1 countdown, get color
        ) : (
          <>
            {/* Record Button */}
            <button
              onClick={isRecording ? stopRecording : startCountdown} // Starts countdown before recording
              className={`font-semibold rounded-lg shadow-md transition duration-300 ${isRecording ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'} px-6 py-3`}
            >
              {isRecording ? 'Stop Recording' : 'Start Recording'}
            </button>

            {/* Test Button (Kept as it is) */}
            <button className="bg-blue-500 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-lg shadow-md">
              Test
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default Record;
