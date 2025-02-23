import google.genai as genai
from dotenv import load_dotenv
import os

def gen():
        
    load_dotenv()

    api_key = os.getenv("API_KEY")

    client = genai.Client(api_key=api_key)

    expected = client.files.upload(file='./audio_files/downloaded_audio.mp3')
    actual = client.files.upload(file='./uploads/recording.wav')

    prompt = """
    You are an audio analysis tool. You are given two musical performance segments in audio format.
    The task is to:
    1. Compare the two audio files and identify THREE discrepancies in musical elements, such as rhythm, pitch, timing, or any other noteworthy differences among the duration of the WHOLE clip.
    2. Provide timestamps where discrepancies occur.
    3. For each identified discrepancy, suggest improvements for the musician (audio file 1) to align more closely with the expected musical performance (audio file 2). Note that these improvements are for musicians to improve at playing their instruments
    4. Provide the result in a structured format with the following fields:
        - "timestamp": The timestamp where the discrepancy occurs (float to the tenth of a second).
        - "discrepancy": A brief description of the discrepancy.
        - "suggestion": A specific improvement recommendation for the actual audio file to match the expected.
    """

    response = client.models.generate_content(
        model="gemini-2.0-flash",
        contents=[prompt, actual, expected]
    )

    return response.text
