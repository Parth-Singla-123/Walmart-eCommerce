'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import {
    BuildingStorefrontIcon,
    CheckCircleIcon,
    XCircleIcon,
    ClockIcon,
    UserIcon,
    CalendarDaysIcon,
    TagIcon,
    PhoneIcon,
    EnvelopeIcon,
    DocumentTextIcon
} from '@heroicons/react/24/outline'
import LoadingSpinner from '@/components/ui/LoadingSpinner'

const RetailerApplicationsPage = () => {
    const [applications, setApplications] = useState([])
    const [loading, setLoading] = useState(true)
    const [processing, setProcessing] = useState(null)
    const [statusFilter, setStatusFilter] = useState('all')
    const [showModal, setShowModal] = useState(false)
    const [showDetailModal, setShowDetailModal] = useState(false)
    const [selectedApp, setSelectedApp] = useState(null)
    const [actionType, setActionType] = useState(null)
    const [rejectionReason, setRejectionReason] = useState('')

    // Fetch applications
    const fetchApplications = useCallback(async () => {
        try {
            setLoading(true)
            const response = await fetch('/api/admin/retailer-applications')
            if (response.ok) {
                const data = await response.json()
                setApplications(data)
            }
        } catch (error) {
            console.error('Error fetching applications:', error)
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        fetchApplications()
    }, [fetchApplications])

    // Filter applications based on status
    const filteredApplications = useMemo(() => {
        if (statusFilter === 'all') return applications
        return applications.filter(app => app.status === statusFilter)
    }, [applications, statusFilter])

    // Handle approval/rejection
    const handleAction = useCallback(async (applicationId, action, reason = '') => {
        try {
            setProcessing(applicationId)
            const response = await fetch(`/api/admin/retailer-applications/${applicationId}/${action}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ rejectionReason: reason })
            })

            if (response.ok) {
                await fetchApplications()
                setShowModal(false)
                setShowDetailModal(false)
                setSelectedApp(null)
                setRejectionReason('')
            }
        } catch (error) {
            console.error(`Error ${action} application:`, error)
        } finally {
            setProcessing(null)
        }
    }, [fetchApplications])

    // Open confirmation modal
    const openModal = useCallback((app, action) => {
        setSelectedApp(app)
        setActionType(action)
        setShowModal(true)
    }, [])

    // Open detailed view modal
    const openDetailModal = useCallback((app) => {
        setSelectedApp(app)
        setShowDetailModal(true)
    }, [])

    // Close all modals
    const closeModals = useCallback(() => {
        setShowModal(false)
        setShowDetailModal(false)
        setSelectedApp(null)
        setActionType(null)
        setRejectionReason('')
    }, [])

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

    // Get user initials for avatar fallback
    const getUserInitials = useCallback((user) => {
        if (user?.profile?.name?.trim()) {
            return user.profile.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
        }
        return user?.email ? user.email[0].toUpperCase() : 'U'
    }, [])

    // Stats for quick overview
    const stats = useMemo(() => {
        const pending = applications.filter(app => app.status === 'pending').length
        const approved = applications.filter(app => app.status === 'approved').length
        const rejected = applications.filter(app => app.status === 'rejected').length
        return { pending, approved, rejected, total: applications.length }
    }, [applications])

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
                <h1 className="text-2xl font-bold text-gray-900 mb-2">Retailer Applications</h1>
                <p className="text-gray-600">Review and manage retailer application requests</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-white border border-gray-200 rounded-xl p-4">
                    <div className="flex items-center">
                        <ClockIcon className="h-8 w-8 text-yellow-500" />
                        <div className="ml-3">
                            <p className="text-sm font-medium text-gray-600">Pending</p>
                            <p className="text-2xl font-bold text-gray-900">{stats.pending}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white border border-gray-200 rounded-xl p-4">
                    <div className="flex items-center">
                        <CheckCircleIcon className="h-8 w-8 text-emerald-500" />
                        <div className="ml-3">
                            <p className="text-sm font-medium text-gray-600">Approved</p>
                            <p className="text-2xl font-bold text-gray-900">{stats.approved}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white border border-gray-200 rounded-xl p-4">
                    <div className="flex items-center">
                        <XCircleIcon className="h-8 w-8 text-red-500" />
                        <div className="ml-3">
                            <p className="text-sm font-medium text-gray-600">Rejected</p>
                            <p className="text-2xl font-bold text-gray-900">{stats.rejected}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white border border-gray-200 rounded-xl p-4">
                    <div className="flex items-center">
                        <BuildingStorefrontIcon className="h-8 w-8 text-blue-500" />
                        <div className="ml-3">
                            <p className="text-sm font-medium text-gray-600">Total</p>
                            <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Filter */}
            <div className="mb-6">
                <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-black focus:border-transparent"
                >
                    <option value="all">All Applications</option>
                    <option value="pending">Pending</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                </select>
            </div>

            {/* Applications Table */}
            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                {filteredApplications.length === 0 ? (
                    <div className="p-8 text-center">
                        <BuildingStorefrontIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                        <p className="text-gray-500">No applications found</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Business
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Applicant
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Category
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Applied
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {filteredApplications.map((app) => (
                                    <tr key={app._id} className="hover:bg-gray-50 cursor-pointer" onClick={() => openDetailModal(app)}>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div>
                                                <div className="text-sm font-medium text-gray-900">
                                                    {app.businessName}
                                                </div>
                                                <div className="text-sm text-gray-500 max-w-xs truncate">
                                                    {app.businessDescription}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <UserIcon className="h-5 w-5 text-gray-400 mr-2" />
                                                <div>
                                                    <div className="text-sm font-medium text-gray-900">
                                                        {app.userId?.profile?.name || 'Unknown'}
                                                    </div>
                                                    <div className="text-sm text-gray-500">
                                                        {app.userId?.email}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <TagIcon className="h-4 w-4 text-gray-400 mr-2" />
                                                <span className="text-sm text-gray-900">{app.businessCategory}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusBadge(app.status)}`}>
                                                {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center text-sm text-gray-500">
                                                <CalendarDaysIcon className="h-4 w-4 mr-2" />
                                                {new Date(app.createdAt).toLocaleDateString()}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            <div className="flex items-center space-x-2" onClick={(e) => e.stopPropagation()}>
                                                {app.status === 'pending' ? (
                                                    <>
                                                        <button
                                                            onClick={() => openModal(app, 'approve')}
                                                            disabled={processing === app._id}
                                                            className="text-emerald-600 hover:text-emerald-900 disabled:opacity-50"
                                                        >
                                                            {processing === app._id ? (
                                                                <LoadingSpinner size="sm" />
                                                            ) : (
                                                                'Approve'
                                                            )}
                                                        </button>
                                                        <button
                                                            onClick={() => openModal(app, 'reject')}
                                                            disabled={processing === app._id}
                                                            className="text-red-600 hover:text-red-900 disabled:opacity-50"
                                                        >
                                                            Reject
                                                        </button>
                                                    </>
                                                ) : (
                                                    <span className="text-gray-400">
                                                        {app.status === 'approved' ? 'Approved' : 'Rejected'}
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Detailed View Modal */}
            {showDetailModal && selectedApp && (
                <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                        {/* Modal Header */}
                        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 rounded-t-xl">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h2 className="text-xl font-bold text-gray-900">Application Details</h2>
                                    <p className="text-sm text-gray-600">Review retailer application information</p>
                                </div>
                                <button
                                    onClick={closeModals}
                                    className="text-gray-400 hover:text-gray-600 p-2 rounded-xl hover:bg-gray-100"
                                >
                                    <XCircleIcon className="h-6 w-6" />
                                </button>
                            </div>
                        </div>

                        {/* Modal Content */}
                        <div className="p-6">
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                {/* Left Column - Business Information */}
                                <div className="lg:col-span-2 space-y-6">
                                    {/* Business Details */}
                                    <div className="bg-gray-50 rounded-xl p-6">
                                        <div className="flex items-center mb-4">
                                            <BuildingStorefrontIcon className="h-6 w-6 text-blue-500 mr-3" />
                                            <h3 className="text-lg font-semibold text-gray-900">Business Information</h3>
                                        </div>
                                        <div className="space-y-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Business Name</label>
                                                <p className="text-gray-900 font-medium">{selectedApp.businessName}</p>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                                                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                                                    <TagIcon className="h-4 w-4 mr-1" />
                                                    {selectedApp.businessCategory}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Business Description */}
                                    <div className="bg-gray-50 rounded-xl p-6">
                                        <div className="flex items-center mb-4">
                                            <DocumentTextIcon className="h-6 w-6 text-purple-500 mr-3" />
                                            <h3 className="text-lg font-semibold text-gray-900">Business Description</h3>
                                        </div>
                                        <div className="prose prose-sm max-w-none">
                                            <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                                                {selectedApp.businessDescription}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Review Information */}
                                    {selectedApp.reviewedBy && (
                                        <div className="bg-gray-50 rounded-xl p-6">
                                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Review Information</h3>
                                            <div className="space-y-3">
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">Reviewed At</label>
                                                    <p className="text-gray-900">{new Date(selectedApp.reviewedAt).toLocaleString()}</p>
                                                </div>
                                                {selectedApp.rejectionReason && (
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-1">Rejection Reason</label>
                                                        <p className="text-red-700 bg-red-50 p-3 rounded-xl">{selectedApp.rejectionReason}</p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Right Column - Applicant Information */}
                                <div className="space-y-6">
                                    {/* Applicant Profile */}
                                    <div className="bg-gray-50 rounded-xl p-6">
                                        <div className="flex items-center mb-4">
                                            <UserIcon className="h-6 w-6 text-emerald-500 mr-3" />
                                            <h3 className="text-lg font-semibold text-gray-900">Applicant Profile</h3>
                                        </div>
                                        <div className="space-y-4">
                                            {/* Avatar and Name */}
                                            <div className="flex items-center space-x-4">
                                                {selectedApp.userId?.profile?.avatar ? (
                                                    <img 
                                                        src={selectedApp.userId.profile.avatar} 
                                                        alt={selectedApp.userId?.profile?.name || 'User'} 
                                                        className="w-16 h-16 rounded-full object-cover border-4 border-white shadow-md"
                                                    />
                                                ) : (
                                                    <div className="w-16 h-16 bg-gray-300 text-gray-600 rounded-full flex items-center justify-center text-lg font-bold border-4 border-white shadow-md">
                                                        {getUserInitials(selectedApp.userId)}
                                                    </div>
                                                )}
                                                <div>
                                                    <h4 className="font-semibold text-gray-900">
                                                        {selectedApp.userId?.profile?.name || 'Unknown User'}
                                                    </h4>
                                                    <p className="text-sm text-gray-600">Applicant</p>
                                                </div>
                                            </div>

                                            {/* Contact Information */}
                                            <div className="space-y-3">
                                                <div className="flex items-center">
                                                    <EnvelopeIcon className="h-5 w-5 text-gray-400 mr-3" />
                                                    <div>
                                                        <p className="text-sm font-medium text-gray-700">Email</p>
                                                        <p className="text-gray-900">{selectedApp.userId?.email || 'Not provided'}</p>
                                                    </div>
                                                </div>
                                                {selectedApp.userId?.profile?.phone && (
                                                    <div className="flex items-center">
                                                        <PhoneIcon className="h-5 w-5 text-gray-400 mr-3" />
                                                        <div>
                                                            <p className="text-sm font-medium text-gray-700">Phone</p>
                                                            <p className="text-gray-900">{selectedApp.userId.profile.phone}</p>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Application Status */}
                                    <div className="bg-gray-50 rounded-xl p-6">
                                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Application Status</h3>
                                        <div className="space-y-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">Current Status</label>
                                                <span className={`inline-flex px-3 py-2 rounded-full text-sm font-medium ${getStatusBadge(selectedApp.status)}`}>
                                                    {selectedApp.status.charAt(0).toUpperCase() + selectedApp.status.slice(1)}
                                                </span>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Application Date</label>
                                                <div className="flex items-center text-gray-900">
                                                    <CalendarDaysIcon className="h-4 w-4 mr-2 text-gray-400" />
                                                    {new Date(selectedApp.createdAt).toLocaleDateString()}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Action Buttons */}
                                    {selectedApp.status === 'pending' && (
                                        <div className="bg-gray-50 rounded-xl p-6">
                                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Actions</h3>
                                            <div className="space-y-3">
                                                <button
                                                    onClick={() => {
                                                        openModal(selectedApp, 'approve')
                                                        setShowDetailModal(false)
                                                    }}
                                                    disabled={processing === selectedApp._id}
                                                    className="w-full bg-emerald-600 text-white py-3 px-4 rounded-xl hover:bg-emerald-700 disabled:opacity-50 font-medium flex items-center justify-center"
                                                >
                                                    <CheckCircleIcon className="h-5 w-5 mr-2" />
                                                    Approve Application
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        openModal(selectedApp, 'reject')
                                                        setShowDetailModal(false)
                                                    }}
                                                    disabled={processing === selectedApp._id}
                                                    className="w-full bg-red-600 text-white py-3 px-4 rounded-xl hover:bg-red-700 disabled:opacity-50 font-medium flex items-center justify-center"
                                                >
                                                    <XCircleIcon className="h-5 w-5 mr-2" />
                                                    Reject Application
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Confirmation Modal */}
            {showModal && selectedApp && (
                <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">
                            {actionType === 'approve' ? 'Approve Application' : 'Reject Application'}
                        </h3>

                        <div className="mb-4">
                            <p className="text-sm text-gray-600 mb-2">
                                <strong>Business:</strong> {selectedApp.businessName}
                            </p>
                            <p className="text-sm text-gray-600 mb-2">
                                <strong>Applicant:</strong> {selectedApp.userId?.profile?.name || 'Unknown'}
                            </p>
                            <p className="text-sm text-gray-600">
                                <strong>Category:</strong> {selectedApp.businessCategory}
                            </p>
                        </div>

                        {actionType === 'reject' && (
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Rejection Reason
                                </label>
                                <textarea
                                    value={rejectionReason}
                                    onChange={(e) => setRejectionReason(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-black focus:border-transparent"
                                    rows="3"
                                    placeholder="Please provide a reason for rejection..."
                                />
                            </div>
                        )}

                        <div className="flex justify-end space-x-3">
                            <button
                                onClick={() => setShowModal(false)}
                                className="px-4 py-2 text-gray-600 hover:text-gray-800"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => handleAction(selectedApp._id, actionType, rejectionReason)}
                                disabled={actionType === 'reject' && !rejectionReason.trim()}
                                className={`px-4 py-2 rounded-xl font-medium disabled:opacity-50 ${actionType === 'approve'
                                        ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                                        : 'bg-red-600 text-white hover:bg-red-700'
                                    }`}
                            >
                                {actionType === 'approve' ? 'Approve' : 'Reject'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default RetailerApplicationsPage
