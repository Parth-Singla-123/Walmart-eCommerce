'use client'

import { useAccountData } from '@/hooks/useAccountData'
import { useMemo, memo, useState, useRef, useEffect } from 'react'
import {
    ShoppingBagIcon,
    HeartIcon,
    MapPinIcon,
    UserIcon,
    CreditCardIcon,
    BellIcon,
    EyeIcon,
    TruckIcon,
    CheckCircleIcon,
    ExclamationTriangleIcon
} from '@heroicons/react/24/outline'
import Link from 'next/link'
import LoadingSpinner from '@/components/ui/LoadingSpinner'

// Memoized stat card component with enhanced styling
const StatCard = memo(({ title, value, description, icon: Icon, href, color = 'black', badge, trend }) => {
    const colorClasses = {
        black: 'hover:bg-black hover:text-white border-black',
        blue: 'hover:bg-blue-600 hover:text-white border-blue-600',
        green: 'hover:bg-green-600 hover:text-white border-green-600',
        purple: 'hover:bg-purple-600 hover:text-white border-purple-600'
    }

    return (
        <Link
            href={href}
            className={`block p-6 bg-white border-2 rounded-xl transition-all duration-200 group ${colorClasses[color]} hover:shadow-md relative overflow-hidden`}
        >
            {badge && (
                <div className="absolute top-3 right-3">
                    <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                        {badge}
                    </span>
                </div>
            )}

            <div className="flex items-center justify-between">
                <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-2xl font-bold text-gray-900 group-hover:text-white transition-colors duration-200">
                            {value}
                        </h3>
                        {trend && (
                            <span className={`text-xs px-2 py-1 rounded-full ${trend > 0 ? 'bg-green-100 text-green-800 group-hover:bg-green-200' :
                                    trend < 0 ? 'bg-red-100 text-red-800 group-hover:bg-red-200' :
                                        'bg-gray-100 text-gray-800 group-hover:bg-gray-200'
                                }`}>
                                {trend > 0 ? `+${trend}%` : `${trend}%`}
                            </span>
                        )}
                    </div>
                    <p className="text-sm font-medium text-gray-600 group-hover:text-gray-200 transition-colors duration-200">
                        {title}
                    </p>
                    <p className="text-xs text-gray-500 group-hover:text-gray-300 transition-colors duration-200 mt-2">
                        {description}
                    </p>
                </div>
                <Icon className="h-8 w-8 text-gray-400 group-hover:text-white transition-colors duration-200" />
            </div>
        </Link>
    )
})

StatCard.displayName = 'StatCard'

