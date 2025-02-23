import React, { useState } from 'react';

const AudioProcessor = () => {
  const [youtubeLink, setYoutubeLink] = useState("");
  const [data, setData] = useState(null);
  const [referenceWaveform, setReferenceWaveform] = useState(null); // Added state for reference waveform
  const [error, setError] = useState("");
  const [audioUrl, setAudioUrl] = useState("");
  const [isPlaying, setIsPlaying] = useState(false);
  const [loading, setLoading] = useState(false); // New state for loading

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await fetch("http://127.0.0.1:5000/process_youtube", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ youtube_url: youtubeLink }),
      });
  
      if (!response.ok) {
        throw new Error("Failed to fetch waveform data");
      }
  
      const result = await response.json();
      setData(result);
      setAudioUrl(result.audio_file_url);
  
      if (result.waveform_data) {
        const processedWaveform = processData(result.waveform_data);
        setReferenceWaveform(processedWaveform); // Store the processed reference waveform
      }
  
      setLoading(false);
    } catch (error) {
      console.error("Error fetching waveform data:", error);
      setLoading(false);
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

  return { youtubeLink, setYoutubeLink, fetchData, processData, data, referenceWaveform, // Now returning referenceWaveform
    audioUrl, toggleAudio, isPlaying, handleAudioEnd, loading };
};

export default AudioProcessor;