"""
Module Name: record.py
Author: Christina Lee
Date: 2025-02-21
Description:
    Function record_audio records the audio from user's computer.
    Function get_audio_length gets the audio length of my_audio.mp3
    
Usage:
    Adjust output_file and duration accordingly.

"""

from pydub import AudioSegment
import sounddevice as sd
import numpy as np
import wave

def record_audio(output_file, duration=5, sample_rate=44100):
    print("🎤 Recording...")

    # Record audio
    audio = sd.rec(int(duration * sample_rate), samplerate=sample_rate, channels=1, dtype='int16')
    sd.wait()

    print("✅ Recording complete!")

    # Save to WAV file
    with wave.open(output_file, 'wb') as wf:
        wf.setnchannels(1)
        wf.setsampwidth(2)
        wf.setframerate(sample_rate)
        wf.writeframes(audio.tobytes())

def get_audio_length(file_path):
    """
    Returns the duration of an MP3 file in seconds.
    """
    audio = AudioSegment.from_mp3(file_path)
    duration = len(audio) / 1000  # Convert milliseconds to seconds
    return duration

# Example usage
output_file = "user_recording.wav"
duration = 5 + get_audio_length("/Users/christinalee/TuneSync/server/my_audio.mp3") # duration is currently 5 seconds more than the youtube mp3
record_audio(output_file, duration)