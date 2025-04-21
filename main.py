import torch
import cv2
import numpy as np
from PIL import Image, UnidentifiedImageError
from collections import defaultdict, Counter
from facenet_pytorch import MTCNN, InceptionResnetV1
from deepface import DeepFace
import os
import time

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
            return

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
                
        self.summarize_weighted_emotions(emotion_score_log)
        return emotion_score_log

    def process_webcam(self):
        cap = cv2.VideoCapture(0)
        if not cap.isOpened():
            print("❌ Could not access the webcam. Please check your camera connection.")
            return

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
                    self.summarize_weighted_emotions(continuous_emotion_scores)
                    continuous_emotion_scores = defaultdict(float)
                    continuous_frames = 0

        cap.release()
        cv2.destroyAllWindows()
        
        # Summarize all emotions detected
        self.summarize_emotions(emotion_log)
        
        # If in continuous mode, also show weighted summary
        if continuous_mode and continuous_frames > 0:
            for emotion in continuous_emotion_scores:
                continuous_emotion_scores[emotion] /= continuous_frames
            self.summarize_weighted_emotions(continuous_emotion_scores)

    def summarize_emotions(self, emotion_log):
        if not emotion_log:
            print("\n😕 I wasn't able to detect any clear emotions.")
            return

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
            return

        total_score = sum(emotion_score_log.values())
        if total_score == 0:
            print("\n😕 I didn't collect enough data to determine your mood.")
            return
            
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

if __name__ == "__main__":
    detector = FacialDetector()

    while True:
        print("\n==== Emotion Detection System ====")
        print("1: Analyze an Image")
        print("2: Analyze a Video")
        print("3: Use Webcam")
        print("4: Exit")
        action = input("\nWhat would you like to do? (1-4): ")
        
        if action == '4':
            print("Thank you for using the Emotion Detection System. Goodbye!")
            break
            
        if action not in ['1', '2', '3', '4']:
            print("Sorry, I didn't understand that choice. Please enter 1, 2, 3, or 4.")
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
            boxes, top_emotions, _ = detector.process_pil_image(img)
            
            # Display image with boxes
            img_np = np.array(img)
            img_with_boxes = detector.draw_boxes(img_np, boxes)
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
                    detector.process_video(video_path)
                    break
                else:
                    print("❌ I couldn't find that file. Please check the path and try again.")

        elif action == '3':
            print("\n📸 Starting your webcam. Get ready to see your emotions in real-time!")
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