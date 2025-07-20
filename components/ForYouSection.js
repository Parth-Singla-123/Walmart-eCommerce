"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
    HeartIcon,
    SparklesIcon,
    ShoppingCartIcon
} from "@heroicons/react/24/outline";
import { HeartIcon as HeartSolid } from "@heroicons/react/24/solid";
import { useWish } from "@/hooks/useWish";
import { useCart } from "@/hooks/useCart";
import { useProduct } from "@/hooks/useProducts";
import { useUser } from "@/hooks/useUser";

// --- ProductCard Subcomponent ---
function ProductCard({
    product,
    wishlisted,
    wishlistLoading,
    inCart,
    cartLoading,
    onWishlistToggle,
    onAddToCart,
    getBadgeColor
}) {
    // Robust image selection
    const imageUrl =
        product.image ||
        (Array.isArray(product.images) && product.images[0]?.url) ||
        "/placeholder.png";

    return (
        <div className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200">
            {/* Product Image Container */}
            <div className="aspect-square relative">
                <Image
                    src={imageUrl}
                    alt={product.name}
                    fill
                    unoptimized
                    className="object-cover transition-transform duration-200 z-0"
                />
                {product.badge && (
                    <div className={`absolute top-2 left-2 z-20 ${getBadgeColor(product.badge)} text-white px-2 py-1 rounded-full text-xs font-bold`}>
                        {product.badge}
                    </div>
                )}
                <button
                    className="absolute top-2 right-2 z-20 p-1.5 bg-white rounded-full shadow-sm hover:shadow-md transition-shadow duration-200"
                    onClick={() => onWishlistToggle(product.productId || product._id)}
                    aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
                    disabled={wishlistLoading}
                >
                    {wishlisted ? (
                        <HeartSolid className="h-4 w-4 text-red-500" />
                    ) : (
                        <HeartIcon className="h-4 w-4 text-gray-600 hover:text-red-500" />
                    )}
                </button>
            </div>

            {/* Product Information */}
            <div className="p-3">
                {/* Product Name */}
                <h3 className="text-sm font-medium text-black mb-2 line-clamp-2 leading-tight">
                    {product.name}
                </h3>

                {/* Pricing */}
                <div className="flex items-center gap-2 mb-3">
                    <span className="text-sm font-bold text-black">₹{product.price}</span>
                    {product.originalPrice && (
                        <>
                            <span className="text-xs text-gray-500 line-through">{product.originalPrice}</span>
                            <span className="text-xs text-green-600 font-medium">
                                {product.originalPrice && product.price
                                    ? `${Math.round(
                                        (1 -
                                            parseFloat(product.price.replace(/[^0-9.]/g, "")) /
                                            parseFloat(product.originalPrice.replace(/[^0-9.]/g, ""))
                                        ) * 100
                                    )}% off`
                                    : ""}
                            </span>
                        </>
                    )}
                </div>

                {/* Add to Cart Button */}
                <button
                    className="w-full bg-black text-white py-2 px-3 rounded-full hover:bg-gray-800 transition-colors duration-200 text-xs font-medium disabled:opacity-50"
                    onClick={() => onAddToCart(product.productId || product._id)}
                    disabled={inCart || cartLoading}
                >
                    {inCart ? (
                        <span className="flex items-center gap-1 justify-center">
                            <ShoppingCartIcon className="h-4 w-4" />
                            In Cart
                        </span>
                    ) : (
                        <span className="flex items-center gap-1 justify-center">
                            <ShoppingCartIcon className="h-4 w-4" />
                            Add to Cart
                        </span>
                    )}
                </button>
            </div>
        </div>
    );
}

