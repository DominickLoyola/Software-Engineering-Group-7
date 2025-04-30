Class: 3354.002

Professor: Srimathi Srinivasan

# Team Details:

Team #7

Team Name: Moodify

Team Names: 

- Aman Deva
- Chris Kennedy
- Rishna Renikunta
- Dominick Loyola
- Nadhif Mahmood
- Pranava Ravindran
- Omar Abubeker
- Afiya Syed

Statement of Work:

Moodify is an ai-powered mood-based application that analyzes facial expressions from user uploaded photos and generates personalized playlists based on their detected mood. It aims to enhance the music experience by recommending songs that match emotions, making music discovery more intuitive and personal. 

# How to Set Up Moodify Locally:

**Do all of this in the VS code terminal**

**Setting up the Chat GPT API:**

1. **Install OpenAI SDK**
* Run the following command in the project root: npm install openai

2. **Create an API Key**
* Go to https://platform.openai.com/api-keys
* Log in and generate a new secret API key

3. **Create Environment File**
* In your project root (moodify) (if not already present) create a .env.local file and add: OPENAI_API_KEY=your-generated-key-here

4. **Restart the development server**
* After editing .env.local, make sure to restart your server: npm run dev

5. **Ensure you have OpenAI Credits**
* GPT API calls won't work without credits
* Go to https://platform.openai.com/settings/organization/billing/overview
* Make sure your account has active credit or billing set up 
* 5 dollars is the minimum amount

**Setting up AI Libraries:**

* import torch
* import cv2
* import numpy as np
* from PIL import Image, UnidentifiedImageError
* from collections import defaultdict, Counter
* from facenet_pytorch import MTCNN, InceptionResnetV1
* from deepface import DeepFace
* import os
* import time
* import json
* from flask import Flask, request, jsonify, send_from_directory
* from datetime import datetime
* from flask_cors import CORS

**Running Flask Server:**
* Navigate to project directory: cd Moodify
* Start the facial detection server: python facial_detector_server.py
* Start the result receiver server: python result_receiver.py
* To avoid CORS (Cross-Origin Resource Sharing) issues while testing locally, please install this Chrome extension: https://chromewebstore.google.com/detail/moesif-origincors-changer/digfbfaphojjndkpccljibejjbppifbc?hl=en-US
* Then make sure the enable cors option is enabled

**Commands to run to download react and next js:**
   * npm install Next.js
   * npm install React

**Put this in the .env.local file:**

(if the .env.local file doesn't exist create it under the modify directory)

MONGODB_URI=mongodb+srv://chrispkennedy10:JZlbet7nfucTgufM@userinfo.1gvlzhd.mongodb.net/?retryWrites=true&w=majority&appName=userinfo
MONGODB_DB=userinfo
* Make sure these libraries are installed and ready to use before running the application

**TO RUN**

* git checkout backend
* cd Moodify
* npm run dev
