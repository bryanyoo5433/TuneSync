// Home.jsx
import React, { useState, useRef, useEffect } from 'react';
import '../App.css';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine
} from 'recharts';

import AudioProcessor from './audioprocessor';
import Record from './record';

/**
 * This version accounts for Recharts margins so the ball only moves
 * within the charted area (the axes region). The line remains smooth,
 * and the ball is aligned with the real "drawn" area.
 */
const Home = () => {
  const {
    youtubeLink,
    setYoutubeLink,
    fetchData,
    data,
    audioUrl,
    toggleAudio,
    isPlaying,
    handleAudioEnd,
    loading,
    hasFetched
  } = AudioProcessor();

  const chartContainerRef = useRef(null);
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });

  // The exact margins used in <LineChart margin={...}>
  const CHART_MARGIN = { top: 20, right: 20, left: 50, bottom: 30 };

  const audioRef = useRef(null);
  const intervalRef = useRef(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  // Start/Pause Playback
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
    toggleAudio();
  };

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.addEventListener("loadedmetadata", () => {
        if (audioRef.current.duration > 0) {
          setDuration(audioRef.current.duration);
        }
      });
      audioRef.current.addEventListener("ended", () => {
        clearInterval(intervalRef.current);
        setCurrentTime(0);
      });
    }
    return () => clearInterval(intervalRef.current);
  }, [audioUrl]);

  // Measure chart size
  useEffect(() => {
    const handleResize = () => {
      if (chartContainerRef.current) {
        const rect = chartContainerRef.current.getBoundingClientRect();
        setContainerSize({ width: rect.width, height: rect.height });
      }
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (chartContainerRef.current) {
      const rect = chartContainerRef.current.getBoundingClientRect();
      setContainerSize({ width: rect.width, height: rect.height });
    }
  }, [data]);

  // Compute time bounds
  let minDataTime = 0;
  let maxDataTime = 0;
  if (data.length > 0) {
    minDataTime = data[0].time;
    maxDataTime = data[data.length - 1].time;
  }

  // Compute loudness bounds
  let minDyn = 0;
  let maxDyn = 1;

  // 1) Clamp current time to ensure ball doesn't go out of bounds
  const clampedTime = Math.min(Math.max(currentTime, minDataTime), maxDataTime);
  const dataRangeX = maxDataTime - minDataTime || 1;
  const fractionX = (clampedTime - minDataTime) / dataRangeX;

  // 2) Find the closest dynamics value
  let someDynamics = 0;
  const closestPoint = data.find((pt) => pt.time >= clampedTime);
  if (closestPoint) {
    someDynamics = closestPoint.dynamics;
  } else if (data.length > 0) {
    someDynamics = data[data.length - 1].dynamics;
  }

  // 3) Compute vertical position
  const dataRangeY = maxDyn - minDyn || 1;
  const fractionY = (someDynamics - minDyn) / dataRangeY;

  // 4) Correcting the ball placement to start at the exact left of the chart
  const effectiveWidth = Math.max(containerSize.width - CHART_MARGIN.left - CHART_MARGIN.right, 0);
  const effectiveHeight = Math.max(containerSize.height - CHART_MARGIN.top - CHART_MARGIN.bottom, 0);

  const ballX = CHART_MARGIN.left + fractionX * effectiveWidth;
  const ballY = CHART_MARGIN.top + (1 - fractionY) * effectiveHeight;

  return (
    <div className="text-grey-900 h-screen w-full flex flex-col">
      <header className="header">
        <div className="text-2xl font-bold">TuneSync</div>
      </header>

      <main className="flex flex-col items-center">
        <h1 className="text-3xl font-bold mb-6">Convert Audio</h1>

        <input
          type="text"
          value={youtubeLink}
          onChange={(e) => setYoutubeLink(e.target.value)}
          className="link-box text-center"
          placeholder="Enter YouTube link"
        />

        <button onClick={fetchData} className="upload-button" disabled={loading}>
          {loading ? (
            <div className="processing-container">
              <div className="spinner"></div>
              Processing...
            </div>
          ) : (
            "Upload"
          )}
        </button>

        {data.length > 0 ? (
          <div
            className="relative mt-6 p-6 rounded-lg shadow-md w-full max-w-5xl mx-auto"
            ref={chartContainerRef}
            style={{ position: "relative" }}
          >
            <h2 className="text-2xl font-bold mb-4 text-center">Dynamics Over Time</h2>
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={data} margin={CHART_MARGIN}>
                <CartesianGrid strokeDasharray="3 3" stroke="#d1d5db" />
                <XAxis
                  dataKey="time"
                  tick={{ fill: "#4b5563" }}
                  label={{
                    value: "Time (s)",
                    position: "insideBottom",
                    offset: -15,
                    fill: "#4b5563"
                  }}
                />
                <YAxis
                  tick={{ fill: "#4b5563" }}
                  label={{
                    value: "Loudness",
                    angle: -90,
                    position: "insideLeft",
                    fill: "#4b5563"
                  }}
                />
                
                {/* Custom Line that moves with time */}
                <ReferenceLine x={clampedTime} stroke="gray" strokeDasharray="3 3" />

                <Tooltip cursor={false} /> {/* Disable the hover effect */}

                <Line type="basis" dataKey="dynamics" stroke="#4b5563" strokeWidth={2} dot={false} />

                {/* Moving Dot */}
          

                {/* <Line
                  type="monotone"
                  dataKey="dynamics"
                  stroke="none"
                  dot={(props) => {
                    const { cx, cy, payload } = props;

                    // Find the closest time in the dataset
                    const closestPoint = data.reduce((prev, curr) =>
                      Math.abs(curr.time - clampedTime) < Math.abs(prev.time - clampedTime) ? curr : prev
                    );

                    return payload.time === closestPoint.time ? (
                      <circle cx={cx} cy={cy} r={6} fill="blue" />
                    ) : null;
                  }}
                /> */}
                <Line
                  type="monotone"
                  dataKey="dynamics"
                  stroke="none"
                  dot={false} // Disable default dots to prevent multiple
                />
                {
                  // Custom single dot logic
                  data.length > 0 && (() => {
                    // Find the closest data point to current time
                    const closestPoint = data.reduce((prev, curr) =>
                      Math.abs(curr.time - clampedTime) < Math.abs(prev.time - clampedTime) ? curr : prev
                    );

                    // Find its corresponding position in Recharts
                    const closestIndex = data.indexOf(closestPoint);
                    if (closestIndex === -1) return null; // Fail-safe check

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


            {/* Adjusted Ball */}
            {/* <div
              style={{
                position: "absolute",
                pointerEvents: "none",
                width: "12px",
                height: "12px",
                borderRadius: "50%",
                background: "blue",
                left: `${ballX}px`,
                top: `${ballY}px`,
                transform: "translate(-50%, -50%)",
              }}
            /> */}
          </div>
        ) : (
          hasFetched && !loading && <p className="text-red-500 mt-4">No data available or invalid waveform data.</p>
        )}

        {audioUrl && (
          <>
            <button onClick={startPlayback} className="playaudio-button">
              <h1>{isPlaying ? "Pause Audio" : "Play Audio"}</h1>
            </button>
            <audio ref={audioRef} id="audioPlayer" src={audioUrl} onEnded={handleAudioEnd} />
          </>
        )}

        {audioUrl && <Record />}
      </main>
    </div>
  );
};

export default Home;
