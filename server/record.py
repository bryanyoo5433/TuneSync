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

# Example usage
record_audio("user_recording.wav", duration=5)