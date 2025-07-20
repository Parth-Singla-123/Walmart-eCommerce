'use client'

import { useState, useEffect, useMemo, useCallback, memo } from 'react'
import Link from 'next/link'
import { useUser } from '@/hooks/useUser'
import {
    ShoppingBagIcon,
    MagnifyingGlassIcon,
    EyeIcon,
    ClockIcon,
    CheckCircleIcon,
    XCircleIcon,
    TruckIcon,
    DocumentTextIcon,
    CalendarIcon,
    UserIcon,
    BanknotesIcon,
    FunnelIcon,
    ArrowTopRightOnSquareIcon,
    PrinterIcon
} from '@heroicons/react/24/outline'
import LoadingSpinner from '@/components/ui/LoadingSpinner'

// Memoized Loading Skeleton Component
const LoadingSkeleton = memo(() => (
    <div className="space-y-6">
        <div className="animate-pulse">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                {[...Array(4)].map((_, i) => (
                    <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                        <div className="h-8 bg-gray-200 rounded w-1/2"></div>
                    </div>
                ))}
            </div>
            <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                    <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
                        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                    </div>
                ))}
            </div>
        </div>
    </div>
))
LoadingSkeleton.displayName = 'LoadingSkeleton'

// Memoized Page Header Component
const PageHeader = memo(() => (
    <div className="mb-8">
        <div className="flex items-center justify-between">
            <div>
                <h1 className="text-3xl font-bold text-gray-900">Orders Management</h1>
                <p className="text-gray-600 mt-2">View and manage your customer orders</p>
            </div>
            <div className="flex items-center gap-3">
                <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors duration-200">
                    <PrinterIcon className="h-4 w-4" />
                    Export Orders
                </button>
            </div>
        </div>
    </div>
))
PageHeader.displayName = 'PageHeader'

// Memoized Stat Card Component
const StatCard = memo(({ title, value, icon: Icon, color = 'blue', subtitle }) => {
    const colorClasses = useMemo(() => {
        const colorMap = {
            blue: { bg: 'bg-blue-50', text: 'text-blue-600' },
            green: { bg: 'bg-green-50', text: 'text-green-600' },
            yellow: { bg: 'bg-yellow-50', text: 'text-yellow-600' },
            purple: { bg: 'bg-purple-50', text: 'text-purple-600' }
        }
        return colorMap[color] || colorMap.blue
    }, [color])

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm font-medium text-gray-600">{title}</p>
                    <p className="text-2xl font-semibold text-gray-900 mt-1">{value}</p>
                    {subtitle && (
                        <p className="text-xs text-gray-500 mt-1">{subtitle}</p>
                    )}
                </div>
                <div className={`p-3 rounded-xl ${colorClasses.bg}`}>
                    <Icon className={`h-6 w-6 ${colorClasses.text}`} />
                </div>
            </div>
        </div>
    )
})
StatCard.displayName = 'StatCard'

// Memoized Stats Grid Component
const StatsGrid = memo(({ stats }) => {
    const statCards = useMemo(() => [
        { 
            title: "Total Orders", 
            value: stats.total, 
            icon: ShoppingBagIcon, 
            color: "blue",
            subtitle: "All time"
        },
        { 
            title: "Pending Orders", 
            value: stats.pending, 
            icon: ClockIcon, 
            color: "yellow",
            subtitle: "Awaiting processing"
        },
        { 
            title: "Completed Orders", 
            value: stats.completed, 
            icon: CheckCircleIcon, 
            color: "green",
            subtitle: "Successfully delivered"
        },
        { 
            title: "Total Revenue", 
            value: `₹${stats.revenue.toLocaleString()}`, 
            icon: BanknotesIcon, 
            color: "purple",
            subtitle: "From all orders"
        }
    ], [stats])

    return (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            {statCards.map((card, index) => (
                <StatCard key={index} {...card} />
            ))}
        </div>
    )
})
StatsGrid.displayName = 'StatsGrid'

