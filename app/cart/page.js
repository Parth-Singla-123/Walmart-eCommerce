'use client';

import { useEffect, useRef, useState, useMemo, useCallback, memo } from "react";
import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/hooks/useCart";
import {
  MagnifyingGlassIcon,
  XMarkIcon,
  ChevronUpIcon,
  ChevronDownIcon as DownIcon,
} from "@heroicons/react/24/outline";
import { useUser } from "@/hooks/useUser";

// --- CartCard Component ---
const CartCard = memo(function CartCard({
  item,
  onRemove,
  onIncrease,
  onDecrease,
  selectable,
  selected,
  onSelectChange,
  disabled,
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 flex items-center gap-4 hover:shadow-md transition-shadow duration-200">
      {selectable && (
        <input
          type="checkbox"
          className="h-5 w-5 accent-blue-600"
          checked={selected}
          onChange={e => onSelectChange(item.id, e.target.checked)}
          disabled={disabled}
          aria-label={item.inStock ? "Select item for checkout" : "Out of stock"}
        />
      )}
      <div className="relative w-16 h-16 rounded-lg overflow-hidden border border-gray-100 bg-white flex-shrink-0">
        <Image
          src={item.image}
          alt={item.name}
          fill
          style={{ objectFit: "cover" }}
          sizes="64px"
          className="transition-transform duration-200"
          unoptimized
        />
        <span
          className={`absolute top-1 left-1 px-2 py-0.5 rounded text-xs font-semibold
            ${item.inStock
              ? "bg-green-100 text-green-700 border border-green-300"
              : "bg-red-100 text-red-700 border border-red-300"
            }`}
        >
          {item.inStock ? "In Stock" : "Out of Stock"}
        </span>
      </div>
      <div className="flex-1 min-w-0">
        <div className="font-semibold text-gray-900 truncate">{item.name}</div>
        <div className="text-xs text-gray-500 truncate">{item.description}</div>
        <div className="text-blue-700 font-bold mt-1 text-sm">₹{item.price}</div>
        <div className="flex items-center gap-2 mt-2">
          <button
            onClick={() => onDecrease(item.id)}
            disabled={item.quantity <= 1 || !item.inStock}
            className="p-1 rounded-full border border-gray-300 hover:bg-gray-100 disabled:opacity-50"
            aria-label="Decrease quantity"
          >
            <DownIcon className="h-4 w-4" />
          </button>
          <span className="px-2">{item.quantity}</span>
          <button
            onClick={() => onIncrease(item.id)}
            disabled={!item.inStock || item.quantity===item.stock}
            className="p-1 rounded-full border border-gray-300 hover:bg-gray-100 disabled:opacity-50"
            aria-label="Increase quantity"
          >
            <ChevronUpIcon className="h-4 w-4" />
          </button>
        </div>
      </div>
      <button
        onClick={() => onRemove(item.id)}
        className="p-2 rounded-full border-2 border-red-200 bg-white text-red-500 hover:bg-red-50 hover:border-red-400 transition"
        aria-label="Remove from cart"
        title="Remove"
      >
        <XMarkIcon className="h-5 w-5" />
      </button>
    </div>
  );
});
CartCard.displayName = "CartCard";

