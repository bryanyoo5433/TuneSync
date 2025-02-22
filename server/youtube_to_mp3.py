import yt_dlp
import os

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
        'outtmpl': 'downloaded_audio.%(ext)s'  # Saves as the best format first
    }

    with yt_dlp.YoutubeDL(ydl_opts) as ydl:
        ydl.download([youtube_url])  # Download video/audio

    # Find the downloaded MP3 file
    for file in os.listdir():
        if file.startswith("downloaded_audio") and file.endswith(".mp3"):
            os.rename(file, output_mp3)  # Rename it to output_mp3

    print(f"✅ Download complete! Saved as: {output_mp3}")

# Example usage
download_youtube_audio("https://www.youtube.com/watch?v=-RxqaEs-DvY", "my_audio.mp3")
