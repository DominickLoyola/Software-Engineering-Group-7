from flask import Flask, request, jsonify
import os
from PIL import Image
from facial_detector import FacialDetector

app = Flask(__name__)

# Allow bigger file uploads
app.config['MAX_CONTENT_LENGTH'] = 50 * 1024 * 1024  # 50 MB

detector = FacialDetector()

UPLOAD_FOLDER = 'uploads'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# ✅ After every request, add CORS headers
@app.after_request
def add_cors_headers(response):
    response.headers['Access-Control-Allow-Origin'] = '*'
    response.headers['Access-Control-Allow-Headers'] = 'Content-Type,Authorization'
    response.headers['Access-Control-Allow-Methods'] = 'GET,POST,OPTIONS'
    return response

# ✅ Before every request, if it's OPTIONS, reply early
@app.before_request
def handle_options():
    if request.method == 'OPTIONS':
        response = app.make_response('')
        response.headers['Access-Control-Allow-Origin'] = '*'
        response.headers['Access-Control-Allow-Headers'] = 'Content-Type,Authorization'
        response.headers['Access-Control-Allow-Methods'] = 'GET,POST,OPTIONS'
        return response

# ✅ Analyze Image
@app.route('/analyze-image', methods=['POST', 'OPTIONS'])
def analyze_image():
    if 'file' not in request.files:
        return jsonify({'error': 'No file provided'}), 400

    file = request.files['file']
    filename = os.path.join(UPLOAD_FOLDER, file.filename)
    file.save(filename)

    try:
        img = Image.open(filename)
        boxes, top_emotions, _ = detector.process_pil_image(img)

        return jsonify({'top_emotions': top_emotions})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# ✅ Analyze Video
@app.route('/analyze-video', methods=['POST'])
def analyze_video():
    if 'file' not in request.files:
        return jsonify({'error': 'No file provided'}), 400

    file = request.files['file']
    filename = os.path.join(UPLOAD_FOLDER, file.filename)
    file.save(filename)

    try:
        emotions = detector.process_video(filename)
        return jsonify({'weighted_emotions': emotions})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# ✅ Home route to check if server running
@app.route('/')
def home():
    return "Facial Detector API is running!"

if __name__ == "__main__":
    app.run(port=8000)
