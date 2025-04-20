import torch
import cv2
import numpy as np
from PIL import Image
from facenet_pytorch import MTCNN, InceptionResnetV1
from deepface import DeepFace
from collections import Counter

class FacialDetector:
    def __init__(self, device=None):
        self.device = torch.device('cuda:0' if torch.cuda.is_available() else 'cpu') if device is None else device

        print(f"Using device: {self.device}")
        
        self.mtcnn = MTCNN(
            image_size=160, margin=0, min_face_size=20,
            thresholds=[0.6, 0.7, 0.7], factor=0.709,
            post_process=True, device=self.device
        )
        self.facenet = InceptionResnetV1(pretrained='vggface2').eval().to(self.device)

    def process_pil_image(self, img):
        if isinstance(img, np.ndarray):
            img = Image.fromarray(img)
        boxes, _ = self.mtcnn.detect(img)
        emotions = self.analyze_emotions(img)
        return boxes, emotions

    def analyze_emotions(self, img):
        try:
            if isinstance(img, Image.Image):
                img = np.array(img)
            analysis = DeepFace.analyze(img_path=img, actions=['emotion'], enforce_detection=False)
            emotion_dict = analysis[0]["emotion"] if isinstance(analysis, list) else analysis["emotion"]
            top_emotion = max(emotion_dict, key=emotion_dict.get)
            top_score = emotion_dict[top_emotion]
            return top_emotion, top_score, emotion_dict
        except Exception as e:
            print("Emotion analysis failed:", str(e))
            return "unknown", 0.0, {}

    def process_video(self, video_path):
        cap = cv2.VideoCapture(video_path)
        if not cap.isOpened():
            print(f"❌ Could not open video: {video_path}")
            return

        print("📹 Processing video... Press 'q' to stop.")
        emotion_log = []
        frame_idx = 0

        while cap.isOpened():
            ret, frame = cap.read()
            if not ret:
                print("⚠️ Finished reading video or failed to grab frame.")
                break

            frame_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
            img = Image.fromarray(frame_rgb)

            boxes, emotion_info = self.process_pil_image(img)
            frame = self.draw_boxes(frame, boxes)

            if isinstance(emotion_info, tuple):
                top_emotion, score, _ = emotion_info
                emotion_log.append(top_emotion)

            cv2.imshow("Video Feed", frame)
            if cv2.waitKey(1) & 0xFF == ord('q'):
                break
            frame_idx += 1

        cap.release()
        cv2.destroyAllWindows()

        self.summarize_emotions(emotion_log)

    def process_webcam(self):
        cap = cv2.VideoCapture(0)
        last_emotion_text = ""
        emotion_log = []
        frame_idx = 0

        while cap.isOpened():
            ret, frame = cap.read()
            if not ret:
                break

            frame_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
            img = Image.fromarray(frame_rgb)

            boxes, _ = self.mtcnn.detect(img)
            frame = self.draw_boxes(frame, boxes, last_emotion_text)

            cv2.imshow("Webcam Feed", frame)
            key = cv2.waitKey(1) & 0xFF

            if key == ord('q'):
                break
            elif key == ord('e'):
                print("🔍 Capturing emotion...")
                boxes, emotion_info = self.process_pil_image(img)
                if isinstance(emotion_info, tuple):
                    top_emotion, score, _ = emotion_info
                    emotion_log.append(top_emotion)
                    last_emotion_text = f"{top_emotion} ({score:.1f}%)"
                    print(f"Emotion Detected: {last_emotion_text}")
                else:
                    print("Could not determine emotion.")

            frame_idx += 1

        cap.release()
        cv2.destroyAllWindows()
        self.summarize_emotions(emotion_log)

    def summarize_emotions(self, emotion_log):
        """ Summarize frequency of each detected emotion as % """
        if not emotion_log:
            print("No emotions detected.")
            return

        emotion_count = Counter(emotion_log)
        total = len(emotion_log)

        print("\n🧠 Overall Emotion Summary:")
        for emotion, count in emotion_count.items():
            percent = (count / total) * 100
            print(f"{emotion}: {percent:.1f}%")

    def draw_boxes(self, frame, boxes, label_text=None):
        if boxes is not None:
            for box in boxes:
                x1, y1, x2, y2 = [int(coord) for coord in box]
                cv2.rectangle(frame, (x1, y1), (x2, y2), (0, 255, 0), 2)
                if label_text:
                    cv2.putText(frame, label_text, (x1, y1 - 10),
                                cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 255, 0), 2)
        return frame

# ===============================
#          MAIN PROGRAM
# ===============================
if __name__ == "__main__":
    detector = FacialDetector()

    action = input("Select action: 1 for image, 2 for video, 3 for webcam\n")

    if action == '1':
        img_path = input("Enter the path to the image file: ")
        img = Image.open(img_path)
        boxes, emotion_info = detector.process_pil_image(img)
        if isinstance(emotion_info, tuple):
            top_emotion, score, all_emotions = emotion_info
            print(f"Detected faces: {len(boxes) if boxes is not None else 0}")
            print(f"Top Emotion: {top_emotion} ({score:.2f}%)")
            print("All Emotions:", all_emotions)
        else:
            print("Could not determine emotion.")

    elif action == '2':
        video_path = input("Enter the path to the video file: ")
        detector.process_video(video_path)

    elif action == '3':
        print("Starting webcam feed. Press 'e' to analyze emotion, 'q' to quit.")
        detector.process_webcam()

    else:
        print("Invalid action selected.")


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