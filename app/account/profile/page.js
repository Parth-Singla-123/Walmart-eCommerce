'use client'

import { useAccountData } from '@/hooks/useAccountData'
import { useState, useRef, useMemo, useCallback, memo } from 'react'
import {
    CameraIcon,
    CheckCircleIcon,
    ExclamationTriangleIcon
} from '@heroicons/react/24/outline'
import { validateProfile, formatPhoneNumber } from '@/lib/validations/userValidation'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import Image from 'next/image'

// Memoized form field component
const FormField = memo(({
    label,
    name,
    type = 'text',
    value,
    onChange,
    onBlur,
    error,
    placeholder,
    required = false,
    disabled = false
}) => {
    return (
        <div className="space-y-2">
            <label htmlFor={name} className="block text-sm font-medium text-gray-700">
                {label} {required && <span className="text-red-500">*</span>}
            </label>
            <input
                id={name}
                name={name}
                type={type}
                value={value}
                onChange={onChange}
                onBlur={onBlur}
                placeholder={placeholder}
                disabled={disabled}
                className={`w-full px-4 py-3 text-sm border-2 rounded-xl bg-white text-black placeholder:text-gray-500 focus:ring-2 focus:ring-black focus:border-black focus:outline-none transition-all duration-200 disabled:bg-gray-50 disabled:text-gray-500 ${error ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300'
                    }`}
            />
            {error && (
                <p className="text-sm text-red-600 flex items-center gap-1">
                    <ExclamationTriangleIcon className="h-4 w-4" />
                    {error}
                </p>
            )}
        </div>
    )
})

FormField.displayName = 'FormField'

// Memoized avatar upload component
const AvatarUpload = memo(({ currentAvatar, onAvatarChange, uploading, user }) => {
    const fileInputRef = useRef(null)
    const [preview, setPreview] = useState(currentAvatar)

    const handleFileSelect = useCallback((event) => {
        const file = event.target.files[0]
        if (file) {
            // Validate file type and size
            if (!file.type.startsWith('image/')) {
                alert('Please select an image file')
                return
            }

            if (file.size > 10 * 1024 * 1024) { // 10MB limit
                alert('File size must be less than 10MB')
                return
            }

            // Create preview immediately
            const reader = new FileReader()
            reader.onload = (e) => {
                setPreview(e.target.result)
            }
            reader.readAsDataURL(file)

            // Call parent handler with the file
            onAvatarChange(file)
        }
    }, [onAvatarChange])

    const handleUploadClick = useCallback(() => {
        fileInputRef.current?.click()
    }, [])

    // Get user initials for fallback
    const initials = useMemo(() => {
        if (user?.profile?.name) {
            return user.profile.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
        }
        if (user?.email) {
            return user.email[0].toUpperCase()
        }
        return 'U'
    }, [user])

    return (
        <div className="flex flex-col items-center space-y-4">
            <div className="relative">
                <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-gray-200 bg-gray-100">
                    {preview ? (
                        <Image
                            src={preview}
                            alt="Profile avatar"
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <div className="w-full h-full bg-black text-white flex items-center justify-center text-xl font-medium">
                            {initials}
                        </div>
                    )}
                </div>

                <button
                    type="button"
                    onClick={handleUploadClick}
                    disabled={uploading}
                    className="absolute bottom-0 right-0 p-2 bg-black text-white rounded-full hover:bg-gray-800 transition-colors duration-200 disabled:opacity-50"
                >
                    {uploading ? (
                        <LoadingSpinner size="sm" className="border-white" />
                    ) : (
                        <CameraIcon className="h-4 w-4" />
                    )}
                </button>
            </div>

            <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
            />

            <p className="text-xs text-gray-500 text-center max-w-xs">
                Click the camera icon to upload a new profile picture. Max file size: 10MB
            </p>
        </div>
    )
})

AvatarUpload.displayName = 'AvatarUpload'

