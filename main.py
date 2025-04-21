import torch
import cv2
import numpy as np
from PIL import Image, UnidentifiedImageError
from collections import defaultdict, Counter
from facenet_pytorch import MTCNN, InceptionResnetV1
from deepface import DeepFace
import os
import time
import json
from flask import Flask, request, jsonify, send_from_directory
from datetime import datetime
from flask_cors import CORS  # Added for cross-origin requests

class FacialDetector:
    def __init__(self, device=None):
        self.device = torch.device('cuda:0' if torch.cuda.is_available() else 'cpu') if device is None else device
        print(f"Using device: {self.device}")

        self.mtcnn = MTCNN(image_size=160, margin=0, min_face_size=20,
                           thresholds=[0.6, 0.7, 0.7], factor=0.709,
                           post_process=True, device=self.device)

        self.facenet = InceptionResnetV1(pretrained='vggface2').eval().to(self.device)
        self.confidence_threshold = 20  # Lowered for video processing

    def process_pil_image(self, img):
        if isinstance(img, np.ndarray):
            img = Image.fromarray(img)
        boxes, top_emotions, all_emotions = self.analyze_emotions(img)
        return boxes, top_emotions, all_emotions

    def analyze_emotions(self, img):
        try:
            if isinstance(img, Image.Image):
                img_np = np.array(img)
            else:
                img_np = img

            boxes, _ = self.mtcnn.detect(img)
            if boxes is None or len(boxes) == 0:
                print("❌ No face detected for emotion analysis.")
                return None, [], {}

            # Make sure coordinates are within image boundaries
            height, width = img_np.shape[:2]
            x1 = max(0, int(boxes[0][0]))
            y1 = max(0, int(boxes[0][1]))
            x2 = min(width, int(boxes[0][2]))
            y2 = min(height, int(boxes[0][3]))
            
            # Check if we have a valid face region
            if x2 <= x1 or y2 <= y1:
                print("❌ Invalid face coordinates.")
                return boxes, [], {}
                
            face_crop = img_np[y1:y2, x1:x2]
            
            # Make sure the face crop is large enough for analysis
            if face_crop.size == 0 or face_crop.shape[0] < 10 or face_crop.shape[1] < 10:
                print("❌ Face crop too small for analysis.")
                return boxes, [], {}

            analysis = DeepFace.analyze(img_path=face_crop, actions=['emotion'], enforce_detection=False)
            emotions = analysis[0]['emotion'] if isinstance(analysis, list) else analysis['emotion']

            sorted_emotions = sorted(emotions.items(), key=lambda x: x[1], reverse=True)
            top_3 = [(emotion, score) for emotion, score in sorted_emotions[:3]]

            if top_3 and top_3[0][1] < self.confidence_threshold:
                print(f"⚠️ Low confidence prediction: {top_3[0][0]} ({top_3[0][1]:.1f}%). Consider retaking.")
            
            return boxes, top_3, emotions

        except Exception as e:
            print(f"⚠️ Emotion analysis failed: {str(e)}")
            return None, [], {}

    def process_video(self, video_path):
        cap = cv2.VideoCapture(video_path)
        if not cap.isOpened():
            print(f"❌ Could not open video: {video_path}")
            return {}, []

        print("📹 Processing video... Press 'q' to stop.")
        emotion_score_log = defaultdict(float)
        frame_index = 0
        processed_frames = 0
        frame_sample_rate = 3  # Process every 3rd frame instead of 5th

        while cap.isOpened():
            ret, frame = cap.read()
            if not ret:
                break

            if frame_index % frame_sample_rate == 0:
                frame_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
                img = Image.fromarray(frame_rgb)
                boxes, _, all_emotions = self.analyze_emotions(img)
                
                if boxes is not None and all_emotions:
                    for emotion, score in all_emotions.items():
                        emotion_score_log[emotion] += score
                    processed_frames += 1
                    
                frame = self.draw_boxes(frame, boxes)
                cv2.putText(frame, f"Processing: {processed_frames} frames", (10, 30), 
                          cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 255, 0), 2)

            cv2.imshow("Video Feed", frame)
            if cv2.waitKey(1) & 0xFF == ord('q'):
                break
            frame_index += 1

        cap.release()
        cv2.destroyAllWindows()
        
        # Normalize the emotion scores by the number of processed frames
        if processed_frames > 0:
            for emotion in emotion_score_log:
                emotion_score_log[emotion] /= processed_frames
                
        top_emotions = self.summarize_weighted_emotions(emotion_score_log)
        return emotion_score_log, top_emotions

    def process_webcam(self):
        cap = cv2.VideoCapture(0)
        if not cap.isOpened():
            print("❌ Could not access the webcam. Please check your camera connection.")
            return {
                "discrete_emotions": None,
                "continuous_emotions": None,
                "raw_emotion_log": [],
                "continuous_emotion_scores": {}
            }

        emotion_log = []
        continuous_mode = False
        print("📷 Webcam active. Options:")
        print("  • Press 'e' to analyze current expression")
        print("  • Press 'c' to toggle continuous analysis mode")
        print("  • Press 'q' to quit")
        
        frame_buffer = []  # Store recent frames for analysis
        buffer_size = 5
        continuous_emotion_scores = defaultdict(float)
        continuous_frames = 0
        
        while cap.isOpened():
            ret, frame = cap.read()
            if not ret:
                break

            # Add current frame to buffer
            if len(frame_buffer) >= buffer_size:
                frame_buffer.pop(0)
            frame_buffer.append(frame.copy())
            
            # Display mode status
            mode_text = "CONTINUOUS" if continuous_mode else "MANUAL"
            cv2.putText(frame, f"Mode: {mode_text}", (10, 30), 
                        cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 255, 0), 2)
            
            # Continuous mode processing
            if continuous_mode and len(frame_buffer) == buffer_size:
                # Process middle frame from buffer to reduce lag
                analysis_frame = frame_buffer[buffer_size // 2].copy()
                frame_rgb = cv2.cvtColor(analysis_frame, cv2.COLOR_BGR2RGB)
                img = Image.fromarray(frame_rgb)
                
                boxes, top_emotions, all_emotions = self.analyze_emotions(img)
                if boxes is not None:
                    frame = self.draw_boxes(frame, boxes)
                    
                if top_emotions:
                    emotion_text = f"{top_emotions[0][0]}: {top_emotions[0][1]:.1f}%"
                    cv2.putText(frame, emotion_text, (10, 60), 
                                cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 255, 0), 2)
                    emotion_log.append(top_emotions[0][0])
                    
                    # Add to continuous tracking
                    for emotion, score in all_emotions.items():
                        continuous_emotion_scores[emotion] += score
                    continuous_frames += 1
            
            cv2.imshow("Webcam Feed", frame)
            key = cv2.waitKey(1) & 0xFF

            if key == ord('q'):
                break
            elif key == ord('e'):
                print("\n📸 Capturing your expression...")
                temp_emotions = []
                for _ in range(3):
                    ret, frame = cap.read()
                    if not ret:
                        continue
                    img = Image.fromarray(cv2.cvtColor(frame, cv2.COLOR_BGR2RGB))
                    _, top_emotions, all_emotions = self.analyze_emotions(img)
                    if top_emotions:
                        temp_emotions.append(top_emotions[0][0])
                    time.sleep(0.5)

                emotion_log.extend(temp_emotions)
                if temp_emotions:
                    most_common = Counter(temp_emotions).most_common(1)[0][0]
                    print(f"I see that you're feeling {most_common} right now.")
                else:
                    print("I couldn't quite read your expression. Could you try again?")
                    
            elif key == ord('c'):
                # Toggle continuous mode
                continuous_mode = not continuous_mode
                print(f"\n{'Starting' if continuous_mode else 'Stopping'} continuous mood tracking...")
                
                # Reset continuous tracking if turning off
                if not continuous_mode and continuous_frames > 0:
                    # Normalize scores
                    for emotion in continuous_emotion_scores:
                        continuous_emotion_scores[emotion] /= continuous_frames
                    top_emotions = self.summarize_weighted_emotions(continuous_emotion_scores)
                    continuous_emotion_scores = defaultdict(float)
                    continuous_frames = 0

        cap.release()
        cv2.destroyAllWindows()
        
        # Summarize all emotions detected
        discrete_emotions = self.summarize_emotions(emotion_log)
        
        # If in continuous mode, also show weighted summary
        continuous_results = None
        if continuous_mode and continuous_frames > 0:
            for emotion in continuous_emotion_scores:
                continuous_emotion_scores[emotion] /= continuous_frames
            continuous_results = self.summarize_weighted_emotions(continuous_emotion_scores)
        
        return {
            "discrete_emotions": discrete_emotions if emotion_log else None,
            "continuous_emotions": continuous_results if continuous_mode and continuous_frames > 0 else None,
            "raw_emotion_log": emotion_log,
            "continuous_emotion_scores": dict(continuous_emotion_scores) if continuous_frames > 0 else None
        }

    def summarize_emotions(self, emotion_log):
        if not emotion_log:
            print("\n😕 I wasn't able to detect any clear emotions.")
            return None

        counts = Counter(emotion_log)
        total = sum(counts.values())
        
        # Calculate percentages
        percentages = {emotion: (count/total)*100 for emotion, count in counts.items()}
        top_3 = sorted(percentages.items(), key=lambda x: x[1], reverse=True)[:3]
        
        # Create a more conversational, user-friendly summary
        if len(top_3) == 1:
            print(f"\n😊 During our session, you primarily expressed {top_3[0][0]}.")
        elif len(top_3) == 2:
            if top_3[0][1] > 70:
                print(f"\n😊 You were mostly showing {top_3[0][0]}, with a touch of {top_3[1][0]}.")
            else:
                print(f"\n😊 Your expressions showed a mixture of {top_3[0][0]} and {top_3[1][0]}.")
        else:
            # Check if there's a dominant emotion
            if top_3[0][1] > 60:
                print(f"\n😊 I primarily saw {top_3[0][0]} in your expressions, with hints of {top_3[1][0]} and {top_3[2][0]}.")
            elif top_3[0][1] - top_3[1][1] < 10:  # Close between top two
                print(f"\n😊 Your mood seemed to shift between {top_3[0][0]} and {top_3[1][0]}, with some {top_3[2][0]} as well.")
            else:
                print(f"\n😊 I detected a range of emotions, primarily {top_3[0][0]}, followed by {top_3[1][0]} and {top_3[2][0]}.")
        
        return top_3

    def summarize_weighted_emotions(self, emotion_score_log):
        if not emotion_score_log:
            print("\n😕 I wasn't able to detect any clear emotions.")
            return None

        total_score = sum(emotion_score_log.values())
        if total_score == 0:
            print("\n😕 I didn't collect enough data to determine your mood.")
            return None
            
        # Calculate percentages
        percentages = {emotion: (score/total_score)*100 for emotion, score in emotion_score_log.items()}
        sorted_scores = sorted(percentages.items(), key=lambda x: x[1], reverse=True)
        top_3 = sorted_scores[:3]
        
        # Friendly descriptors for emotion intensities
        def get_intensity(percentage):
            if percentage > 75:
                return "strongly"
            elif percentage > 50:
                return "clearly"
            elif percentage > 30:
                return "somewhat"
            else:
                return "slightly"

        # Create more natural, friendly summary based on patterns
        print("\n🧠 Mood Analysis Results:")
        
        # Check different patterns and create appropriate messages
        if len(top_3) == 1 or top_3[0][1] > 80:
            # Single dominant emotion
            print(f"You appear to be {get_intensity(top_3[0][1])} {top_3[0][0]}.")
            
        elif len(top_3) >= 2 and (top_3[0][1] - top_3[1][1] < 15):
            # Two emotions are close - mixed state
            print(f"Your expressions show a mixture of {top_3[0][0]} and {top_3[1][0]}.")
            if len(top_3) >= 3 and top_3[2][1] > 15:
                print(f"I also noticed some {top_3[2][0]} in your expressions.")
                
        elif len(top_3) >= 2:
            # Clear primary emotion with secondary influences
            print(f"You're primarily showing {top_3[0][0]}")
            
            secondary_emotions = []
            for emotion, score in top_3[1:]:
                if score > 10:  # Only mention emotions with reasonable presence
                    secondary_emotions.append(emotion)
            
            if secondary_emotions:
                if len(secondary_emotions) == 1:
                    print(f"with some {secondary_emotions[0]} also visible.")
                else:
                    print(f"with hints of {' and '.join(secondary_emotions)}.")
        
        # Add an interpretation or suggestion based on the dominant emotion
        dominant_emotion = top_3[0][0].lower()
        if dominant_emotion == "happy" or dominant_emotion == "neutral":
            print("You seem to be in a good mood right now!")
        elif dominant_emotion == "sad":
            print("You might be feeling down at the moment.")
        elif dominant_emotion == "angry":
            print("You appear to be experiencing some frustration.")
        elif dominant_emotion == "surprise":
            print("Something seems to have caught you off guard.")
        elif dominant_emotion == "fear":
            print("You might be feeling a bit anxious or concerned.")
        elif dominant_emotion == "disgust":
            print("Something seems to be bothering you.")
            
        return top_3

    def draw_boxes(self, frame, boxes):
        if boxes is not None:
            for box in boxes:
                x1, y1, x2, y2 = [int(coord) for coord in box]
                cv2.rectangle(frame, (x1, y1), (x2, y2), (0, 255, 0), 2)
        return frame


