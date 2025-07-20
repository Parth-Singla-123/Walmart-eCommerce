'use client'

import { useState, useEffect, useMemo, useCallback, memo } from 'react'
import Link from 'next/link'
import { useUser } from '@/hooks/useUser'
import {
    ChartBarIcon,
    CubeIcon,
    ShoppingBagIcon,
    EyeIcon,
    PlusIcon,
    ArrowTrendingUpIcon,
    ArrowTrendingDownIcon,
    ClockIcon,
    CheckCircleIcon,
    XCircleIcon,
    ExclamationTriangleIcon,
    ArrowRightIcon,
    DocumentTextIcon,
    BanknotesIcon
} from '@heroicons/react/24/outline'
import LoadingSpinner from '@/components/ui/LoadingSpinner'

// Memoized Loading Skeleton Component
const LoadingSkeleton = memo(() => (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {[...Array(8)].map((_, i) => (
                    <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                        <div className="h-8 bg-gray-200 rounded w-1/2"></div>
                    </div>
                ))}
            </div>
        </div>
    </div>
))
LoadingSkeleton.displayName = 'LoadingSkeleton'

// Memoized Page Header Component
const PageHeader = memo(({ userName }) => (
    <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Retailer Dashboard</h1>
        <p className="text-gray-600 mt-2">
            Welcome back, {userName || 'Retailer'}! Here&apos;s your store overview.
        </p>
    </div>
))
PageHeader.displayName = 'PageHeader'

// Memoized Alert Component
const Alert = memo(({ alert, onAction }) => {
    const alertColors = {
        warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
        error: 'bg-red-50 border-red-200 text-red-800',
        info: 'bg-blue-50 border-blue-200 text-blue-800',
        success: 'bg-green-50 border-green-200 text-green-800'
    }

    const getAlertIcon = (type) => {
        switch (type) {
            case 'warning': return ExclamationTriangleIcon
            case 'error': return XCircleIcon
            case 'success': return CheckCircleIcon
            default: return DocumentTextIcon
        }
    }

    const Icon = getAlertIcon(alert.type)

    return (
        <div className={`p-4 rounded-xl border ${alertColors[alert.type] || alertColors.info}`}>
            <div className="flex items-center justify-between">
                <div className="flex items-center">
                    <Icon className="h-5 w-5 mr-3" />
                    <span className="text-sm font-medium">{alert.message}</span>
                </div>
                <button 
                    onClick={() => onAction(alert.action)}
                    className="text-sm font-medium hover:underline"
                >
                    {alert.action}
                </button>
            </div>
        </div>
    )
})
Alert.displayName = 'Alert'

// Memoized Alerts Section Component
const AlertsSection = memo(({ alerts, onAlertAction }) => {
    if (!alerts.length) return null

    return (
        <div className="mb-8 space-y-4">
            {alerts.map((alert, index) => (
                <Alert key={index} alert={alert} onAction={onAlertAction} />
            ))}
        </div>
    )
})
AlertsSection.displayName = 'AlertsSection'

// Memoized Stat Card Component
const StatCard = memo(({ title, value, change, icon: Icon, color = 'blue', format = 'number' }) => {
    const colorClasses = useMemo(() => {
        const colorMap = {
            blue: { bg: 'bg-blue-50', text: 'text-blue-600' },
            green: { bg: 'bg-green-50', text: 'text-green-600' },
            purple: { bg: 'bg-purple-50', text: 'text-purple-600' },
            yellow: { bg: 'bg-yellow-50', text: 'text-yellow-600' },
            indigo: { bg: 'bg-indigo-50', text: 'text-indigo-600' },
            red: { bg: 'bg-red-50', text: 'text-red-600' }
        }
        return colorMap[color] || colorMap.blue
    }, [color])
    
    const formattedValue = useMemo(() => {
        if (format === 'currency') return `₹${value.toLocaleString()}`
        if (format === 'percentage') return `${value}%`
        return value.toLocaleString()
    }, [value, format])

    const changeColor = useMemo(() => {
        return change > 0 ? 'text-green-600' : change < 0 ? 'text-red-600' : 'text-gray-500'
    }, [change])

    const ChangeIcon = useMemo(() => {
        return change > 0 ? ArrowTrendingUpIcon : change < 0 ? ArrowTrendingDownIcon : null
    }, [change])

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm font-medium text-gray-600">{title}</p>
                    <p className="text-2xl font-semibold text-gray-900 mt-1">{formattedValue}</p>
                    {change !== undefined && (
                        <div className={`flex items-center mt-2 ${changeColor}`}>
                            {ChangeIcon && <ChangeIcon className="h-4 w-4 mr-1" />}
                            <span className="text-sm font-medium">
                                {change > 0 ? '+' : ''}{change}% from last month
                            </span>
                        </div>
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
        { title: "Total Products", value: stats.totalProducts, change: 8.2, icon: CubeIcon, color: "blue" },
        { title: "Active Products", value: stats.activeProducts, change: 5.1, icon: CheckCircleIcon, color: "green" },
        { title: "Total Orders", value: stats.totalOrders, change: 12.5, icon: ShoppingBagIcon, color: "purple" },
        { title: "Pending Orders", value: stats.pendingOrders, change: -2.3, icon: ClockIcon, color: "yellow" },
        { title: "Total Revenue", value: stats.totalRevenue, change: 15.3, icon: BanknotesIcon, color: "green", format: "currency" },
        { title: "Monthly Revenue", value: stats.monthlyRevenue, change: 23.1, icon: ArrowTrendingUpIcon, color: "green", format: "currency" },
        { title: "Product Views", value: stats.totalViews, change: 18.7, icon: EyeIcon, color: "blue" },
        { title: "Conversion Rate", value: stats.conversionRate, change: 0.8, icon: ChartBarIcon, color: "purple", format: "percentage" }
    ], [stats])

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {statCards.map((card, index) => (
                <StatCard key={index} {...card} />
            ))}
        </div>
    )
})
StatsGrid.displayName = 'StatsGrid'

