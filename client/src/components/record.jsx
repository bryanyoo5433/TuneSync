<<<<<<< HEAD
import React, { useState, useEffect, useRef } from 'react';
=======
import React, { useState, useRef, useEffect } from 'react';
>>>>>>> 4c9cf1a625c95bc44c0461b794e0f28e7268a8e9
import { useNavigate } from 'react-router-dom';
import AudioProcessor from "./audioprocessor"; // Import Audio Processor
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';

const Record = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [audioURL, setAudioURL] = useState(null);
  const [waveformData, setWaveformData] = useState(null);
  const [processedData, setProcessedData] = useState(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  
  const navigate = useNavigate();  // Add this line to use navigate

  const { referenceWaveform } = AudioProcessor();

  // Audio playback logic
  const audioRef = useRef(null);
  const intervalRef = useRef(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const startPlayback = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
        clearInterval(intervalRef.current);
      } else {
        audioRef.current.play();
        setCurrentTime(0);
        intervalRef.current = setInterval(() => {
          if (audioRef.current) {
            setCurrentTime(audioRef.current.currentTime);
          }
        }, 100);
      }
    }
    setIsPlaying(!isPlaying);
  };

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.addEventListener("ended", () => {
        clearInterval(intervalRef.current);
        setCurrentTime(0);
        setIsPlaying(false);
      });
    }
    return () => clearInterval(intervalRef.current);
  }, []);

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
        setWaveformData(data.waveform_data);
        const processed = processData(data.waveform_data);
        setProcessedData(processed);
      } else {
        console.error('Error uploading file:', data.error);
      }
    } catch (error) {
      console.error('Error uploading file:', error);
    }
  };

  const processData = (waveformData) => {
    if (!waveformData || !waveformData.times || !waveformData.dynamics) return [];
    return waveformData.times.map((time, index) => ({
      time,
      dynamics: waveformData.dynamics[index],
    }));
  };

  const handleProceedToAnalyze = () => {
    // Ensure the waveforms are ready to be sent
    navigate('/analyze')
  };

  return (
    <div className="items-center text-grey-900 h-screen w-full flex flex-col">
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
                tickFormatter={(tick) => {
                  const meanLoudness = 0.5;
                  if (tick === meanLoudness) return 'm';
                  if (tick > meanLoudness) return tick > 0.75 ? 'f' : 'mf';
                  return tick < 0.25 ? 'p' : 'mp';
                }}
              />
              <Tooltip wrapperStyle={{ color: "black" }} />
              <Line type="monotone" dataKey="dynamics" stroke="#4b5563" strokeWidth={2} dot={false} />

              {/* Moving Dot */}
              {
                processedData?.length > 0 && (() => {
                  const closestPoint = processedData.reduce((prev, curr) =>
                    Math.abs(curr.time - currentTime) < Math.abs(prev.time - currentTime) ? curr : prev
                  );
                  return (
                    <Line
                      type="monotone"
                      dataKey="dynamics"
                      stroke="none"
                      dot={(props) => {
                        const { cx, cy, payload } = props;
                        return payload.time === closestPoint.time ? (
                          <circle cx={cx} cy={cy} r={6} fill="blue" />
                        ) : null;
                      }}
                    />
                  );
                })()
              }

            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      <div className="text-center flex flex-row items-center space-x-6 mt-8">
        <button
          onClick={isRecording ? stopRecording : startRecording}
          style={{
            backgroundColor: isRecording ? "#899481" : "#304f6d",
          }}
          className="font-semibold rounded-lg shadow-md transition duration-300 hover:bg-[#899481] text-white px-6 py-3 min-w-[300px]"
        >
          {isRecording ? 'Stop Recording' : 'Start Recording'}
        </button>

        {processedData && (
          <button
            onClick={handleProceedToAnalyze}
            className="font-semibold rounded-lg shadow-md transition duration-300 hover:bg-[#899481] px-6 py-3 min-w-[200px]"
          >
            Analyze
          </button>
        )}

        {/* Play Audio Button */}
        {audioURL && (
          <>
            <button onClick={startPlayback} className="playaudio-button">
              <h1>{isPlaying ? "Pause Audio" : "Play Audio"}</h1>
            </button>
            <audio ref={audioRef} id="audioPlayer" src={audioURL} onEnded={() => setIsPlaying(false)} />
          </>
        )}
      </div>
    </div>
  );
};

export default Record;
