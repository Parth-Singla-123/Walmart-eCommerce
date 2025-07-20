"use client";

import React, { useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";

export default function ProductRecommendPage() {
  const [input, setInput] = useState("");
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    if (!input.trim()) return;
    setLoading(true);
    setRecommendations([]);
    try {
      const response = await axios.post("http://localhost:8000/chat", {
        message: input,
      });
      const data = response.data;
      const result = [];

      if (data.recommendation?.productId) {
        result.push(data.recommendation);
      }

      if (Array.isArray(data.alternatives)) {
        data.alternatives.forEach((alt) => {
          if (alt.productId) result.push(alt);
        });
      }

      setRecommendations(result);
    } catch (err) {
      console.error("API error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4 flex flex-col items-center">
      {/* Heading */}
      <div className="w-full max-w-2xl mb-8">
        <h1 className="text-4xl font-bold text-center text-gray-900 mb-2 tracking-tight">
          Product Recommendations
        </h1>
      </div>

      {/* Search Bar */}
      <div className="w-full max-w-2xl flex flex-col sm:flex-row gap-2 mb-10">
        <input
          type="text"
          className="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-base focus:ring-2 focus:ring-blue-500 outline-none bg-white shadow-sm"
          placeholder="Search for a product (e.g., oats, cereal)"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') handleSearch(); }}
        />
        <button
          className="px-6 py-2 rounded-lg bg-black text-white font-semibold text-base shadow hover:bg-gray-800 transition disabled:opacity-50"
          onClick={handleSearch}
          disabled={loading}
        >
          {loading ? (
            <svg className="animate-spin h-5 w-5 mx-auto" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="white" strokeWidth="4" fill="none"/>
              <path className="opacity-75" fill="white" d="M4 12a8 8 0 018-8v8z"/>
            </svg>
          ) : (
            "Search"
          )}
        </button>
      </div>

      {/* Results */}
      <div className="w-full flex flex-col items-center">
        {loading ? (
          <div className="flex justify-center mt-16">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center gap-2"
            >
              <svg className="animate-spin h-8 w-8 text-gray-600" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
              </svg>
              <span className="text-lg text-gray-700">Loading...</span>
            </motion.div>
          </div>
        ) : recommendations.length > 0 ? (
          <div className="flex flex-wrap justify-center gap-8 mt-4">
            {recommendations.map((item, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.08 }}
                className="bg-white rounded-2xl shadow hover:shadow-lg transition flex flex-col items-center w-[270px] h-[380px] border border-gray-100"
              >
                {/* Product Image */}
                <div className="h-40 w-40 mt-6 mb-3 rounded-xl overflow-hidden bg-gray-100 flex items-center justify-center">
                  <img
                    src={
                      item?.images?.[0]?.url ||
                      "https://via.placeholder.com/160x160?text=No+Image"
                    }
                    alt={item.name || item.product_id}
                    className="object-cover w-full h-full"
                  />
                </div>
                {/* Product Details */}
                <div className="flex-1 flex flex-col px-5 pb-5 w-full">
                  <h2 className="font-semibold text-gray-900 text-lg mb-1 truncate text-center">
                    {item.name || item.product_id}
                  </h2>
                  {item.price && (
                    <div className="text-xl font-bold text-gray-800 mb-1 text-center">
                      ${item.price.toFixed(2)}
                    </div>
                  )}
                  <p className="text-gray-600 text-sm mb-2 line-clamp-2 text-center">
                    {item.details || "No description available."}
                  </p>
                  <div className="mt-auto">
                    <button
                      className="w-full py-2 rounded-full bg-black text-white font-semibold hover:bg-gray-800 transition text-base"
                    >
                      Add to Cart
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center mt-24">
            <span className="text-7xl mb-2">😔</span>
            <p className="text-lg text-gray-600 mb-1 text-center">
              Sorry, this is not available right now, try something else
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
