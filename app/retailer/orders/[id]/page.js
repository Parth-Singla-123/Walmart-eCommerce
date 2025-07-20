'use client'

import { useState, useEffect, useMemo, useCallback, memo } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useUser } from '@/hooks/useUser'
import {
    ShoppingBagIcon,
    UserIcon,
    MapPinIcon,
    TruckIcon,
    PrinterIcon,
    ArrowLeftIcon,
    CheckCircleIcon,
    ClockIcon,
    XCircleIcon,
    ExclamationTriangleIcon,
    DocumentTextIcon,
    PhoneIcon,
    EnvelopeIcon,
    CreditCardIcon,
} from '@heroicons/react/24/outline'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import Image from 'next/image'

// Memoized Loading Skeleton Component
const LoadingSkeleton = memo(() => (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse space-y-8">
            <div className="h-8 bg-gray-200 rounded w-1/4"></div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                    {[...Array(3)].map((_, i) => (
                        <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
                            <div className="space-y-2">
                                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                            </div>
                        </div>
                    ))}
                </div>
                <div className="space-y-6">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
                        <div className="space-y-2">
                            <div className="h-4 bg-gray-200 rounded"></div>
                            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
))
LoadingSkeleton.displayName = 'LoadingSkeleton'

// Memoized Page Header Component
const PageHeader = memo(({ order, onBack, onPrint, printLoading }) => (
    <div className="mb-8">
        <div className="flex items-center gap-4 mb-4">
            <button
                onClick={onBack}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors duration-200"
            >
                <ArrowLeftIcon className="h-5 w-5" />
            </button>
            <div className="flex-1">
                <h1 className="text-3xl font-bold text-gray-900">Order #{order.id}</h1>
                <p className="text-gray-600 mt-2">Placed on {order.date} by {order.customer.name}</p>
            </div>
            <button
                onClick={onPrint}
                disabled={printLoading}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors duration-200"
            >
                {printLoading ? (
                    <LoadingSpinner size="sm" />
                ) : (
                    <PrinterIcon className="h-4 w-4" />
                )}
                Print Order
            </button>
        </div>
    </div>
))
PageHeader.displayName = 'PageHeader'

// Memoized Success Message Component
const SuccessMessage = memo(({ show, message, onClose }) => {
    useEffect(() => {
        if (show) {
            const timer = setTimeout(onClose, 5000)
            return () => clearTimeout(timer)
        }
    }, [show, onClose])

    if (!show) return null

    return (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 mb-6">
            <div className="flex items-center gap-2">
                <CheckCircleIcon className="h-5 w-5 text-emerald-600" />
                <p className="text-emerald-700 font-medium">{message}</p>
            </div>
        </div>
    )
})
SuccessMessage.displayName = 'SuccessMessage'

// Memoized Status Badge Component
const StatusBadge = memo(({ status, size = 'md' }) => {
    const statusConfig = useMemo(() => {
        const configs = {
            pending: { color: 'bg-yellow-100 text-yellow-800', icon: ClockIcon, text: 'Pending' },
            processing: { color: 'bg-blue-100 text-blue-800', icon: DocumentTextIcon, text: 'Processing' },
            shipped: { color: 'bg-purple-100 text-purple-800', icon: TruckIcon, text: 'Shipped' },
            completed: { color: 'bg-green-100 text-green-800', icon: CheckCircleIcon, text: 'Completed' },
            cancelled: { color: 'bg-red-100 text-red-800', icon: XCircleIcon, text: 'Cancelled' }
        }
        return configs[status] || configs.pending
    }, [status])

    const Icon = statusConfig.icon
    const sizeClasses = size === 'lg' ? 'px-3 py-1.5 text-sm' : 'px-2.5 py-0.5 text-xs'
    const iconSize = size === 'lg' ? 'h-4 w-4' : 'h-3 w-3'

    return (
        <span className={`inline-flex items-center ${sizeClasses} rounded-full font-medium ${statusConfig.color}`}>
            <Icon className={`${iconSize} mr-1`} />
            {statusConfig.text}
        </span>
    )
})
StatusBadge.displayName = 'StatusBadge'

