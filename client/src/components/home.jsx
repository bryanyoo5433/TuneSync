// Home.jsx
import React from 'react';
import '../App.css';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import AudioProcessor from './audioprocessor';
import Record from './record';

const Home = () => {
  const { youtubeLink, setYoutubeLink, fetchData, processData, data, audioUrl, toggleAudio, isPlaying, handleAudioEnd } = AudioProcessor();

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

        {audioUrl && (
          <Record />
        )}
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