# Improved API Implementation
class EmotionAnalysisAPI:
    def __init__(self, storage_path="emotion_results"):
        self.storage_path = storage_path
        self.detector = FacialDetector()
        
        # Create storage directory if it doesn't exist
        if not os.path.exists(storage_path):
            os.makedirs(storage_path)
        
        # Create thumbnails directory
        self.thumbnails_path = os.path.join(storage_path, "thumbnails")
        if not os.path.exists(self.thumbnails_path):
            os.makedirs(self.thumbnails_path)
    
    def save_results(self, result_data, source_type, source_name=None, image_data=None):
        """
        Save emotion analysis results to a JSON file and optionally save image thumbnail
        
        Parameters:
        - result_data: Dictionary containing the emotion analysis results
        - source_type: String indicating the source ('image', 'video', or 'webcam')
        - source_name: Optional filename of the source
        - image_data: Optional image data to save as thumbnail
        
        Returns:
        - String with the path where the data was saved and result ID
        """
        # Generate a timestamp for the filename
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        result_id = timestamp
        
        # Create a descriptive filename
        if source_name:
            filename = f"{timestamp}_{source_type}_{os.path.basename(source_name)}.json"
        else:
            filename = f"{timestamp}_{source_type}_analysis.json"
        
        # Generate a human-readable summary
        summary = self.generate_text_summary(result_data, source_type)
            
        # Create the full metadata
        metadata = {
            "id": result_id,
            "timestamp": datetime.now().isoformat(),
            "source_type": source_type,
            "source_name": source_name,
            "summary": summary,
            "results": result_data,
            "thumbnail": None
        }
        
        # Save thumbnail if image data is provided
        if image_data is not None and isinstance(image_data, np.ndarray):
            thumbnail_filename = f"{timestamp}_thumbnail.jpg"
            thumbnail_path = os.path.join(self.thumbnails_path, thumbnail_filename)
            
            # Resize image to save space
            h, w = image_data.shape[:2]
            max_dim = 300
            if max(h, w) > max_dim:
                scale = max_dim / max(h, w)
                new_w = int(w * scale)
                new_h = int(h * scale)
                image_data = cv2.resize(image_data, (new_w, new_h))
            
            cv2.imwrite(thumbnail_path, image_data)
            metadata["thumbnail"] = f"thumbnails/{thumbnail_filename}"
        
        # Save to file
        filepath = os.path.join(self.storage_path, filename)
        with open(filepath, 'w') as f:
            json.dump(metadata, f, indent=2)
            
        print(f"\n✅ Analysis results saved to: {filepath}")
        return {"filepath": filepath, "result_id": result_id}
    
    def generate_text_summary(self, result_data, source_type):
        """Generate a human-readable summary of the emotion analysis results"""
        summary = ""
        
        if source_type == "image":
            top_emotions = result_data.get("top_emotions", [])
            if top_emotions and len(top_emotions) > 0:
                emotion = top_emotions[0][0]
                score = top_emotions[0][1]
                summary = f"Primary emotion detected: {emotion} ({score:.1f}%)"
            else:
                summary = "No clear emotions detected in image"
                
        elif source_type == "video":
            top_emotions = result_data.get("top_emotions", [])
            if top_emotions and len(top_emotions) > 0:
                emotion = top_emotions[0][0]
                score = top_emotions[0][1]
                summary = f"Overall video emotion: {emotion} ({score:.1f}%)"
            else:
                summary = "No clear emotions detected in video"
                
        elif source_type == "webcam":
            discrete = result_data.get("discrete_emotions", [])
            continuous = result_data.get("continuous_emotions", [])
            
            if discrete and len(discrete) > 0:
                emotion = discrete[0][0]
                score = discrete[0][1]
                summary = f"Primary observed emotion: {emotion} ({score:.1f}%)"
            elif continuous and len(continuous) > 0:
                emotion = continuous[0][0]
                score = continuous[0][1]
                summary = f"Primary continuous emotion: {emotion} ({score:.1f}%)"
            else:
                summary = "No clear emotions detected during session"
                
        return summary
    
    def start_flask_server(self, host='0.0.0.0', port=5000):
        """Start the Flask API server with CORS enabled"""
        app = Flask(__name__)
        CORS(app)  # Enable CORS for all routes
        
        @app.route('/', methods=['GET'])
        def index():
            return jsonify({
                "status": "success",
                "message": "Emotion Analysis API is running",
                "endpoints": {
                    "analyze_image": "/api/analyze/image",
                    "analyze_video": "/api/analyze/video",
                    "analyze_webcam": "/api/analyze/webcam",
                    "get_all_results": "/api/results",
                    "get_result": "/api/results/<result_id>",
                    "get_thumbnail": "/api/thumbnails/<filename>"
                }
            })
        
        @app.route('/api/analyze/image', methods=['POST'])
        def analyze_image():
            if 'image' in request.files:
                # Handle file upload
                file = request.files['image']
                temp_path = os.path.join(self.storage_path, "temp_" + file.filename)
                file.save(temp_path)
                img_path = temp_path
            elif 'image_path' in request.json:
                img_path = request.json['image_path']
            else:
                return jsonify({"error": "No image provided. Send either 'image' as file or 'image_path' in JSON"}), 400
                
            if not os.path.isfile(img_path):
                return jsonify({"error": "Image file not found"}), 404
                
            try:
                img = Image.open(img_path)
                img_np = np.array(img)
                boxes, top_emotions, all_emotions = self.detector.process_pil_image(img)
                
                # Create a copy of the image with boxes drawn
                img_with_boxes = None
                if boxes is not None:
                    img_with_boxes = self.detector.draw_boxes(img_np.copy(), boxes)
                
                result = {
                    "top_emotions": top_emotions,
                    "all_emotions": all_emotions
                }
                
                # Save the results with thumbnail
                saved_info = self.save_results(
                    result, 
                    "image", 
                    os.path.basename(img_path), 
                    img_with_boxes if img_with_boxes is not None else img_np
                )
                
                # Clean up temp file if needed
                if 'image' in request.files and os.path.exists(temp_path):
                    os.remove(temp_path)
                
                return jsonify({
                    "status": "success",
                    "result_id": saved_info["result_id"],
                    "results": result,
                    "summary": self.generate_text_summary(result, "image")
                })
                
            except Exception as e:
                return jsonify({"error": str(e)}), 500
        
        @app.route('/api/analyze/video', methods=['POST'])
        def analyze_video():
            if 'video' in request.files:
                # Handle file upload
                file = request.files['video']
                temp_path = os.path.join(self.storage_path, "temp_" + file.filename)
                file.save(temp_path)
                video_path = temp_path
            elif 'video_path' in request.json:
                video_path = request.json['video_path']
            else:
                return jsonify({"error": "No video provided. Send either 'video' as file or 'video_path' in JSON"}), 400
                
            if not os.path.isfile(video_path):
                return jsonify({"error": "Video file not found"}), 404
                
            try:
                emotion_scores, top_emotions = self.detector.process_video(video_path)
                
                # Extract a thumbnail from the video
                thumbnail = None
                cap = cv2.VideoCapture(video_path)
                if cap.isOpened():
                    ret, frame = cap.read()
                    if ret:
                        thumbnail = frame
                    cap.release()
                
                result = {
                    "emotion_scores": dict(emotion_scores),
                    "top_emotions": top_emotions
                }
                
                # Save the results with thumbnail
                saved_info = self.save_results(
                    result, 
                    "video", 
                    os.path.basename(video_path),
                    thumbnail
                )
                
                # Clean up temp file if needed
                if 'video' in request.files and os.path.exists(temp_path):
                    os.remove(temp_path)
                
                return jsonify({
                    "status": "success",
                    "result_id": saved_info["result_id"],
                    "results": result,
                    "summary": self.generate_text_summary(result, "video")
                })
                
            except Exception as e:
                return jsonify({"error": str(e)}), 500
        
        @app.route('/api/analyze/webcam', methods=['POST'])
        def analyze_webcam():
            try:
                # Start webcam analysis
                print("\n🎥 Starting webcam analysis via API...")
                results = self.detector.process_webcam()
                
                # Save the results (without thumbnail for webcam sessions)
                saved_info = self.save_results(results, "webcam")
                
                return jsonify({
                    "status": "success",
                    "result_id": saved_info["result_id"],
                    "results": results,
                    "summary": self.generate_text_summary(results, "webcam")
                })
                
            except Exception as e:
                return jsonify({"error": str(e)}), 500
                
        @app.route('/api/results', methods=['GET'])
        def get_all_results():
            try:
                results = []
                for filename in os.listdir(self.storage_path):
                    if filename.endswith('.json'):
                        with open(os.path.join(self.storage_path, filename), 'r') as f:
                            data = json.load(f)
                            # Create a simplified version without full result data
                            simplified = {
                                "id": data.get("id"),
                                "timestamp": data.get("timestamp"),
                                "source_type": data.get("source_type"),
                                "source_name": data.get("source_name"),
                                "summary": data.get("summary"),
                                "thumbnail": data.get("thumbnail")
                            }
                            results.append(simplified)
                
                # Sort by timestamp (newest first)
                results.sort(key=lambda x: x["timestamp"], reverse=True)
                
                return jsonify({
                    "status": "success",
                    "count": len(results),
                    "results": results
                })
                
            except Exception as e:
                return jsonify({"error": str(e)}), 500
                
        @app.route('/api/results/<result_id>', methods=['GET'])
        def get_result(result_id):
            try:
                # Find files that match the ID pattern
                matching_files = [f for f in os.listdir(self.storage_path) 
                                 if f.startswith(result_id) and f.endswith('.json')]
                
                if not matching_files:
                    return jsonify({"error": "Result not found"}), 404
                    
                # Load the first matching file
                with open(os.path.join(self.storage_path, matching_files[0]), 'r') as f:
                    result = json.load(f)
                
                return jsonify({
                    "status": "success",
                    "result": result
                })
                
            except Exception as e:
                return jsonify({"error": str(e)}), 500
        
        @app.route('/api/thumbnails/<path:filename>', methods=['GET'])
        def get_thumbnail(filename):
            return send_from_directory(self.thumbnails_path, filename)
        
        print(f"\n🚀 API server starting on http://{host}:{port}")
        app.run(host=host, port=port, debug=True)


