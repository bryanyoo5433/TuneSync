import React, { useState } from 'react';

const AudioProcessor = () => {
  const [youtubeLink, setYoutubeLink] = useState("");
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [audioUrl, setAudioUrl] = useState("");
  const [isPlaying, setIsPlaying] = useState(false);
  const [loading, setLoading] = useState(false); // New state for loading

  const fetchData = async () => {
    if (!youtubeLink) return;
    setLoading(true); // Set loading to true when the request starts

    try {
      const response = await fetch("http://127.0.0.1:5000/process_youtube", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ youtube_url: youtubeLink })
      });

      if (!response.ok) {
        throw new Error("Failed to fetch waveform data");
      }

      const result = await response.json();
      setData(result);
      setAudioUrl(result.audio_file_url);
      setLoading(false); // Stop loading when data is received
    } catch (error) {
      console.error("Error fetching waveform data:", error);
      setLoading(false); // Stop loading if there's an error
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
    setIsPlaying(false);
  };

  return { youtubeLink, setYoutubeLink, fetchData, processData, data, audioUrl, toggleAudio, isPlaying, handleAudioEnd, loading };
};

export default AudioProcessor;