export default function ForYouSection() {
    // Hooks for wishlist and cart
    const { wishlist, addToWishlist, removeFromWishlist } = useWish();
    const { cart, addToCart } = useCart();
    const { personalized, personalizedLoading, getPersonalizedProducts } = useProduct();
    const { user } = useUser();

    // Helper: Check if product is in wishlist/cart
    const isInWishlist = (productId) =>
        wishlist.some(item => String(item.id) === String(productId) || String(item.productId) === String(productId));
    const isInCart = (productId) =>
        cart.some(item => String(item.id) === String(productId) || String(item.productId) === String(productId));

    // Badge color helper
    const getBadgeColor = (badge) => {
        switch (badge?.toLowerCase()) {
            case 'trending': return 'bg-purple-500';
            case 'deal': return 'bg-red-500';
            case 'popular': return 'bg-blue-500';
            case 'best seller': return 'bg-orange-500';
            case 'new': return 'bg-green-500';
            case 'premium': return 'bg-gray-800';
            default: return 'bg-gray-500';
        }
    };

    // Local state to track loading for each action
    const [wishlistLoading, setWishlistLoading] = useState({});
    const [cartLoading, setCartLoading] = useState({});

    // Fetch personalized products when user.supabaseId is available
    useEffect(() => {
        if (user && user.supabaseId) {
            getPersonalizedProducts(user.supabaseId);
        }
    }, [user, getPersonalizedProducts]);

    // Handlers
    const handleWishlistToggle = async (productId) => {
        setWishlistLoading(prev => ({ ...prev, [productId]: true }));
        if (isInWishlist(productId)) {
            await removeFromWishlist(productId);
        } else {
            await addToWishlist(productId);
        }
        setWishlistLoading(prev => ({ ...prev, [productId]: false }));
    };

    const handleAddToCart = async (productId) => {
        setCartLoading(prev => ({ ...prev, [productId]: true }));
        await addToCart(productId);
        setCartLoading(prev => ({ ...prev, [productId]: false }));
    };

    // Show top 6 personalized products
    const productsToShow = personalized.slice(0, 6);

    return (
        <section className="w-full px-6 lg:px-12 py-8 bg-white">
            <div className="max-w-8xl mx-auto">

                {/* Section Header */}
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-3">
                        <SparklesIcon className="h-6 w-6 text-black" />
                        <div>
                            <h2 className="text-2xl font-bold text-black">For You</h2>
                            <p className="text-sm text-gray-600">Personalized recommendations based on your activity</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <Link href="/recommendations" className="text-sm text-black hover:text-gray-600 font-medium">
                            View All →
                        </Link>
                        <button
                            className="text-sm text-gray-600 hover:text-black border border-gray-300 px-3 py-1 rounded-full hover:border-black transition-colors duration-200"
                            onClick={() => user && user.supabaseId && getPersonalizedProducts(user.supabaseId)}
                            disabled={personalizedLoading}
                        >
                            Refresh
                        </button>
                    </div>
                </div>

                {/* Personalized Products Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                    {personalizedLoading ? (
                        <div className="col-span-full text-center py-10 text-gray-500">Loading...</div>
                    ) : productsToShow.length > 0 ? (
                        productsToShow.map((product) => (
                            <ProductCard
                                key={product.productId || product._id}
                                product={product}
                                wishlisted={isInWishlist(product.productId)}
                                wishlistLoading={wishlistLoading[product.productId]}
                                inCart={isInCart(product.productId)}
                                cartLoading={cartLoading[product.productId]}
                                onWishlistToggle={handleWishlistToggle}
                                onAddToCart={handleAddToCart}
                                getBadgeColor={getBadgeColor}
                            />
                        ))
                    ) : (
                        <div className="col-span-full text-center py-10 text-gray-500">
                            No recommendations yet.
                        </div>
                    )}
                </div>

                {/* Personalization Controls */}
                <div className="mt-8 p-4 bg-gray-50 rounded-xl">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-sm font-medium text-black mb-1">Improve your recommendations</h3>
                            <p className="text-xs text-gray-600">Help us show you more relevant products</p>
                        </div>
                        <div className="flex gap-2">
                            <Link href="/preferences" className="text-xs text-black hover:text-gray-600 border border-gray-300 px-3 py-1 rounded-full hover:border-black transition-colors duration-200">
                                Update Preferences
                            </Link>
                            <Link href="/browsing-history" className="text-xs text-gray-600 hover:text-black px-3 py-1 rounded-full hover:bg-gray-100 transition-colors duration-200">
                                View History
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
