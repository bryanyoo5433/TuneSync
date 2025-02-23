from model.model import PerformanceScorer  # Make sure to import the PerformanceScorer class

def use_trained_model(audio_path: str):
    # Load the trained scorer model and scaler
    scorer = PerformanceScorer.load('trained_model')  # Path where the model and scaler are saved
    
    # Use the model to score the performance of a new audio file
    score, confidence = scorer.score_performance(audio_path)
    
    print(f"Performance Score: {score}/100")
    print(f"Confidence: {confidence['confidence']}%")
    print(f"Score Range: {confidence['min_score']} - {confidence['max_score']}")

    return score

# use_trained_model('./uploads/recording.wav')