// Memoized Search and Filter Bar Component
const SearchAndFilterBar = memo(({ 
    searchTerm, 
    onSearchChange, 
    selectedStatus, 
    onStatusChange,
    dateRange,
    onDateRangeChange,
    sortBy,
    onSortChange
}) => {
    const statusOptions = useMemo(() => [
        { value: 'all', label: 'All Orders' },
        { value: 'pending', label: 'Pending' },
        { value: 'processing', label: 'Processing' },
        { value: 'shipped', label: 'Shipped' },
        { value: 'completed', label: 'Completed' },
        { value: 'cancelled', label: 'Cancelled' }
    ], [])

    const sortOptions = useMemo(() => [
        { value: 'newest', label: 'Newest First' },
        { value: 'oldest', label: 'Oldest First' },
        { value: 'amount_high', label: 'Amount: High to Low' },
        { value: 'amount_low', label: 'Amount: Low to High' }
    ], [])

    const dateRangeOptions = useMemo(() => [
        { value: 'all', label: 'All Time' },
        { value: 'today', label: 'Today' },
        { value: 'week', label: 'This Week' },
        { value: 'month', label: 'This Month' },
        { value: 'quarter', label: 'This Quarter' }
    ], [])

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
            <div className="flex flex-col lg:flex-row gap-4">
                {/* Search */}
                <div className="relative flex-1">
                    <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search by order ID or customer name..."
                        value={searchTerm}
                        onChange={(e) => onSearchChange(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-black focus:border-black transition-all duration-200"
                    />
                </div>

                {/* Filters */}
                <div className="flex flex-wrap gap-4">
                    {/* Status Filter */}
                    <select
                        value={selectedStatus}
                        onChange={(e) => onStatusChange(e.target.value)}
                        className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-black focus:border-black transition-all duration-200"
                    >
                        {statusOptions.map(status => (
                            <option key={status.value} value={status.value}>
                                {status.label}
                            </option>
                        ))}
                    </select>

                    {/* Date Range Filter */}
                    <select
                        value={dateRange}
                        onChange={(e) => onDateRangeChange(e.target.value)}
                        className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-black focus:border-black transition-all duration-200"
                    >
                        {dateRangeOptions.map(range => (
                            <option key={range.value} value={range.value}>
                                {range.label}
                            </option>
                        ))}
                    </select>

                    {/* Sort */}
                    <select
                        value={sortBy}
                        onChange={(e) => onSortChange(e.target.value)}
                        className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-black focus:border-black transition-all duration-200"
                    >
                        {sortOptions.map(option => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                </div>
            </div>
        </div>
    )
})
SearchAndFilterBar.displayName = 'SearchAndFilterBar'

// Memoized Status Badge Component
const StatusBadge = memo(({ status }) => {
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

    return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusConfig.color}`}>
            <Icon className="h-3 w-3 mr-1" />
            {statusConfig.text}
        </span>
    )
})
StatusBadge.displayName = 'StatusBadge'

// Memoized Order Item Component
const OrderItem = memo(({ order, onViewOrder, onUpdateStatus, onPrint }) => {
    const [actionLoading, setActionLoading] = useState(null)

    const handleAction = useCallback(async (action, actionFn) => {
        setActionLoading(action)
        await actionFn()
        setActionLoading(null)
    }, [])

    const itemsText = useMemo(() => {
        const count = order.items.length
        return count === 1 ? '1 item' : `${count} items`
    }, [order.items.length])

    const nextStatus = useMemo(() => {
        const statusFlow = {
            pending: 'processing',
            processing: 'shipped',
            shipped: 'completed'
        }
        return statusFlow[order.status]
    }, [order.status])

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all duration-200 group">
            <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">#{order.id}</h3>
                        <StatusBadge status={order.status} />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                            <UserIcon className="h-4 w-4" />
                            <span>{order.customer.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <CalendarIcon className="h-4 w-4" />
                            <span>{order.date}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <ShoppingBagIcon className="h-4 w-4" />
                            <span>{itemsText}</span>
                        </div>
                    </div>
                </div>

                <div className="text-right">
                    <p className="text-xl font-bold text-gray-900">₹{order.total.toLocaleString()}</p>
                    <p className="text-sm text-gray-500">{order.paymentStatus}</p>
                </div>
            </div>

            {/* Order Items Preview */}
            <div className="mb-4">
                <div className="flex items-center gap-3">
                    {order.items.slice(0, 3).map((item, index) => (
                        <div key={index} className="flex items-center gap-2 text-sm text-gray-600">
                            <div className="w-8 h-8 bg-gray-100 rounded flex items-center justify-center">
                                {item.image ? (
                                    <img src={item.image} alt={item.name} className="w-full h-full object-cover rounded" />
                                ) : (
                                    <ShoppingBagIcon className="h-4 w-4" />
                                )}
                            </div>
                            <span className="truncate max-w-[100px]">{item.name}</span>
                            <span className="text-gray-400">×{item.quantity}</span>
                        </div>
                    ))}
                    {order.items.length > 3 && (
                        <span className="text-sm text-gray-500">+{order.items.length - 3} more</span>
                    )}
                </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3 pt-4 border-t border-gray-100 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <button
                    onClick={() => onViewOrder(order.id)}
                    className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors duration-200"
                >
                    <EyeIcon className="h-4 w-4" />
                    View Details
                </button>

                {nextStatus && (
                    <button
                        onClick={() => handleAction('status', () => onUpdateStatus(order.id, nextStatus))}
                        disabled={actionLoading === 'status'}
                        className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-blue-700 bg-blue-100 rounded-lg hover:bg-blue-200 transition-colors duration-200"
                    >
                        {actionLoading === 'status' ? (
                            <LoadingSpinner size="sm" className="border-blue-600" />
                        ) : (
                            <ArrowTopRightOnSquareIcon className="h-4 w-4" />
                        )}
                        Mark as {nextStatus}
                    </button>
                )}

                <button
                    onClick={() => handleAction('print', () => onPrint(order.id))}
                    disabled={actionLoading === 'print'}
                    className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors duration-200"
                >
                    {actionLoading === 'print' ? (
                        <LoadingSpinner size="sm" />
                    ) : (
                        <PrinterIcon className="h-4 w-4" />
                    )}
                    Print
                </button>
            </div>
        </div>
    )
})
OrderItem.displayName = 'OrderItem'

// Memoized Orders List Component
const OrdersList = memo(({ orders, onViewOrder, onUpdateStatus, onPrint }) => {
    if (orders.length === 0) {
        return (
            <div className="text-center py-16">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <ShoppingBagIcon className="h-10 w-10 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No orders found</h3>
                <p className="text-gray-500 mb-8 max-w-md mx-auto">
                    No orders match your current search and filter criteria
                </p>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {orders.map((order) => (
                <OrderItem
                    key={order.id}
                    order={order}
                    onViewOrder={onViewOrder}
                    onUpdateStatus={onUpdateStatus}
                    onPrint={onPrint}
                />
            ))}
        </div>
    )
})
OrdersList.displayName = 'OrdersList'

// Main Orders Page Component
export default function OrdersPage() {
    const { user, loading } = useUser()
    const [orders, setOrders] = useState([])
    const [isLoading, setIsLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')
    const [selectedStatus, setSelectedStatus] = useState('all')
    const [dateRange, setDateRange] = useState('all')
    const [sortBy, setSortBy] = useState('newest')

    // Memoized stats calculation
    const stats = useMemo(() => {
        const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0)
        return {
            total: orders.length,
            pending: orders.filter(o => o.status === 'pending').length,
            completed: orders.filter(o => o.status === 'completed').length,
            revenue: totalRevenue
        }
    }, [orders])

    // Memoized filtered orders
    const filteredOrders = useMemo(() => {
        let filtered = orders

        // Search filter
        if (searchTerm) {
            filtered = filtered.filter(order =>
                order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                order.customer.name.toLowerCase().includes(searchTerm.toLowerCase())
            )
        }

        // Status filter
        if (selectedStatus !== 'all') {
            filtered = filtered.filter(order => order.status === selectedStatus)
        }

        // Date range filter (simplified for demo)
        if (dateRange !== 'all') {
            // Add date filtering logic here
        }

        // Sort
        filtered = [...filtered].sort((a, b) => {
            switch (sortBy) {
                case 'oldest':
                    return new Date(a.date) - new Date(b.date)
                case 'amount_high':
                    return b.total - a.total
                case 'amount_low':
                    return a.total - b.total
                default: // newest
                    return new Date(b.date) - new Date(a.date)
            }
        })

        return filtered
    }, [orders, searchTerm, selectedStatus, dateRange, sortBy])

    // Memoized fetch function
    const fetchOrders = useCallback(async () => {
        if (!user) return
        
        try {
            setIsLoading(true)
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1000))
            
            // Mock data - replace with actual API calls
            const mockOrders = [
                {
                    id: 'ORD-001',
                    customer: { name: 'John Doe', email: 'john@example.com' },
                    date: '2025-01-15',
                    status: 'pending',
                    paymentStatus: 'Paid',
                    total: 2999,
                    items: [
                        { name: 'Wireless Headphones', quantity: 1, price: 2999, image: null }
                    ]
                },
                {
                    id: 'ORD-002',
                    customer: { name: 'Jane Smith', email: 'jane@example.com' },
                    date: '2025-01-14',
                    status: 'processing',
                    paymentStatus: 'Paid',
                    total: 10598,
                    items: [
                        { name: 'Smart Watch', quantity: 1, price: 8999, image: null },
                        { name: 'Phone Case', quantity: 2, price: 799, image: null }
                    ]
                },
                {
                    id: 'ORD-003',
                    customer: { name: 'Mike Johnson', email: 'mike@example.com' },
                    date: '2025-01-13',
                    status: 'shipped',
                    paymentStatus: 'Paid',
                    total: 4999,
                    items: [
                        { name: 'Gaming Keyboard', quantity: 1, price: 4999, image: null }
                    ]
                },
                {
                    id: 'ORD-004',
                    customer: { name: 'Sarah Wilson', email: 'sarah@example.com' },
                    date: '2025-01-12',
                    status: 'completed',
                    paymentStatus: 'Paid',
                    total: 1598,
                    items: [
                        { name: 'Cotton T-Shirt', quantity: 2, price: 599, image: null },
                        { name: 'Phone Charger', quantity: 1, price: 399, image: null }
                    ]
                }
            ]
            
            setOrders(mockOrders)
        } catch (error) {
            console.error('Error fetching orders:', error)
        } finally {
            setIsLoading(false)
        }
    }, [user])

    // Memoized event handlers
    const handleViewOrder = useCallback((orderId) => {
        // Navigate to order details page
        window.location.href = `/retailer/orders/${orderId}`
    }, [])

    const handleUpdateStatus = useCallback(async (orderId, newStatus) => {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 500))
        
        setOrders(prev => prev.map(order =>
            order.id === orderId
                ? { ...order, status: newStatus }
                : order
        ))
    }, [])

    const handlePrint = useCallback(async (orderId) => {
        // Simulate print functionality
        await new Promise(resolve => setTimeout(resolve, 500))
        console.log('Printing order:', orderId)
    }, [])

    // Effect to fetch orders when user changes
    useEffect(() => {
        fetchOrders()
    }, [fetchOrders])

    if (loading || isLoading) {
        return (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <LoadingSkeleton />
            </div>
        )
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <PageHeader />
            
            <StatsGrid stats={stats} />
            
            <SearchAndFilterBar
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                selectedStatus={selectedStatus}
                onStatusChange={setSelectedStatus}
                dateRange={dateRange}
                onDateRangeChange={setDateRange}
                sortBy={sortBy}
                onSortChange={setSortBy}
            />
            
            <OrdersList
                orders={filteredOrders}
                onViewOrder={handleViewOrder}
                onUpdateStatus={handleUpdateStatus}
                onPrint={handlePrint}
            />
        </div>
    )
}
