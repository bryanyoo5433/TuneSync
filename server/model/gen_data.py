import yt_dlp
import os
import imageio_ffmpeg as ffmpeg  # Uses Python-installed FFmpeg

# Get the FFmpeg path from imageio_ffmpeg
FFMPEG_PATH = ffmpeg.get_ffmpeg_exe()  # Correct function name

def download_youtube_audio(youtube_url, output_mp3="output.mp3"):
    """
    Downloads the audio from a YouTube video and converts it into an MP3 file.
    """

    if not os.path.exists("model/dataset"):
        os.makedirs("model/dataset")
    
    output_path = os.path.join("model/dataset", output_mp3)

    ydl_opts = {
        'format': 'bestaudio/best',
        'noplaylist': True,
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

# links = [
#     "https://www.youtube.com/watch?v=CRQ9lFZK3kg",
#     "https://youtube.com/clip/UgkxmZN4h5glA8jfTEqKI-fkny-BpU7HMcCm?si=kATDgmfhsL_z6Dr6",
#     "https://www.youtube.com/clip/UgkxDWajlzdQe7vOtuL-LcHHm-od-brnMDY8",
#     "https://www.youtube.com/watch?v=nkf5OKok2VY",
#     "https://www.youtube.com/watch?v=boXzdQsJe2k",
#     "https://youtube.com/clip/UgkxaFXMctgMQP0qra7m8ksF1wZANduyNJKg?si=RtOc0XAH2UbQ3s-d",
#     "https://youtube.com/clip/UgkxU_Jjx367Gv39O8smoVu8y39PCSjDqYbb?si=1yanT8KJBvMtxva3",
#     "https://www.youtube.com/watch?v=328nODWJD-M",
#     "https://youtube.com/clip/UgkxaBP3aY0BXNlwqvaQyhjkco4XmpvQSA77?si=bo6VKSvsuZg_Knjt ",
#     "https://youtube.com/clip/Ugkx2ydrldVdtsCun6-uwVGRXg1lYNOo3jvG?si=hnhNoAHSHpH06_qM",
#     "https://youtube.com/clip/UgkxSuN7t9zR8gUjb_6nX0AlggbZIDuUX6qO?si=ToOywqp7Zl9OI2fG"
# ]

links = [
    "https://youtube.com/clip/Ugkx9z7ou_EzggEQUnnlnUJ1K7yBTX9vBjBk?si=geBxPLxn8s9T8rGK",
    "https://youtube.com/clip/Ugkxg_6gkzb-z73BOJhvyuUuwTAJdzz991Ef?si=5A0H8yEQdwjiVD_H",
    "https://youtube.com/clip/UgkxKnY-vCGa5MO1GI8l3WJKQifR4qxaJTYe?si=UBvlVLh-atiQQHti",
    "https://youtube.com/clip/UgkxY5NO4h2uzvOS1Y14JfDkZh6NtSfE-zuG?si=8JnJhM5FSC51btUI",
    "https://youtube.com/clip/UgkxvTlCVuEz72gm88uQnTrIJYi6IeJK_yOJ?si=gVcFi33gFhqgKxzi",
    "https://youtube.com/clip/UgkxJMWvwzgFDKQGYj38a6mTolEbglFgGDfh?si=nvK7mkikItBxtJv_"
]
for i, link in enumerate(links):
    path = "".join([str(i+11), ".mp3"])
    download_youtube_audio(link, path)
