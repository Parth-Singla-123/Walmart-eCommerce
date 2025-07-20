'use client'

import { useState, useRef, useMemo, useCallback, useEffect, memo } from 'react'
import Image from 'next/image'
import { FaHeart, FaRegHeart } from 'react-icons/fa'
import { MagnifyingGlassIcon, FunnelIcon, ChevronDownIcon, ShoppingCartIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline'
import Link from 'next/link'
import { useWish } from '@/hooks/useWish'
import { useCart } from '@/hooks/useCart'



// Dummy data for demonstration
const initialWishlist = [
  {
    id: '1',
    name: 'Apple iPhone 15',
    image: 'https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/iphone-15-model-unselect-202309?wid=512&hei=512&fmt=jpeg&qlt=95&.v=1692923771594',
    description: '128GB, Midnight Black',
    price: 799,
    brand: 'Apple',
    category: 'Electronics',
    inStock: true,
  },
  {
    id: '2',
    name: 'Samsung 4K TV',
    image: 'https://images.samsung.com/is/image/samsung/p6pim/in/ua43au7600kxxl/gallery/in-uhd-au7000-ua43au7600kxxl-frontblack-530285982?$650_519_PNG$',
    description: '55-inch Smart UHD',
    price: 499,
    brand: 'Samsung',
    category: 'TVs',
    inStock: false,
  },
  // ...add more items as needed
]



// Memoized Card for Wishlist Items
const WishlistCard = memo(({ item, onRemove, onMoveToCart }) => (
  <div className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md transition-shadow duration-200 flex items-center gap-4">
    <div className="relative w-16 h-16 rounded-lg overflow-hidden border border-gray-100 bg-white flex-shrink-0">
      <Image
        src={item.image}
        alt={item.name}
        fill
        style={{ objectFit: 'cover' }}
        sizes="64px"
        className="transition-transform duration-200"
        unoptimized
      />
    </div>
    <div className="flex-1 min-w-0">
      <div className="font-semibold text-gray-900 truncate">{item.name}</div>
      <div className="text-xs text-gray-500 truncate">{item.description}</div>
      <div className="text-blue-700 font-bold mt-1 text-sm">${item.price}</div>
      <div className="text-xs mt-1">
        {item.inStock
          ? <span className="text-green-600">In Stock</span>
          : <span className="text-red-500">Out of Stock</span>}
      </div>
    </div>
    <div className="flex flex-col gap-2 items-end">
      <button
        onClick={() => onRemove(item.productId)}
        className="p-2 rounded-full border-2 border-blue-200 bg-white text-pink-500 hover:bg-pink-50 hover:border-pink-400 transition"
        aria-label="Remove from wishlist"
        title="Remove"
      >
        <FaHeart className="fill-current" size={18} />
      </button>
      <button
        onClick={() => onMoveToCart(item.productId)}
        disabled={!item.inStock}
        className="flex items-center gap-1 px-3 py-1 text-xs font-medium text-white bg-black rounded-lg hover:bg-gray-800 disabled:opacity-50 transition"
      >
        <ShoppingCartIcon className="h-4 w-4" />
        Move to Cart
      </button>
    </div>
  </div>
))
WishlistCard.displayName = 'WishlistCard'




// Memoized Filter Component
const WishlistFilters = memo(({ onFilterChange, currentFilters }) => {
  const [isOpen, setIsOpen] = useState(false)
  const filterRef = useRef(null)

  const brandOptions = useMemo(() => [
    { value: '', label: 'All Brands' },
    { value: 'Apple', label: 'Apple' },
    { value: 'Samsung', label: 'Samsung' },
    // Add more brands as needed
  ], [])

  const categoryOptions = useMemo(() => [
    { value: '', label: 'All Categories' },
    { value: 'Electronics', label: 'Electronics' },
    { value: 'TVs', label: 'TVs' },
    // Add more categories as needed
  ], [])

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (filterRef.current && !filterRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div className="relative" ref={filterRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition"
      >
        <FunnelIcon className="h-4 w-4" />
        Filters
        <ChevronDownIcon className={`h-4 w-4 transform transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-200 z-20">
          <div className="p-4 space-y-4">
            {/* Brand Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Brand</label>
              <select
                value={currentFilters.brand || ''}
                onChange={(e) => onFilterChange({ ...currentFilters, brand: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black"
              >
                {brandOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            {/* Category Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
              <select
                value={currentFilters.category || ''}
                onChange={(e) => onFilterChange({ ...currentFilters, category: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black"
              >
                {categoryOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            {/* Clear Filters */}
            <button
              onClick={() => onFilterChange({})}
              className="w-full px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
            >
              Clear All Filters
            </button>
          </div>
        </div>
      )}
    </div>
  )
})
WishlistFilters.displayName = 'WishlistFilters'





// Main Wishlist Page Component
export default function WishlistPage() {
  // Use the custom hooks
  const {
    wishlist,
    loading,
    error,
    getWishlist,
    removeFromWishlist,
  } = useWish();

  const {
    addToCart, // <-- Use this from your useCart hook
  } = useCart();

  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({});
  const searchRef = useRef(null);

  // Fetch wishlist on mount
  useEffect(() => {
    getWishlist();
  }, [getWishlist]);

  // Search and filter logic
  const filteredWishlist = useMemo(() => {
    return wishlist.filter(item => {
      const matchesSearch =
        !searchTerm ||
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesBrand = !filters.brand || item.brand === filters.brand;
      const matchesCategory = !filters.category || item.category === filters.category;

      return matchesSearch && matchesBrand && matchesCategory;
    });
  }, [wishlist, searchTerm, filters]);

  // Remove item from wishlist (calls backend)
  const handleRemove = async (id) => {
    await removeFromWishlist(id);
    // Optionally, show a toast/notification here
  };

  // Move item to cart (calls backend)
  const handleMoveToCart = async (id) => {
    // 1. Add to cart
    const result = await addToCart(id);
    if (result && result.success) {
      // 2. Remove from wishlist
      await removeFromWishlist(id);
      // 3. Optionally, show a toast/notification here
    } else {
      alert(result?.error || "Failed to move to cart.");
    }
  };

  return (
    <div className="h-full w-full">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <h1 className="text-2xl font-bold text-gray-900">My Wishlist</h1>
        <p className="text-gray-600 mt-2">
          Save products to buy later or move them to your cart.
        </p>
      </div>

      {/* Search and Filters */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search Bar */}
          <div className="flex-1 relative">
            <input
              ref={searchRef}
              type="text"
              placeholder="Search wishlist by product or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm border-2 border-gray-300 rounded-xl bg-white text-black placeholder:text-gray-500 focus:ring-2 focus:ring-black focus:border-black focus:outline-none transition-all duration-200"
            />
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          </div>
          {/* Filters */}
          <WishlistFilters
            onFilterChange={setFilters}
            currentFilters={filters}
          />
        </div>
      </div>

      {/* Wishlist List */}
      <div className="p-6">
        {loading ? (
          <div className="text-center py-12 text-gray-500">Loading...</div>
        ) : error ? (
          <div className="text-center py-12 text-red-500">{error}</div>
        ) : filteredWishlist.length === 0 ? (
          <div className="text-center py-12">
            <div className="max-w-md mx-auto">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaRegHeart className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No wishlist items found</h3>
              <p className="text-gray-500 mb-6">
                {searchTerm || Object.keys(filters).length > 0
                  ? "No items match your search criteria"
                  : "Your wishlist is empty. Start shopping and add items you love!"}
              </p>
              <Link
                href="/"
                className="inline-flex items-center px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition"
              >
                Start Shopping
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredWishlist.map(item => (
              <WishlistCard
                key={item.id}
                item={item}
                onRemove={handleRemove}
                onMoveToCart={handleMoveToCart}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}