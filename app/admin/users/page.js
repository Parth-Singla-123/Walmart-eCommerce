'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import {
    UsersIcon,
    MagnifyingGlassIcon,
    CalendarDaysIcon,
    EnvelopeIcon
} from '@heroicons/react/24/outline'
import LoadingSpinner from '@/components/ui/LoadingSpinner'

const UserManagementPage = () => {
    const [users, setUsers] = useState([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')

    // Fetch users
    const fetchUsers = useCallback(async () => {
        try {
            setLoading(true)
            const response = await fetch('/api/admin/users')
            if (response.ok) {
                const data = await response.json()
                setUsers(data)
            }
        } catch (error) {
            console.error('Error fetching users:', error)
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        fetchUsers()
    }, [fetchUsers])

    // Filter users based on search term
    const filteredUsers = useMemo(() => {
        if (!searchTerm.trim()) return users

        const search = searchTerm.toLowerCase()
        return users.filter(user =>
            user.profile?.name?.toLowerCase().includes(search) ||
            user.email?.toLowerCase().includes(search)
        )
    }, [users, searchTerm])

    // Get role badge styling
    const getRoleBadge = useCallback((role) => {
        switch (role) {
            case 'Admin':
                return 'bg-purple-100 text-purple-800'
            case 'Retailer':
                return 'bg-blue-100 text-blue-800'
            case 'Buyer':
                return 'bg-gray-100 text-gray-800'
            default:
                return 'bg-gray-100 text-gray-800'
        }
    }, [])

    // User statistics
    const userStats = useMemo(() => {
        const buyers = users.filter(user => user.role === 'Buyer').length
        const retailers = users.filter(user => user.role === 'Retailer').length
        const admins = users.filter(user => user.role === 'Admin').length
        const total = users.length

        return { buyers, retailers, admins, total }
    }, [users])

    // Handle search input
    const handleSearchChange = useCallback((e) => {
        setSearchTerm(e.target.value)
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
                <h1 className="text-2xl font-bold text-gray-900 mb-2">User Management</h1>
                <p className="text-gray-600">Overview of all platform users</p>
            </div>

            {/* User Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-white border border-gray-200 rounded-xl p-4">
                    <div className="flex items-center">
                        <UsersIcon className="h-8 w-8 text-gray-500" />
                        <div className="ml-3">
                            <p className="text-sm font-medium text-gray-600">Total Users</p>
                            <p className="text-2xl font-bold text-gray-900">{userStats.total}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white border border-gray-200 rounded-xl p-4">
                    <div className="flex items-center">
                        <UsersIcon className="h-8 w-8 text-gray-500" />
                        <div className="ml-3">
                            <p className="text-sm font-medium text-gray-600">Buyers</p>
                            <p className="text-2xl font-bold text-gray-900">{userStats.buyers}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white border border-gray-200 rounded-xl p-4">
                    <div className="flex items-center">
                        <UsersIcon className="h-8 w-8 text-blue-500" />
                        <div className="ml-3">
                            <p className="text-sm font-medium text-gray-600">Retailers</p>
                            <p className="text-2xl font-bold text-gray-900">{userStats.retailers}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white border border-gray-200 rounded-xl p-4">
                    <div className="flex items-center">
                        <UsersIcon className="h-8 w-8 text-purple-500" />
                        <div className="ml-3">
                            <p className="text-sm font-medium text-gray-600">Admins</p>
                            <p className="text-2xl font-bold text-gray-900">{userStats.admins}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Search */}
            <div className="mb-6">
                <div className="relative max-w-md">
                    <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search users by name or email..."
                        value={searchTerm}
                        onChange={handleSearchChange}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-black focus:border-transparent"
                    />
                </div>
            </div>

            {/* Users Table */}
            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                {filteredUsers.length === 0 ? (
                    <div className="p-8 text-center">
                        <UsersIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                        <p className="text-gray-500">
                            {searchTerm ? 'No users found matching your search' : 'No users found'}
                        </p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        User
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Email
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Role
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Join Date
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Retailer Status
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {filteredUsers.map((user) => (
                                    <tr key={user._id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                {user.profile?.avatar ? (
                                                    <img
                                                        src={user.profile.avatar}
                                                        alt={user.profile?.name || 'User'}
                                                        className="w-8 h-8 rounded-full object-cover mr-3"
                                                    />
                                                ) : (
                                                    <div className="w-8 h-8 bg-gray-300 text-gray-600 rounded-full flex items-center justify-center text-xs font-medium mr-3">
                                                        {user.profile?.name ? user.profile.name[0].toUpperCase() : user.email[0].toUpperCase()}
                                                    </div>
                                                )}
                                                <div>
                                                    <div className="text-sm font-medium text-gray-900">
                                                        {user.profile?.name || 'Unknown User'}
                                                    </div>
                                                    {user.profile?.phone && (
                                                        <div className="text-sm text-gray-500">
                                                            {user.profile.phone}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <EnvelopeIcon className="h-4 w-4 text-gray-400 mr-2" />
                                                <span className="text-sm text-gray-900">{user.email}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getRoleBadge(user.role)}`}>
                                                {user.role}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center text-sm text-gray-500">
                                                <CalendarDaysIcon className="h-4 w-4 mr-2" />
                                                {new Date(user.createdAt).toLocaleDateString()}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {user.retailerVerification?.status && user.retailerVerification.status !== 'none' ? (
                                                <span className={`px-2 py-1 text-xs font-medium rounded-full ${user.retailerVerification.status === 'approved'
                                                        ? 'bg-emerald-100 text-emerald-800'
                                                        : user.retailerVerification.status === 'rejected'
                                                            ? 'bg-red-100 text-red-800'
                                                            : 'bg-yellow-100 text-yellow-800'
                                                    }`}>
                                                    {user.retailerVerification.status.charAt(0).toUpperCase() + user.retailerVerification.status.slice(1)}
                                                </span>
                                            ) : (
                                                <span className="text-xs text-gray-400">Not Applied</span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Search Results Count */}
            {searchTerm && (
                <div className="mt-4 text-sm text-gray-600">
                    Showing {filteredUsers.length} of {users.length} users
                </div>
            )}
        </div>
    )
}

export default UserManagementPage
