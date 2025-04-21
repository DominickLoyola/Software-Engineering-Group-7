import requests
import os

# Base URL for local testing
BASE_URL = "http://localhost:5000"

def main():
    print("Simple API Test")
    
    # Check if API is running
    try:
        response = requests.get(BASE_URL)
        if response.status_code == 200:
            print("✅ API is running")
        else:
            print("❌ API returned unexpected status code")
            return
    except requests.exceptions.ConnectionError:
        print("❌ API is not running. Please start the server first.")
        print("Run your original script and select option 4 to start the API.")
        return
    
    # Get test image path
    test_image = input("Enter path to a test image: ")
    if not os.path.exists(test_image):
        print(f"❌ Image not found: {test_image}")
        return
    
    # Test image analysis
    print(f"Sending image {test_image} to API for analysis...")
    with open(test_image, 'rb') as f:
        files = {'image': f}
        response = requests.post(f"{BASE_URL}/api/analyze/image", files=files)
    
    # Print results
    if response.status_code == 200:
        result = response.json()
        print("\n✅ Analysis successful!")
        print(f"Result ID: {result.get('result_id')}")
        print(f"Summary: {result.get('summary')}")
        
        # Show top emotions
        if 'results' in result and 'top_emotions' in result['results']:
            print("\nTop emotions detected:")
            for emotion, score in result['results']['top_emotions']:
                print(f"- {emotion}: {score:.1f}%")
    else:
        print(f"❌ Analysis failed: {response.status_code}")
        print(response.text)

if __name__ == "__main__":
    main()