if __name__ == "__main__":
    # Create the API instance
    api = EmotionAnalysisAPI(storage_path="emotion_results")
    detector = FacialDetector()

    while True:
        print("\n==== Emotion Detection System ====")
        print("1: Analyze an Image")
        print("2: Analyze a Video")
        print("3: Use Webcam")
        print("4: Start API Server")
        print("5: Exit")
        action = input("\nWhat would you like to do? (1-5): ")
        
        if action == '5':
            print("Thank you for using the Emotion Detection System. Goodbye!")
            break
            
        if action not in ['1', '2', '3', '4', '5']:
            print("Sorry, I didn't understand that choice. Please enter 1, 2, 3, 4, or 5.")
            continue

        if action == '1':
            while True:
                img_path = input("\nPlease enter the path to your image: ")
                if os.path.isfile(img_path):
                    try:
                        img = Image.open(img_path)
                        break
                    except UnidentifiedImageError:
                        print("❌ That doesn't seem to be a valid image file. Please try again.")
                else:
                    print("❌ I couldn't find that file. Please check the path and try again.")

            print("\n🔍 Analyzing your image...")
            boxes, top_emotions, all_emotions = detector.process_pil_image(img)
            
            # Save results
            result = {
                "top_emotions": top_emotions,
                "all_emotions": all_emotions
            }
            # Create a copy of the image with boxes drawn
            img_np = np.array(img)
            img_with_boxes = detector.draw_boxes(img_np.copy(), boxes)
            api.save_results(result, "image", img_path, img_with_boxes)
            
            # Display image with boxes
            cv2.imshow("Your Image", cv2.cvtColor(img_with_boxes, cv2.COLOR_RGB2BGR))
            cv2.waitKey(0)
            cv2.destroyAllWindows()

            if top_emotions:
                        # Create a friendly, sentence-based output
                        if len(top_emotions) == 1:
                            print(f"\n😊 In this image, you appear to be {top_emotions[0][0]}.")
                        elif len(top_emotions) == 2:
                            if top_emotions[0][1] > 70:
                                print(f"\n😊 You look primarily {top_emotions[0][0]}, with a hint of {top_emotions[1][0]}.")
                            else:
                                print(f"\n😊 Your expression shows a blend of {top_emotions[0][0]} and {top_emotions[1][0]}.")
                        else:
                            # Check if there's a dominant emotion
                            if top_emotions[0][1] > 60:
                                print(f"\n😊 You look mainly {top_emotions[0][0]}, with some {top_emotions[1][0]} and {top_emotions[2][0]} mixed in.")
                            elif top_emotions[0][1] - top_emotions[1][1] < 10:  # Close between top two
                                print(f"\n😊 Your expression is a mixture of {top_emotions[0][0]} and {top_emotions[1][0]}, with a touch of {top_emotions[2][0]}.")
                            else:
                                print(f"\n😊 I can see several emotions in your expression - primarily {top_emotions[0][0]}, followed by {top_emotions[1][0]} and {top_emotions[2][0]}.")
            else:
                        print("\n😕 I couldn't detect any clear emotions in this image. The lighting or angle might be affecting the analysis.")

        elif action == '2':
                    while True:
                        video_path = input("\nPlease enter the path to your video: ")
                        if os.path.isfile(video_path):
                            print("\n🎬 Starting video analysis. This may take a moment...")
                            emotion_scores, top_emotions = detector.process_video(video_path)
                            
                            # Save results with thumbnail
                            cap = cv2.VideoCapture(video_path)
                            thumbnail = None
                            if cap.isOpened():
                                ret, frame = cap.read()
                                if ret:
                                    thumbnail = frame
                                cap.release()
                            
                            result = {
                                "emotion_scores": dict(emotion_scores),
                                "top_emotions": top_emotions
                            }
                            api.save_results(result, "video", video_path, thumbnail)
                            break
                        else:
                            print("❌ I couldn't find that file. Please check the path and try again.")

        elif action == '3':
            print("\n📸 Starting your webcam. Get ready to see your emotions in real-time!")
            results = detector.process_webcam()
                    
            # Save results
            api.save_results(results, "webcam")
                    
        elif action == '4':
            print("\n🚀 Starting the API server...")
            api.start_flask_server()


#Aman
#
#Use case: Upload image for facial detection
#Takes in file path for image
#Processes image and detects face to be prepared for mood readings
#
#Use case: Upload video for facial detection
#Takes in file path for video
#Processes video and detects face to be prepared for mood readings

#Pranava
#
#Use Case: Receive mood reading for uploaded image
#Processed image is analyzed by model.
#Model provides moods and weights for the various moods 
#
#Use Case: Receive mood reading for uploaded video
#Processed image is analyzed by model.
#Model provides moods and weights for the various moods 