// Memoized Order Status Management Component
const OrderStatusManagement = memo(({ order, onUpdateStatus, onAddTracking, loading }) => {
    const [trackingNumber, setTrackingNumber] = useState(order.trackingNumber || '')
    const [showTrackingInput, setShowTrackingInput] = useState(false)

    const nextStatus = useMemo(() => {
        const statusFlow = {
            pending: 'processing',
            processing: 'shipped',
            shipped: 'completed'
        }
        return statusFlow[order.status]
    }, [order.status])

    const handleAddTracking = useCallback(async () => {
        if (!trackingNumber.trim()) return

        const result = await onAddTracking(trackingNumber)
        if (result.success) {
            setShowTrackingInput(false)
        }
    }, [trackingNumber, onAddTracking])

    const canCancel = useMemo(() => {
        return ['pending', 'processing'].includes(order.status)
    }, [order.status])

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Order Status Management</h3>

            <div className="space-y-6">
                {/* Current Status */}
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                        <p className="text-sm font-medium text-gray-600">Current Status</p>
                        <div className="mt-1">
                            <StatusBadge status={order.status} size="lg" />
                        </div>
                    </div>
                    <div className="text-right">
                        <p className="text-sm text-gray-500">Last updated</p>
                        <p className="text-sm font-medium text-gray-900">{order.lastUpdated}</p>
                    </div>
                </div>

                {/* Tracking Number */}
                {(order.status === 'shipped' || order.trackingNumber) && (
                    <div className="space-y-3">
                        <p className="text-sm font-medium text-gray-700">Tracking Information</p>
                        {order.trackingNumber ? (
                            <div className="p-4 bg-blue-50 rounded-lg">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-blue-600 font-medium">Tracking Number</p>
                                        <p className="text-lg font-mono font-semibold text-blue-900">{order.trackingNumber}</p>
                                    </div>
                                    <TruckIcon className="h-8 w-8 text-blue-600" />
                                </div>
                            </div>
                        ) : showTrackingInput ? (
                            <div className="space-y-3">
                                <input
                                    type="text"
                                    value={trackingNumber}
                                    onChange={(e) => setTrackingNumber(e.target.value)}
                                    placeholder="Enter tracking number"
                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-black focus:border-black transition-all duration-200"
                                />
                                <div className="flex gap-3">
                                    <button
                                        onClick={handleAddTracking}
                                        disabled={loading || !trackingNumber.trim()}
                                        className="flex-1 px-4 py-2 text-sm font-medium text-white bg-black rounded-lg hover:bg-gray-800 disabled:opacity-50 transition-colors duration-200"
                                    >
                                        Add Tracking
                                    </button>
                                    <button
                                        onClick={() => setShowTrackingInput(false)}
                                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors duration-200"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <button
                                onClick={() => setShowTrackingInput(true)}
                                className="w-full p-4 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-gray-400 hover:text-gray-700 transition-colors duration-200"
                            >
                                + Add Tracking Number
                            </button>
                        )}
                    </div>
                )}

                {/* Action Buttons */}
                <div className="space-y-3">
                    {nextStatus && (
                        <button
                            onClick={() => onUpdateStatus(nextStatus)}
                            disabled={loading}
                            className="w-full flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium text-white bg-blue-600 rounded-xl hover:bg-blue-700 disabled:opacity-50 transition-colors duration-200"
                        >
                            {loading ? (
                                <LoadingSpinner size="sm" className="border-white" />
                            ) : (
                                <CheckCircleIcon className="h-4 w-4" />
                            )}
                            Mark as {nextStatus.charAt(0).toUpperCase() + nextStatus.slice(1)}
                        </button>
                    )}

                    {canCancel && (
                        <button
                            onClick={() => onUpdateStatus('cancelled')}
                            disabled={loading}
                            className="w-full flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium text-red-700 bg-red-50 border border-red-200 rounded-xl hover:bg-red-100 disabled:opacity-50 transition-colors duration-200"
                        >
                            {loading ? (
                                <LoadingSpinner size="sm" className="border-red-600" />
                            ) : (
                                <XCircleIcon className="h-4 w-4" />
                            )}
                            Cancel Order
                        </button>
                    )}
                </div>
            </div>
        </div>
    )
})
OrderStatusManagement.displayName = 'OrderStatusManagement'

