import React, { useState } from 'react';
import '../App.css';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const audioProcessing = () => {
  const [youtubeLink, setYoutubeLink] = useState("");
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [audioUrl, setAudioUrl] = useState("");  // State for audio URL
  const [isPlaying, setIsPlaying] = useState(false);  // State for tracking if audio is playing

  const fetchData = async () => {
    if (!youtubeLink) return;

    try {
      const response = await fetch("http://127.0.0.1:5000/process_youtube", {
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
      console.error("Error fetching waveform data:", error);
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

  return { youtubeLink, setYoutubeLink, fetchData, processData, data, audioUrl, toggleAudio, isPlaying, handleAudioEnd };
};

const Home = () => {
  const { youtubeLink, setYoutubeLink, fetchData, processData, data, audioUrl, toggleAudio, isPlaying, handleAudioEnd } = audioProcessing();

  return (
    <div className="text-grey-900 h-screen w-full flex flex-col">
      {/* Header */}
      <header className="header">
        <div className="text-2xl font-bold">TuneSync</div>
      </header>

      {/* YouTube Input */}
      <main className="flex flex-col items-center">
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

        {/* Waveform Graph */}
        {data && (
          <div className="mt-6 p-6 rounded-lg shadow-md w-full max-w-5xl mx-auto">
            <h2 className="text-2xl font-bold mb-4 text-center">Dynamics Over Time</h2>
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={processData()}>
                <CartesianGrid strokeDasharray="3 3" stroke="#d1d5db" />
                <XAxis
                  dataKey="time"
                  tick={{ fill: "#4b5563" }}
                  label={{ value: "Time (s)", position: "insideBottom", fill: "#4b5563" }}
                />
                <YAxis
                  tick={{ fill: "#4b5563" }}
                  label={{ value: "Loudness", angle: -90, position: "insideLeft", fill: "#4b5563" }}
                />
                <Tooltip wrapperStyle={{ color: "black" }} />
                <Line type="monotone" dataKey="dynamics" stroke="#4b5563" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Play Audio Button (Only appears after the audio URL is received) */}
        {audioUrl && (
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
      </main>
    </div>
  );
};

export default Home;