// Memoized Quick Action Card Component
const QuickActionCard = memo(({ title, description, href, icon: Icon, color = 'blue' }) => {
    const colorClasses = useMemo(() => {
        const colorMap = {
            blue: { bg: 'bg-blue-50', text: 'text-blue-600', hover: 'hover:bg-blue-100' },
            green: { bg: 'bg-green-50', text: 'text-green-600', hover: 'hover:bg-green-100' },
            purple: { bg: 'bg-purple-50', text: 'text-purple-600', hover: 'hover:bg-purple-100' },
            indigo: { bg: 'bg-indigo-50', text: 'text-indigo-600', hover: 'hover:bg-indigo-100' }
        }
        return colorMap[color] || colorMap.blue
    }, [color])

    return (
        <Link href={href} className="block group">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all duration-200 group-hover:border-gray-300">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <div className={`p-3 rounded-xl ${colorClasses.bg} ${colorClasses.hover} transition-colors duration-200`}>
                            <Icon className={`h-6 w-6 ${colorClasses.text}`} />
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 group-hover:text-black">{title}</h3>
                            <p className="text-sm text-gray-600 mt-1">{description}</p>
                        </div>
                    </div>
                    <ArrowRightIcon className="h-5 w-5 text-gray-400 group-hover:text-gray-600 transition-colors duration-200" />
                </div>
            </div>
        </Link>
    )
})
QuickActionCard.displayName = 'QuickActionCard'

// Memoized Quick Actions Section Component
const QuickActionsSection = memo(() => {
    const quickActions = useMemo(() => [
        { title: "Add New Product", description: "Create and list a new product", href: "/retailer/products/add", icon: PlusIcon, color: "blue" },
        { title: "Manage Products", description: "Edit, update, or remove products", href: "/retailer/products", icon: CubeIcon, color: "purple" },
        { title: "View Orders", description: "Check and manage customer orders", href: "/retailer/orders", icon: ShoppingBagIcon, color: "green" },
        { title: "Analytics", description: "View detailed sales analytics", href: "/retailer/analytics", icon: ChartBarIcon, color: "indigo" }
    ], [])

    return (
        <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Quick Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {quickActions.map((action, index) => (
                    <QuickActionCard key={index} {...action} />
                ))}
            </div>
        </div>
    )
})
QuickActionsSection.displayName = 'QuickActionsSection'

