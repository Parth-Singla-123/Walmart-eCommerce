'use client'

import { useState, useRef, useMemo, useCallback, useEffect, memo } from 'react'
import Image from 'next/image'
import { useOrders } from '@/hooks/useOrders'
import {
    MagnifyingGlassIcon,
    FunnelIcon,
    EyeIcon,
    ArrowPathIcon,
    XMarkIcon,
    ChevronDownIcon,
    TruckIcon,
    CheckCircleIcon,
    ClockIcon,
    ExclamationTriangleIcon
} from '@heroicons/react/24/outline'
import Link from 'next/link'
import LoadingSpinner from '@/components/ui/LoadingSpinner'

// Memoized order status component
const OrderStatus = memo(({ status }) => {
    const statusConfig = useMemo(() => ({
        pending: { color: 'bg-yellow-100 text-yellow-800', icon: ClockIcon, label: 'Pending' },
        confirmed: { color: 'bg-blue-100 text-blue-800', icon: CheckCircleIcon, label: 'Confirmed' },
        processing: { color: 'bg-purple-100 text-purple-800', icon: ArrowPathIcon, label: 'Processing' },
        shipped: { color: 'bg-indigo-100 text-indigo-800', icon: TruckIcon, label: 'Shipped' },
        delivered: { color: 'bg-green-100 text-green-800', icon: CheckCircleIcon, label: 'Delivered' },
        cancelled: { color: 'bg-red-100 text-red-800', icon: XMarkIcon, label: 'Cancelled' },
        returned: { color: 'bg-gray-100 text-gray-800', icon: ArrowPathIcon, label: 'Returned' }
    }), [])

    const config = statusConfig[status] || statusConfig.pending
    const Icon = config.icon

    return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
            <Icon className="h-3 w-3 mr-1" />
            {config.label}
        </span>
    )
})

OrderStatus.displayName = 'OrderStatus'

