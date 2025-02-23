import librosa
import os
import numpy as np
from sklearn.preprocessing import StandardScaler
from sklearn.ensemble import RandomForestRegressor
from sklearn.model_selection import GridSearchCV, train_test_split
import pandas as pd
import joblib
from typing import Tuple, Dict
from pathlib import Path

def extract_performance_features(audio_path):
    """
    Extract enhanced musical features from an audio segment
    Returns features as a dictionary for clearer feature tracking
    """
    # Load the audio file
    y, sr = librosa.load(audio_path)
    
    # Enhanced pitch features
    pitches, magnitudes = librosa.piptrack(y=y, sr=sr)
    pitch_mask = magnitudes > np.median(magnitudes)
    pitch_std = np.std(pitches[pitch_mask]) if len(pitch_mask) > 0 else 0
    pitch_mean = np.mean(pitches[pitch_mask]) if len(pitch_mask) > 0 else 0
    
    # Enhanced rhythm features
    onset_env = librosa.onset.onset_strength(y=y, sr=sr)
    tempo, beats = librosa.beat.beat_track(y=y, sr=sr)
    tempo_stability = np.std(onset_env) if len(onset_env) > 0 else 0
    beat_strength = np.mean(onset_env[beats]) if len(beats) > 0 else 0
    
    # Dynamic range
    rms = librosa.feature.rms(y=y)[0]
    dynamic_range = np.max(rms) - np.min(rms) if len(rms) > 0 else 0
    dynamic_std = np.std(rms) if len(rms) > 0 else 0
    
    # Timbre features
    mfcc = librosa.feature.mfcc(y=y, sr=sr, n_mfcc=13)
    mfcc_mean = np.mean(mfcc, axis=1)
    timbre_avg = float(np.mean(mfcc_mean))
    timbre_std = float(np.std(mfcc_mean))
    
    # Spectral features
    spectral = librosa.feature.spectral_centroid(y=y, sr=sr)[0]
    spectral_std = np.std(spectral) if len(spectral) > 0 else 0
    
    # Return features as a dictionary with explicit float conversions
    features = {
        'pitch_std': float(pitch_std),
        'pitch_mean': float(pitch_mean),
        'tempo': float(tempo),
        'rhythm_stability': float(tempo_stability),
        'beat_strength': float(beat_strength),
        'dynamic_range': float(dynamic_range),
        'dynamic_std': float(dynamic_std),
        'timbre_avg': timbre_avg,
        'timbre_std': timbre_std,
        'spectral_std': float(spectral_std)
    }
    
    return features

class PerformanceScorer:
    def __init__(self, model=None, scaler=None):
        self.model = model
        self.scaler = scaler
    
    @classmethod
    def train_new(cls, audio_files: list, scores: list) -> 'PerformanceScorer':
        """
        Create and train a new scorer with optimization
        """
        print("Training new model...")
        features_list = []
        
        # Extract features and ensure we have the same number of features as scores
        for i, audio_file in enumerate(audio_files):
            if i >= len(scores):
                break
            try:
                features = extract_performance_features(audio_file)
                features_list.append(list(features.values()))
                print(f"Processed file {i+1}/{len(audio_files)}")
            except Exception as e:
                print(f"Error processing {audio_file}: {str(e)}")
                continue
        
        if not features_list:
            raise ValueError("No features could be extracted from the audio files")
        
        X = np.array(features_list)
        y = np.array(scores[:len(features_list)])
        
        print(f"Feature matrix shape: {X.shape}")
        print(f"Labels shape: {y.shape}")
        
        # Split data for evaluation
        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=0.2, random_state=42
        )
        
        # Normalize features
        scaler = StandardScaler()
        X_train_scaled = scaler.fit_transform(X_train)
        X_test_scaled = scaler.transform(X_test)
        
        # Define parameter grid for optimization
        param_grid = {
            'n_estimators': [50, 100, 200],
            'max_depth': [3, 5, 7],
            'min_samples_split': [2, 5]
        }
        
        # Perform grid search
        base_model = RandomForestRegressor(random_state=42)
        grid_search = GridSearchCV(
            base_model, 
            param_grid, 
            cv=5, 
            scoring='neg_mean_squared_error',
            n_jobs=-1
        )
        print("Optimizing model parameters...")
        grid_search.fit(X_train_scaled, y_train)
        
        print("Best parameters:", grid_search.best_params_)
        model = grid_search.best_estimator_
        
        # Evaluate model
        train_score = model.score(X_train_scaled, y_train)
        test_score = model.score(X_test_scaled, y_test)
        print(f"Train R² score: {train_score:.3f}")
        print(f"Test R² score: {test_score:.3f}")
        
        return cls(model, scaler)
    
    def score_performance(self, audio_path: str) -> Tuple[float, Dict[str, float]]:
        """
        Score a new performance and return confidence metrics
        """
        features = extract_performance_features(audio_path)
        features_array = np.array(list(features.values())).reshape(1, -1)
        features_scaled = self.scaler.transform(features_array)
        
        tree_predictions = [tree.predict(features_scaled)[0] 
                          for tree in self.model.estimators_]
        
        score = np.mean(tree_predictions)
        confidence_metrics = {
            'score': round(np.clip(score, 0, 100), 1),
            'confidence': round(100 - np.std(tree_predictions), 1),
            'min_score': round(np.clip(np.percentile(tree_predictions, 25), 0, 100), 1),
            'max_score': round(np.clip(np.percentile(tree_predictions, 75), 0, 100), 1)
        }
        
        return confidence_metrics['score'], confidence_metrics
    
    def save(self, directory: str):
        directory = Path(directory)
        directory.mkdir(parents=True, exist_ok=True)
        joblib.dump(self.model, directory / "model.joblib")
        joblib.dump(self.scaler, directory / "scaler.joblib")
    
    @classmethod
    def load(cls, directory: str) -> 'PerformanceScorer':
        directory = Path(directory)
        model = joblib.load(directory / "model.joblib")
        scaler = joblib.load(directory / "scaler.joblib")
        return cls(model, scaler)

def train_model():
    dataset_folder = './dataset/'
    training_files = []
    for filename in os.listdir(dataset_folder):
        if filename.endswith('.mp3'):
            file_path = os.path.join(dataset_folder, filename)
            training_files.append(file_path)

    training_scores = [20, 55, 95, 10, 15, 75, 80, 80, 95, 97, 78, 100, 95, 74, 80, 90, 90]
    
    # Create and train scorer
    scorer = PerformanceScorer.train_new(training_files, training_scores)
    scorer.save("trained_model")

def main():
    # used for testing model
    loaded_scorer = PerformanceScorer.load("trained_model")
    score, confidence = loaded_scorer.score_performance('../audio_files/downloaded_audio.mp3')
    
    print(f"Performance Score: {score}/100")
    print(f"Confidence: {confidence['confidence']}%")
    print(f"Score Range: {confidence['min_score']}-{confidence['max_score']}")

if __name__ == "__main__":
    main()