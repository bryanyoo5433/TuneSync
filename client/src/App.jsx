import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

function App() {
  const [count, setCount] = useState(0)

  const [youtubeLink, setYoutubeLink] = useState("");
  const [soundwaves, setSoundwaves] = useState(null);

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
  };

  return (
    <>
      <div>
        <a href="https://vite.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      {/*<h1>Vite + React</h1>*/}

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
          onClick={handleUpload}
          className="mt-4 w-full py-2 px-4 bg-gray-600 hover:bg-gray-500 text-gray-200 rounded-lg"
        >
          Upload
        </button>
      </div>

      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
        <p>
          Edit <code>src/App.jsx</code> and save to test HMR
        </p>
      </div>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
    </>
  )
}

export default App
