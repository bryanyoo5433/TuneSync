// RecordingProcessor.jsx
import { useState, useRef } from "react";

const useRecordingProcessor = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [audioURL, setAudioURL] = useState(null);
  const [userData, setUserData] = useState(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

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

  return { isRecording, startRecording, stopRecording, isLoading, audioURL, userData };
};

export default useRecordingProcessor;