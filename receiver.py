from flask import Flask, request, jsonify
from flask_cors import CORS
from collections import deque

app = Flask(__name__)
CORS(app)

MAX_PACKETS = 1000
packets = deque(maxlen=MAX_PACKETS)

@app.route('/receive', methods=['POST'])
def receive():
    data = request.get_json()
    if not data:
        return jsonify({"error": "Invalid JSON"}), 400

    packets.append(data)
    return jsonify({"status": "received"}), 200

@app.route('/data', methods=['GET'])
def get_data():
    return jsonify(list(packets)), 200

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