// Memoized Status Badge Component
const StatusBadge = memo(({ status }) => {
    const statusConfig = useMemo(() => {
        const configs = {
            pending: { color: 'bg-yellow-100 text-yellow-800', icon: ClockIcon },
            processing: { color: 'bg-blue-100 text-blue-800', icon: DocumentTextIcon },
            shipped: { color: 'bg-green-100 text-green-800', icon: CheckCircleIcon },
            completed: { color: 'bg-gray-100 text-gray-800', icon: CheckCircleIcon },
            cancelled: { color: 'bg-red-100 text-red-800', icon: XCircleIcon }
        }
        return configs[status] || configs.pending
    }, [status])

    const Icon = statusConfig.icon

    return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusConfig.color}`}>
            <Icon className="h-3 w-3 mr-1" />
            {status.charAt(0).toUpperCase() + status.slice(1)}
        </span>
    )
})
StatusBadge.displayName = 'StatusBadge'

// Memoized Order Item Component
const OrderItem = memo(({ order }) => (
    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
        <div className="flex-1">
            <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-gray-900">#{order.id}</p>
                <StatusBadge status={order.status} />
            </div>
            <p className="text-sm text-gray-600 mt-1">{order.customer}</p>
            <p className="text-xs text-gray-500 mt-1">{order.date}</p>
        </div>
        <div className="text-right">
            <p className="text-sm font-semibold text-gray-900">₹{order.amount.toLocaleString()}</p>
        </div>
    </div>
))
OrderItem.displayName = 'OrderItem'

// Memoized Recent Orders Component
const RecentOrdersSection = memo(({ orders }) => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Recent Orders</h3>
            <Link href="/retailer/orders" className="text-sm text-blue-600 hover:text-blue-800 font-medium">
                View All
            </Link>
        </div>
        <div className="space-y-4">
            {orders.map((order) => (
                <OrderItem key={order.id} order={order} />
            ))}
        </div>
    </div>
))
RecentOrdersSection.displayName = 'RecentOrdersSection'

// Memoized Product Item Component
const ProductItem = memo(({ product, index }) => (
    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
        <div className="flex items-center space-x-4">
            <div className="flex-shrink-0">
                <span className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-gray-200 text-sm font-medium text-gray-700">
                    {index + 1}
                </span>
            </div>
            <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">{product.name}</p>
                <p className="text-sm text-gray-600">{product.sales} sales</p>
            </div>
        </div>
        <div className="text-right">
            <p className="text-sm font-semibold text-gray-900">₹{product.revenue.toLocaleString()}</p>
        </div>
    </div>
))
ProductItem.displayName = 'ProductItem'

// Memoized Top Products Component
const TopProductsSection = memo(({ products }) => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Top Products</h3>
            <Link href="/retailer/products" className="text-sm text-blue-600 hover:text-blue-800 font-medium">
                View All
            </Link>
        </div>
        <div className="space-y-4">
            {products.map((product, index) => (
                <ProductItem key={product.id} product={product} index={index} />
            ))}
        </div>
    </div>
))
TopProductsSection.displayName = 'TopProductsSection'

// Memoized Bottom Section Component
const BottomSection = memo(({ recentOrders, topProducts }) => (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <RecentOrdersSection orders={recentOrders} />
        <TopProductsSection products={topProducts} />
    </div>
))
BottomSection.displayName = 'BottomSection'

// Main Retailer Dashboard Component
export default function RetailerDashboard() {
    const { user, loading } = useUser()
    const [dashboardData, setDashboardData] = useState({
        stats: {
            totalProducts: 0,
            activeProducts: 0,
            totalOrders: 0,
            pendingOrders: 0,
            totalRevenue: 0,
            monthlyRevenue: 0,
            totalViews: 0,
            conversionRate: 0
        },
        recentOrders: [],
        topProducts: [],
        alerts: []
    })
    const [isLoading, setIsLoading] = useState(true)

    // Memoized fetch function with proper dependencies
    const fetchDashboardData = useCallback(async () => {
        if (!user) return
        
        try {
            setIsLoading(true)
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1000))
            
            // Mock data - replace with actual API calls
            setDashboardData({
                stats: {
                    totalProducts: 24,
                    activeProducts: 22,
                    totalOrders: 156,
                    pendingOrders: 8,
                    totalRevenue: 45680,
                    monthlyRevenue: 12340,
                    totalViews: 2840,
                    conversionRate: 3.2
                },
                recentOrders: [
                    { id: 'ORD-001', customer: 'John Doe', amount: 299, status: 'pending', date: '2025-01-15' },
                    { id: 'ORD-002', customer: 'Jane Smith', amount: 159, status: 'processing', date: '2025-01-14' },
                    { id: 'ORD-003', customer: 'Mike Johnson', amount: 499, status: 'shipped', date: '2025-01-14' }
                ],
                topProducts: [
                    { id: 1, name: 'Wireless Headphones', sales: 45, revenue: 6750 },
                    { id: 2, name: 'Smart Watch', sales: 32, revenue: 9600 },
                    { id: 3, name: 'Phone Case', sales: 78, revenue: 2340 }
                ],
                alerts: [
                    { type: 'warning', message: '3 products are low on stock', action: 'Manage Inventory' },
                    { type: 'info', message: 'New order notification settings available', action: 'Update Settings' }
                ]
            })
        } catch (error) {
            console.error('Error fetching dashboard data:', error)
        } finally {
            setIsLoading(false)
        }
    }, [user?._id])

    // Memoized alert action handler
    const handleAlertAction = useCallback((action) => {
        // Handle alert actions here
        console.log('Alert action:', action)
    }, [])

    // Memoized user name
    const userName = useMemo(() => user?.profile?.name, [user?.profile?.name])

    // Effect to fetch data when user changes
    useEffect(() => {
        fetchDashboardData()
    }, [fetchDashboardData])

    if (loading || isLoading) {
        return <LoadingSkeleton />
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <PageHeader userName={userName} />
            
            <AlertsSection 
                alerts={dashboardData.alerts} 
                onAlertAction={handleAlertAction} 
            />
            
            <StatsGrid stats={dashboardData.stats} />
            
            <QuickActionsSection />
            
            <BottomSection 
                recentOrders={dashboardData.recentOrders} 
                topProducts={dashboardData.topProducts} 
            />
        </div>
    )
}
