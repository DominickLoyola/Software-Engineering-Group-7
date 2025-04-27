from flask import Flask, request, jsonify

app = Flask(__name__)
last_received_data = None  # Global variable to store the last result

@app.route('/upload-results', methods=['POST'])
def upload_results():
    global last_received_data
    last_received_data = request.get_json()
    print("\n📥 Received mood data:")
    print(last_received_data)
    return jsonify({"status": "received"})

@app.route('/view-last-result', methods=['GET'])  # ✅ Make sure this exists
def view_last_result():
    if last_received_data is None:
        return jsonify({"message": "No result received yet."}), 404
    return jsonify({"last_result": last_received_data})

if __name__ == '__main__':
    app.run(port=5050)
