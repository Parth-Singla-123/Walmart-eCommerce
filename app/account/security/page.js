'use client'

import { useState, useRef, useMemo, useCallback, useEffect, memo } from 'react'
import { useAccountData } from '@/hooks/useAccountData'
import { useUser } from '@/hooks/useUser'
import {
    ShieldCheckIcon,
    EyeIcon,
    KeyIcon,
    CheckCircleIcon,
    ExclamationTriangleIcon
} from '@heroicons/react/24/outline'
import LoadingSpinner from '@/components/ui/LoadingSpinner'

// Memoized Toggle Switch Component
const ToggleSwitch = memo(({ name, label, description, checked, onChange, disabled = false }) => {
    return (
        <div className="flex items-center justify-between py-4">
            <div className="flex-1">
                <label htmlFor={name} className="text-sm font-medium text-gray-900 cursor-pointer">
                    {label}
                </label>
                {description && (
                    <p className="text-xs text-gray-500 mt-1">{description}</p>
                )}
            </div>
            <button
                type="button"
                id={name}
                name={name}
                disabled={disabled}
                onClick={() => onChange(!checked)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 disabled:opacity-50 ${checked ? 'bg-black' : 'bg-gray-200'
                    }`}
            >
                <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${checked ? 'translate-x-6' : 'translate-x-1'
                        }`}
                />
            </button>
        </div>
    )
})
ToggleSwitch.displayName = 'ToggleSwitch'

const CustomRadioButton = memo(({ name, value, label, description, checked, onChange, disabled = false }) => {
    return (
        <label className={`flex items-start space-x-3 cursor-pointer group p-4 rounded-xl border-2 transition-all duration-200 ${checked
                ? 'border-black bg-gray-50'
                : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
            } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}>
            <div className="relative mt-0.5">
                <input
                    type="radio"
                    name={name}
                    value={value}
                    checked={checked}
                    onChange={onChange}
                    disabled={disabled}
                    className="sr-only"
                />
                <div className={`w-5 h-5 rounded-full border-2 transition-all duration-200 flex items-center justify-center ${checked
                        ? 'bg-black border-black'
                        : 'bg-white border-gray-300 group-hover:border-gray-400'
                    } ${!disabled && 'group-hover:shadow-sm'}`}>
                    {checked && (
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                    )}
                </div>
            </div>
            <div className="flex-1">
                <span className={`text-sm font-semibold block transition-colors duration-200 ${checked ? 'text-gray-900' : 'text-gray-700'
                    } ${!disabled && 'group-hover:text-gray-900'}`}>
                    {label}
                </span>
                {description && (
                    <span className={`text-xs mt-1 block transition-colors duration-200 ${checked ? 'text-gray-600' : 'text-gray-500'
                        }`}>
                        {description}
                    </span>
                )}
            </div>
        </label>
    )
})
CustomRadioButton.displayName = 'CustomRadioButton'

// Memoized Password Change Form Component
const PasswordChangeForm = memo(({ onSubmit, loading }) => {
    const [passwords, setPasswords] = useState({
        current: '',
        new: '',
        confirm: ''
    })
    const [errors, setErrors] = useState({})

    const handleSubmit = useCallback((e) => {
        e.preventDefault()
        const newErrors = {}

        if (!passwords.current) newErrors.current = 'Current password is required'
        if (!passwords.new) newErrors.new = 'New password is required'
        if (passwords.new.length < 6) newErrors.new = 'Password must be at least 6 characters'
        if (passwords.new !== passwords.confirm) newErrors.confirm = 'Passwords do not match'

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors)
            return
        }

        onSubmit(passwords)
        // Reset form on successful submission
        setPasswords({ current: '', new: '', confirm: '' })
        setErrors({})
    }, [passwords, onSubmit])

    const handleInputChange = useCallback((e) => {
        const { name, value } = e.target
        setPasswords(prev => ({ ...prev, [name]: value }))
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }))
        }
    }, [errors])

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Current Password</label>
                <input
                    type="password"
                    name="current"
                    value={passwords.current}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-black focus:border-black transition-all duration-200 ${errors.current ? 'border-red-300' : 'border-gray-300'
                        }`}
                />
                {errors.current && (
                    <p className="mt-1 text-sm text-red-600">{errors.current}</p>
                )}
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
                <input
                    type="password"
                    name="new"
                    value={passwords.new}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-black focus:border-black transition-all duration-200 ${errors.new ? 'border-red-300' : 'border-gray-300'
                        }`}
                />
                {errors.new && (
                    <p className="mt-1 text-sm text-red-600">{errors.new}</p>
                )}
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Confirm New Password</label>
                <input
                    type="password"
                    name="confirm"
                    value={passwords.confirm}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-black focus:border-black transition-all duration-200 ${errors.confirm ? 'border-red-300' : 'border-gray-300'
                        }`}
                />
                {errors.confirm && (
                    <p className="mt-1 text-sm text-red-600">{errors.confirm}</p>
                )}
            </div>

            <button
                type="submit"
                disabled={loading}
                className="w-full px-4 py-3 bg-black text-white rounded-xl hover:bg-gray-800 disabled:opacity-50 transition-colors duration-200 flex items-center justify-center gap-2"
            >
                {loading ? (
                    <>
                        <LoadingSpinner size="sm" className="border-white" />
                        Updating Password...
                    </>
                ) : (
                    <>
                        <KeyIcon className="h-4 w-4" />
                        Update Password
                    </>
                )}
            </button>
        </form>
    )
})
PasswordChangeForm.displayName = 'PasswordChangeForm'

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

