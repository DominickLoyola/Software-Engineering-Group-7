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
* 1 dollar should be enough for now


