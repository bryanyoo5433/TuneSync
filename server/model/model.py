import joblib
import librosa
import numpy as np
from typing import Dict, List, Tuple

class AudioComparisonModel:
    def __init__(self, model_path: str):
        """
        Initialize model with a path to the saved model file
        """
        # Load the trained model
        self.model = joblib.load(model_path)
        
    def extract_features(self, audio_path: str) -> Dict[str, float]:
        """
        Extract features from an audio file
        """
        # Load audio file
        y, sr = librosa.load(audio_path)
        
        # Extract features (same as training)
        pitches, magnitudes = librosa.piptrack(y=y, sr=sr)
        pitch_mean = np.mean(pitches[magnitudes > np.median(magnitudes)])
        
        tempo, _ = librosa.beat.beat_track(y=y, sr=sr)
        rmse = librosa.feature.rms(y=y)[0].mean()
        spectral_centroid = librosa.feature.spectral_centroid(y=y, sr=sr)[0].mean()
        mfcc = librosa.feature.mfcc(y=y, sr=sr)
        mfcc_mean = np.mean(mfcc, axis=1)[:5]
        
        return {
            'pitch': pitch_mean,
            'tempo': tempo,
            'energy': rmse,
            'brightness': spectral_centroid,
            'mfcc_1': mfcc_mean[0],
            'mfcc_2': mfcc_mean[1],
            'mfcc_3': mfcc_mean[2],
            'mfcc_4': mfcc_mean[3],
            'mfcc_5': mfcc_mean[4]
        }
    
    def compare_performances(self, expected_path: str, actual_path: str) -> Dict[str, float]:
        """
        Compare two audio files and return differences
        """
        expected_features = self.extract_features(expected_path)
        actual_features = self.extract_features(actual_path)
        
        return {
            key: actual_features[key] - expected_features[key]
            for key in expected_features
        }
    
    def generate_feedback(self, differences: Dict[str, float]) -> List[str]:
        """
        Generate feedback based on differences
        """
        feedback = []
        
        if abs(differences['pitch']) > 1:
            direction = "higher" if differences['pitch'] > 0 else "lower"
            feedback.append(f"Your pitch is {direction} than expected")
        
        if abs(differences['tempo']) > 5:
            direction = "faster" if differences['tempo'] > 0 else "slower"
            feedback.append(f"Your tempo is {direction} than expected")
        
        if abs(differences['energy']) > 0.1:
            direction = "louder" if differences['energy'] > 0 else "softer"
            feedback.append(f"Your playing is {direction} than expected")
        
        return feedback
    
    def evaluate_performance(self, reference_path: str, student_path: str) -> Tuple[float, List[str]]:
        """
        Evaluate a student performance against a reference
        Returns (score, feedback)
        """
        # Get differences between performances
        differences = self.compare_performances(reference_path, student_path)
        
        # Get model prediction
        features = list(differences.values())
        score = self.model.predict([features])[0]
        
        # Generate feedback
        feedback = self.generate_feedback(differences)
        
        return score, feedback

# Example of saving the model after training
def save_trained_model(model, save_path: str):
    """
    Save the trained model to a file
    """
    joblib.dump(model, save_path)
