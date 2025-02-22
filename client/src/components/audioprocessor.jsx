// AudioProcessor.jsx
import { useState, useRef } from "react";

const useAudioProcessor = () => {
  const [youtubeLink, setYoutubeLink] = useState("");
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [audioURL, setAudioURL] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [userData, setUserData] = useState(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  const fetchData = async () => {
    if (!youtubeLink) return;

    {/*
        const mockData = {
            times: [0.0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6],
            dynamics: [0.15, 0.25, 0.78, 0.92, 0.85, 0.67, 0.55]
        };
        setData(mockData);
        */}

    try {
      const response = await fetch("http://localhost:5000/process_youtube", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ youtube_url: youtubeLink }),
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "An unknown error occurred");

      setData(result);
      setError("");
    } catch (error) {
      setError(error.message);
      setData(null);
    }
  };

  const processData = (dataset) => {
    if (!dataset) return [];
    return dataset.times.map((time, index) => ({
      time,
      dynamics: dataset.dynamics[index],
    }));
  };

  const startRecording = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    mediaRecorderRef.current = new MediaRecorder(stream);

    mediaRecorderRef.current.ondataavailable = (event) => {
      if (event.data.size > 0) {
        audioChunksRef.current.push(event.data);
      }
    };

    mediaRecorderRef.current.onstop = async () => {
      setIsLoading(true);
      const audioBlob = new Blob(audioChunksRef.current, { type: "audio/mp3" });
      const formData = new FormData();
      formData.append("file", audioBlob, "recording.mp3");

      try {
        const response = await fetch("http://localhost:5000/upload", {
          method: "POST",
          body: formData,
        });

        const result = await response.json();
        setUserData(result);
      } catch (error) {
        console.error("Upload Error:", error);
      } finally {
        setIsLoading(false);
        setAudioURL(URL.createObjectURL(audioBlob));
      }
    };

    mediaRecorderRef.current.start();
    setIsRecording(true);
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  return {
    youtubeLink,
    setYoutubeLink,
    fetchData,
    processData,
    data,
    error,
    isRecording,
    startRecording,
    stopRecording,
    isLoading,
    userData,
  };
};

export default useAudioProcessor;