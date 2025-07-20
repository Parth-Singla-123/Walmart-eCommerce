from flask import Flask, request, jsonify
from flask_cors import CORS
from recommender import load_model, get_recommendations, update_user_purchase
import logging

app = Flask(__name__)

# Restrict CORS in production (change origins as needed)
CORS(app, resources={r"/recommend/*": {"origins": "*"}, r"/purchase": {"origins": "*"}})

# Configure logging
logging.basicConfig(level=logging.INFO)

# Load model artifacts at API startup
try:
    load_model()
    logging.info("Model loaded successfully at startup.")
except Exception as e:
    logging.error(f"Error loading model at startup: {e}")

@app.route("/health", methods=["GET"])
def health():
    return jsonify({"status": "ok"}), 200

@app.route("/recommend/<user_id>", methods=["GET"])
def recommend(user_id):
    try:
        # Accept both string and integer user IDs
        user_id = str(user_id)
        top_n = 200
        recommendations = get_recommendations(user_id, top_n)
        return jsonify({
            "user_id": user_id,
            "recommendations": recommendations
        }), 200
    except Exception as e:
        logging.exception(f"Error in /recommend/{user_id}: {e}")
        return jsonify({"error": "Internal server error"}), 500

@app.route("/purchase", methods=["POST"])
def purchase():
    try:
        data = request.get_json(force=True)
        user_id = str(data.get("user_id"))
        product_names = data.get("product_names")

        if not user_id or not product_names:
            return jsonify({"error": "user_id and product_names are required."}), 400

        # Accept both single string and list of product names
        if isinstance(product_names, str):
            product_names = [product_names]

        update_user_purchase(user_id, product_names)
        return jsonify({"message": "Purchase recorded successfully."}), 200
    except Exception as e:
        logging.exception(f"Error in /purchase: {e}")
        return jsonify({"error": "Internal server error"}), 500

if __name__ == "__main__":
    # Use a production WSGI server like Gunicorn in actual deployment!
    app.run(debug=False, host="0.0.0.0", port=5000)
