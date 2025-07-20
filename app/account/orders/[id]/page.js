'use client'

import { useState, useRef, useMemo, useCallback, useEffect, memo } from 'react'
import Image from 'next/image'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import {
    ArrowLeftIcon,
    TruckIcon,
    CheckCircleIcon,
    ClockIcon,
    XMarkIcon,
    ArrowPathIcon,
    PrinterIcon,
    ChatBubbleLeftIcon,
    MapPinIcon,
    CreditCardIcon,
    ExclamationTriangleIcon
} from '@heroicons/react/24/outline'
import LoadingSpinner from '@/components/ui/LoadingSpinner'

// Memoized order status timeline component
const OrderTimeline = memo(({ order }) => {
    const timelineSteps = useMemo(() => {
        const steps = [
            {
                key: 'orderDate',
                label: 'Order Placed',
                status: 'completed',
                date: order.timestamps.orderDate,
                icon: CheckCircleIcon
            },
            {
                key: 'confirmedAt',
                label: 'Order Confirmed',
                status: order.timestamps.confirmedAt ? 'completed' : 'pending',
                date: order.timestamps.confirmedAt,
                icon: CheckCircleIcon
            },
            {
                key: 'processing',
                label: 'Processing',
                status: ['processing', 'shipped', 'delivered'].includes(order.status) ? 'completed' : 'pending',
                date: order.timestamps.processingAt,
                icon: ArrowPathIcon
            },
            {
                key: 'shippedAt',
                label: 'Shipped',
                status: order.timestamps.shippedAt ? 'completed' : 'pending',
                date: order.timestamps.shippedAt,
                icon: TruckIcon
            },
            {
                key: 'deliveredAt',
                label: 'Delivered',
                status: order.timestamps.deliveredAt ? 'completed' : 'pending',
                date: order.timestamps.deliveredAt,
                icon: CheckCircleIcon
            }
        ]

        // Handle cancelled orders
        if (order.status === 'cancelled') {
            return steps.slice(0, 2).concat([{
                key: 'cancelled',
                label: 'Order Cancelled',
                status: 'cancelled',
                date: order.timestamps.cancelledAt,
                icon: XMarkIcon
            }])
        }

        return steps
    }, [order])

    const formatDate = useCallback((date) => {
        if (!date) return null
        return new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        })
    }, [])

    return (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Order Timeline</h2>

            <div className="space-y-4">
                {timelineSteps.map((step, index) => {
                    const Icon = step.icon
                    const isLast = index === timelineSteps.length - 1

                    return (
                        <div key={step.key} className="flex items-start">
                            <div className="flex flex-col items-center">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step.status === 'completed' ? 'bg-green-100 text-green-600' :
                                        step.status === 'cancelled' ? 'bg-red-100 text-red-600' :
                                            'bg-gray-100 text-gray-400'
                                    }`}>
                                    <Icon className="h-4 w-4" />
                                </div>
                                {!isLast && (
                                    <div className={`w-px h-8 mt-2 ${step.status === 'completed' ? 'bg-green-200' : 'bg-gray-200'
                                        }`} />
                                )}
                            </div>

                            <div className="ml-4 flex-1">
                                <div className="flex items-center justify-between">
                                    <p className={`text-sm font-medium ${step.status === 'completed' ? 'text-gray-900' :
                                            step.status === 'cancelled' ? 'text-red-600' :
                                                'text-gray-500'
                                        }`}>
                                        {step.label}
                                    </p>
                                    {step.date && (
                                        <p className="text-xs text-gray-500">
                                            {formatDate(step.date)}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    )
})

OrderTimeline.displayName = 'OrderTimeline'

// Memoized order item component
const OrderItem = memo(({ item, onReorderItem }) => {
    const [reorderLoading, setReorderLoading] = useState(false)

    const handleReorder = useCallback(async () => {
        setReorderLoading(true)
        await onReorderItem(item)
        setReorderLoading(false)
    }, [item, onReorderItem])

    return (
        <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
            {item.image && (
                <Image
                    src={item.image}
                    alt={item.name}
                    className="w-16 h-16 object-cover rounded-lg"
                />
            )}

            <div className="flex-1">
                <h4 className="font-medium text-gray-900">{item.name}</h4>
                <div className="flex items-center gap-4 mt-1 text-sm text-gray-600">
                    <span>Qty: {item.quantity}</span>
                    {item.size && <span>Size: {item.size}</span>}
                    {item.color && <span>Color: {item.color}</span>}
                </div>
                <p className="text-sm font-medium text-gray-900 mt-1">
                    ${item.price.toFixed(2)} each
                </p>
            </div>

            <div className="text-right">
                <p className="font-semibold text-gray-900">
                    ${(item.price * item.quantity).toFixed(2)}
                </p>
                <button
                    onClick={handleReorder}
                    disabled={reorderLoading}
                    className="mt-2 text-sm text-blue-600 hover:text-blue-800 disabled:opacity-50 transition-colors duration-200"
                >
                    {reorderLoading ? 'Adding...' : 'Reorder'}
                </button>
            </div>
        </div>
    )
})

OrderItem.displayName = 'OrderItem'

// Memoized shipping info component
const ShippingInfo = memo(({ order }) => {
    return (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Shipping Information</h2>

            <div className="space-y-4">
                {/* Shipping Address */}
                <div className="flex items-start gap-3">
                    <MapPinIcon className="h-5 w-5 text-gray-500 mt-0.5" />
                    <div>
                        <p className="font-medium text-gray-900">Shipping Address</p>
                        <div className="text-sm text-gray-600 mt-1">
                            <p>{order.shippingAddress.street}</p>
                            <p>{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}</p>
                            <p>{order.shippingAddress.country}</p>
                        </div>
                    </div>
                </div>

                {/* Tracking Information */}
                {order.tracking?.number && (
                    <div className="flex items-start gap-3">
                        <TruckIcon className="h-5 w-5 text-gray-500 mt-0.5" />
                        <div>
                            <p className="font-medium text-gray-900">Tracking Information</p>
                            <div className="text-sm text-gray-600 mt-1">
                                <p>Carrier: {order.tracking.carrier}</p>
                                <p>Tracking Number:
                                    <span className="font-mono ml-1">{order.tracking.number}</span>
                                </p>
                                {order.tracking.estimatedDelivery && (
                                    <p>Estimated Delivery: {new Date(order.tracking.estimatedDelivery).toLocaleDateString()}</p>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* Payment Method */}
                <div className="flex items-start gap-3">
                    <CreditCardIcon className="h-5 w-5 text-gray-500 mt-0.5" />
                    <div>
                        <p className="font-medium text-gray-900">Payment Method</p>
                        <p className="text-sm text-gray-600 mt-1">
                            {order.paymentMethod.type} ending in {order.paymentMethod.last4}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
})

ShippingInfo.displayName = 'ShippingInfo'

// Memoized order summary component
const OrderSummary = memo(({ order }) => {
    const summaryItems = useMemo(() => [
        { label: 'Subtotal', value: order.totals.subtotal },
        { label: 'Shipping', value: order.totals.shipping },
        { label: 'Tax', value: order.totals.tax },
        ...(order.totals.discount > 0 ? [{ label: 'Discount', value: -order.totals.discount }] : []),
        { label: 'Total', value: order.totals.total, isTotal: true }
    ], [order.totals])

    return (
        <div className="bg-gray-50 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h3>

            <div className="space-y-3">
                {summaryItems.map((item, index) => (
                    <div key={index} className={`flex justify-between ${item.isTotal ? 'border-t border-gray-200 pt-3 text-lg font-semibold' : 'text-sm'
                        }`}>
                        <span className={item.isTotal ? 'text-gray-900' : 'text-gray-600'}>
                            {item.label}
                        </span>
                        <span className={`${item.isTotal ? 'text-gray-900' :
                                item.value < 0 ? 'text-green-600' : 'text-gray-900'
                            }`}>
                            ${Math.abs(item.value).toFixed(2)}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    )
})

OrderSummary.displayName = 'OrderSummary'

export default function OrderDetailsPage() {
    const params = useParams()
    const router = useRouter()
    const [order, setOrder] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [actionLoading, setActionLoading] = useState(null)
    const [actionMessage, setActionMessage] = useState(null)

    // Fetch order details
    useEffect(() => {
        const fetchOrder = async () => {
            try {
                setLoading(true)
                setError(null)

                const response = await fetch(`/api/orders/${params.id}`)

                if (!response.ok) {
                    if (response.status === 404) {
                        throw new Error('Order not found')
                    }
                    throw new Error('Failed to fetch order details')
                }

                const data = await response.json()
                setOrder(data.order)
            } catch (err) {
                setError(err.message)
            } finally {
                setLoading(false)
            }
        }

        if (params.id) {
            fetchOrder()
        }
    }, [params.id])

    // Check if order can be cancelled
    const canCancel = useMemo(() => {
        return order && ['pending', 'confirmed'].includes(order.status)
    }, [order])

    // Handle order cancellation
    const handleCancelOrder = useCallback(async () => {
        if (!order || !canCancel) return

        setActionLoading('cancel')
        try {
            const response = await fetch(`/api/orders/${order._id}/cancel`, {
                method: 'POST'
            })

            if (!response.ok) {
                throw new Error('Failed to cancel order')
            }

            // Refresh order data
            const updatedResponse = await fetch(`/api/orders/${params.id}`)
            const updatedData = await updatedResponse.json()
            setOrder(updatedData.order)

            setActionMessage({ type: 'success', text: 'Order cancelled successfully' })
        } catch (err) {
            setActionMessage({ type: 'error', text: err.message })
        } finally {
            setActionLoading(null)
        }
    }, [order, canCancel, params.id])

    // Handle reorder single item
    const handleReorderItem = useCallback(async (item) => {
        try {
            const response = await fetch('/api/cart/add', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    productId: item.productId,
                    quantity: item.quantity,
                    size: item.size,
                    color: item.color
                })
            })

            if (!response.ok) {
                throw new Error('Failed to add item to cart')
            }

            setActionMessage({ type: 'success', text: `${item.name} added to cart` })
        } catch (err) {
            setActionMessage({ type: 'error', text: err.message })
        }
    }, [])

    // Handle reorder all items
    const handleReorderAll = useCallback(async () => {
        setActionLoading('reorder')
        try {
            const response = await fetch(`/api/orders/${order._id}/reorder`, {
                method: 'POST'
            })

            if (!response.ok) {
                throw new Error('Failed to reorder items')
            }

            setActionMessage({ type: 'success', text: 'All items added to cart successfully' })
        } catch (err) {
            setActionMessage({ type: 'error', text: err.message })
        } finally {
            setActionLoading(null)
        }
    }, [order])

    // Clear action messages
    useEffect(() => {
        if (actionMessage) {
            const timer = setTimeout(() => setActionMessage(null), 5000)
            return () => clearTimeout(timer)
        }
    }, [actionMessage])

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <LoadingSpinner size="lg" />
            </div>
        )
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <ExclamationTriangleIcon className="h-12 w-12 text-red-500 mx-auto mb-3" />
                    <h1 className="text-xl font-semibold text-gray-900 mb-2">Order Not Found</h1>
                    <p className="text-gray-600 mb-6">{error}</p>
                    <Link
                        href="/account/orders"
                        className="inline-flex items-center px-6 py-3 bg-black text-white rounded-xl hover:bg-gray-800 transition-colors duration-200"
                    >
                        <ArrowLeftIcon className="h-4 w-4 mr-2" />
                        Back to Orders
                    </Link>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="px-4 sm:px-6 lg:px-12 py-8">
                {/* Header */}
                <div className="mb-8">
                    <Link
                        href="/account/orders"
                        className="inline-flex items-center text-sm font-medium text-gray-600 hover:text-gray-900 mb-4 transition-colors duration-200"
                    >
                        <ArrowLeftIcon className="h-4 w-4 mr-2" />
                        Back to Orders
                    </Link>

                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">
                                Order #{order.orderNumber}
                            </h1>
                            <p className="text-gray-600 mt-1">
                                Placed on {new Date(order.timestamps.orderDate).toLocaleDateString('en-US', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric'
                                })}
                            </p>
                        </div>

                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => window.print()}
                                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                            >
                                <PrinterIcon className="h-4 w-4" />
                                Print
                            </button>

                            <Link
                                href="/support"
                                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                            >
                                <ChatBubbleLeftIcon className="h-4 w-4" />
                                Get Help
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Action Message */}
                {actionMessage && (
                    <div className={`mb-6 p-4 rounded-xl ${actionMessage.type === 'success' ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
                        }`}>
                        <p className={`text-sm font-medium ${actionMessage.type === 'success' ? 'text-green-700' : 'text-red-700'
                            }`}>
                            {actionMessage.text}
                        </p>
                    </div>
                )}

                {/* Main Content */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column - Order Items and Timeline */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Order Items */}
                        <div className="bg-white rounded-xl border border-gray-200 p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-lg font-semibold text-gray-900">
                                    Order Items ({order.items.length})
                                </h2>
                                <button
                                    onClick={handleReorderAll}
                                    disabled={actionLoading === 'reorder'}
                                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-black rounded-lg hover:bg-gray-800 disabled:opacity-50 transition-colors duration-200"
                                >
                                    {actionLoading === 'reorder' ? (
                                        <LoadingSpinner size="sm" className="border-white" />
                                    ) : (
                                        <ArrowPathIcon className="h-4 w-4" />
                                    )}
                                    Reorder All
                                </button>
                            </div>

                            <div className="space-y-4">
                                {order.items.map((item, index) => (
                                    <OrderItem
                                        key={index}
                                        item={item}
                                        onReorderItem={handleReorderItem}
                                    />
                                ))}
                            </div>
                        </div>

                        {/* Order Timeline */}
                        <OrderTimeline order={order} />
                    </div>

                    {/* Right Column - Order Summary and Info */}
                    <div className="space-y-8">
                        {/* Order Summary */}
                        <OrderSummary order={order} />

                        {/* Shipping Information */}
                        <ShippingInfo order={order} />

                        {/* Order Actions */}
                        <div className="bg-white rounded-xl border border-gray-200 p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Actions</h3>

                            <div className="space-y-3">
                                {canCancel && (
                                    <button
                                        onClick={handleCancelOrder}
                                        disabled={actionLoading === 'cancel'}
                                        className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-red-700 bg-white border border-red-300 rounded-lg hover:bg-red-50 disabled:opacity-50 transition-colors duration-200"
                                    >
                                        {actionLoading === 'cancel' ? (
                                            <LoadingSpinner size="sm" className="border-red-600" />
                                        ) : (
                                            <XMarkIcon className="h-4 w-4" />
                                        )}
                                        Cancel Order
                                    </button>
                                )}

                                {order.status === 'delivered' && (
                                    <Link
                                        href={`/orders/${order._id}/return`}
                                        className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                                    >
                                        <ArrowPathIcon className="h-4 w-4" />
                                        Return Items
                                    </Link>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