// --- CartPage Component ---
export default function CartPage() {
  const {
    cart,
    loading,
    error,
    getCart,
    removeFromCart,
    increaseQuantity,
    decreaseQuantity,
  } = useCart();

  const { user } = useUser();

  const [searchTerm, setSearchTerm] = useState('');
  const searchRef = useRef(null);

  // Track selected items for partial checkout
  const [selectedIds, setSelectedIds] = useState([]);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  useEffect(() => {
    getCart();
  }, [getCart]);

  // Split cart into in-stock and out-of-stock items, and apply search filter
  const { inStockItems, outOfStockItems } = useMemo(() => {
    const filtered = cart.filter(item => {
      const matchesSearch =
        !searchTerm ||
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesSearch;
    });
    return {
      inStockItems: filtered.filter(item => item.inStock),
      outOfStockItems: filtered.filter(item => !item.inStock),
    };
  }, [cart, searchTerm]);

  useEffect(() => {
    setSelectedIds(prev =>
      prev.filter(id => inStockItems.some(item => item.id === id))
    );
  }, [inStockItems]);

  const handleSelectChange = useCallback((id, checked) => {
    setSelectedIds(prev =>
      checked ? [...prev, id] : prev.filter(selectedId => selectedId !== id)
    );
  }, []);

  const handleSelectAll = useCallback((checked) => {
    if (checked) {
      setSelectedIds(inStockItems.map(item => item.id));
    } else {
      setSelectedIds([]);
    }
  }, [inStockItems]);

  const handleRemove = useCallback(async (id) => {
    await removeFromCart(id);
  }, [removeFromCart]);

  const handleIncrease = useCallback(async (id) => {
    await increaseQuantity(id);
  }, [increaseQuantity]);

  const handleDecrease = useCallback(async (id) => {
    await decreaseQuantity(id);
  }, [decreaseQuantity]);

  const selectedItems = useMemo(
    () => inStockItems.filter(item => selectedIds.includes(item.id)),
    [inStockItems, selectedIds]
  );

  const selectedItemsForCheckout = useMemo(
    () =>
      selectedItems.map(item => ({
        id: item.id,
        quantity: item.quantity,
        name: item.name,
        price: item.price
      })),
    [selectedItems]
  );

  const total = useMemo(() =>
    selectedItems.reduce((sum, item) => sum + item.price * item.quantity, 0), [selectedItems]
  );

  const handleCheckout = async () => {
    if (checkoutLoading) return;
    setCheckoutLoading(true);

    if (user && user.supabaseId) {
      const product_names = selectedItemsForCheckout.map(item => item.name);
      try {
        const response = await fetch("http://localhost:5000/purchase", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            user_id: user.supabaseId,
            product_names,
          }),
        });

        if (response.ok) {
          setOrderPlaced(true);
        } else {
          setOrderPlaced(false);
        }
      } catch (error) {
        setOrderPlaced(false);
      }
    }
    setCheckoutLoading(false);
  };

  const allSelected = inStockItems.length > 0 && selectedIds.length === inStockItems.length;

  return (
    <div className="h-full w-full bg-gray-50 min-h-screen pb-12">
      {/* Header */}
      <div className="p-8 border-b border-gray-200 bg-white">
        <h1 className="text-3xl font-bold text-gray-900">My Cart</h1>
        <p className="text-gray-600 mt-2">
          Review your cart and proceed to checkout.
        </p>
      </div>

      {/* Search Bar */}
      <div className="p-8 border-b border-gray-200 bg-white">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <input
              ref={searchRef}
              type="text"
              placeholder="Search cart by product or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm border-2 border-gray-300 rounded-xl bg-white text-black placeholder:text-gray-500 focus:ring-2 focus:ring-black focus:border-black focus:outline-none transition-all duration-200"
            />
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          </div>
        </div>
      </div>

      {/* Main Content: Cart Items + Checkout */}
      <div className="p-8 max-w-6xl mx-auto">
        {loading ? (
          <div className="text-center py-12 text-gray-500">Loading...</div>
        ) : error ? (
          <div className="text-center py-12 text-red-500">{error}</div>
        ) : inStockItems.length === 0 && outOfStockItems.length === 0 ? (
          <div className="text-center py-12">
            <div className="max-w-md mx-auto">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                🛒
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No cart items found</h3>
              <p className="text-gray-500 mb-6">
                {searchTerm
                  ? "No items match your search criteria"
                  : "Your cart is empty. Start shopping and add items you love!"}
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
          <div className="flex flex-col lg:flex-row gap-8 items-start">
            {/* Cart Items */}
            <div className="flex-1 w-full">
              {/* In-Stock Items */}
              {inStockItems.length > 0 && (
                <div className="space-y-5 mb-8">
                  <div className="flex items-center mb-2 gap-2">
                    <input
                      type="checkbox"
                      className="h-5 w-5 accent-blue-600"
                      checked={allSelected}
                      onChange={e => handleSelectAll(e.target.checked)}
                      aria-label="Select all in-stock items"
                    />
                    <span className="font-semibold text-gray-700">
                      Select All ({selectedIds.length}/{inStockItems.length})
                    </span>
                  </div>
                  {inStockItems.map(item => (
                    <CartCard
                      key={item.id}
                      item={item}
                      onRemove={handleRemove}
                      onIncrease={handleIncrease}
                      onDecrease={handleDecrease}
                      selectable={true}
                      selected={selectedIds.includes(item.id)}
                      onSelectChange={handleSelectChange}
                      disabled={false}
                    />
                  ))}
                </div>
              )}

              {/* Out-of-Stock Items */}
              {outOfStockItems.length > 0 && (
                <div className="space-y-4 border-t pt-8 mt-8">
                  <h2 className="text-lg font-semibold mb-2 text-red-700">Out of Stock</h2>
                  {outOfStockItems.map(item => (
                    <CartCard
                      key={item.id}
                      item={item}
                      onRemove={handleRemove}
                      onIncrease={handleIncrease}
                      onDecrease={handleDecrease}
                      selectable={false}
                      selected={false}
                      onSelectChange={() => {}}
                      disabled={true}
                    />
                  ))}
                  <div className="text-sm text-red-600 mt-2">
                    Out-of-stock items cannot be selected or ordered. Please remove them to proceed with only available items.
                  </div>
                </div>
              )}
            </div>
            {/* Checkout Summary */}
            <div className="w-full lg:w-[370px] flex-shrink-0">
              <div className="bg-white shadow-xl border rounded-2xl p-8 sticky top-24">
                <div className="flex justify-between items-center mb-4">
                  <span className="font-semibold text-gray-700">Total</span>
                  <span className="font-bold text-2xl text-black">₹{total}</span>
                </div>
                {selectedItems.length > 0 ? (
                  orderPlaced ? (
                    <button
                      className="w-full px-4 py-2 bg-green-600 text-white rounded-lg font-semibold flex items-center justify-center gap-2 cursor-default"
                      disabled
                    >
                      <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                      Order Placed!
                    </button>
                  ) : (
                    <button
                      className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition flex items-center justify-center gap-2"
                      onClick={handleCheckout}
                      disabled={checkoutLoading}
                    >
                      {checkoutLoading && (
                        <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                        </svg>
                      )}
                      {checkoutLoading ? "Loading..." : (
                        <>Proceed to Checkout ({selectedItems.length} item{selectedItems.length > 1 ? 's' : ''})</>
                      )}
                    </button>
                  )
                ) : (
                  <div className="text-xs text-red-500 mt-2 text-center">
                    Please select at least one available item to checkout.
                  </div>
                )}

                {selectedItemsForCheckout.length > 0 && (
                  <div className="mt-4 text-xs text-gray-700">
                    <div className="font-semibold mb-1">Selected for Order:</div>
                    <ul className="list-disc ml-4">
                      {selectedItemsForCheckout.map(item => (
                        <li key={item.id}>
                          {item.name} <span className="text-gray-500">(x{item.quantity})</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
