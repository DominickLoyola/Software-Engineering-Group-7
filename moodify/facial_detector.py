import torch
import cv2
import sys
import numpy as np
from PIL import Image, UnidentifiedImageError
from collections import defaultdict, Counter
from facenet_pytorch import MTCNN, InceptionResnetV1
from deepface import DeepFace
import os
import time
import requests

if sys.platform == "darwin":
    cv2.imshow = lambda *args, **kwargs: None
    cv2.waitKey = lambda *args, **kwargs: -1

class FacialDetector:
    def __init__(self, device=None):
        self.device = torch.device('cuda:0' if torch.cuda.is_available() else 'cpu') if device is None else device
        print(f"Using device: {self.device}")

        self.mtcnn = MTCNN(image_size=160, margin=0, min_face_size=20,
                           thresholds=[0.6, 0.7, 0.7], factor=0.709,
                           post_process=True, device=self.device)

        self.facenet = InceptionResnetV1(pretrained='vggface2').eval().to(self.device)
        self.confidence_threshold = 20

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

            height, width = img_np.shape[:2]
            x1 = max(0, int(boxes[0][0]))
            y1 = max(0, int(boxes[0][1]))
            x2 = min(width, int(boxes[0][2]))
            y2 = min(height, int(boxes[0][3]))

            if x2 <= x1 or y2 <= y1:
                print("❌ Invalid face coordinates.")
                return boxes, [], {}

            face_crop = img_np[y1:y2, x1:x2]

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
            return {}

        print("📹 Processing video... Press 'q' to stop.")
        emotion_score_log = defaultdict(float)
        frame_index = 0
        processed_frames = 0
        frame_sample_rate = 3

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

        if processed_frames > 0:
            for emotion in emotion_score_log:
                emotion_score_log[emotion] /= processed_frames

        self.summarize_weighted_emotions(emotion_score_log)
        return emotion_score_log

    def draw_boxes(self, frame, boxes):
        if boxes is not None:
            for box in boxes:
                x1, y1, x2, y2 = [int(coord) for coord in box]
                cv2.rectangle(frame, (x1, y1), (x2, y2), (0, 255, 0), 2)
        return frame

    def summarize_weighted_emotions(self, emotion_score_log):
        if not emotion_score_log:
            print("\n😕 I wasn't able to detect any clear emotions.")
            return

        total_score = sum(emotion_score_log.values())
        if total_score == 0:
            print("\n😕 I didn't collect enough data to determine your mood.")
            return

        percentages = {emotion: (score / total_score) * 100 for emotion, score in emotion_score_log.items()}
        sorted_scores = sorted(percentages.items(), key=lambda x: x[1], reverse=True)
        top_3 = sorted_scores[:3]

        print("\n🧠 Mood Analysis Results:")
        for emotion, score in top_3:
            print(f"{emotion}: {score:.2f}%")

        # Send result to local server
        try:
            requests.post(
                "http://localhost:5050/upload-results",
                json={
                    "mode": "video",
                    "weighted_emotions": dict(sorted_scores)
                }
            )
            print("📤 Sent result to local server at /upload-results.")
        except Exception as e:
            print(f"❌ Failed to send result: {e}")

    def summarize_emotions(self, emotion_log):
        if not emotion_log:
            print("\n😕 I wasn't able to detect any clear emotions.")
            return []

        counts = Counter(emotion_log)
        total = sum(counts.values())
        percentages = {emotion: (count / total) * 100 for emotion, count in counts.items()}
        top_3 = sorted(percentages.items(), key=lambda x: x[1], reverse=True)[:3]

        print("\n😊 Summary of your mood:")
        for emotion, score in top_3:
            print(f"{emotion}: {score:.2f}%")

        return top_3

if __name__ == "__main__":
    detector = FacialDetector()

    while True:
        print("\n==== Emotion Detection System ====")
        print("1: Analyze an Image")
        print("2: Analyze a Video")
        print("3: Exit")
        action = input("\nWhat would you like to do? (1-3): ")
        
        if action == '3':
            print("Thank you for using the Emotion Detection System. Goodbye!")
            break

        if action not in ['1', '2', '3']:
            print("Invalid choice. Please enter 1, 2, or 3.")
            continue

        if action == '1':
            while True:
                img_path = input("\nEnter the path to your image: ")
                if os.path.isfile(img_path):
                    try:
                        img = Image.open(img_path)
                        break
                    except UnidentifiedImageError:
                        print("❌ Invalid image. Try again.")
                else:
                    print("❌ File not found. Try again.")

            print("\n🔍 Analyzing image...")
            boxes, top_emotions, _ = detector.process_pil_image(img)

            img_np = np.array(img)
            img_with_boxes = detector.draw_boxes(img_np, boxes)
            cv2.imshow("Your Image", cv2.cvtColor(img_with_boxes, cv2.COLOR_RGB2BGR))
            cv2.waitKey(0)
            cv2.destroyAllWindows()

            if top_emotions:
                print("\n😊 Detected emotions:")
                for emotion, score in top_emotions:
                    print(f"{emotion}: {score:.2f}%")

                # Send result to local server
                try:
                    requests.post(
                        "http://localhost:5050/upload-results",
                        json={
                            "mode": "image",
                            "top_3_emotions": top_emotions
                        }
                    )
                    print("📤 Sent result to local server at /upload-results.")
                except Exception as e:
                    print(f"❌ Failed to send result: {e}")

        elif action == '2':
            while True:
                video_path = input("\nEnter the path to your video: ")
                if os.path.isfile(video_path):
                    print("\n🎬 Starting video analysis...")
                    detector.process_video(video_path)
                    break
                else:
                    print("❌ File not found. Try again.")

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