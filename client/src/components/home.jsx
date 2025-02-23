// Home.jsx
import React, { useState, useRef, useEffect } from 'react';
import '../App.css';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import AudioProcessor from './audioprocessor';
import Record from './record';

const Home = () => {
  const { youtubeLink, setYoutubeLink, fetchData, processData, data, audioUrl, toggleAudio, isPlaying, handleAudioEnd, loading } = AudioProcessor();

  const audioRef = useRef(null);
  const intervalRef = useRef(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const startPlayback = () => {
    if (audioRef.current) {
      if (isPlaying) {
        console.log("Pausing audio...");
        audioRef.current.pause();
        clearInterval(intervalRef.current);
      } else {
        console.log("Playing audio...");
        audioRef.current.play();
        setCurrentTime(0); // Reset to beginning
    
        // Update ball position as audio plays
        intervalRef.current = setInterval(() => {
          if (audioRef.current) {
            const newTime = audioRef.current.currentTime;
            setCurrentTime(newTime); // ✅ Direct update
            console.log("Current Time Updated:", newTime);
            console.log("Duration:", duration);
            console.log("Ball Position (Expected %):", (newTime / duration) * 100);
          }
        }, 50);
        
        
      }
    }
    toggleAudio();
  };
  
  useEffect(() => {
    if (audioRef.current) {
      console.log("Audio loaded, setting duration...");
      audioRef.current.addEventListener("loadedmetadata", () => {
        if (audioRef.current.duration > 0) {
          setDuration(audioRef.current.duration);
          console.log("Duration set:", audioRef.current.duration);
        }
      });
  
      audioRef.current.addEventListener("ended", () => {
        clearInterval(intervalRef.current);
        setCurrentTime(0); // Reset ball position
        console.log("Audio ended, ball reset.");
      });
    }
    return () => clearInterval(intervalRef.current);
  }, [audioUrl]);
  
  
  const getBallPosition = () => {
    if (!data || !duration) return { left: "0%", top: "50%" };
  
    // Find the closest time index in data
    const closestIndex = data.findIndex((d) => d.time >= currentTime);
    if (closestIndex === -1) return { left: "0%", top: "50%" };
  
    const loudness = data[closestIndex]?.dynamics || 0; // Default to 0 if undefined
  
    // Normalize loudness to a Y position (invert it so higher loudness moves UP)
    const minY = 20;  // Top bound
    const maxY = 380; // Bottom bound
    const topPosition = maxY - (loudness * (maxY - minY));
  
    return {
      left: duration > 0 ? `${(currentTime / duration) * 100}%` : "0%",
      top: `${topPosition}px`,
    };
  };
  
  

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
        <button onClick={fetchData} className="upload-button" disabled={loading}>
          {loading ? (
            <div className="processing-container">
              <div className="spinner"></div>
              Processing...
            </div>
          ) : "Upload"}
        </button>

        {/* Waveform Graph */}
        {data && (
          <div className="relative mt-6 p-6 rounded-lg shadow-md w-full max-w-5xl mx-auto">
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
                    const meanLoudness = 0.5; // Replace with actual mean calculation
                    if (tick === meanLoudness) return 'm';
                    if (tick > meanLoudness) return tick > 0.75 ? 'f' : 'mf';
                    return tick < 0.25 ? 'p' : 'mp';
                  }}
                />
                <Tooltip wrapperStyle={{ color: "black" }} />
                <Line type="monotone" dataKey="dynamics" stroke="#4b5563" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          
            {data && (
              <div
                className="absolute bg-red-500 w-4 h-4 border-2 border-black rounded-full transition-all duration-50"
                style={{
                  left: duration > 0 ? `${(currentTime / duration) * 100}%` : "0%", // ✅ Only move if `duration` is valid
                  bottom: "0px",
                  transform: "translateX(-50%)"
                }}
              />            
            )}
          </div>
        )}

        {/* Play Audio Button (Only appears after the audio URL is received) */}
        {audioUrl && (
          <>
            <button onClick={startPlayback} className="playaudio-button">
              <h1>{isPlaying ? 'Pause Audio' : 'Play Audio'}</h1>
            </button>
            <audio
              ref={audioRef} 
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
