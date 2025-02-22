from flask import Flask, request, jsonify, render_template
import os
from werkzeug.utils import secure_filename
from waveform import generate_waveform

app = Flask(__name__)

# File upload settings
UPLOAD_FOLDER = 'uploads'
ALLOWED_EXTENSIONS = {'wav', 'mp3', 'flac'}
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

# Check if a file extension is allowed
def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

# Main route to serve HTML page
@app.route('/')
def index():
    return render_template('index.html')

# Route to handle file upload and waveform generation
@app.route('/upload', methods=['POST'])
def upload_file():
    if 'file' not in request.files:
        return jsonify({'error': 'No file part'}), 400
    
    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400
    
    if file and allowed_file(file.filename):
        # Save the file securely
        filename = secure_filename(file.filename)
        file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(file_path)

        # Generate the waveform
        waveform_data, img_base64 = generate_waveform(file_path)

        return jsonify({
            'waveform_data': waveform_data,
            'waveform_image': img_base64
        })
    else:
        return jsonify({'error': 'Invalid file format. Only .wav, .mp3, .flac allowed.'}), 400

if __name__ == '__main__':
    app.run(debug=True)
