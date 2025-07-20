"use client";

import { useEffect, useState, useMemo } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import { useCart } from "@/hooks/useCart";
import { useWish } from "@/hooks/useWish";

export default function ProductPage() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [activeImage, setActiveImage] = useState(0);

  const { cart, addToCart } = useCart();
  const { wishlist, addToWishlist } = useWish();

  // Add these state variables for loading
  const [cartLoading, setCartLoading] = useState(false);
  const [wishLoading, setWishLoading] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      const res = await fetch(`/api/product/${id}`);
      const data = await res.json();
      setProduct(data.product);
    };
    fetchProduct();
  }, [id]);

  const inCart = useMemo(
    () => cart.some((item) => item.productId === id || item.id === id),
    [cart, id]
  );
  const inWish = useMemo(
    () => wishlist.some((item) => item.productId === id || item.id === id),
    [wishlist, id]
  );

  const handleAddToCart = async () => {
    if (inCart || cartLoading) return;
    setCartLoading(true);
    await addToCart(id);
    setCartLoading(false);
  };

  const handleAddToWish = async () => {
    if (inWish || wishLoading) return;
    setWishLoading(true);
    await addToWishlist(id);
    setWishLoading(false);
  };

  if (!product) return <div className="p-10 text-lg">Loading...</div>;

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <div className="max-w-4xl w-full mx-auto flex flex-col md:flex-row gap-8 bg-white rounded-2xl shadow-lg mt-8 p-6">
        {/* Left: Carousel */}
        <div className="w-full md:w-1/2 flex flex-col items-center gap-4">
          <div className="relative w-[320px] h-[320px] md:w-[280px] md:h-[280px] rounded-xl overflow-hidden bg-gray-100 shadow">
            <Image
              src={product.images?.[activeImage]?.url || "/placeholder.png"}
              alt={product.name}
              fill
              className="object-contain"
              sizes="(max-width: 768px) 70vw, 320px"
              priority
            />
          </div>
          <div className="flex gap-2 overflow-x-auto">
            {(product.images || []).map((img, index) => (
              <button
                key={index}
                className={`w-14 h-14 border rounded-lg overflow-hidden focus:outline-none ${
                  index === activeImage ? "ring-2 ring-blue-500" : ""
                }`}
                onClick={() => setActiveImage(index)}
                aria-label={`Show image ${index + 1}`}
                type="button"
              >
                <Image
                  src={img.url || "/placeholder.png"}
                  alt={`thumb-${index}`}
                  width={56}
                  height={56}
                  className="object-cover w-full h-full"
                />
              </button>
            ))}
          </div>
        </div>

        {/* Right: Product Details */}
        <div className="w-full md:w-1/2 flex flex-col justify-between">
          <div className="space-y-3">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">{product.name}</h1>
            <div className="flex items-center gap-2">
              <span className="text-xl md:text-2xl text-blue-700 font-bold">₹ {product.price}</span>
              {product.originalPrice && (
                <span className="text-base line-through text-gray-400">
                  ₹ {product.originalPrice}
                </span>
              )}
            </div>
            <p className="text-gray-700 text-sm md:text-base">{product.details}</p>
            {/* Stock and brand info */}
            <div className="flex items-center gap-4 mt-2">
              {product.brand && (
                <span className="text-xs bg-gray-100 px-2 py-1 rounded font-medium text-gray-600">
                  {product.brand}
                </span>
              )}
              <span
                className={`text-xs font-semibold px-2 py-1 rounded ${
                  product.stock > 0
                    ? "bg-green-100 text-green-700"
                    : "bg-red-100 text-red-700"
                }`}
              >
                {product.stock > 0 ? "In Stock" : "Out of Stock"}
              </span>
            </div>
          </div>
          {/* Action Buttons */}
          <div className="flex gap-3 mt-6">
            <button
              className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-lg text-sm font-semibold disabled:opacity-60 transition"
              onClick={handleAddToWish}
              disabled={inWish || wishLoading}
            >
              {wishLoading
              ? "Loading..."
              : inWish
              ? "In Wishlist"
              : "Add to Wishlist"}
            </button>
            <button
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-semibold disabled:opacity-60 transition"
              onClick={handleAddToCart}
              disabled={inCart || cartLoading || product.stock <= 0}
            >
              {cartLoading
              ? "Loading..."
              : product.stock <= 0
              ? "Out of Stock"
              : inCart
              ? "In Cart"
              : "Add to Cart"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
