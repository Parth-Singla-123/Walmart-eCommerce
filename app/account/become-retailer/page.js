'use client'

import { useState, useEffect, memo } from 'react'
import { useRouter } from 'next/navigation'
import { useUser } from '@/hooks/useUser'
import {
    BuildingStorefrontIcon,
    DocumentArrowUpIcon,
    CheckCircleIcon,
    XCircleIcon,
    ClockIcon,
    InformationCircleIcon,
    ExclamationTriangleIcon
} from '@heroicons/react/24/outline'
import LoadingSpinner from '@/components/ui/LoadingSpinner'

const BUSINESS_CATEGORIES = [
    'Electronics',
    'Clothing',
    'Home & Garden',
    'Books',
    'Sports',
    'Beauty',
    'Food',
    'Other'
]

const ApplicationStatus = memo(({ status, applicationData }) => {
    if (!applicationData) return null

    const statusConfig = {
        pending: {
            icon: ClockIcon,
            color: 'text-yellow-600',
            bg: 'bg-yellow-50',
            border: 'border-yellow-200',
            title: 'Application Under Review',
            message: 'Your retailer application is being reviewed by our team. We\'ll notify you once it\'s processed.'
        },
        approved: {
            icon: CheckCircleIcon,
            color: 'text-green-600',
            bg: 'bg-green-50',
            border: 'border-green-200',
            title: 'Application Approved!',
            message: 'Congratulations! Your retailer application has been approved. You can now start selling on our platform.'
        },
        rejected: {
            icon: XCircleIcon,
            color: 'text-red-600',
            bg: 'bg-red-50',
            border: 'border-red-200',
            title: 'Application Rejected',
            message: applicationData.rejectionReason || 'Your application was not approved. Please contact support for more information.'
        }
    }

    const config = statusConfig[status]
    const StatusIcon = config.icon

    return (
        <div className={`p-4 rounded-xl border ${config.bg} ${config.border}`}>
            <div className="flex items-start gap-3">
                <StatusIcon className={`h-5 w-5 ${config.color} mt-0.5 flex-shrink-0`} />
                <div className="flex-1">
                    <h3 className={`text-sm font-medium ${config.color} mb-1`}>
                        {config.title}
                    </h3>
                    <p className="text-sm text-gray-700 mb-3">
                        {config.message}
                    </p>
                    <div className="text-xs text-gray-600 space-y-1">
                        <p><span className="font-medium">Applied:</span> {new Date(applicationData.createdAt).toLocaleDateString()}</p>
                        <p><span className="font-medium">Business:</span> {applicationData.businessName}</p>
                        <p><span className="font-medium">Category:</span> {applicationData.businessCategory}</p>
                        {applicationData.reviewedAt && (
                            <p><span className="font-medium">Reviewed:</span> {new Date(applicationData.reviewedAt).toLocaleDateString()}</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
})
ApplicationStatus.displayName = 'ApplicationStatus'

const SuccessMessage = memo(({ show, message, onClose }) => {
    useEffect(() => {
        if (show) {
            const timer = setTimeout(onClose, 5000)
            return () => clearTimeout(timer)
        }
    }, [show, onClose])

    if (!show) return null

    return (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
            <div className="flex items-center gap-2">
                <CheckCircleIcon className="h-5 w-5 text-emerald-600" />
                <p className="text-emerald-700 font-medium">{message}</p>
            </div>
        </div>
    )
})
SuccessMessage.displayName = 'SuccessMessage'

export default function BecomeRetailerPage() {
    const { user, loading } = useUser()
    const router = useRouter()
    
    const [formData, setFormData] = useState({
        businessName: '',
        businessDescription: '',
        businessCategory: ''
    })
    const [errors, setErrors] = useState({})
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [applicationData, setApplicationData] = useState(null)
    const [loadingApplication, setLoadingApplication] = useState(true)
    const [success, setSuccess] = useState({ show: false, message: '' })

    // Check existing application on mount
    useEffect(() => {
        const checkExistingApplication = async () => {
            if (!user) return
            
            try {
                const response = await fetch('/api/retailer/application-status')
                if (response.ok) {
                    const data = await response.json()
                    if (data.application) {
                        setApplicationData(data.application)
                    }
                }
            } catch (error) {
                console.error('Error checking application status:', error)
            } finally {
                setLoadingApplication(false)
            }
        }

        checkExistingApplication()
    }, [user])

    // Redirect if already a retailer
    useEffect(() => {
        if (user && user.role === 'Retailer') {
            router.push('/retailer/dashboard')
        }
    }, [user, router])

    const validateForm = () => {
        const newErrors = {}

        if (!formData.businessName.trim()) {
            newErrors.businessName = 'Business name is required'
        } else if (formData.businessName.trim().length < 2) {
            newErrors.businessName = 'Business name must be at least 2 characters'
        }

        if (!formData.businessDescription.trim()) {
            newErrors.businessDescription = 'Business description is required'
        } else if (formData.businessDescription.trim().length < 20) {
            newErrors.businessDescription = 'Business description must be at least 20 characters'
        }

        if (!formData.businessCategory) {
            newErrors.businessCategory = 'Please select a business category'
        }

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleInputChange = (e) => {
        const { name, value } = e.target
        setFormData(prev => ({
            ...prev,
            [name]: value
        }))
        
        // Clear error when user starts typing
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }))
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        if (!validateForm()) return

        setIsSubmitting(true)
        setErrors({})

        try {
            const response = await fetch('/api/retailer/apply', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData)
            })

            const data = await response.json()

            if (response.ok) {
                setApplicationData(data.application)
                setFormData({ businessName: '', businessDescription: '', businessCategory: '' })
                setSuccess({ show: true, message: 'Retailer application submitted successfully!' })
            } else {
                setErrors({ submit: data.error || 'Failed to submit application' })
            }
        } catch (error) {
            setErrors({ submit: 'An unexpected error occurred. Please try again.' })
        } finally {
            setIsSubmitting(false)
        }
    }

    if (loading || loadingApplication) {
        return (
            <div className="h-full flex items-center justify-center">
                <LoadingSpinner size="lg" />
            </div>
        )
    }

    if (!user) {
        router.push('/login')
        return null
    }

    return (
        <div className="h-full w-full">
            {/* Header */}
            <div className="p-6 rounded-xl border-b border-gray-200 bg-white">
                <div className="flex items-center gap-3">
                    <BuildingStorefrontIcon className="h-8 w-8 text-gray-600" />
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Become a Retailer</h1>
                        <p className="text-gray-600 mt-1">Start selling your products on our platform</p>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="p-6 space-y-8">
                <SuccessMessage
                    show={success.show}
                    message={success.message}
                    onClose={() => setSuccess({ show: false, message: '' })}
                />

                {/* Show application status if exists */}
                {applicationData && (
                    <ApplicationStatus 
                        status={applicationData.status} 
                        applicationData={applicationData} 
                    />
                )}

                {/* Retailer Benefits */}
                <div className="bg-blue-50 rounded-xl p-6">
                    <div className="flex items-center gap-2 mb-4">
                        <InformationCircleIcon className="h-5 w-5 text-blue-600" />
                        <h2 className="text-lg font-semibold text-blue-900">What you&apos;ll get as a retailer</h2>
                    </div>
                    <ul className="list-disc list-inside space-y-1 text-sm text-blue-800">
                        <li>Create and manage your own store</li>
                        <li>Add unlimited products with detailed descriptions</li>
                        <li>Track sales and analytics in real-time</li>
                        <li>Manage customer orders and communications</li>
                        <li>Access to our seller support team</li>
                    </ul>
                </div>

                {/* Application Form - Only show if no pending/approved application */}
                {!applicationData && (
                    <div className="bg-gray-50 rounded-xl p-6">
                        <div className="flex items-center gap-2 mb-6">
                            <DocumentArrowUpIcon className="h-5 w-5 text-gray-600" />
                            <h2 className="text-lg font-semibold text-gray-900">Retailer Application</h2>
                        </div>
                        
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Business Name */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Business Name *
                                </label>
                                <input
                                    type="text"
                                    name="businessName"
                                    value={formData.businessName}
                                    onChange={handleInputChange}
                                    className={`w-full px-4 py-3 text-sm border-2 rounded-xl bg-white text-black placeholder:text-gray-500 focus:ring-2 focus:ring-black focus:border-black focus:outline-none transition-all duration-200 ${
                                        errors.businessName ? 'border-red-300' : 'border-gray-300'
                                    }`}
                                    placeholder="Enter your business name"
                                    maxLength={100}
                                />
                                {errors.businessName && (
                                    <p className="mt-1 text-sm text-red-600">{errors.businessName}</p>
                                )}
                            </div>

                            {/* Business Category */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Business Category *
                                </label>
                                <select
                                    name="businessCategory"
                                    value={formData.businessCategory}
                                    onChange={handleInputChange}
                                    className={`w-full px-4 py-3 text-sm border-2 rounded-xl bg-white text-black focus:ring-2 focus:ring-black focus:border-black focus:outline-none transition-all duration-200 ${
                                        errors.businessCategory ? 'border-red-300' : 'border-gray-300'
                                    }`}
                                >
                                    <option value="">Select a category</option>
                                    {BUSINESS_CATEGORIES.map(category => (
                                        <option key={category} value={category}>
                                            {category}
                                        </option>
                                    ))}
                                </select>
                                {errors.businessCategory && (
                                    <p className="mt-1 text-sm text-red-600">{errors.businessCategory}</p>
                                )}
                            </div>

                            {/* Business Description */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Business Description *
                                </label>
                                <textarea
                                    name="businessDescription"
                                    value={formData.businessDescription}
                                    onChange={handleInputChange}
                                    rows={4}
                                    className={`w-full px-4 py-3 text-sm border-2 rounded-xl bg-white text-black placeholder:text-gray-500 focus:ring-2 focus:ring-black focus:border-black focus:outline-none transition-all duration-200 resize-none ${
                                        errors.businessDescription ? 'border-red-300' : 'border-gray-300'
                                    }`}
                                    placeholder="Describe your business, products, and what makes you unique..."
                                    maxLength={500}
                                />
                                <div className="text-xs text-gray-500 mt-1">
                                    {formData.businessDescription.length}/500 characters
                                </div>
                                {errors.businessDescription && (
                                    <p className="mt-1 text-sm text-red-600">{errors.businessDescription}</p>
                                )}
                            </div>

                            {/* Terms and Conditions */}
                            <div className="bg-white rounded-xl p-4 border border-gray-200">
                                <h3 className="text-sm font-medium text-gray-900 mb-2">Terms and Conditions</h3>
                                <div className="text-xs text-gray-600 space-y-1">
                                    <p>• I agree to comply with all platform policies and guidelines</p>
                                    <p>• I understand that product listings will be subject to review</p>
                                    <p>• I agree to provide accurate business information</p>
                                    <p>• I accept the retailer commission structure</p>
                                </div>
                            </div>

                            {/* Submit Error */}
                            {errors.submit && (
                                <div className="bg-red-50 border border-red-200 rounded-xl p-3">
                                    <div className="flex items-center gap-2">
                                        <ExclamationTriangleIcon className="h-4 w-4 text-red-600" />
                                        <p className="text-red-700 text-sm">{errors.submit}</p>
                                    </div>
                                </div>
                            )}

                            {/* Submit Button */}
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full flex justify-center items-center py-3 px-6 bg-black text-white rounded-xl hover:bg-gray-800 disabled:opacity-50 transition-colors duration-200 gap-2"
                            >
                                {isSubmitting ? (
                                    <>
                                        <LoadingSpinner size="sm" className="border-white" />
                                        Submitting Application...
                                    </>
                                ) : (
                                    <>
                                        <DocumentArrowUpIcon className="h-4 w-4" />
                                        Submit Retailer Application
                                    </>
                                )}
                            </button>
                        </form>
                    </div>
                )}

                {/* Help Section */}
                <div className="bg-gray-50 rounded-xl p-6">
                    <div className="flex items-center gap-2 mb-4">
                        <InformationCircleIcon className="h-5 w-5 text-gray-600" />
                        <h2 className="text-lg font-semibold text-gray-900">Need Help?</h2>
                    </div>
                    <div className="grid md:grid-cols-2 gap-6 text-sm">
                        <div>
                            <h4 className="font-medium text-gray-900 mb-2">Application Process</h4>
                            <ul className="text-gray-600 space-y-1">
                                <li>• Applications are reviewed within 2-3 business days</li>
                                <li>• You&apos;ll receive an email notification of the decision</li>
                                <li>• Approved retailers can immediately start listing products</li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-medium text-gray-900 mb-2">Requirements</h4>
                            <ul className="text-gray-600 space-y-1">
                                <li>• Valid business information</li>
                                <li>• Compliance with platform policies</li>
                                <li>• Quality product standards</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
