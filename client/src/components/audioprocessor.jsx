// AudioProcessor.js
import React, { useState } from 'react';

const AudioProcessor = () => {
  const [youtubeLink, setYoutubeLink] = useState("");
  const [data, setData] = useState([]); // store processed data as an array
  const [audioUrl, setAudioUrl] = useState("");
  const [isPlaying, setIsPlaying] = useState(false);
  const [loading, setLoading] = useState(false);

  // ✅ Only show error if we have fetched data
  const [hasFetched, setHasFetched] = useState(false);

  // Fetch data from your Flask backend
  const fetchData = async () => {
    if (!youtubeLink) return;
    setLoading(true);
    setHasFetched(true); // Mark that we've fetched at least once

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
      console.log("Raw API Response:", result);

      // Process waveform data before storing in state
      const processedData = processWaveform(result);
      setData(processedData); // store array of {time, dynamics}
      setAudioUrl(result.audio_file_url);

      setLoading(false);
    } catch (error) {
      console.error("Error fetching waveform data:", error);
      setLoading(false);
    }
  };

  // Convert backend data into an array of {time, dynamics}
  const processWaveform = (waveformData) => {
    if (
      !waveformData ||
      !waveformData.waveform_data ||
      !Array.isArray(waveformData.waveform_data.times) ||
      !Array.isArray(waveformData.waveform_data.dynamics)
    ) {
      console.error("Invalid waveformData:", waveformData);
      return [];
    }

    const processed = waveformData.waveform_data.times.map((time, index) => ({
      time,
      dynamics: waveformData.waveform_data.dynamics[index],
    }));

    console.log("Processed Data for Graph:", processed);
    return processed;
  };

  // Play/Pause logic
  const toggleAudio = () => {
    const audio = document.getElementById('audioPlayer');
    if (isPlaying) {
      audio.pause();
    } else {
      audio.play();
    }
    setIsPlaying(!isPlaying);
  };

  // Audio ended
  const handleAudioEnd = () => {
    setIsPlaying(false);
  };

  return {
    youtubeLink,
    setYoutubeLink,
    fetchData,
    data,
    audioUrl,
    toggleAudio,
    isPlaying,
    handleAudioEnd,
    loading,
    hasFetched // Export this so we know if we've tried fetching
  };
  
};

export default AudioProcessor;
