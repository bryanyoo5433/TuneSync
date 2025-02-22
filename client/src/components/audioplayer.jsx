// AudioPlayer.jsx
import React from "react";

const AudioPlayer = ({ audioURL, title }) => {
  return (
    <div className="mt-4 text-center">
      <h3 className="text-xl font-bold text-gray-800">{title}</h3>
      <audio controls>
        <source src={audioURL} type="audio/mp3" />
        Your browser does not support the audio element.
      </audio>
    </div>
  );
};

export default AudioPlayer;