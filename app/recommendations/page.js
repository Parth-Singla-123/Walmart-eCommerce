"use client";

import { useEffect, useState } from "react";
import { useProduct } from "@/hooks/useProducts";
import { useWish } from "@/hooks/useWish";
import { useCart } from "@/hooks/useCart";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import Link from "next/link";
import {
    StarIcon,
    HeartIcon,
    ClockIcon,
    SparklesIcon,
    ShoppingCartIcon
} from "@heroicons/react/24/outline";
import { HeartIcon as HeartSolid } from "@heroicons/react/24/solid";
import Image from "next/image";
import { useUser } from "@/hooks/useUser";

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

    const imageUrl =
        product.image ||
        (Array.isArray(product.images) && product.images[0]?.url) ||
        "/placeholder.png";

    return (
        <div className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200 group">
            {/* Product Image Container */}
            <div className="aspect-square relative">
                <Image
                    src={imageUrl}
                    alt={product.name}
                    fill
                    unoptimized
                    className="object-cover group-hover:scale-105 transition-transform duration-200 z-0"
                />
                {product.badge && (
                    <div className={`absolute top-2 left-2 z-20 ${getBadgeColor(product.badge)} text-white px-2 py-1 rounded-full text-xs font-bold`}>
                        {product.badge}
                    </div>
                )}
                <button
                    className="absolute top-2 right-2 z-20 p-1.5 bg-white rounded-full shadow-sm hover:shadow-md transition-shadow duration-200"
                    onClick={() => onWishlistToggle(product.id)}
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
                {/* Personalization Reason */}
                {product.reason && (
                    <div className="flex items-center gap-1 mb-2">
                        <ClockIcon className="h-3 w-3 text-gray-400" />
                        <span className="text-xs text-gray-500">{product.reason}</span>
                    </div>
                )}

                {/* Product Name */}
                <h3 className="text-sm font-medium text-black mb-2 line-clamp-2 leading-tight">
                    {product.name}
                </h3>

                {/* Rating and Reviews */}
                

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
                    onClick={() => onAddToCart(product.id)}
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

export default function RecommendationsPage() {
    const {
        personalized,
        personalizedLoading,
        getPersonalizedProducts,
    } = useProduct();

    const {
        wishlist,
        addToWishlist,
        removeFromWishlist,
    } = useWish();

    const {
        cart,
        addToCart,
    } = useCart();

    const {
        user
    } = useUser();
    const [userId, setUserId] = useState(null);
    const [wishlistLoading, setWishlistLoading] = useState({});
    const [cartLoading, setCartLoading] = useState({});

    // Get userId from Supabase on mount
    useEffect(() => {
        async function fetchUser() {
            const supabase = createClientComponentClient();
            const { data: { user } } = await supabase.auth.getUser();
            if (user) setUserId(user.id);
        }
        fetchUser();
    }, []);

    // Fetch all personalized recommendations for the user
    useEffect(() => {
        if (user && user.supabaseId) {
            getPersonalizedProducts(user.supabaseId);
        }
    }, [user, getPersonalizedProducts]);

    // Helpers
    const isInWishlist = (productId) =>
        wishlist.some(item => String(item.id) === String(productId) || String(item.productId) === String(productId));

    const isInCart = (productId) =>
        cart.some(item => String(item.id) === String(productId) || String(item.productId) === String(productId));

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

    // Limit recommendations to 25 items
    const recommendationsToShow = personalized.slice(0, 25);

    return (
        <section className="w-full px-6 lg:px-12 py-8 bg-white min-h-screen">
            <div className="max-w-8xl mx-auto">
                {/* Header */}
                <div className="flex items-center gap-3 mb-8">
                    <SparklesIcon className="h-6 w-6 text-black" />
                    <div>
                        <h1 className="text-3xl font-bold text-black">Your Recommendations</h1>
                        <p className="text-sm text-gray-600">A full list of products recommended just for you</p>
                    </div>
                </div>

                {/* Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                    {personalizedLoading ? (
                        <div className="col-span-full text-center py-10 text-gray-500">Loading...</div>
                    ) : recommendationsToShow.length > 0 ? (
                        recommendationsToShow.map((product) => (
                            <ProductCard
                                key={product.id}
                                product={product}
                                wishlisted={isInWishlist(product.id)}
                                wishlistLoading={wishlistLoading[product.id]}
                                inCart={isInCart(product.id)}
                                cartLoading={cartLoading[product.id]}
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

                {/* Optionally, add a refresh button */}
                <div className="mt-8 flex justify-center">
                    <button
                        className="text-sm text-gray-600 hover:text-black border border-gray-300 px-4 py-2 rounded-full hover:border-black transition-colors duration-200"
                        onClick={() => userId && getPersonalizedProducts(userId)}
                        disabled={personalizedLoading}
                    >
                        Refresh Recommendations
                    </button>
                </div>
            </div>
        </section>
    );
}
