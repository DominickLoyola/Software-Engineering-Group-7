import torch
import cv2
import numpy as np
from PIL import Image, UnidentifiedImageError
from collections import Counter
from facenet_pytorch import MTCNN, InceptionResnetV1
from deepface import DeepFace
import os

class FacialDetector:
    def __init__(self, device=None):
        self.device = torch.device('cuda:0' if torch.cuda.is_available() else 'cpu') if device is None else device
        print(f"Using device: {self.device}")

        self.mtcnn = MTCNN(image_size=160, margin=0, min_face_size=20,
                           thresholds=[0.6, 0.7, 0.7], factor=0.709,
                           post_process=True, device=self.device)

        self.facenet = InceptionResnetV1(pretrained='vggface2').eval().to(self.device)

    def process_pil_image(self, img):
        if isinstance(img, np.ndarray):
            img = Image.fromarray(img)
        boxes, emotions = self.analyze_emotions(img)
        return boxes, emotions

    def analyze_emotions(self, img):
        try:
            if isinstance(img, Image.Image):
                img_np = np.array(img)
            else:
                img_np = img

            boxes, _ = self.mtcnn.detect(img)
            if boxes is None or len(boxes) == 0:
                print("❌ No face detected for emotion analysis.")
                return None, []

            x1, y1, x2, y2 = [int(coord) for coord in boxes[0]]
            face_crop = img_np[y1:y2, x1:x2]

            analysis = DeepFace.analyze(img_path=face_crop, actions=['emotion'], enforce_detection=False)
            emotions = analysis[0]['emotion'] if isinstance(analysis, list) else analysis['emotion']

            sorted_emotions = sorted(emotions.items(), key=lambda x: x[1], reverse=True)
            top_3 = [(emotion, score) for emotion, score in sorted_emotions[:3]]

            return boxes, top_3

        except Exception as e:
            print("Emotion analysis failed:", str(e))
            return None, []

    def process_video(self, video_path):
        cap = cv2.VideoCapture(video_path)
        if not cap.isOpened():
            print(f"❌ Could not open video: {video_path}")
            return

        print("📹 Processing video... Press 'q' to stop.")
        emotion_log = []

        while cap.isOpened():
            ret, frame = cap.read()
            if not ret:
                break

            frame_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
            img = Image.fromarray(frame_rgb)

            boxes, top_emotions = self.analyze_emotions(img)
            if top_emotions:
                emotion_log.append(top_emotions[0][0])

            frame = self.draw_boxes(frame, boxes)
            cv2.imshow("Video Feed", frame)
            if cv2.waitKey(1) & 0xFF == ord('q'):
                break

        cap.release()
        cv2.destroyAllWindows()
        self.summarize_emotions(emotion_log)

    def process_webcam(self):
        cap = cv2.VideoCapture(0)
        if not cap.isOpened():
            print("❌ Could not access the webcam. Please check your camera connection.")
            return

        emotion_log = []
        print("📷 Webcam active. Press 'e' to analyze, 'q' to quit.")
        while cap.isOpened():
            ret, frame = cap.read()
            if not ret:
                break

            frame_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
            img = Image.fromarray(frame_rgb)

            cv2.imshow("Webcam Feed", frame)
            key = cv2.waitKey(1) & 0xFF

            if key == ord('q'):
                break
            elif key == ord('e'):
                boxes, top_emotions = self.analyze_emotions(img)
                if top_emotions:
                    emotion_log.append(top_emotions[0][0])
                    print(f"Detected: {top_emotions[0][0]}")

        cap.release()
        cv2.destroyAllWindows()
        self.summarize_emotions(emotion_log)

    def summarize_emotions(self, emotion_log):
        if not emotion_log:
            print("No emotions detected.")
            return

        counts = Counter(emotion_log)
        top_3 = counts.most_common(3)

        if len(top_3) == 1:
            summary = f"You mostly appeared to be {top_3[0][0]}."
        elif len(top_3) == 2:
            summary = f"You mostly appeared to be {top_3[0][0]}, with some expressions of {top_3[1][0]}."
        else:
            summary = (
                f"You mostly appeared to be {top_3[0][0]}, but also showed signs of {top_3[1][0]} and {top_3[2][0]}."
            )

        print(f"\n🧠 {summary}")

    def draw_boxes(self, frame, boxes):
        if boxes is not None:
            for box in boxes:
                x1, y1, x2, y2 = [int(coord) for coord in box]
                cv2.rectangle(frame, (x1, y1), (x2, y2), (0, 255, 0), 2)
        return frame

if __name__ == "__main__":
    detector = FacialDetector()

    while True:
        action = input("Select action: 1 for image, 2 for video, 3 for webcam\n")
        if action in ['1', '2', '3']:
            break
        print("Invalid input. Please enter 1, 2, or 3.")

    if action == '1':
        while True:
            img_path = input("Enter the path to the image file: ")
            if os.path.isfile(img_path):
                try:
                    img = Image.open(img_path)
                    break
                except UnidentifiedImageError:
                    print("❌ Invalid image file. Please try again.")
            else:
                print("❌ File not found. Please enter a valid image path.")

        _, top_emotions = detector.process_pil_image(img)
        if top_emotions:
            if len(top_emotions) == 1:
                summary = f"You mostly appeared to be {top_emotions[0][0]}."
            elif len(top_emotions) == 2:
                summary = f"You mostly appeared to be {top_emotions[0][0]}, with some expressions of {top_emotions[1][0]}."
            else:
                summary = (
                    f"You mostly appeared to be {top_emotions[0][0]}, but also showed signs of {top_emotions[1][0]} and {top_emotions[2][0]}."
                )
            print(f"\n🧠 {summary}")
        else:
            print("No emotions detected.")

    elif action == '2':
        while True:
            video_path = input("Enter the path to the video file: ")
            if os.path.isfile(video_path):
                detector.process_video(video_path)
                break
            else:
                print("❌ File not found. Please enter a valid video path.")

    elif action == '3':
        detector.process_webcam()




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