"""
Module Name: record.py
Author: Christina Lee
Date: 2025-02-22
Description:
    This function aligns the user audio with the youtube audio, ensuring the same start time.
    
Usage:
    Adjust youtube_file, user_file, and output_file accordingly.

"""

import librosa
import numpy as np
import soundfile as sf

def process_student_audio(example_path, student_path, output_path):
    # Load the example and student audio files.
    # sr=None loads the audio at its native sampling rate.
    y_example, sr_example = librosa.load(example_path, sr=None)
    y_student, sr_student = librosa.load(student_path, sr=None)
    
    # Optional: if sample rates differ, resample the student audio to match the example.
    if sr_example != sr_student:
        y_student = librosa.resample(y_student, orig_sr=sr_student, target_sr=sr_example)
        sr_student = sr_example

    # Detect the first onset in the example audio.
    onset_frames_example = librosa.onset.onset_detect(y=y_example, sr=sr_example, backtrack=True)
    if len(onset_frames_example) == 0:
        raise ValueError("No onset detected in example audio.")
    onset_time_example = librosa.frames_to_time(onset_frames_example[0], sr=sr_example)

    # Detect the first onset in the student audio.
    onset_frames_student = librosa.onset.onset_detect(y=y_student, sr=sr_student, backtrack=True)
    if len(onset_frames_student) == 0:
        raise ValueError("No onset detected in student audio.")
    onset_time_student = librosa.frames_to_time(onset_frames_student[0], sr=sr_student)
    
    # Calculate the time difference.
    delta = onset_time_student - onset_time_example
    print(f"Example onset: {onset_time_example:.2f} s, Student onset: {onset_time_student:.2f} s, Delta: {delta:.2f} s")
    
    # Align the student audio.
    if delta > 0:
        # Student starts later; crop the leading portion.
        start_sample = int(delta * sr_student)
        y_student_aligned = y_student[start_sample:]
    elif delta < 0:
        # Student starts too early; prepend silence.
        silence_samples = int(abs(delta) * sr_student)
        y_student_aligned = np.concatenate((np.zeros(silence_samples), y_student))
    else:
        y_student_aligned = y_student

    # Compute RMS values for volume normalization.
    # Here, we compute the average RMS over the entire audio.
    rms_example = np.mean(librosa.feature.rms(y=y_example))
    rms_student = np.mean(librosa.feature.rms(y=y_student_aligned))
    
    if rms_student == 0:
        raise ValueError("Student audio appears silent after alignment.")

    # Calculate scaling factor: if student is louder, factor < 1; if softer, factor > 1.
    scaling_factor = rms_example / rms_student
    print(f"RMS (Example): {rms_example:.4f}, RMS (Student): {rms_student:.4f}, Scaling factor: {scaling_factor:.4f}")
    
    # Adjust the volume of the student audio.
    y_student_adjusted = y_student_aligned * scaling_factor

    # Write the processed student audio to file.
    sf.write(output_path, y_student_adjusted, sr_student)
    print(f"Processed student audio saved to {output_path}")
    
    return y_student_adjusted

# Example usage:
if __name__ == "__main__":
    youtube_file = "/Users/christinalee/TuneSync/server/example_recording.mp3"   # Path to the example audio file
    user_file = "/Users/christinalee/TuneSync/server/user_recording.mp3"     # Path to the student audio file
    output_file  = "aligned_user.mp3"  # Path for saving the adjusted student audio
    process_student_audio(youtube_file, user_file, output_file)