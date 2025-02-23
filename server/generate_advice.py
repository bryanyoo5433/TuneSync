import google.genai as genai
from dotenv import load_dotenv
import os

def gen():
    try:
        load_dotenv()
        api_key = os.getenv("API_KEY")

        if not api_key:
            return {"error": "API_KEY not found in environment variables."}

        client = genai.Client(api_key=api_key)

        expected = client.files.upload(file='./audio_files/downloaded_audio.mp3')
        actual = client.files.upload(file='./uploads/recording.wav')

        prompt = """
        You are an audio analysis tool. You are given two musical performance segments in audio format.
        The task is to:
        1. Compare the two audio files and identify THREE discrepancies in musical elements, such as rhythm, pitch, timing, or any other noteworthy differences among the duration of the WHOLE clip.
        2. Provide timestamps where discrepancies occur.
        3. For each identified discrepancy, suggest improvements for the musician (audio file 1) to align more closely with the expected musical performance (audio file 2). Note that these improvements are for musicians to improve at playing their instruments
        4. Provide the result in a structured format with the following fields. Have EXACTLY THIS and don't have any other words like an introductory sentence. Include new lines and don't bold anything. One sentence each for all 9 points:
        5. Make sure the timestamps are all less than the duration of the shorter audio file. 
        6. ALSO MAKE SURE THAT YOU DON'T USE PERIODS AT THE END OF SENTENCES BUT INSTEAD SEMICOLONS. ONLY USE PERIODS FOR THE TIMESTAMP. USE SEMICOLONS BETWEEN EVERY STATEMENT. THERE SHOULD BE 9 of them.   
            1) Timestamp (float to the tenth of a second; include seconds after the timestamp);
            Discrepancy: A brief description of the discrepancy;
            Suggestion: A specific improvement recommendation for the actual audio file to match the expected;
            
            2) Timestamp (float to the tenth of a second);
            Discrepancy: A brief description of the discrepancy;
            Suggestion: A specific improvement recommendation for the actual audio file to match the expected;
            
            3) Timestamp (float to the tenth of a second);
            Discrepancy: A brief description of the discrepancy;
            Suggestion: A specific improvement recommendation for the actual audio file to match the expected;


        """

        response = client.models.generate_content(
            model="gemini-2.0-flash",
            contents=[prompt, actual, expected]
        )

        # result_text = getattr(response, 'text', None)
        # if not isinstance(result_text, str):
        #     result_text = str(result_text) if result_text else "No valid result returned"

        return response.text

    except Exception as e:
        return {"error": str(e)}
