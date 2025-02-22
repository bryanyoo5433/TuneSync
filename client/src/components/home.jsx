import React, { useState, useRef } from 'react';
import Record from './record';
import '../App.css'

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const audioProcessing = () => {
  const [youtubeLink, setYoutubeLink] = useState("");
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const [audioUrl, setAudioUrl] = useState("");  // State for audio URL
  const [isPlaying, setIsPlaying] = useState(false);  // State for tracking if audio is playing

  const fetchData = async () => {
    if (!youtubeLink) return;

    {/*const mockData = {
      times: [0.0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6],
      dynamics: [0.15, 0.25, 0.78, 0.92, 0.85, 0.67, 0.55]
    };
    setData(mockData);*/}

    try {
      const response = await fetch("http://localhost:5173/process", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ youtube_url: youtubeLink }) // Correct key name
      });

      if (!response.ok) {
        throw new Error("Failed to fetch waveform data");
      }

      const result = await response.json();
      setData(result);  // Set waveform data
      setAudioUrl(result.audio_file_url);  // Set audio URL for playback

      // Debugging: Check if the audio URL is being set correctly
      console.log("Audio URL:", result.audio_file_url);
    } catch (error) {
      console.error(error);
      setData(null);
    }
  };

  // Updated processData to match the new response format
  const processData = () => {
    if (!data || !data.waveform_data || !data.waveform_data.times || !data.waveform_data.dynamics) return [];
    return data.waveform_data.times.map((time, index) => ({
      time,
      dynamics: data.waveform_data.dynamics[index]
    }));
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
      setIsLoading(true);
      const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/mp3' });
      const formData = new FormData();
      formData.append('file', audioBlob, 'recording.mp3');

      try {
        const response = await fetch("http://localhost:5173/upload", {
          method: "POST",
          body: formData,
        });

        const result = await response.json();
        console.log("Upload Success:", result);
      } catch (error) {
        console.error("Upload Error:", error);
      } finally {
        setIsLoading(false);
        setAudioURL(URL.createObjectURL(audioBlob));
      }
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

  // Toggle play/pause functionality for audio
  const toggleAudio = () => {
    const audio = document.getElementById('audioPlayer');
    if (isPlaying) {
      audio.pause();
    } else {
      audio.play();
    }
    setIsPlaying(!isPlaying);
  };

  // Reset audio to "Play Audio" once the audio ends
  const handleAudioEnd = () => {
    setIsPlaying(false);  // Reset to play state after audio ends
  };

  return { youtubeLink, setYoutubeLink, fetchData, processData, data, error, isRecording, startRecording, stopRecording, isLoading, audioURL };
};

const Home = () => {
  const { youtubeLink, setYoutubeLink, fetchData, processData, data, error, isRecording, startRecording, stopRecording, isLoading, audioURL } = audioProcessing();


  return (
    <div className="text-grey-900 h-screen w-full flex flex-col">
      {/* Header */}
      <header className="header">
        <div className="text-2xl font-bold">TuneSync</div>
      </header>

      {/* YouTube Input */}
      <h1 className="text-3xl font-bold mb-6">Convert Audio</h1>
      <input
        type="text"
        value={youtubeLink}
        onChange={(e) => setYoutubeLink(e.target.value)}
        className="link-box text-center"
        placeholder="Enter YouTube link"
      />
      <button onClick={fetchData} className="upload-button">
        Upload
      </button>

      {/* WaveForm Graph */}
      <main className=''>
        <div>

          {error && <p className='text-red-500 text-center mt-2'>{error}</p>}

          {data && (
            <>
              <div className="mt-6 p-6 rounded-lg shadow-md w-full max-w-5xl mx-auto">
                <h2 className="text-2xl font-bold mb-4 text-center">Dynamics Over Time</h2>
                <ResponsiveContainer width="100%" height={400}>
                  <LineChart data={processData(data)} margin={{ bottom: 30 }}>
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
              <button className='record-button' onClick={isRecording ? stopRecording : startRecording}>
                {isRecording ? 'Stop Recording' : 'Record My Own'}
              </button>
              {isLoading && <p className='text-center text-gray-600'>Processing audio...</p>}
            </>
          )}
        </div>
      </main>

      {/* Play Audio Button (Only appears after the audio URL is received) */}
      {data && (
        <div className="mt-6 mb-10 box-shadow rounded-lg w-full max-w-5xl mx-auto flex flex-col items-center">
          <button
            onClick={toggleAudio}
            className="play-button w-48 h-24 outline-black"
          >
            <h1 className="text-2xl !text-2xl font-bold">{isPlaying ? 'Pause Audio' : 'Play Audio'}</h1>
          </button>
          <audio
            id="audioPlayer"
            src={audioUrl}
            onEnded={handleAudioEnd} // Reset state after audio ends
          />
        </div>
      )}
    </div >
  );
};

export default Home;