// Memoized Order Timeline Component
const OrderTimeline = memo(({ timeline }) => {
    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Order Timeline</h3>

            <div className="space-y-4">
                {timeline.map((event, index) => (
                    <div key={index} className="flex items-start gap-4">
                        <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${event.completed ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'
                            }`}>
                            <event.icon className="h-4 w-4" />
                        </div>

                        <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                                <p className={`text-sm font-medium ${event.completed ? 'text-gray-900' : 'text-gray-500'
                                    }`}>
                                    {event.title}
                                </p>
                                {event.timestamp && (
                                    <span className="text-xs text-gray-500">{event.timestamp}</span>
                                )}
                            </div>
                            {event.description && (
                                <p className="text-sm text-gray-600 mt-1">{event.description}</p>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
})
OrderTimeline.displayName = 'OrderTimeline'

// Memoized Customer Information Component
const CustomerInformation = memo(({ customer, shippingAddress }) => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Customer Information</h3>

        <div className="space-y-6">
            {/* Customer Details */}
            <div>
                <h4 className="text-sm font-medium text-gray-600 mb-3">Contact Details</h4>
                <div className="space-y-3">
                    <div className="flex items-center gap-3">
                        <UserIcon className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-900">{customer.name}</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <EnvelopeIcon className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-900">{customer.email}</span>
                    </div>
                    {customer.phone && (
                        <div className="flex items-center gap-3">
                            <PhoneIcon className="h-4 w-4 text-gray-400" />
                            <span className="text-sm text-gray-900">{customer.phone}</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Shipping Address */}
            <div>
                <h4 className="text-sm font-medium text-gray-600 mb-3">Shipping Address</h4>
                <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-start gap-3">
                        <MapPinIcon className="h-4 w-4 text-gray-400 mt-0.5" />
                        <div className="text-sm text-gray-900 leading-relaxed">
                            <p className="font-medium">{shippingAddress.name}</p>
                            <p>{shippingAddress.street}</p>
                            <p>{shippingAddress.city}, {shippingAddress.state} {shippingAddress.zipCode}</p>
                            {shippingAddress.phone && <p>Phone: {shippingAddress.phone}</p>}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
))
CustomerInformation.displayName = 'CustomerInformation'

// Memoized Order Items Component
const OrderItems = memo(({ items, orderTotal, paymentInfo }) => {
    const subtotal = useMemo(() => {
        return items.reduce((sum, item) => sum + (item.price * item.quantity), 0)
    }, [items])

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Order Items</h3>

            <div className="space-y-4">
                {items.map((item, index) => (
                    <div key={index} className="flex items-start gap-4 p-4 border border-gray-200 rounded-lg">
                        {/* Product Image */}
                        <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                            {item.image ? (
                                <Image
                                    src={item.image}
                                    alt={item.name}
                                    className="w-full h-full object-cover rounded-lg"
                                />
                            ) : (
                                <ShoppingBagIcon className="h-8 w-8 text-gray-400" />
                            )}
                        </div>

                        {/* Product Details */}
                        <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-medium text-gray-900">{item.name}</h4>
                            {item.sku && (
                                <p className="text-xs text-gray-500 mt-1">SKU: {item.sku}</p>
                            )}
                            {item.variant && (
                                <p className="text-xs text-gray-600 mt-1">{item.variant}</p>
                            )}
                        </div>

                        {/* Quantity and Price */}
                        <div className="text-right">
                            <p className="text-sm font-medium text-gray-900">₹{item.price.toLocaleString()}</p>
                            <p className="text-xs text-gray-500 mt-1">Qty: {item.quantity}</p>
                            <p className="text-sm font-semibold text-gray-900 mt-1">
                                ₹{(item.price * item.quantity).toLocaleString()}
                            </p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Order Summary */}
            <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Subtotal</span>
                        <span className="text-gray-900">₹{subtotal.toLocaleString()}</span>
                    </div>
                    {paymentInfo.shipping && (
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Shipping</span>
                            <span className="text-gray-900">₹{paymentInfo.shipping.toLocaleString()}</span>
                        </div>
                    )}
                    {paymentInfo.tax && (
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Tax</span>
                            <span className="text-gray-900">₹{paymentInfo.tax.toLocaleString()}</span>
                        </div>
                    )}
                    {paymentInfo.discount && (
                        <div className="flex justify-between text-sm">
                            <span className="text-green-600">Discount</span>
                            <span className="text-green-600">-₹{paymentInfo.discount.toLocaleString()}</span>
                        </div>
                    )}
                    <div className="flex justify-between text-lg font-semibold pt-3 border-t border-gray-200">
                        <span className="text-gray-900">Total</span>
                        <span className="text-gray-900">₹{orderTotal.toLocaleString()}</span>
                    </div>
                </div>

                {/* Payment Information */}
                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                        <CreditCardIcon className="h-4 w-4 text-gray-400" />
                        <span className="text-sm font-medium text-gray-700">Payment Information</span>
                    </div>
                    <div className="text-sm text-gray-600">
                        <p>Method: {paymentInfo.method}</p>
                        <p>Status: <span className="font-medium text-green-600">{paymentInfo.status}</span></p>
                        {paymentInfo.transactionId && (
                            <p>Transaction ID: {paymentInfo.transactionId}</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
})
OrderItems.displayName = 'OrderItems'

// Main Order Details Page Component
export default function OrderDetailsPage() {
    const { user, loading } = useUser()
    const router = useRouter()
    const params = useParams()
    const orderId = params.id

    const [order, setOrder] = useState(null)
    const [isLoading, setIsLoading] = useState(true)
    const [actionLoading, setActionLoading] = useState(false)
    const [printLoading, setPrintLoading] = useState(false)
    const [success, setSuccess] = useState({ show: false, message: '' })

    // Memoized fetch order function
    const fetchOrder = useCallback(async () => {
        if (!user || !orderId) return

        try {
            setIsLoading(true)
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1000))

            // Mock order data - replace with actual API call
            const mockOrder = {
                id: orderId,
                date: 'January 15, 2025',
                lastUpdated: '2 hours ago',
                status: 'processing',
                trackingNumber: null,
                customer: {
                    name: 'John Doe',
                    email: 'john.doe@example.com',
                    phone: '+91 98765 43210'
                },
                shippingAddress: {
                    name: 'John Doe',
                    street: '123 MG Road, Koramangala',
                    city: 'Bangalore',
                    state: 'Karnataka',
                    zipCode: '560034',
                    phone: '+91 98765 43210'
                },
                items: [
                    {
                        name: 'Wireless Bluetooth Headphones',
                        sku: 'WBH-001',
                        price: 2999,
                        quantity: 1,
                        variant: 'Black, Over-ear',
                        image: null
                    },
                    {
                        name: 'Phone Case',
                        sku: 'PC-002',
                        price: 799,
                        quantity: 2,
                        variant: 'Clear, iPhone 14',
                        image: null
                    }
                ],
                total: 4597,
                paymentInfo: {
                    method: 'Credit Card',
                    status: 'Paid',
                    transactionId: 'TXN123456789',
                    subtotal: 4597,
                    shipping: 0,
                    tax: 0,
                    discount: 0
                },
                timeline: [
                    {
                        title: 'Order Placed',
                        description: 'Order was successfully placed',
                        timestamp: 'Jan 15, 2025 10:30 AM',
                        completed: true,
                        icon: CheckCircleIcon
                    },
                    {
                        title: 'Payment Confirmed',
                        description: 'Payment was processed successfully',
                        timestamp: 'Jan 15, 2025 10:31 AM',
                        completed: true,
                        icon: CreditCardIcon
                    },
                    {
                        title: 'Processing',
                        description: 'Order is being prepared for shipment',
                        timestamp: 'Jan 15, 2025 11:00 AM',
                        completed: true,
                        icon: DocumentTextIcon
                    },
                    {
                        title: 'Shipped',
                        description: 'Order has been shipped',
                        timestamp: null,
                        completed: false,
                        icon: TruckIcon
                    },
                    {
                        title: 'Delivered',
                        description: 'Order delivered successfully',
                        timestamp: null,
                        completed: false,
                        icon: CheckCircleIcon
                    }
                ]
            }

            setOrder(mockOrder)
        } catch (error) {
            console.error('Error fetching order:', error)
        } finally {
            setIsLoading(false)
        }
    }, [user?._id, orderId])

    // Memoized navigation handlers
    const handleBack = useCallback(() => {
        router.push('/retailer/orders')
    }, [router])

    const handlePrint = useCallback(async () => {
        setPrintLoading(true)
        try {
            // Simulate print functionality
            await new Promise(resolve => setTimeout(resolve, 1000))
            console.log('Printing order:', orderId)

            setSuccess({ show: true, message: 'Order printed successfully!' })
        } catch (error) {
            console.error('Error printing order:', error)
        } finally {
            setPrintLoading(false)
        }
    }, [orderId])

    const handleUpdateStatus = useCallback(async (newStatus) => {
        if (newStatus === 'cancelled' && !window.confirm('Are you sure you want to cancel this order?')) {
            return
        }

        setActionLoading(true)
        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1500))

            // Update order status
            setOrder(prev => ({
                ...prev,
                status: newStatus,
                lastUpdated: 'Just now'
            }))

            setSuccess({
                show: true,
                message: `Order status updated to ${newStatus}!`
            })
        } catch (error) {
            console.error('Error updating order status:', error)
        } finally {
            setActionLoading(false)
        }
    }, [])

    const handleAddTracking = useCallback(async (trackingNumber) => {
        setActionLoading(true)
        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1000))

            // Update order with tracking number
            setOrder(prev => ({
                ...prev,
                trackingNumber,
                lastUpdated: 'Just now'
            }))

            setSuccess({
                show: true,
                message: 'Tracking number added successfully!'
            })

            return { success: true }
        } catch (error) {
            console.error('Error adding tracking number:', error)
            return { success: false, error: 'Failed to add tracking number' }
        } finally {
            setActionLoading(false)
        }
    }, [])

    const handleCloseSuccess = useCallback(() => {
        setSuccess({ show: false, message: '' })
    }, [])

    // Effect to fetch order when user/orderId changes
    useEffect(() => {
        fetchOrder()
    }, [fetchOrder])

    if (loading || isLoading) {
        return <LoadingSkeleton />
    }

    if (!order) {
        return (
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="text-center py-16">
                    <ExclamationTriangleIcon className="h-12 w-12 text-red-500 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Order not found</h3>
                    <p className="text-gray-500 mb-8">The order you&apos;re looking for doesn&apos;t exist or has been deleted.</p>
                    <button
                        onClick={handleBack}
                        className="px-6 py-3 bg-black text-white rounded-xl hover:bg-gray-800 transition-colors duration-200"
                    >
                        Back to Orders
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <PageHeader
                order={order}
                onBack={handleBack}
                onPrint={handlePrint}
                printLoading={printLoading}
            />

            <SuccessMessage
                show={success.show}
                message={success.message}
                onClose={handleCloseSuccess}
            />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column - Order Details */}
                <div className="lg:col-span-2 space-y-8">
                    <OrderItems
                        items={order.items}
                        orderTotal={order.total}
                        paymentInfo={order.paymentInfo}
                    />

                    <OrderTimeline timeline={order.timeline} />
                </div>

                {/* Right Column - Status & Customer Info */}
                <div className="space-y-8">
                    <OrderStatusManagement
                        order={order}
                        onUpdateStatus={handleUpdateStatus}
                        onAddTracking={handleAddTracking}
                        loading={actionLoading}
                    />

                    <CustomerInformation
                        customer={order.customer}
                        shippingAddress={order.shippingAddress}
                    />
                </div>
            </div>
        </div>
    )
}
