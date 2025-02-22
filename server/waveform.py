import numpy as np
import librosa
import librosa.display
import matplotlib.pyplot as plt
from scipy.ndimage import gaussian_filter1d
import io
import base64

def generate_waveform(audio_file):
    """
    This function will generate waveform data from an audio file.
    It will return the data as a list and an optional plot image in base64 format.
    """
    # Load audio file
    y, sr = librosa.load(audio_file, sr=None)

    # Step 1: Compute loudness using RMS (Root Mean Square)
    frame_length = 2048  # Adjust for resolution
    hop_length = 512   # Increase for more smoothness
    rms = librosa.feature.rms(y=y, frame_length=frame_length, hop_length=hop_length)[0]

    # Step 2: Normalize the loudness from 0 (p) to 1 (f)
    rms_min, rms_max = np.min(rms), np.max(rms)
    normalized_loudness = (rms - rms_min) / (rms_max - rms_min)

    # Step 3: Smooth the curve using a Gaussian filter (adjust sigma for smoothness)
    smoothed_loudness = gaussian_filter1d(normalized_loudness, sigma=5)

    # Step 4: Time axis (convert frames to seconds)
    times = librosa.times_like(rms, sr=sr, hop_length=hop_length)

    # Step 5: Generate the plot and return as base64 image
    plt.figure(figsize=(10, 4))
    plt.plot(times, smoothed_loudness, label="Dynamics (p → f)", color="blue")
    plt.xlabel("Time (seconds)")
    plt.ylabel("Normalized Dynamics (p to f)")
    plt.title("Musical Phrasing Dynamics")
    plt.ylim(0, 1)  # Keep the range between p (soft) and f (loud)
    plt.legend()
    plt.grid()
    plt.show()

    # Save plot to a bytes buffer and convert to base64 to return as image
    img_buf = io.BytesIO()
    plt.savefig(img_buf, format='png')
    img_buf.seek(0)
    img_base64 = base64.b64encode(img_buf.read()).decode('utf-8')

    return smoothed_loudness.tolist(), img_base64