// Main Security Page Component
export default function SecurityPage() {
    const { user, preferences: userPreferences, updatePreferences, preferencesLoading } = useAccountData()
    const { changePassword } = useUser()

    // Local privacy state
    const [privacy, setPrivacy] = useState({
        showEmail: false,
        profileVisibility: 'public'
    })

    // UI state
    const [loading, setLoading] = useState(false)
    const [passwordLoading, setPasswordLoading] = useState(false)
    const [errors, setErrors] = useState({})
    const [success, setSuccess] = useState({ show: false, message: '' })

    // Initialize privacy settings from user data
    useEffect(() => {
        if (userPreferences?.privacy) {
            setPrivacy(userPreferences.privacy)
        }
    }, [userPreferences])

    // Check if there are unsaved privacy changes
    const hasPrivacyChanges = useMemo(() => {
        if (!userPreferences?.privacy) return false
        return JSON.stringify(privacy) !== JSON.stringify(userPreferences.privacy)
    }, [privacy, userPreferences])

    // Handle privacy setting changes
    const handlePrivacyChange = useCallback((field, value) => {
        setPrivacy(prev => ({
            ...prev,
            [field]: value
        }))
    }, [])

    // Handle save privacy changes
    const handleSavePrivacyChanges = useCallback(async () => {
        setLoading(true)
        setErrors({})

        try {
            const updatedPreferences = {
                ...userPreferences,
                privacy
            }

            const result = await updatePreferences(updatedPreferences)

            if (result.success) {
                setSuccess({ show: true, message: 'Privacy settings updated successfully!' })
            } else {
                setErrors({ privacy: result.error })
            }
        } catch (error) {
            setErrors({ privacy: 'Failed to update privacy settings' })
        } finally {
            setLoading(false)
        }
    }, [privacy, userPreferences, updatePreferences])

    // Handle discard privacy changes
    const handleDiscardPrivacyChanges = useCallback(() => {
        if (userPreferences?.privacy) {
            setPrivacy(userPreferences.privacy)
        }
        setErrors({})
    }, [userPreferences])

    // Handle password change
    const handlePasswordChange = useCallback(async (passwordData) => {
        setPasswordLoading(true)
        setErrors({})

        try {
            const result = await changePassword(passwordData.current, passwordData.new)

            if (result.success) {
                setSuccess({ show: true, message: 'Password updated successfully!' })
            } else {
                setErrors({ password: result.error })
            }
        } catch (error) {
            setErrors({ password: 'Failed to update password' })
        } finally {
            setPasswordLoading(false)
        }
    }, [changePassword])

    if (preferencesLoading) {
        return (
            <div className="h-full flex items-center justify-center">
                <LoadingSpinner size="lg" />
            </div>
        )
    }

    return (
        <div className="h-full w-full">
            {/* Header */}
            <div className="p-6 rounded-xl border-b border-gray-200 bg-white">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <ShieldCheckIcon className="h-8 w-8 text-gray-600" />
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Security & Privacy</h1>
                            <p className="text-gray-600 mt-1">Manage your account security and privacy settings</p>
                        </div>
                    </div>

                    {/* Unsaved Changes Indicator */}
                    {hasPrivacyChanges && (
                        <div className="text-sm text-amber-600 bg-amber-50 px-3 py-1 rounded-lg border border-amber-200">
                            Unsaved changes
                        </div>
                    )}
                </div>
            </div>

            {/* Content */}
            <div className="p-6 space-y-8">
                <SuccessMessage
                    show={success.show}
                    message={success.message}
                    onClose={() => setSuccess({ show: false, message: '' })}
                />

                {/* Privacy Settings */}
                <div className="bg-gray-50 rounded-xl p-6">
                    <div className="flex items-center gap-2 mb-6">
                        <EyeIcon className="h-5 w-5 text-gray-600" />
                        <h2 className="text-lg font-semibold text-gray-900">Privacy Settings</h2>
                    </div>

                    <div className="space-y-6">
                        <ToggleSwitch
                            name="showEmail"
                            label="Show Email Address"
                            description="Display your email address in your public profile"
                            checked={privacy.showEmail}
                            onChange={(checked) => handlePrivacyChange('showEmail', checked)}
                            disabled={loading}
                        />

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-4">
                                Profile Visibility
                            </label>
                            <div className="space-y-3">
                                <CustomRadioButton
                                    name="profileVisibility"
                                    value="public"
                                    label="Public Profile"
                                    description="Anyone can view your profile and basic information"
                                    checked={privacy.profileVisibility === 'public'}
                                    onChange={(e) => handlePrivacyChange('profileVisibility', e.target.value)}
                                    disabled={loading}
                                />
                                <CustomRadioButton
                                    name="profileVisibility"
                                    value="private"
                                    label="Private Profile"
                                    description="Only you can view your profile information"
                                    checked={privacy.profileVisibility === 'private'}
                                    onChange={(e) => handlePrivacyChange('profileVisibility', e.target.value)}
                                    disabled={loading}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Privacy Save/Discard Buttons */}
                    {hasPrivacyChanges && (
                        <div className="mt-6 pt-6 border-t border-gray-200">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="text-sm font-medium text-gray-900">Unsaved Privacy Changes</h3>
                                    <p className="text-xs text-gray-500 mt-1">You have unsaved changes to your privacy settings</p>
                                </div>
                                <div className="flex gap-3">
                                    <button
                                        onClick={handleDiscardPrivacyChanges}
                                        disabled={loading}
                                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 disabled:opacity-50 transition-colors duration-200"
                                    >
                                        Discard Changes
                                    </button>
                                    <button
                                        onClick={handleSavePrivacyChanges}
                                        disabled={loading}
                                        className="px-6 py-2 text-sm font-medium text-white bg-black rounded-lg hover:bg-gray-800 disabled:opacity-50 transition-colors duration-200 flex items-center gap-2"
                                    >
                                        {loading ? (
                                            <>
                                                <LoadingSpinner size="sm" className="border-white" />
                                                Saving...
                                            </>
                                        ) : (
                                            <>
                                                <CheckCircleIcon className="h-4 w-4" />
                                                Save Changes
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Privacy Error */}
                    {errors.privacy && (
                        <div className="mt-4 bg-red-50 border border-red-200 rounded-xl p-3">
                            <div className="flex items-center gap-2">
                                <ExclamationTriangleIcon className="h-4 w-4 text-red-600" />
                                <p className="text-red-700 text-sm">{errors.privacy}</p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Password Change */}
                <div className="bg-gray-50 rounded-xl p-6">
                    <div className="flex items-center gap-2 mb-6">
                        <KeyIcon className="h-5 w-5 text-gray-600" />
                        <h2 className="text-lg font-semibold text-gray-900">Change Password</h2>
                    </div>

                    <div className="max-w-md">
                        <p className="text-sm text-gray-600 mb-4">
                            Update your password to keep your account secure. Make sure to use a strong password.
                        </p>
                        <PasswordChangeForm onSubmit={handlePasswordChange} loading={passwordLoading} />
                        {errors.password && (
                            <div className="mt-4 bg-red-50 border border-red-200 rounded-xl p-3">
                                <div className="flex items-center gap-2">
                                    <ExclamationTriangleIcon className="h-4 w-4 text-red-600" />
                                    <p className="text-red-700 text-sm">{errors.password}</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