// Memoized welcome section with profile completion
const WelcomeSection = memo(({ user, profileCompletion }) => {
    const welcomeMessage = useMemo(() => {
        const hour = new Date().getHours()
        if (hour < 12) return 'Good morning'
        if (hour < 18) return 'Good afternoon'
        return 'Good evening'
    }, [])

    return (
        <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-purple-50">
            <div className="flex items-center justify-between">
                <div className="flex-1">
                    <h1 className="text-2xl font-bold text-gray-900">
                        {welcomeMessage}, {user.profile?.name || 'there'}!
                    </h1>
                    <p className="text-gray-600 mt-2">
                        Manage your account settings and view your activity
                    </p>
                </div>

                {/* Profile Completion Widget */}
                <div className="hidden sm:block bg-white rounded-xl p-4 shadow-sm border border-gray-200">
                    <div className="flex items-center gap-3">
                        <div className="relative w-12 h-12">
                            <svg className="w-12 h-12 transform -rotate-90" viewBox="0 0 100 100">
                                <circle
                                    cx="50"
                                    cy="50"
                                    r="40"
                                    stroke="#E5E7EB"
                                    strokeWidth="8"
                                    fill="none"
                                />
                                <circle
                                    cx="50"
                                    cy="50"
                                    r="40"
                                    stroke={profileCompletion >= 80 ? "#10B981" : profileCompletion >= 50 ? "#F59E0B" : "#EF4444"}
                                    strokeWidth="8"
                                    fill="none"
                                    strokeDasharray={`${profileCompletion * 2.51} 251`}
                                    strokeLinecap="round"
                                    className="transition-all duration-500"
                                />
                            </svg>
                            <div className="absolute inset-0 flex items-center justify-center">
                                <span className="text-xs font-semibold text-gray-700">
                                    {profileCompletion}%
                                </span>
                            </div>
                        </div>
                        <div>
                            <p className="text-sm font-semibold text-gray-900">Profile</p>
                            <p className="text-xs text-gray-500">
                                {profileCompletion < 100 ? 'Complete your profile' : 'Complete!'}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
})

WelcomeSection.displayName = 'WelcomeSection'

// Recent activity component
const RecentActivity = memo(({ activities }) => {
    const activityRef = useRef(null)

    if (!activities || activities.length === 0) {
        return (
            <div className="bg-gray-50 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
                <div className="text-center py-8">
                    <EyeIcon className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-500">No recent activity</p>
                </div>
            </div>
        )
    }

    return (
        <div className="bg-gray-50 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
            <div ref={activityRef} className="space-y-3 max-h-64 overflow-y-auto">
                {activities.slice(0, 5).map((activity, index) => (
                    <div key={index} className="flex items-center gap-3 bg-white rounded-lg p-3">
                        <div className={`p-2 rounded-full ${activity.type === 'order' ? 'bg-blue-100 text-blue-600' :
                                activity.type === 'wishlist' ? 'bg-red-100 text-red-600' :
                                    'bg-gray-100 text-gray-600'
                            }`}>
                            {activity.type === 'order' ? <ShoppingBagIcon className="h-4 w-4" /> :
                                activity.type === 'wishlist' ? <HeartIcon className="h-4 w-4" /> :
                                    <EyeIcon className="h-4 w-4" />}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">
                                {activity.title}
                            </p>
                            <p className="text-xs text-gray-500">
                                {activity.time}
                            </p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
})

RecentActivity.displayName = 'RecentActivity'

// Quick actions component with dynamic content
const QuickActions = memo(({ user, profileCompletion }) => {
    const [hoveredAction, setHoveredAction] = useState(null)

    const quickActions = useMemo(() => {
        const actions = [
            {
                title: 'Edit Profile',
                description: 'Update your personal information',
                href: '/account/profile',
                icon: UserIcon,
                priority: profileCompletion < 100 ? 'high' : 'normal'
            },
            {
                title: 'View Orders',
                description: 'Track your recent purchases',
                href: '/account/orders',
                icon: ShoppingBagIcon,
                priority: 'normal'
            },
            {
                title: 'Manage Addresses',
                description: 'Add or edit shipping addresses',
                href: '/account/addresses',
                icon: MapPinIcon,
                priority: (user.addresses?.length || 0) === 0 ? 'high' : 'normal'
            },
            {
                title: 'View Wishlist',
                description: 'See your saved items',
                href: '/account/wishlist',
                icon: HeartIcon,
                priority: 'normal'
            }
        ]

        // Sort by priority
        return actions.sort((a, b) => a.priority === 'high' ? -1 : 1)
    }, [user, profileCompletion])

    return (
        <div className="bg-gray-50 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {quickActions.map((action, index) => (
                    <Link
                        key={action.title}
                        href={action.href}
                        onMouseEnter={() => setHoveredAction(index)}
                        onMouseLeave={() => setHoveredAction(null)}
                        className={`flex items-center p-4 bg-white rounded-lg transition-all duration-200 group relative ${action.priority === 'high' ? 'ring-2 ring-blue-200 hover:ring-blue-300' : 'hover:bg-gray-100'
                            }`}
                    >
                        {action.priority === 'high' && (
                            <div className="absolute top-2 right-2">
                                <ExclamationTriangleIcon className="h-4 w-4 text-blue-600" />
                            </div>
                        )}

                        <action.icon className={`h-5 w-5 mr-3 transition-colors duration-200 ${hoveredAction === index ? 'text-black' : 'text-gray-500'
                            }`} />
                        <div className="flex-1">
                            <span className={`text-sm font-medium transition-colors duration-200 ${hoveredAction === index ? 'text-black' : 'text-gray-700'
                                }`}>
                                {action.title}
                            </span>
                            <p className="text-xs text-gray-500 mt-1">
                                {action.description}
                            </p>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    )
})

QuickActions.displayName = 'QuickActions'

export default function AccountPage() {
    const { user, loading, error } = useAccountData()
    const [recentActivities, setRecentActivities] = useState([])

    // Calculate profile completion percentage using useMemo
    const profileCompletion = useMemo(() => {
        if (!user) return 0

        let completed = 0
        const total = 6

        if (user.profile?.name) completed++
        if (user.profile?.phone) completed++
        if (user.profile?.avatar) completed++
        if (user.addresses?.length > 0) completed++
        if (user.preferences?.categories?.length > 0) completed++
        if (user.email) completed++

        return Math.round((completed / total) * 100)
    }, [user])

    // Account stats with memoization
    const accountStats = useMemo(() => {
        if (!user) return []

        return [
            {
                title: 'Total Orders',
                value: user.orders?.length || 0,
                description: 'Your purchase history',
                icon: ShoppingBagIcon,
                href: '/account/orders',
                color: 'black',
                trend: 0 // You can calculate this based on recent vs older orders
            },
            {
                title: 'Wishlist Items',
                value: user.wishlist?.length || 0,
                description: 'Items you want to buy',
                icon: HeartIcon,
                href: '/account/wishlist',
                color: 'blue',
                badge: user.wishlist?.length > 10 ? 'Full' : null
            },
            {
                title: 'Saved Addresses',
                value: user.addresses?.length || 0,
                description: 'Shipping locations',
                icon: MapPinIcon,
                href: '/account/addresses',
                color: 'green',
                badge: (user.addresses?.length || 0) === 0 ? 'Setup' : null
            },
            {
                title: 'Profile Score',
                value: `${profileCompletion}%`,
                description: 'Profile completion',
                icon: UserIcon,
                href: '/account/profile',
                color: 'purple',
                badge: profileCompletion < 100 ? 'Incomplete' : null
            }
        ]
    }, [user, profileCompletion])

    // Simulate recent activities (replace with real data)
    useEffect(() => {
        if (user && recentActivities.length === 0) {
            const mockActivities = [
                {
                    type: 'order',
                    title: 'Order #12345 shipped',
                    time: '2 hours ago'
                },
                {
                    type: 'wishlist',
                    title: 'Added item to wishlist',
                    time: '1 day ago'
                },
                {
                    type: 'view',
                    title: 'Viewed product details',
                    time: '2 days ago'
                }
            ]
            setRecentActivities(mockActivities)
        }
    }, [user, recentActivities.length])

    if (loading) {
        return (
            <div className="h-full flex items-center justify-center">
                <LoadingSpinner size="lg" />
            </div>
        )
    }

    if (error) {
        return (
            <div className="h-full flex items-center justify-center">
                <div className="text-center">
                    <ExclamationTriangleIcon className="h-12 w-12 text-red-500 mx-auto mb-3" />
                    <p className="text-red-600 font-medium">Error loading account data</p>
                    <p className="text-gray-500 text-sm mt-1">{error}</p>
                </div>
            </div>
        )
    }

    if (!user) {
        return null
    }

    return (
        <div className="h-full w-full">
            {/* Welcome Section */}
            <WelcomeSection user={user} profileCompletion={profileCompletion} />

            {/* Dashboard Content */}
            <div className="p-6 w-full">
                {/* Account Stats */}
                <div className="mb-8">
                    <h2 className="text-lg font-semibold text-gray-900 mb-6">Account Overview</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                        {accountStats.map((stat) => (
                            <StatCard
                                key={stat.title}
                                title={stat.title}
                                value={stat.value}
                                description={stat.description}
                                icon={stat.icon}
                                href={stat.href}
                                color={stat.color}
                                badge={stat.badge}
                                trend={stat.trend}
                            />
                        ))}
                    </div>
                </div>

                {/* Bottom Section - Recent Activity & Quick Actions */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <RecentActivity activities={recentActivities} />
                    <QuickActions user={user} profileCompletion={profileCompletion} />
                </div>
            </div>
        </div>
    )
}
