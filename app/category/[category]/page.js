'use client';

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";

// ProductCard Component
function ProductCard({ product }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 flex flex-col shadow-sm hover:shadow-lg transition-shadow duration-200 group relative">
      <Link
        href={`/product/${product._id}`}
        className="block"
        tabIndex={-1}
      >
        <div className="relative w-full aspect-square rounded-lg overflow-hidden border border-gray-100 bg-white mb-3">
          <Image
            src={product.images?.[0]?.url || product.images?.[0] || "/placeholder.png"}
            alt={product.name}
            fill
            style={{ objectFit: "cover" }}
            sizes="(max-width: 768px) 100vw, 33vw"
            className="group-hover:scale-105 transition-transform duration-300"
            unoptimized
          />
          {product.stock < 5 && (
            <span className="absolute top-2 left-2 px-2 py-0.5 rounded text-xs font-semibold bg-yellow-100 text-yellow-700 border border-yellow-300">
              Only {product.stock} left!
            </span>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-gray-900 truncate">{product.name}</div>
          <div className="text-xs text-gray-500 truncate">{product.details}</div>
          <div className="text-blue-700 font-bold mt-1 text-base">₹{product.price}</div>
          <div className="text-xs text-gray-400 mt-1">{product.brand} | {product.category}</div>
        </div>
      </Link>
      <button
        className="mt-4 w-full py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-60"
        disabled={product.stock < 1}
        tabIndex={0}
        title={product.stock < 1 ? "Out of Stock" : "Add to Cart"}
      >
        {product.stock < 1 ? "Out of Stock" : "Add to Cart"}
      </button>
    </div>
  );
}

export default function CategoryPage() {
  const params = useParams();
  const category = params.category;
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchProducts() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/product/category?category=${encodeURIComponent(category)}`);
        const data = await res.json();
        if (res.ok) {
          // Only show products with stock > 0
          setProducts((data.products || []).filter(p => p.stock > 0));
        } else {
          setError(data.error || "Failed to fetch products");
        }
      } catch (err) {
        setError("Network error");
      } finally {
        setLoading(false);
      }
    }
    fetchProducts();
  }, [category]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6 capitalize tracking-tight">
        {category} Products
      </h1>

      {loading ? (
        <div className="text-center py-12 text-gray-500">Loading...</div>
      ) : error ? (
        <div className="text-center py-12 text-red-500">{error}</div>
      ) : products.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          No products found in this category.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {products.map(product => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
