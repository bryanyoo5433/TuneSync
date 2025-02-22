import React, {useState} from 'react';
import Record from './record';
import '../App.css'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";


const audioProcessing = () => {
  const [youtubeLink, setYoutubeLink] = useState("");
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

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
        body: JSON.stringify({ youtubeLink })
      });

      const data = await response.json();
      setData(data);
    } catch (error) {
      console.error(error);
    }
  };

  const processData = () => {
    if (!data) return [];
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
    <>
      <div className='text-grey-900 h-screen w-full flex flex-col'>

        {/* Header */}
        <header className='header'>
          <div className='text-2xl style = {{color: "#013d5a" }}font-bold'>TuneSync</div>
          <nav>
            <ul className='flex space-x-6 text-gray-700 font-medium'>
              <li><a href='#' className='hover:text-green-700'>About</a></li>
            </ul>
          </nav>
        </header>

        {/* Main Content */}
        <main className=''>
          <div>
            <h1 className='text-3xl font-bold font-garamond mb-6 text-center'>Convert Audio</h1>
            <input
              type='text'
              value={youtubeLink}
              onChange={(e) => setYoutubeLink(e.target.value)}
              className='link-box text-center'
              placeholder='Enter YouTube link'
            />
            <button
              onClick={fetchData}
              className='upload-button'
            >
              Upload
            </button>
            {data && (
              <div className='mt-6 p-6 rounded-lg shadow-md w-full max-w-5xl mx-auto'>
                <h2 className='text-2xl font-bold mb-4 text-gray-800 text-center'>Dynamics Over Time</h2>
                <ResponsiveContainer width='100%' height={400}>
                  <LineChart data={processData()}>
                    <CartesianGrid strokeDasharray='3 3' stroke='#d1d5db' />
                    <XAxis dataKey='time' tick={{ fill: '#4b5563' }} label={{ value: 'Time (s)', position: 'insideBottom', fill: '#4b5563' }} />
                    <YAxis tick={{ fill: '#4b5563' }} label={{ value: 'Loudness', angle: -90, position: 'insideLeft', fill: '#4b5563' }} />
                    <Tooltip wrapperStyle={{ color: 'black' }} />
                    <Line type='monotone' dataKey='dynamics' stroke='#4b5563' strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        </main>
      </div>
    </>
  )
}

export default Home;