// Memoized order card component
const OrderCard = memo(({ order, onViewDetails, onCancel, onReorder }) => {
    const [isExpanded, setIsExpanded] = useState(false)
    const [actionLoading, setActionLoading] = useState(null)

    const canCancel = useMemo(() => {
        return ['pending', 'confirmed'].includes(order.status)
    }, [order.status])

    const formatDate = useCallback((date) => {
        return new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        })
    }, [])

    const handleAction = useCallback(async (action, actionFn) => {
        setActionLoading(action)
        await actionFn()
        setActionLoading(null)
    }, [])

    return (
        <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200">
            {/* Order Header */}
            <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                            Order #{order.orderNumber}
                        </h3>
                        <OrderStatus status={order.status} />
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                        <span>Placed on {formatDate(order.timestamps.orderDate)}</span>
                        <span>•</span>
                        <span className="font-medium text-gray-900">${order.totals.total.toFixed(2)}</span>
                        <span>•</span>
                        <span>{order.items.length} item{order.items.length !== 1 ? 's' : ''}</span>
                    </div>
                </div>

                <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="p-2 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100 transition-colors duration-200"
                >
                    <ChevronDownIcon className={`h-5 w-5 transform transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} />
                </button>
            </div>

            {/* Order Items Preview */}
            <div className="mb-4">
                <div className="flex items-center gap-3 overflow-x-auto pb-2">
                    {order.items.slice(0, 3).map((item, index) => (
                        <div key={index} className="flex items-center gap-2 bg-gray-50 rounded-lg p-2 whitespace-nowrap">
                            {item.image && (
                                <Image
                                    src={item.image}
                                    alt={item.name}
                                    className="w-8 h-8 object-cover rounded"
                                />
                            )}
                            <div className="text-sm">
                                <p className="font-medium text-gray-900 max-w-32 truncate">{item.name}</p>
                                <p className="text-gray-600">Qty: {item.quantity}</p>
                            </div>
                        </div>
                    ))}
                    {order.items.length > 3 && (
                        <div className="text-sm text-gray-500 px-2">
                            +{order.items.length - 3} more
                        </div>
                    )}
                </div>
            </div>

            {/* Expanded Content */}
            {isExpanded && (
                <div className="border-t border-gray-200 pt-4 space-y-4">
                    {/* Shipping Info */}
                    <div className="bg-gray-50 rounded-lg p-4">
                        <h4 className="font-medium text-gray-900 mb-2">Shipping Address</h4>
                        <div className="text-sm text-gray-600">
                            <p>{order.shippingAddress.street}</p>
                            <p>{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}</p>
                        </div>
                    </div>

                    {/* Tracking Info */}
                    {order.tracking?.number && (
                        <div className="bg-blue-50 rounded-lg p-4">
                            <h4 className="font-medium text-gray-900 mb-2">Tracking Information</h4>
                            <div className="text-sm text-gray-600">
                                <p>Carrier: {order.tracking.carrier}</p>
                                <p>Tracking: {order.tracking.number}</p>
                                {order.tracking.estimatedDelivery && (
                                    <p>Estimated Delivery: {formatDate(order.tracking.estimatedDelivery)}</p>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Action Buttons */}
            <div className="flex items-center gap-3 mt-4 pt-4 border-t border-gray-200">
                <Link
                    href={`/orders/${order._id}`}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                >
                    <EyeIcon className="h-4 w-4" />
                    View Details
                </Link>

                <button
                    onClick={() => handleAction('reorder', () => onReorder(order._id))}
                    disabled={actionLoading === 'reorder'}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-black rounded-lg hover:bg-gray-800 disabled:opacity-50 transition-colors duration-200"
                >
                    {actionLoading === 'reorder' ? (
                        <LoadingSpinner size="sm" className="border-white" />
                    ) : (
                        <ArrowPathIcon className="h-4 w-4" />
                    )}
                    Reorder
                </button>

                {canCancel && (
                    <button
                        onClick={() => handleAction('cancel', () => onCancel(order._id))}
                        disabled={actionLoading === 'cancel'}
                        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-700 bg-white border border-red-300 rounded-lg hover:bg-red-50 disabled:opacity-50 transition-colors duration-200"
                    >
                        {actionLoading === 'cancel' ? (
                            <LoadingSpinner size="sm" className="border-red-600" />
                        ) : (
                            <XMarkIcon className="h-4 w-4" />
                        )}
                        Cancel Order
                    </button>
                )}
            </div>
        </div>
    )
})

OrderCard.displayName = 'OrderCard'

// Memoized filter component
const OrderFilters = memo(({ onFilterChange, currentFilters }) => {
    const [isOpen, setIsOpen] = useState(false)
    const filterRef = useRef(null)

    const statusOptions = useMemo(() => [
        { value: '', label: 'All Orders' },
        { value: 'pending', label: 'Pending' },
        { value: 'confirmed', label: 'Confirmed' },
        { value: 'processing', label: 'Processing' },
        { value: 'shipped', label: 'Shipped' },
        { value: 'delivered', label: 'Delivered' },
        { value: 'cancelled', label: 'Cancelled' }
    ], [])

    const dateRangeOptions = useMemo(() => [
        { value: '', label: 'All Time' },
        { value: '30', label: 'Last 30 Days' },
        { value: '90', label: 'Last 3 Months' },
        { value: '365', label: 'Last Year' }
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
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200"
            >
                <FunnelIcon className="h-4 w-4" />
                Filters
                <ChevronDownIcon className={`h-4 w-4 transform transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-200 z-20">
                    <div className="p-4 space-y-4">
                        {/* Status Filter */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                            <select
                                value={currentFilters.status || ''}
                                onChange={(e) => onFilterChange({ ...currentFilters, status: e.target.value })}
                                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black"
                            >
                                {statusOptions.map(option => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Date Range Filter */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Date Range</label>
                            <select
                                value={currentFilters.dateRange || ''}
                                onChange={(e) => onFilterChange({ ...currentFilters, dateRange: e.target.value })}
                                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black"
                            >
                                {dateRangeOptions.map(option => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Clear Filters */}
                        <button
                            onClick={() => onFilterChange({})}
                            className="w-full px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors duration-200"
                        >
                            Clear All Filters
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
})

OrderFilters.displayName = 'OrderFilters'

// Main Orders Page Component
export default function OrdersPage() {
    const { orders, loading, error, fetchOrders, cancelOrder, reorderItems } = useOrders()
    const [searchTerm, setSearchTerm] = useState('')
    const [filters, setFilters] = useState({})
    const [showCancelDialog, setShowCancelDialog] = useState(null)

    const searchRef = useRef(null)

    // Initialize data on component mount
    useEffect(() => {
        fetchOrders()
    }, [fetchOrders])

    // Handle search with debouncing
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            fetchOrders({ ...filters, search: searchTerm })
        }, 300)

        return () => clearTimeout(timeoutId)
    }, [searchTerm, filters, fetchOrders])

    // Memoized filtered orders for client-side filtering
    const filteredOrders = useMemo(() => {
        if (!orders) return []

        return orders.filter(order => {
            const matchesSearch = !searchTerm ||
                order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                order.items.some(item =>
                    item.name.toLowerCase().includes(searchTerm.toLowerCase())
                )

            return matchesSearch
        })
    }, [orders, searchTerm])

    // Handle filter changes
    const handleFilterChange = useCallback((newFilters) => {
        setFilters(newFilters)
    }, [])

    // Handle order cancellation
    const handleCancelOrder = useCallback(async (orderId) => {
        const result = await cancelOrder(orderId)
        if (result.success) {
            setShowCancelDialog(null)
            // Show success message (you can add toast notification here)
        } else {
            alert(`Failed to cancel order: ${result.error}`)
        }
    }, [cancelOrder])

    // Handle reorder
    const handleReorder = useCallback(async (orderId) => {
        const result = await reorderItems(orderId)
        if (result.success) {
            // Redirect to cart or show success message
            alert('Items added to cart successfully!')
        } else {
            alert(`Failed to reorder: ${result.error}`)
        }
    }, [reorderItems])

    if (loading && !orders.length) {
        return (
            <div className="h-full flex items-center justify-center">
                <LoadingSpinner size="lg" />
            </div>
        )
    }

    return (
        <div className="h-full w-full">
            {/* Header */}
            <div className="p-6 border-b border-gray-200">
                <h1 className="text-2xl font-bold text-gray-900">Order History</h1>
                <p className="text-gray-600 mt-2">
                    Track and manage your orders
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
                            placeholder="Search orders by number or item name..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 text-sm border-2 border-gray-300 rounded-xl bg-white text-black placeholder:text-gray-500 focus:ring-2 focus:ring-black focus:border-black focus:outline-none transition-all duration-200"
                        />
                        <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    </div>

                    {/* Filters */}
                    <OrderFilters
                        onFilterChange={handleFilterChange}
                        currentFilters={filters}
                    />
                </div>
            </div>

            {/* Orders List */}
            <div className="p-6">
                {error && (
                    <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4">
                        <div className="flex items-center gap-2">
                            <ExclamationTriangleIcon className="h-5 w-5 text-red-600" />
                            <p className="text-red-700">{error}</p>
                        </div>
                    </div>
                )}

                {filteredOrders.length === 0 ? (
                    <div className="text-center py-12">
                        <div className="max-w-md mx-auto">
                            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <TruckIcon className="h-8 w-8 text-gray-400" />
                            </div>
                            <h3 className="text-lg font-medium text-gray-900 mb-2">No orders found</h3>
                            <p className="text-gray-500 mb-6">
                                {searchTerm || Object.keys(filters).length > 0
                                    ? "No orders match your search criteria"
                                    : "You haven't placed any orders yet"
                                }
                            </p>
                            <Link
                                href="/"
                                className="inline-flex items-center px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors duration-200"
                            >
                                Start Shopping
                            </Link>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {filteredOrders.map((order) => (
                            <OrderCard
                                key={order._id}
                                order={order}
                                onCancel={handleCancelOrder}
                                onReorder={handleReorder}
                            />
                        ))}
                    </div>
                )}

                {/* Loading indicator for pagination */}
                {loading && orders.length > 0 && (
                    <div className="flex justify-center py-8">
                        <LoadingSpinner size="md" />
                    </div>
                )}
            </div>

            {/* Cancel Confirmation Dialog */}
            {showCancelDialog && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Cancel Order</h3>
                        <p className="text-gray-600 mb-6">
                            Are you sure you want to cancel this order? This action cannot be undone.
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowCancelDialog(null)}
                                className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors duration-200"
                            >
                                Keep Order
                            </button>
                            <button
                                onClick={() => handleCancelOrder(showCancelDialog)}
                                className="flex-1 px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors duration-200"
                            >
                                Cancel Order
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}