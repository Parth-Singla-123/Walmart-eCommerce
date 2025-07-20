from flask import Flask, request, jsonify
from flask_cors import CORS
import json
import os
from product_chain import recommend_product

app = Flask(__name__)
CORS(app)

@app.route("/", methods=["GET"])
def hello():
    return jsonify({"message": "Backend is smooth"})

@app.route("/chat", methods=["POST"])
def chat():
    data = request.json
    description = data.get("message", "")

    if not description:
        return jsonify({"error": "Missing 'message' in request"}), 400

    try:
        # Load catalog from JSON file
        json_path = os.path.join(os.path.dirname(__file__), "products_mongo_ready.json")
        with open(json_path, "r", encoding="utf-8") as f:
            raw_catalog = json.load(f)

        # Build simplified list for Gemini prompt
        catalog = [
            {
                "product_id": item["productId"],
                "product_name": item["name"]
            }
            for item in raw_catalog
        ]

        # Get Gemini-based recommendation (basic info only)
        result = recommend_product(description, catalog)

        # Function to find full details of a product
        def enrich(product_id):
            for item in raw_catalog:
                if item["productId"] == product_id:
                    return item
            return {
                "productId": product_id,
                "name": "Unknown Product",
                "images": [],
                "details": "No additional info available."
            }

        # Enrich the recommendation
        if result.get("recommendation", {}).get("product_id"):
            result["recommendation"] = enrich(result["recommendation"]["product_id"])

        # Enrich the alternatives
        if "alternatives" in result:
            result["alternatives"] = [
                enrich(alt["product_id"]) for alt in result["alternatives"]
                if alt.get("product_id")
            ]

        return jsonify(result)

    except Exception as e:
        return jsonify({
            "error": "Server failed",
            "details": str(e)
        }), 500

if __name__ == "__main__":
    app.run(debug=True, port=8000)
