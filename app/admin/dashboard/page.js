'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import {
    UsersIcon,
    BuildingStorefrontIcon,
    ClockIcon,
    DocumentCheckIcon,
    ArrowRightIcon,
    CalendarDaysIcon
} from '@heroicons/react/24/outline'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import Link from 'next/link'

const AdminDashboard = () => {
    const [stats, setStats] = useState(null)
    const [recentApplications, setRecentApplications] = useState([])
    const [loading, setLoading] = useState(true)

    // Fetch dashboard data
    const fetchDashboardData = useCallback(async () => {
        try {
            setLoading(true)

            // Fetch stats and recent applications in parallel
            const [statsResponse, recentResponse] = await Promise.all([
                fetch('/api/admin/dashboard/stats'),
                fetch('/api/admin/dashboard/recent')
            ])

            if (statsResponse.ok) {
                const statsData = await statsResponse.json()
                setStats(statsData)
            }

            if (recentResponse.ok) {
                const recentData = await recentResponse.json()
                setRecentApplications(recentData)
            }
        } catch (error) {
            console.error('Error fetching dashboard data:', error)
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        fetchDashboardData()
    }, [fetchDashboardData])

    // Memoized stats cards data
    const statsCards = useMemo(() => {
        if (!stats) return []

        return [
            {
                title: 'Total Users',
                value: stats.totalUsers,
                icon: UsersIcon,
                color: 'text-blue-500',
                bgColor: 'bg-blue-50'
            },
            {
                title: 'Active Retailers',
                value: stats.totalRetailers,
                icon: BuildingStorefrontIcon,
                color: 'text-emerald-500',
                bgColor: 'bg-emerald-50'
            },
            {
                title: 'Pending Applications',
                value: stats.pendingApplications,
                icon: ClockIcon,
                color: 'text-yellow-500',
                bgColor: 'bg-yellow-50'
            },
            {
                title: 'Total Applications',
                value: stats.totalApplications,
                icon: DocumentCheckIcon,
                color: 'text-purple-500',
                bgColor: 'bg-purple-50'
            }
        ]
    }, [stats])

    // Get status badge styling
    const getStatusBadge = useCallback((status) => {
        switch (status) {
            case 'approved':
                return 'bg-emerald-100 text-emerald-800'
            case 'rejected':
                return 'bg-red-100 text-red-800'
            case 'pending':
                return 'bg-yellow-100 text-yellow-800'
            default:
                return 'bg-gray-100 text-gray-800'
        }
    }, [])

    if (loading) {
        return (
            <div className="p-6 flex items-center justify-center min-h-[400px]">
                <LoadingSpinner />
            </div>
        )
    }

    return (
        <div className="p-6">
            {/* Header */}
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
                <p className="text-gray-600">Platform overview and key metrics</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {statsCards.map((card, index) => (
                    <div key={index} className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow">
                        <div className="flex items-center">
                            <div className={`p-3 rounded-xl ${card.bgColor}`}>
                                <card.icon className={`h-6 w-6 ${card.color}`} />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">{card.title}</p>
                                <p className="text-2xl font-bold text-gray-900">{card.value}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                <Link
                    href="/admin/retailer-applications"
                    className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow group"
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">Review Applications</h3>
                            <p className="text-sm text-gray-600">
                                {stats?.pendingApplications} pending applications
                            </p>
                        </div>
                        <ArrowRightIcon className="h-5 w-5 text-gray-400 group-hover:text-gray-600" />
                    </div>
                </Link>

                <Link
                    href="/admin/users"
                    className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow group"
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">Manage Users</h3>
                            <p className="text-sm text-gray-600">
                                {stats?.totalUsers} total users
                            </p>
                        </div>
                        <ArrowRightIcon className="h-5 w-5 text-gray-400 group-hover:text-gray-600" />
                    </div>
                </Link>

                <Link
                    href="/admin/retailer-applications"
                    className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow group"
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">Platform Overview</h3>
                            <p className="text-sm text-gray-600">
                                {stats?.totalRetailers} active retailers
                            </p>
                        </div>
                        <ArrowRightIcon className="h-5 w-5 text-gray-400 group-hover:text-gray-600" />
                    </div>
                </Link>
            </div>

            {/* Recent Applications */}
            <div className="bg-white border border-gray-200 rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-gray-900">Recent Applications</h2>
                    <Link
                        href="/admin/retailer-applications"
                        className="text-sm text-gray-600 hover:text-gray-900 flex items-center"
                    >
                        View all
                        <ArrowRightIcon className="h-4 w-4 ml-1" />
                    </Link>
                </div>

                {recentApplications.length === 0 ? (
                    <div className="text-center py-8">
                        <DocumentCheckIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                        <p className="text-gray-500">No recent applications</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {recentApplications.map((app) => (
                            <div key={app._id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                                <div className="flex items-center space-x-4">
                                    <BuildingStorefrontIcon className="h-8 w-8 text-gray-400" />
                                    <div>
                                        <p className="text-sm font-medium text-gray-900">{app.businessName}</p>
                                        <p className="text-xs text-gray-500">
                                            {app.userId?.profile?.name || 'Unknown'} • {app.businessCategory}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-3">
                                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusBadge(app.status)}`}>
                                        {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                                    </span>
                                    <div className="flex items-center text-xs text-gray-500">
                                        <CalendarDaysIcon className="h-4 w-4 mr-1" />
                                        {new Date(app.createdAt).toLocaleDateString()}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}

export default AdminDashboard
