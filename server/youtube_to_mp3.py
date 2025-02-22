"""
Module Name: youtube_to_mp3.py
Author: Christina Lee
Date: 2025-02-22
Description:
    This function converts a youtube video link into an mp3 file.
    
Usage:
    Change youtube_link and output_file accordingly.

"""

import yt_dlp
import os
import imageio_ffmpeg as ffmpeg  # Uses Python-installed FFmpeg

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

# Example usage
youtube_link = "https://www.youtube.com/watch?v=-RxqaEs-DvY"
output_file = "my_audio.mp3"
download_youtube_audio(youtube_link, output_file)
