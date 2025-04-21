import requests
import os
import json
import time
import threading
import sys
import importlib.util

# Base URL for local testing
BASE_URL = "http://localhost:5000"

def import_api_class():
    """Dynamically import the EmotionAnalysisAPI class from main.py"""
    try:
        # Ensure main.py is in the current directory
        if not os.path.exists('main.py'):
            print("❌ main.py file not found in the current directory.")
            return None
        
        # Load the module
        spec = importlib.util.spec_from_file_location("main", "main.py")
        main_module = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(main_module)
        
        # Check if EmotionAnalysisAPI exists in the module
        if hasattr(main_module, 'EmotionAnalysisAPI'):
            return main_module.EmotionAnalysisAPI
        else:
            print("❌ EmotionAnalysisAPI class not found in main.py")
            return None
    except Exception as e:
        print(f"❌ Error importing EmotionAnalysisAPI: {str(e)}")
        return None

def start_api_server():
    """Start the API server in a background thread"""
    print("Starting API server...")
    
    # Import the EmotionAnalysisAPI class
    EmotionAnalysisAPI = import_api_class()
    if EmotionAnalysisAPI is None:
        print("❌ Failed to import EmotionAnalysisAPI class. Cannot start server.")
        return
    
    # Create an instance and start the server
    api = EmotionAnalysisAPI(storage_path="emotion_results")
    api.start_flask_server(host='localhost', port=5000)

def test_image_analysis(test_image):
    """Test image analysis endpoint"""
    if not os.path.exists(test_image):
        print(f"Test image not found: {test_image}")
        return False
    
    # Send request to analyze image
    with open(test_image, 'rb') as f:
        files = {'image': f}
        response = requests.post(f"{BASE_URL}/api/analyze/image", files=files)
    
    # Check response
    if response.status_code == 200:
        result = response.json()
        print("✅ Image analysis successful!")
        print(f"Result ID: {result.get('result_id')}")
        print(f"Summary: {result.get('summary')}")
        
        # Verify result was saved to disk
        result_id = result.get('result_id')
        verification_response = requests.get(f"{BASE_URL}/api/results/{result_id}")
        
        if verification_response.status_code == 200:
            print("✅ Result saved to API successfully!")
            return True
        else:
            print("❌ Failed to verify saved result")
            return False
    else:
        print(f"❌ Image analysis failed: {response.status_code}")
        print(response.text)
        return False

def test_get_all_results():
    """Test retrieving all results"""
    response = requests.get(f"{BASE_URL}/api/results")
    
    if response.status_code == 200:
        results = response.json().get('results', [])
        print(f"✅ Retrieved {len(results)} results from API")
        
        # Display most recent results
        for result in results[:3]:
            print(f"- {result.get('timestamp')}: {result.get('summary')}")
        
        return True
    else:
        print(f"❌ Failed to retrieve results: {response.status_code}")
        print(response.text)
        return False

def wait_for_api(max_retries=10, delay=1):
    """Wait for the API to be available"""
    print("Waiting for API to start...")
    for i in range(max_retries):
        try:
            response = requests.get(BASE_URL)
            if response.status_code == 200:
                print("✅ API is now running")
                return True
        except requests.exceptions.ConnectionError:
            print(f"Waiting for API to start... (attempt {i+1}/{max_retries})")
            time.sleep(delay)
    
    print("❌ API did not start within the expected time")
    return False

def main():
    # Start the test suite
    print("🧪 Running API tests...\n")
    
    # Prompt for starting the server if needed
    server_running = False
    try:
        response = requests.get(BASE_URL)
        if response.status_code == 200:
            print("✅ API is already running")
            server_running = True
    except requests.exceptions.ConnectionError:
        print("API is not running.")
        choice = input("Do you want to: \n1. Start the API automatically in this script \n2. Start it manually from main.py \nEnter your choice (1 or 2): ")
        
        if choice == '1':
            # Start API server in a background thread
            server_thread = threading.Thread(target=start_api_server, daemon=True)
            server_thread.start()
            
            # Wait for API to become available
            server_running = wait_for_api(max_retries=15, delay=2)  # Give more time to start
        else:
            print("\nPlease follow these steps:")
            print("1. Open a new terminal window")
            print("2. Navigate to the directory containing main.py")
            print("3. Run 'python main.py'")
            print("4. Select option 4 to start the API server")
            print("5. Come back to this window and run this test script again")
            return

    if not server_running:
        print("Cannot connect to API. Exiting tests.")
        return
    
    # Get test image path
    test_image = input("Enter path to a test image (full path recommended): ")
    
    # Run individual tests
    test_image_analysis(test_image)
    test_get_all_results()
    
    print("\n🧪 Tests completed!")
    
    # Note that the API server will continue running in the background
    # if it was started by this script
    if choice == '1':
        print("\nNote: The API server is still running in the background.")
        print("This script will exit but the server will continue running.")
        print("You can press Ctrl+C to stop it later.")

if __name__ == "__main__":
    main()