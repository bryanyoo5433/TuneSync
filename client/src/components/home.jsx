// Home.jsx
import React from 'react';
import '../App.css';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import AudioProcessor from './audioprocessor';
import Record from './record';

const Home = () => {
  const { youtubeLink, setYoutubeLink, fetchData, processData, data, audioUrl, toggleAudio, isPlaying, handleAudioEnd, loading } = AudioProcessor();

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
        {/* Upload Button with Spinner */}
        <button onClick={fetchData} className="upload-button px-6 py-10 min-w-[300px]" disabled={loading}>
          {loading ? (
            <div className="processing-container">
              <div className="spinner"></div>
              Processing...
            </div>
          ) : "Upload"}
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
                  tickFormatter={(tick) => {
                    const meanLoudness = 0.5;
                    if (tick === meanLoudness) return 'm';
                    if (tick > meanLoudness) return tick > 0.75 ? 'f' : 'mf';
                    return tick < 0.25 ? 'p' : 'mp';
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
          <>
            <button
              onClick={toggleAudio}
              style={{
                backgroundColor: isPlaying ? "#899481" : "#304f6d", // Green when playing, default blue-gray when not
              }}
              className="font-semibold rounded-lg shadow-md transition duration-300 mt-8 hover:bg-[#899481] text-white px-6 py-10 min-w-[300px]"
            >
              <div>{isPlaying ? 'Pause Audio' : 'Play Audio'}</div>
            </button>
            <audio
              id="audioPlayer"
              src={audioUrl}
              onEnded={handleAudioEnd} // Reset state after audio ends
            />
          </>
        )}

        {audioUrl && (
          <Record />
        )}
      </main>

    </div >
  );
};

export default Home;
