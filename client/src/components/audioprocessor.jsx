// AudioProcessor.jsx
import React, { useState } from 'react';

const AudioProcessor = () => {
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

  const processData = () => {
    if (!data || !data.waveform_data || !data.waveform_data.times || !data.waveform_data.dynamics) return [];
    
    return data.waveform_data.times.map((time, index) => ({
      time,
      dynamics: data.waveform_data.dynamics[index]
    }));
  };

  const toggleAudio = () => {
    const audio = document.getElementById('audioPlayer');
    if (isPlaying) {
      audio.pause();
    } else {
      audio.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleAudioEnd = () => {
    setIsPlaying(false);  // Reset to play state after audio ends
  };

  return { youtubeLink, setYoutubeLink, fetchData, processData, data, audioUrl, toggleAudio, isPlaying, handleAudioEnd };
};

export default AudioProcessor;
