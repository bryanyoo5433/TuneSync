from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from werkzeug.utils import secure_filename
import os
from waveform import generate_waveform
from youtube_to_mp3 import download_youtube_audio

app = Flask(__name__)
CORS(app)

app.config['AUDIO_FOLDER'] = 'audio_files'
os.makedirs(app.config['AUDIO_FOLDER'], exist_ok=True)


@app.route('/upload', methods=['POST'])
def upload_file():
    if 'file' not in request.files:
        return jsonify({'error': 'No file part in request'}), 400

    file = request.files['file']

    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400

    # Secure and save the uploaded file
    filename = secure_filename(file.filename)
    file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
    file.save(file_path)

    waveform_data = generate_waveform(file_path)

    return jsonify(waveform_data), 200

@app.route('/process_youtube', methods=['POST'])
def process_youtube():
    # Get YouTube URL from the request
    youtube_url = request.json.get("youtube_url")
    if not youtube_url:
        return jsonify({"error": "No YouTube URL provided"}), 400

    # Download the audio from YouTube
    try:
        output_path = download_youtube_audio(youtube_url, "downloaded_audio.mp3")
    except Exception as e:
        return jsonify({"error": f"Error downloading audio: {str(e)}"}), 500

    if not output_path:
        return jsonify({"error": "Error downloading audio"}), 500
    
    # Generate waveform data from the downloaded audio
    waveform_data = generate_waveform(output_path)

    audio_file_url = f"http://127.0.0.1:5000/audio_files/downloaded_audio.mp3"

    return jsonify({"waveform_data": waveform_data, "audio_file_url": audio_file_url})

@app.route('/audio_files/<path:filename>', methods=['GET'])
def serve_audio(filename):
    return send_from_directory(app.config['AUDIO_FOLDER'], filename)

if __name__ == '__main__':
    app.run(debug=True, port=5000)
