// components/HeroSection.js
"use client"

import Link from 'next/link'
import Image from 'next/image'
import {
    ArrowRightIcon,
    TruckIcon,
    ShieldCheckIcon,
    StarIcon
} from '@heroicons/react/24/outline'

export default function HeroSection() {
    return (
        <div className="w-full bg-white">
            {/* Compact Main Hero Section */}
            <section className="w-full px-6 lg:px-12 py-8 lg:py-12">
                <div className="max-w-8xl mx-auto">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">

                        {/* Left Content - Reduced back to normal proportion */}
                        <div className="space-y-6">
                            <div className="space-y-4">
                                <h1 className="text-3xl lg:text-4xl font-bold text-black leading-tight">
                                    Save money.<br />
                                    <span className="text-gray-600">Live better.</span>
                                </h1>

                                <p className="text-base text-gray-600 leading-relaxed max-w-md">
                                    Millions of products at everyday low prices. Free shipping on $35+
                                </p>
                            </div>

                            {/* Compact CTA Buttons */}
                            <div className="flex gap-3">
                                <button
                                    onClick={()=>{window.scrollTo({top: document.getElementById('featured-products').offsetTop, behavior: 'smooth'})}} // scroll to featured products section
                                    className="inline-flex items-center px-6 py-2 bg-black text-white text-sm font-medium rounded-full hover:bg-gray-800 transition-colors duration-200"
                                >
                                    Shop Now
                                    <ArrowRightIcon className="ml-2 h-4 w-4" />
                                </button>

                                <button
                                    onClick={()=>{window.scrollTo({top: document.getElementById('popular-products').offsetTop, behavior: 'smooth'})}} // scroll to popular products section
                                    className="inline-flex items-center px-6 py-2 border-2 border-black text-black text-sm font-medium rounded-full hover:bg-black hover:text-white transition-all duration-200"
                                >
                                    Deals
                                </button>
                            </div>

                            {/* Compact Trust Indicators */}
                            <div className="flex items-center gap-4 text-xs text-gray-600">
                                <div className="flex items-center gap-1">
                                    <TruckIcon className="h-4 w-4" />
                                    <span>Free Shipping</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <ShieldCheckIcon className="h-4 w-4" />
                                    <span>Secure</span>
                                </div>
                            </div>
                        </div>

                        {/* Right Content - Much Larger Three Images Horizontally */}
                        <div className="relative">
                            <div className="grid grid-cols-3 gap-3">
                                {/* First Image - Much Larger */}
                                <div className="relative bg-gray-100 rounded-xl overflow-hidden aspect-[3/4]">
                                    <Image
                                        src="https://images.pexels.com/photos/1005638/pexels-photo-1005638.jpeg?auto=compress&cs=tinysrgb&w=600"
                                        alt="Shopping at Walmart"
                                        fill
                                        className="object-cover"
                                        priority
                                    />

                                    {/* Discount Badge */}
                                    <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                                        70% OFF
                                    </div>
                                </div>

                                {/* Second Image - Much Larger */}
                                <div className="relative bg-gray-100 rounded-xl overflow-hidden aspect-[3/4]">
                                    <Image
                                        src="https://images.pexels.com/photos/3962285/pexels-photo-3962285.jpeg?auto=compress&cs=tinysrgb&w=600"
                                        alt="Online Shopping"
                                        fill
                                        className="object-cover"
                                    />

                                    {/* New Arrivals Badge */}
                                    <div className="absolute top-2 right-2 bg-blue-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                                        NEW
                                    </div>
                                </div>

                                {/* Third Image - Much Larger */}
                                <div className="relative bg-gray-100 rounded-xl overflow-hidden aspect-[3/4]">
                                    <Image
                                        src="https://images.pexels.com/photos/5632402/pexels-photo-5632402.jpeg?auto=compress&cs=tinysrgb&w=600"
                                        alt="Fast Delivery"
                                        fill
                                        className="object-cover"
                                    />

                                    {/* Fast Delivery Badge */}
                                    <div className="absolute top-2 right-2 bg-green-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                                        FAST
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Rest of the sections remain exactly the same */}
            <section className="w-full px-6 lg:px-12 py-6 bg-gray-50">
                <div className="max-w-8xl mx-auto">
                    <div className="flex overflow-x-auto gap-4 pb-2">
                        {[
                            { name: 'Dairy', image: 'https://images.pexels.com/photos/5946720/pexels-photo-5946720.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=500' },
                            { name: 'Snacks', image: 'https://images.pexels.com/photos/1894325/pexels-photo-1894325.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=500' },
                            { name: 'Home', image: 'https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg?auto=compress&cs=tinysrgb&w=400' },
                            { name: 'Grocery', image: 'https://images.pexels.com/photos/264636/pexels-photo-264636.jpeg?auto=compress&cs=tinysrgb&w=400' },
                            { name: 'Beauty', image: 'https://images.pexels.com/photos/2113855/pexels-photo-2113855.jpeg?auto=compress&cs=tinysrgb&w=400' },
                            { name: 'Bakery', image: 'https://images.pexels.com/photos/17850150/pexels-photo-17850150.jpeg?cs=srgb&dl=pexels-isaacgraphy-17850150.jpg&fm=jpg' }
                        ].map((category, index) => (
                            <Link
                                key={index}
                                href={`/category/${category.name.toLowerCase()}`}
                                className="flex-shrink-0 group cursor-pointer"
                            >
                                <div className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200 w-24">
                                    <div className="h-16 relative">
                                        <Image
                                            src={category.image}
                                            alt={category.name}
                                            fill
                                            className="object-cover"
                                        />
                                    </div>
                                    <div className="p-2">
                                        <h3 className="text-xs font-medium text-black text-center group-hover:text-gray-600 transition-colors duration-200">
                                            {category.name}
                                        </h3>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            </section>

            <section id="featured-products" className="w-full px-6 lg:px-12 py-8">
                <div className="max-w-8xl mx-auto">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-bold text-black">Featured Products</h2>
                        <Link href="/all-products" className="text-sm text-black hover:text-gray-600 font-medium">
                            View All →
                        </Link>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                        {[
                            { name: 'Yogurt', price: '$0.99', originalPrice: '$79.99', rating: 4.5, image: 'https://images.openfoodfacts.org/images/products/003/663/200/8350/front_en.19.400.jpg' },
                            { name: 'Fresh Ginger Root', price: '$0.99', originalPrice: '$299.99', rating: 4.8, image: 'https://images.openfoodfacts.org/images/products/000/009/614/7450/front_en.23.400.jpg' },
                            { name: 'Organic White Onions', price: '$0.19', originalPrice: '$59.99', rating: 4.3, image: 'https://images.openfoodfacts.org/images/products/009/222/797/5322/front_en.25.400.jpg' },
                            { name: 'Organic Bosc Pear', price: '$1.99', originalPrice: '$19.99', rating: 4.6, image: 'https://images.rawpixel.com/image_1300/czNmcy1wcml2YXRlL3Jhd3BpeGVsX2ltYWdlcy93ZWJzaXRlX2NvbnRlbnQvbHIvcGR3YXRlcmNvbG9yZnJ1aXRiYXRjaDEtMTA5MC1nbG95LWJfMS5qcGc.jpg' },
                            { name: 'Organic Diced Tomatoes', price: '$2.99', originalPrice: '$14.99', rating: 4.4, image: 'https://images.openfoodfacts.org/images/products/009/661/993/7325/front_en.42.400.jpg' },
                            { name: 'Organic Bell Pepper', price: '$24.99', originalPrice: '$39.99', rating: 4.7, image: 'https://images.openfoodfacts.org/images/products/356/470/711/8637/front_fr.21.400.jpg' }
                        ].map((product, index) => (
                            <div key={index} className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200">
                                <div className="aspect-square relative">
                                    <Image
                                        src={product.image}
                                        alt={product.name}
                                        fill
                                        className="object-cover"
                                    />
                                </div>

                                <div className="p-3">
                                    <h3 className="text-sm font-medium text-black mb-1 line-clamp-2">{product.name}</h3>

                                    <div className="flex items-center gap-1 mb-2">
                                        <div className="flex">
                                            {[...Array(5)].map((_, i) => (
                                                <StarIcon
                                                    key={i}
                                                    className={`h-3 w-3 ${i < Math.floor(product.rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                                                />
                                            ))}
                                        </div>
                                        <span className="text-xs text-gray-500">({product.rating})</span>
                                    </div>

                                    <div className="flex items-center gap-2 mb-2">
                                        <span className="text-sm font-bold text-black">{product.price}</span>
                                        <span className="text-xs text-gray-500 line-through">{product.originalPrice}</span>
                                    </div>

                                    <button className="w-full bg-black text-white py-1.5 px-3 rounded-full hover:bg-gray-800 transition-colors duration-200 text-xs font-medium">
                                        Add to Cart
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    )
}
