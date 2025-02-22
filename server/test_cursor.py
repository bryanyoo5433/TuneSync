import numpy as np
import librosa
import librosa.display
import matplotlib.pyplot as plt
import matplotlib.animation as animation
import matplotlib.widgets as widgets
from scipy.ndimage import gaussian_filter1d
import sounddevice as sd
import threading

# Global variables
audio_data = None
sr = None
animation_running = False  # Prevent multiple playbacks

def generate_waveform(audio_file):
    global audio_data, sr

    # Load audio file with correct format
    y, sr = librosa.load(audio_file, sr=None, mono=False)  # Preserve stereo if needed
    y = y.astype(np.float32)  # Ensure correct format for playback
    audio_data = y

    # Compute loudness using RMS
    frame_length = 2048
    hop_length = 512
    rms = librosa.feature.rms(y=y, frame_length=frame_length, hop_length=hop_length)[0]

    # Normalize loudness
    rms_min, rms_max = np.min(rms), np.max(rms)
    normalized_loudness = (rms - rms_min) / (rms_max - rms_min)

    # Smooth curve
    smoothed_loudness = gaussian_filter1d(normalized_loudness, sigma=50)
    smoothed_loudness = np.squeeze(smoothed_loudness)  # Ensure 1D

    # Time axis
    times = librosa.times_like(rms, sr=sr, hop_length=hop_length)

    # Setup plot
    fig, ax = plt.subplots(figsize=(10, 4))
    ax.plot(times, smoothed_loudness, label="Dynamics (p → f)", color="blue")
    ax.set_xlabel("Time (seconds)")
    ax.set_ylabel("Normalized Dynamics (p to f)")
    ax.set_title("Musical Phrasing Dynamics")
    ax.set_ylim(0, 1)
    ax.legend()
    ax.grid()

    # Cursor (ball) (FIXED INITIAL POSITION)
    cursor, = ax.plot([times[0]], [smoothed_loudness[0]], 'ro', markersize=10)

    # Update function for animation
    def update_cursor(frame):
        if frame < len(times):
            cursor.set_data([times[frame]], [smoothed_loudness[frame]])  # Move cursor
            fig.canvas.draw_idle()  # Force update
        return cursor,

    # Fix the frame count issue
    ani = animation.FuncAnimation(fig, update_cursor, frames=len(smoothed_loudness), interval=50, blit=False)

    # Function to play audio and start animation
    def play_audio_and_animate(event):
        global animation_running
        if animation_running:
            return  # Prevent multiple playbacks

        animation_running = True

        # Play audio correctly
        def play_audio():
            sd.play(audio_data.T, sr)  # Ensure correct channel format
            sd.wait()
            animation_running = False  # Reset after playback

        threading.Thread(target=play_audio, daemon=True).start()  # Run in background
        ani.event_source.start()  # Start animation

    # Add Play Button
    ax_play = plt.axes([0.8, 0.01, 0.1, 0.05])  # Position (x, y, width, height)
    play_button = widgets.Button(ax_play, "Play")
    play_button.on_clicked(play_audio_and_animate)

    plt.show()

# Run function with your audio file
generate_waveform("/Users/christinalee/TuneSync/server/crescendo.wav")