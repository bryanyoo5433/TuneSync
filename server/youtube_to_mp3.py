import yt_dlp
import os
import imageio_ffmpeg as ffmpeg  # Uses Python-installed FFmpeg

# Get the FFmpeg path from imageio_ffmpeg
FFMPEG_PATH = ffmpeg.get_ffmpeg_exe()  # Correct function name

def download_youtube_audio(youtube_url, output_mp3="output.mp3"):
    """
    Downloads the audio from a YouTube video and converts it into an MP3 file.
    """

    if not os.path.exists("audio_files"):
        os.makedirs("audio_files")
    
    output_path = os.path.join("audio_files", output_mp3)

    ydl_opts = {
        'format': 'bestaudio/best',
        'noplaylist': True,  # Ensure only the video/clip itself is downloaded
        'postprocessors': [{
            'key': 'FFmpegExtractAudio',
            'preferredcodec': 'mp3',
            'preferredquality': '192'
        }],
        'postprocessor_args': ['-ss', "00:00:00"], 
        'outtmpl': 'downloaded_audio.%(ext)s',
        'ffmpeg_location': FFMPEG_PATH
    }


    with yt_dlp.YoutubeDL(ydl_opts) as ydl:
        ydl.download([youtube_url])  # Download video/audio

    # Find the downloaded MP3 file and move it to the audio_files folder
    for file in os.listdir():
        if file.startswith("downloaded_audio") and file.endswith(".mp3"):
            temp_mp3_path = os.path.join(os.getcwd(), file)  # Get the current file path
            if os.path.exists(output_path):
                os.remove(output_path)  # Remove the old file if it exists
            os.rename(temp_mp3_path, output_path)  # Rename and move it to the audio_files folder
            print(f"✅ Download complete! Saved as: {output_path}")
            return output_path

    print("❌ Error: No MP3 file found after download.")
    return None

# Example usage
# youtube_link = "https://youtube.com/clip/UgkxQGPOYrsPQ8PrsAx9mYhpfDGm3GiYhVxi?si=KRC8xS83fLtrc2Qm"
# mp3_file = "my_audio.mp3"
# download_youtube_audio(youtube_link, mp3_file)

