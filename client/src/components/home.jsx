import React, {useState} from 'react';
import Record from './record';
import '../App.css'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";


const audioProcessing = () => {
  const [youtubeLink, setYoutubeLink] = useState("");
  const [data, setData] = useState(null);

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
      setData(result); //  Store real backend waveform data instead of mock data
    } catch (error) {
      console.error("Error fetching waveform data:", error);
    }
  };
  

  // const processData = () => {
  //   if (!data) return [];
  //   return data.times.map((time, index) => ({
  //     time,
  //     dynamics: data.dynamics[index]
  //   }));
  // };

  const processData = () => {
    if (!data || !data.times || !data.dynamics) return [];
  
    return data.times.map((time, index) => ({
      time,
      dynamics: data.dynamics[index]
    }));
  };
  
  return { youtubeLink, setYoutubeLink, fetchData, processData, data };

  
}


const Home = () => {
  const { youtubeLink, setYoutubeLink, fetchData, processData, data } = audioProcessing();

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
      </main>
    </div>
  );
};

export default Home;