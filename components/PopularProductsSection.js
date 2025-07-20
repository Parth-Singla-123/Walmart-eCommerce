"use client"

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import {
    StarIcon,
    ArrowRightIcon,
    HeartIcon,
    ShoppingCartIcon,
    ArrowTrendingUpIcon
} from '@heroicons/react/24/outline'
import { HeartIcon as HeartSolid } from '@heroicons/react/24/solid'
import { useWish } from '@/hooks/useWish'
import { useCart } from '@/hooks/useCart'
import { useProduct } from '@/hooks/useProducts'

export default function PopularProductsSection() {
    // Hooks for wishlist, cart, and products
    const { wishlist, addToWishlist, removeFromWishlist } = useWish();
    const { cart, addToCart } = useCart();
    const {
        popular,
        popularLoading,
        getPopularProducts
    } = useProduct();

    // Load popular products on mount
    useEffect(() => {
        getPopularProducts();
    }, [getPopularProducts]);

    // Split into two sections for 2x4 grids
    const popularProducts1 = popular.slice(0, 8);
    const popularProducts2 = popular.slice(8, 16);

    // Helpers
    const isInWishlist = (productId) =>
        wishlist.some(item => String(item.id) === String(productId) || String(item.productId) === String(productId));

    const isInCart = (productId) =>
        cart.some(item => String(item.id) === String(productId) || String(item.productId) === String(productId));

    const [wishlistLoading, setWishlistLoading] = useState({});
    const [cartLoading, setCartLoading] = useState({});

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

    const getBadgeColor = (badge) => {
        switch ((badge || '').toLowerCase()) {
            case 'bestseller': return 'bg-orange-500'
            case 'popular': return 'bg-blue-500'
            case 'deal': return 'bg-red-500'
            case 'trending': return 'bg-purple-500'
            case 'premium': return 'bg-gray-800'
            case 'new': return 'bg-green-500'
            default: return 'bg-gray-500'
        }
    }

    // ProductCard adapted for dynamic products
    const ProductCard = ({ product }) => {
        const wishlisted = isInWishlist(product.productId);
        const inCart = isInCart(product.productId);

        return (
            <div className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200 group flex-shrink-0" style={{ width: 'calc(25% - 6px)' }}>
                <div className="aspect-[4/3] relative">
                    <Image
                        src={product.image || product.images?.[0]?.url || '/placeholder.png'}
                        alt={product.name}
                        fill
                        unoptimized
                        className="object-cover group-hover:scale-105 transition-transform duration-200 z-0"
                    />

                    {/* Badge */}
                    {product.badge && (
                        <div className={`absolute top-1 left-1 z-20 ${getBadgeColor(product.badge)} text-white px-1.5 py-0.5 rounded-full text-xs font-bold`}>
                            {product.badge}
                        </div>
                    )}

                    {/* Wishlist Button */}
                    <button
                        className="absolute top-1 right-1 z-20 p-1 bg-white rounded-full shadow-sm hover:shadow-md transition-shadow duration-200"
                        onClick={() => handleWishlistToggle(product.productId)}
                        aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
                        disabled={wishlistLoading[product.productId]}
                    >
                        {wishlisted ? (
                            <HeartSolid className="h-6 w-6 text-red-500" />
                        ) : (
                            <HeartIcon className="h-6 w-6 text-gray-600 hover:text-red-500" />
                        )}
                    </button>
                </div>

                <div className="p-2">
                    <h3 className="text-xs font-medium text-black mb-1 line-clamp-2 leading-tight">{product.name}</h3>

                    

                    <div className="flex items-center gap-1 mb-1.5">
                        <span className="text-xs font-bold text-black">
                            {typeof product.price === "number" ? `₹${product.price}` : product.price}
                        </span>
                        {product.originalPrice && (
                            <span className="text-xs text-gray-500 line-through">
                                {typeof product.originalPrice === "number" ? `₹${product.originalPrice}` : product.originalPrice}
                            </span>
                        )}
                    </div>

                    <button
                        className="w-full bg-black text-white py-1 px-2 rounded-full hover:bg-gray-800 transition-colors duration-200 text-xs font-medium disabled:opacity-50"
                        onClick={() => handleAddToCart(product.productId)}
                        disabled={inCart || cartLoading[product.productId]}
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
        )
    }

    return (
        <div className="max-w-8xl mx-auto bg-white">
            <section id="popular-products" className="w-full px-6 lg:px-12 py-3">
                <div className="w-full">
                    <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                            <ArrowTrendingUpIcon className="h-5 w-5 text-black" />
                            <div>
                                <h2 className="text-lg font-bold text-black">Popular Products</h2>
                                <p className="text-xs text-gray-600">Trending items loved by our customers</p>
                            </div>
                        </div>
                        <Link href="/popular" className="text-xs text-black hover:text-gray-600 font-medium">
                            View All →
                        </Link>
                    </div>

                    {/* First Section: 2x4 Products Left, Compact Explore Image Right */}
                    <div className="flex flex-col lg:flex-row gap-3 mb-4">
                        {/* Left Side: 2x4 Product Flex Layout */}
                        <div className="flex-1 lg:flex-[2]">
                            <div className="flex flex-wrap gap-2">
                                {popularLoading ? (
                                    <div className="w-full text-center py-8 text-gray-400">Loading...</div>
                                ) : (
                                    popularProducts1.map((product) => (
                                        <ProductCard key={product.productId || product._id} product={product} />
                                    ))
                                )}
                            </div>
                        </div>
                        {/* Right Side: Compact Explore More Image */}
                        <div className="flex-1 lg:flex-[1]">
                            <div className="relative bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl overflow-hidden h-full min-h-[140px] flex items-center justify-center">
                                <Image
                                    src="https://images.pexels.com/photos/1005638/pexels-photo-1005638.jpeg?auto=compress&cs=tinysrgb&w=600"
                                    alt="Explore Grocery"
                                    fill
                                    unoptimized
                                    className="object-cover opacity-30"
                                />
                                <div className="relative z-10 text-center text-white p-2">
                                    <h3 className="text-sm font-bold mb-1">Explore Electronics</h3>
                                    <p className="text-xs mb-2 opacity-90">
                                        Latest tech gadgets
                                    </p>
                                    <Link
                                        href="/electronics"
                                        className="inline-flex items-center px-3 py-1 bg-white text-black rounded-full font-medium hover:bg-gray-100 transition-colors duration-200 text-xs"
                                    >
                                        Shop Now
                                        <ArrowRightIcon className="ml-1 h-3 w-3" />
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Second Section: Compact Explore Image Left, 2x4 Products Right */}
                    <div className="flex flex-col lg:flex-row gap-3">
                        {/* Left Side: Compact Explore More Image */}
                        <div className="flex-1 lg:flex-[1]">
                            <div className="relative bg-gradient-to-br from-green-500 to-teal-600 rounded-xl overflow-hidden h-full min-h-[140px] flex items-center justify-center">
                                <Image
                                    src="https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg?auto=compress&cs=tinysrgb&w=600"
                                    alt="Explore Home & Kitchen"
                                    fill
                                    unoptimized
                                    className="object-cover opacity-30"
                                />
                                <div className="relative z-10 text-center text-white p-2">
                                    <h3 className="text-sm font-bold mb-1">Home & Kitchen</h3>
                                    <p className="text-xs mb-2 opacity-90">
                                        Everything here
                                    </p>
                                    <Link
                                        href="/home-kitchen"
                                        className="inline-flex items-center px-3 py-1 bg-white text-black rounded-full font-medium hover:bg-gray-100 transition-colors duration-200 text-xs"
                                    >
                                        Shop Now
                                        <ArrowRightIcon className="ml-1 h-3 w-3" />
                                    </Link>
                                </div>
                            </div>
                        </div>
                        {/* Right Side: 2x4 Product Flex Layout */}
                        <div className="flex-1 lg:flex-[2]">
                            <div className="flex flex-wrap gap-2">
                                {popularLoading ? (
                                    <div className="w-full text-center py-8 text-gray-400">Loading...</div>
                                ) : (
                                    popularProducts2.map((product) => (
                                        <ProductCard key={product.productId || product._id} product={product} />
                                    ))
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Minimal Bottom CTA Strip */}
                    <div className="mt-3 p-2 bg-gray-50 rounded-lg">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-sm font-semibold text-black">Can&apos;t find what you&apos;re looking for?</h3>
                                <p className="text-xs text-gray-600">Browse our complete catalog</p>
                            </div>
                            <div className="flex gap-2">
                                <Link href="/categories" className="px-2 py-1 border border-black text-black rounded-full hover:bg-black hover:text-white transition-all duration-200 text-xs font-medium">
                                    Categories
                                </Link>
                                <Link href="/search" className="px-2 py-1 bg-black text-white rounded-full hover:bg-gray-800 transition-colors duration-200 text-xs font-medium flex items-center">
                                    <ShoppingCartIcon className="h-3 w-3 mr-1" />
                                    Search
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    )
}
