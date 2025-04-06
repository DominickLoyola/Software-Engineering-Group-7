import torch
import torch.nn as nn
import torch.nn.functional as F
import torchvision.transforms as transforms
import cv2
import numpy as np
from PIL import Image
import matplotlib.pyplot as plt
from facenet_pytorch import MTCNN, InceptionResnetV1

class FacialDetector:
    def __init__(self, device=None):
        # If no device is specified, use CUDA if available, otherwise CPU
        if device is None:
            self.device = torch.device('cuda:0' if torch.cuda.is_available() else 'cpu')
        else:
            self.device = device
            
        print(f"Using device: {self.device}")
        
        # Initialize MTCNN for face detection
        self.mtcnn = MTCNN(
            image_size=160, 
            margin=0, 
            min_face_size=20,
            thresholds=[0.6, 0.7, 0.7],  # MTCNN thresholds
            factor=0.709, 
            post_process=True,
            device=self.device
        )
        
        # Initialize FaceNet model (InceptionResnetV1)
        self.facenet = InceptionResnetV1(pretrained='vggface2').eval().to(self.device)
    
    def detect_faces(self, img):
        """
        Detect faces in an image and return bounding boxes and probability scores
        
        Args:
            img: PIL Image or numpy array
            
        Returns:
            boxes: Bounding boxes of detected faces (x1, y1, x2, y2)
            probs: Confidence scores for each detection
        """
        # Ensure image is in correct format
        if isinstance(img, np.ndarray):
            img = Image.fromarray(img)
            
        # Detect faces
        boxes, probs = self.mtcnn.detect(img)
        
        return boxes, probs
    
    def extract_faces(self, img, save_path=None):
        """
        Extract face regions from image
        
        Args:
            img: PIL Image or numpy array
            save_path: Optional path to save the extracted faces
            
        Returns:
            faces: List of extracted face tensors
            boxes: Corresponding bounding boxes
        """
        # Ensure image is in correct format
        if isinstance(img, np.ndarray):
            img = Image.fromarray(img)
            
        # Extract faces
        faces = self.mtcnn(img, return_prob=False)
        
        # Get boxes for visualization
        boxes, probs = self.mtcnn.detect(img)
        
        # If no faces detected
        if faces is None or boxes is None:
            return None, None
        
        # If only one face is detected, make it a list
        if not isinstance(faces, list) and faces.ndim == 3:
            faces = [faces]
        
        # Save extracted faces if requested
        if save_path and faces is not None:
            for i, face in enumerate(faces):
                if isinstance(face, torch.Tensor):
                    face_img = transforms.ToPILImage()(face)
                    face_img.save(f"{save_path}/face_{i}.jpg")
        
        return faces, boxes
    
    def get_face_embeddings(self, faces):
        """
        Get embeddings for extracted faces
        
        Args:
            faces: List of face tensors from extract_faces
            
        Returns:
            embeddings: Face embeddings that can be used for recognition or analysis
        """
        if faces is None:
            return None
            
        embeddings = []
        
        for face in faces:
            if face is not None:
                # Ensure face is a batch
                if face.ndim == 3:
                    face = face.unsqueeze(0)
                
                face = face.to(self.device)
                embedding = self.facenet(face).detach().cpu()
                embeddings.append(embedding)
        
        return embeddings
    
    def process_image(self, img_path):
        """Process a single image file"""
        img = Image.open(img_path)
        return self.process_pil_image(img)
    
    def process_pil_image(self, img):
        """Process a PIL image"""
        faces, boxes = self.extract_faces(img)
        embeddings = self.get_face_embeddings(faces)
        return faces, boxes, embeddings
    
    def process_video_frame(self, frame):
        """Process a video frame (numpy array)"""
        # Convert BGR (OpenCV format) to RGB
        frame_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        img = Image.fromarray(frame_rgb)
        return self.process_pil_image(img)
    
    def process_video(self, video_path, output_path=None, sample_rate=1, max_frames=None):
        """
        Process a video file, detecting faces in frames
        
        Args:
            video_path: Path to video file
            output_path: Path to save annotated video (optional)
            sample_rate: Process every nth frame
            max_frames: Maximum number of frames to process
            
        Returns:
            List of (frame_index, faces, boxes, embeddings) for each processed frame
        """
        cap = cv2.VideoCapture(video_path)
        
        # Video writer setup if output is requested
        if output_path:
            fourcc = cv2.VideoWriter_fourcc(*'XVID')
            fps = cap.get(cv2.CAP_PROP_FPS)
            width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
            height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
            out = cv2.VideoWriter(output_path, fourcc, fps, (width, height))
        
        results = []
        frame_count = 0
        processed_count = 0
        
        while cap.isOpened():
            ret, frame = cap.read()
            if not ret:
                break
                
            # Process every nth frame
            if frame_count % sample_rate == 0:
                # Process the frame
                faces, boxes, embeddings = self.process_video_frame(frame)
                
                # Store results
                results.append((frame_count, faces, boxes, embeddings))
                
                # Draw bounding boxes if output requested
                if output_path and boxes is not None:
                    frame = self.draw_boxes(frame, boxes)
                    out.write(frame)
                
                processed_count += 1
                print(f"Processed frame {frame_count} ({processed_count} total)")
                
                # Check if we've hit the max frames limit
                if max_frames and processed_count >= max_frames:
                    break
            elif output_path:
                # Write original frame if we're not processing it
                out.write(frame)
                
            frame_count += 1
        
        cap.release()
        if output_path:
            out.release()
            
        return results
        
    def process_webcam(self, camera_id=0, display=True, quit_key='q'):
        """
        Process webcam feed in real-time
        
        Args:
            camera_id: Webcam ID (usually 0 for built-in)
            display: Whether to display the feed with face boxes
            quit_key: Key to press to exit
            
        Returns:
            None
        """
        cap = cv2.VideoCapture(camera_id)
        
        while cap.isOpened():
            ret, frame = cap.read()
            if not ret:
                break
                
            # Process the frame
            faces, boxes, _ = self.process_video_frame(frame)
            
            # Draw bounding boxes if faces detected
            if boxes is not None:
                frame = self.draw_boxes(frame, boxes)
            
            # Display the frame
            if display:
                cv2.imshow('Face Detection', frame)
                
            # Check for quit key
            if cv2.waitKey(1) & 0xFF == ord(quit_key):
                break
                
        cap.release()
        cv2.destroyAllWindows()
    
    def draw_boxes(self, frame, boxes):
        """Draw bounding boxes on frame"""
        if boxes is None:
            return frame
            
        frame_with_boxes = frame.copy()
        for box in boxes:
            if box is not None:
                x1, y1, x2, y2 = [int(b) for b in box]
                cv2.rectangle(frame_with_boxes, (x1, y1), (x2, y2), (0, 255, 0), 2)
        
        return frame_with_boxes

# Example usage
if __name__ == "__main__":
    # Initialize the detector
    detector = FacialDetector()
    
    # Example 1: Process an image
    # img = Image.open("path/to/image.jpg")
    # faces, boxes, embeddings = detector.process_pil_image(img)
    # print(f"Detected {len(faces) if faces else 0} faces in image")
    
    # Example 2: Process a video file
    # results = detector.process_video("path/to/video.mp4", "path/to/output.avi", sample_rate=5)
    # print(f"Processed {len(results)} frames from video")
    
    # Example 3: Process webcam feed in real-time
    print("Starting webcam feed. Press 'q' to quit.")
    detector.process_webcam()