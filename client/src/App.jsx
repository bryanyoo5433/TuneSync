import react, { useState } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

function App() {
  const [count, setCount] = useState(0)
  const [youtubeLink, setYoutubeLink] = useState("");
  const [data, setData] = useState(null);

  /*const [soundwaves, setSoundwaves] = useState(null);
  const handleUpload = async () => {
    if (!youtubeLink) return;
    try {
      const response = await fetch("/api/convert", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ youtubeLink }),
      });

      const data = await response.json();
      setSoundwaves(data.soundwaves);
    } catch (error) {
      console.error(error);
    }
  };*/

  const fetchData = async () => {
    if (!youtubeLink) return;

    const mockData = {
      times: [0.0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6],
      dynamics: [0.15, 0.25, 0.78, 0.92, 0.85, 0.67, 0.55]
    };
    setData(mockData);

    {/*try {
      const response = await fetch("http://localhost:5173/process", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ youtubeLink })
      });

      const data = await response.json();
      setData(data);
    } catch (error) {
      console.error(error);
    }*/}
  };

  const processData = () => {
    if (!data) return [];
    return data.times.map((time, index) => ({
      time,
      dynamics: data.dynamics[index]
    }));
  };



  return (
    <>
      {/*<div>
        <a href="https://vite.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Vite + React</h1>*/}
      <div className='bg-white text-grey-900 h-screen flex flex-col'>
        <div className='youtube-upload'>
          <h1>Convert Audio</h1>
          <input
            type="text"
            value={youtubeLink}
            onChange={(e) => setYoutubeLink(e.target.value)}
            className="block w-full p-2 pl-10 text-gray-200 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-gray-500 focus:border-gray-500"
            placeholder="Enter YouTube link"
          />
          <button
            onClick={fetchData}
            className="mt-4 w-full py-2 px-4 bg-gray-600 hover:bg-gray-500 text-gray-200 rounded-lg"
          >
            Upload
          </button>
          {data && (
            <div className="mt-4">
              <h2 className="text-2xl font-bold mb-2">Dynamics Over Time</h2>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart graph={processData()}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" tick={{ fill: "#ffffff" }} label={{ value: "Time (s)", position: "insideBottom", fill: "#ffffff" }} />
                  <YAxis tick={{ fill: "#ffffff" }} label={{ value: "Loudness", angle: -90, position: "insideLeft", fill: "#ffffff" }} />
                  <Tooltip wrapperStyle={{ color: "black" }} />
                  <Line type="monotone" dataKey="dynamics" stroke="#00c0ff" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>

      {/*<div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
      </div>*/}
    </>
  )
}

export default App