// Memoized save button with loading state
const SaveButton = memo(({ loading, hasChanges, onClick }) => {
    return (
        <button
            type="submit"
            onClick={onClick}
            disabled={loading || !hasChanges}
            className="w-full sm:w-auto px-6 py-3 bg-black text-white rounded-xl hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2"
        >
            {loading ? (
                <>
                    <LoadingSpinner size="sm" className="border-white" />
                    Saving...
                </>
            ) : (
                <>
                    <CheckCircleIcon className="h-5 w-5" />
                    Save Changes
                </>
            )}
        </button>
    )
})

SaveButton.displayName = 'SaveButton'

// Memoized success message component
const SuccessMessage = memo(({ show, message }) => {
    if (!show) return null

    return (
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6">
            <div className="flex items-center gap-2">
                <CheckCircleIcon className="h-5 w-5 text-green-600" />
                <p className="text-green-700 font-medium">{message}</p>
            </div>
        </div>
    )
})

SuccessMessage.displayName = 'SuccessMessage'

export default function ProfilePage() {
    const { user, profileData, updateProfile, loading: dataLoading } = useAccountData()

    // Form state management
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        email: ''
    })

    // UI state
    const [errors, setErrors] = useState({})
    const [loading, setLoading] = useState(false)
    const [avatarUploading, setAvatarUploading] = useState(false)
    const [showSuccess, setShowSuccess] = useState(false)
    const [selectedAvatarUrl, setSelectedAvatarUrl] = useState(null)
    const [selectedAvatarPublicId, setSelectedAvatarPublicId] = useState(null)

    // Refs for form inputs that don't need immediate validation
    const nameRef = useRef(null)
    const phoneRef = useRef(null)

    // Initialize form data when user data loads
    useMemo(() => {
        if (profileData) {
            setFormData({
                name: profileData.name || '',
                phone: profileData.phone || '',
                email: profileData.email || ''
            })
        }
    }, [profileData])

    // Memoized validation to prevent unnecessary recalculations
    const validationResult = useMemo(() => {
        return validateProfile(formData)
    }, [formData])

    // Check if form has changes
    const hasChanges = useMemo(() => {
        if (!profileData) return false

        return (
            formData.name !== (profileData.name || '') ||
            formData.phone !== (profileData.phone || '') ||
            selectedAvatarUrl !== null
        )
    }, [formData, profileData, selectedAvatarUrl])

    // Handle input changes
    const handleInputChange = useCallback((e) => {
        const { name, value } = e.target

        setFormData(prev => ({
            ...prev,
            [name]: name === 'phone' ? formatPhoneNumber(value) : value
        }))

        // Clear error when user starts typing
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }))
        }
    }, [errors])

    // Handle input blur for validation
    const handleInputBlur = useCallback((e) => {
        const { name } = e.target

        if (!validationResult.isValid && validationResult.errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: validationResult.errors[name]
            }))
        }
    }, [validationResult])

    // Handle avatar change with Cloudinary upload
    const handleAvatarChange = useCallback(async (file) => {
        setAvatarUploading(true)
        setErrors(prev => ({ ...prev, avatar: '' })) // Clear any previous avatar errors

        try {
            // Upload directly to Cloudinary
            const formData = new FormData()
            formData.append('file', file)
            formData.append('upload_preset', 'profile-pictures') // Your Cloudinary upload preset
            formData.append('folder', 'profile-pictures')

            const response = await fetch(
                `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
                {
                    method: 'POST',
                    body: formData,
                }
            )

            if (!response.ok) {
                const errorData = await response.json()
                throw new Error(errorData.error?.message || 'Upload failed')
            }

            const result = await response.json()

            // Store the uploaded image URL and public_id
            setSelectedAvatarUrl(result.secure_url)
            setSelectedAvatarPublicId(result.public_id)

        } catch (error) {
            console.error('Avatar upload error:', error)
            setErrors(prev => ({
                ...prev,
                avatar: `Failed to upload image: ${error.message}`
            }))

            // Reset preview to current avatar on error
            const avatarUpload = document.querySelector('[alt="Profile avatar"]')
            if (avatarUpload && profileData?.avatar) {
                avatarUpload.src = profileData.avatar
            }
        } finally {
            setAvatarUploading(false)
        }
    }, [profileData])

    // Handle form submission
    const handleSubmit = useCallback(async (e) => {
        e.preventDefault()

        if (!validationResult.isValid) {
            setErrors(validationResult.errors)
            return
        }

        setLoading(true)
        setErrors({})

        try {
            const updateData = {
                profile: {
                    name: formData.name.trim(),
                    phone: formData.phone.trim(),
                    avatar: selectedAvatarUrl || profileData.avatar,
                    avatarPublicId: selectedAvatarPublicId || profileData.avatarPublicId
                }
            }

            const result = await updateProfile(updateData)

            if (result.success) {
                setShowSuccess(true)
                setSelectedAvatarUrl(null)
                setSelectedAvatarPublicId(null)

                // Hide success message after 3 seconds
                setTimeout(() => setShowSuccess(false), 3000)
            } else {
                setErrors({ submit: result.error || 'Failed to update profile' })
            }
        } catch (error) {
            console.error('Profile update error:', error)
            setErrors({ submit: 'An unexpected error occurred' })
        } finally {
            setLoading(false)
        }
    }, [formData, validationResult, updateProfile, profileData, selectedAvatarUrl, selectedAvatarPublicId])

    if (dataLoading) {
        return (
            <div className="h-full flex items-center justify-center">
                <LoadingSpinner size="lg" />
            </div>
        )
    }

    if (!user) {
        return (
            <div className="h-full flex items-center justify-center">
                <p className="text-gray-500">Unable to load profile data</p>
            </div>
        )
    }

    return (
        <div className="h-full w-full">
            {/* Header */}
            <div className="p-6 border-b border-gray-200">
                <h1 className="text-2xl font-bold text-gray-900">Profile Settings</h1>
                <p className="text-gray-600 mt-2">
                    Manage your personal information and preferences
                </p>
            </div>

            {/* Content */}
            <div className="p-6">
                <SuccessMessage
                    show={showSuccess}
                    message="Profile updated successfully!"
                />

                <form onSubmit={handleSubmit} className="space-y-8">
                    {/* Avatar Section */}
                    <div className="bg-gray-50 rounded-xl p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Profile Picture</h2>
                        <AvatarUpload
                            currentAvatar={selectedAvatarUrl || profileData.avatar}
                            onAvatarChange={handleAvatarChange}
                            uploading={avatarUploading}
                            user={user}
                        />
                        {errors.avatar && (
                            <div className="mt-4 bg-red-50 border border-red-200 rounded-xl p-3">
                                <div className="flex items-center gap-2">
                                    <ExclamationTriangleIcon className="h-4 w-4 text-red-600" />
                                    <p className="text-red-700 text-sm">{errors.avatar}</p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Personal Information */}
                    <div className="bg-gray-50 rounded-xl p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-6">Personal Information</h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <FormField
                                label="Full Name"
                                name="name"
                                value={formData.name}
                                onChange={handleInputChange}
                                onBlur={handleInputBlur}
                                error={errors.name}
                                placeholder="Enter your full name"
                                required
                            />

                            <FormField
                                label="Phone Number"
                                name="phone"
                                type="tel"
                                value={formData.phone}
                                onChange={handleInputChange}
                                onBlur={handleInputBlur}
                                error={errors.phone}
                                placeholder="99999-99999"
                            />

                            <FormField
                                label="Email Address"
                                name="email"
                                type="email"
                                value={formData.email}
                                onChange={handleInputChange}
                                onBlur={handleInputBlur}
                                error={errors.email}
                                placeholder="your.email@example.com"
                                disabled
                            />
                        </div>

                        {errors.submit && (
                            <div className="mt-4 bg-red-50 border border-red-200 rounded-xl p-4">
                                <div className="flex items-center gap-2">
                                    <ExclamationTriangleIcon className="h-5 w-5 text-red-600" />
                                    <p className="text-red-700">{errors.submit}</p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Save Button */}
                    <div className="flex justify-end">
                        <SaveButton
                            loading={loading}
                            hasChanges={hasChanges}
                            onClick={handleSubmit}
                        />
                    </div>
                </form>
            </div>
        </div>
    )
}
