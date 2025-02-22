"""
Module Name: youtube_to_mp3.py
Author: Christina Lee
Date: 2025-02-21
Description:
    Function download_youtube_audio converts a youtube video link into an mp3 file.
    Function crop_audio crops the mp3 file given start and end time.
    
Usage:
    Change youtube_link, mp3_file, cropped_file, start_time, and end_time accordingly.
"""

import yt_dlp
import os
import imageio_ffmpeg as ffmpeg  # Uses Python-installed FFmpeg
from pydub import AudioSegment

# Get the FFmpeg path from imageio_ffmpeg
FFMPEG_PATH = ffmpeg.get_ffmpeg_exe()  # Correct function name

def download_youtube_audio(youtube_url, output_mp3="output.mp3"):
    """
    Downloads the audio from a YouTube video and converts it into an MP3 file.
    """
    ydl_opts = {
        'format': 'bestaudio/best',
        'postprocessors': [{
            'key': 'FFmpegExtractAudio',
            'preferredcodec': 'mp3',
            'preferredquality': '192',
        }],
        'outtmpl': 'downloaded_audio.%(ext)s',
        'ffmpeg_location': FFMPEG_PATH  # Set the correct FFmpeg path
    }

    with yt_dlp.YoutubeDL(ydl_opts) as ydl:
        ydl.download([youtube_url])  # Download video/audio

    # Find the downloaded MP3 file and rename it
    for file in os.listdir():
        if file.startswith("downloaded_audio") and file.endswith(".mp3"):
            os.rename(file, output_mp3)
            print(f"✅ Download complete! Saved as: {output_mp3}")
            return output_mp3

    print("❌ Error: No MP3 file found after download.")
    return None

def crop_audio(input_file, output_file, start_time, end_time):
    """
    Crops an MP3 file from start_time to end_time.
    
    :param input_file: Path to the MP3 file
    :param output_file: Path to save the cropped file
    :param start_time: Start time in seconds
    :param end_time: End time in seconds
    """
    # Load the MP3 file
    audio = AudioSegment.from_mp3(input_file)
    
    # Convert seconds to milliseconds
    start_ms = start_time * 1000
    end_ms = end_time * 1000
    
    # Crop the audio
    cropped_audio = audio[start_ms:end_ms]
    
    # Export the cropped version
    cropped_audio.export(output_file, format="mp3")
    print(f"✅ Cropped audio saved as {output_file}")

# Example usage
youtube_link = "https://www.youtube.com/watch?v=-RxqaEs-DvY"
mp3_file = "my_audio.mp3"
download_youtube_audio(youtube_link, output_file)


# Example usage
cropped_file = "cropped_audio.mp3"
start_time = 10
end_time = 30
crop_audio(mp3_file, cropped_file, start_time, end_time)
