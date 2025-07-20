'use client'

import { useState, useRef, useMemo, useCallback, useEffect, memo } from 'react'
import { useAccountData } from '@/hooks/useAccountData'
import {
    AdjustmentsHorizontalIcon,
    BellIcon,
    CurrencyDollarIcon,
    CheckCircleIcon,
    ExclamationTriangleIcon,
    CheckIcon
} from '@heroicons/react/24/outline'
import { validatePreferences } from '@/lib/validations/userValidation'
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

// Memoized Price Range Slider Component
const PriceRangeSlider = memo(({ min, max, onChange, disabled = false }) => {
    return (
        <div className="space-y-4">
            <div className="flex justify-between text-sm text-gray-600">
                <span>₹{min.toLocaleString()}</span>
                <span>₹{max.toLocaleString()}</span>
            </div>
            <div className="space-y-3">
                <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Minimum Price</label>
                    <input
                        type="range"
                        min="0"
                        max="100000"
                        step="1000"
                        value={min}
                        onChange={(e) => onChange(parseInt(e.target.value), max)}
                        disabled={disabled}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                    />
                </div>
                <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Maximum Price</label>
                    <input
                        type="range"
                        min="1000"
                        max="200000"
                        step="1000"
                        value={max}
                        onChange={(e) => onChange(min, parseInt(e.target.value))}
                        disabled={disabled}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                    />
                </div>
            </div>
        </div>
    )
})
PriceRangeSlider.displayName = 'PriceRangeSlider'

const CustomCheckbox = memo(({ name, label, checked, onChange, disabled = false }) => {
    return (
        <label className={`flex items-center space-x-3 cursor-pointer group ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}>
            <div className="relative">
                <input
                    type="checkbox"
                    name={name}
                    checked={checked}
                    onChange={onChange}
                    disabled={disabled}
                    className="sr-only"
                />
                <div className={`w-5 h-5 rounded-lg border-2 transition-all duration-200 flex items-center justify-center ${
                    checked 
                        ? 'bg-black border-black' 
                        : 'bg-white border-gray-300 group-hover:border-gray-400'
                } ${!disabled && 'group-hover:shadow-sm'}`}>
                    {checked && (
                        <CheckIcon className="h-3 w-3 text-white" strokeWidth={3} />
                    )}
                </div>
            </div>
            <span className={`text-sm font-medium transition-colors duration-200 ${
                checked ? 'text-gray-900' : 'text-gray-700'
            } ${!disabled && 'group-hover:text-gray-900'}`}>
                {label}
            </span>
        </label>
    )
})
CustomCheckbox.displayName = 'CustomCheckbox'

// Updated Category Selector Component with enhanced styling
const CategorySelector = memo(({ categories, selectedCategories, onChange, disabled = false }) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {categories.map((category) => (
                <CustomCheckbox
                    key={category}
                    name={`category-${category}`}
                    label={category}
                    checked={selectedCategories.includes(category)}
                    onChange={(e) => {
                        if (e.target.checked) {
                            onChange([...selectedCategories, category])
                        } else {
                            onChange(selectedCategories.filter(c => c !== category))
                        }
                    }}
                    disabled={disabled}
                />
            ))}
        </div>
    )
})
CategorySelector.displayName = 'CategorySelector'

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

// Main Preferences Page Component
export default function PreferencesPage() {
    const { user, preferences: userPreferences, updatePreferences, preferencesLoading } = useAccountData()

    // Local form state (not auto-saved)
    const [preferences, setPreferences] = useState({
        categories: [],
        priceRange: { min: 0, max: 50000 },
        currency: 'INR',
        notifications: {
            email: true,
            push: true,
            orderUpdates: true,
            deals: true,
            newArrivals: false
        },
        privacy: {
            showEmail: false,
            profileVisibility: 'public'
        }
    })

    // UI state
    const [loading, setLoading] = useState(false)
    const [errors, setErrors] = useState({})
    const [success, setSuccess] = useState({ show: false, message: '' })

    // Available categories
    const availableCategories = useMemo(() => [
        'Electronics', 'Fashion', 'Home & Garden', 'Sports', 'Books', 'Beauty',
        'Automotive', 'Health', 'Toys', 'Grocery', 'Art', 'Music'
    ], [])

    // Initialize preferences from user data
    useEffect(() => {
        if (userPreferences) {
            setPreferences(prev => ({
                ...prev,
                categories: userPreferences.categories || [],
                priceRange: userPreferences.priceRange || { min: 0, max: 50000 },
                currency: userPreferences.currency || 'INR',
                notifications: userPreferences.notifications || {
                    email: true,
                    push: true,
                    orderUpdates: true,
                    deals: true,
                    newArrivals: false
                }
            }))
        }
    }, [userPreferences])

    // Check if there are unsaved changes
    const hasChanges = useMemo(() => {
        if (!userPreferences) return false

        return (
            JSON.stringify(preferences.categories) !== JSON.stringify(userPreferences.categories || []) ||
            JSON.stringify(preferences.priceRange) !== JSON.stringify(userPreferences.priceRange || { min: 0, max: 50000 }) ||
            preferences.currency !== (userPreferences.currency || 'INR') ||
            JSON.stringify(preferences.notifications) !== JSON.stringify(userPreferences.notifications || {
                email: true,
                push: true,
                orderUpdates: true,
                deals: true,
                newArrivals: false
            }) ||
            JSON.stringify(preferences.privacy) !== JSON.stringify(userPreferences.privacy || {
                showEmail: false,
                profileVisibility: 'public'
            })
        )
    }, [preferences, userPreferences])

    // Handle local preference changes (no API call)
    const handlePreferenceChange = useCallback((section, data) => {
        setPreferences(prev => ({
            ...prev,
            [section]: data
        }))
    }, [])

    // Handle save all changes
    const handleSaveChanges = useCallback(async () => {
        setLoading(true)
        setErrors({})

        try {
            const validation = validatePreferences(preferences)
            if (!validation.isValid) {
                setErrors(validation.errors)
                return
            }

            const result = await updatePreferences(preferences)

            if (result.success) {
                setSuccess({ show: true, message: 'Preferences saved successfully!' })
            } else {
                setErrors({ submit: result.error })
            }
        } catch (error) {
            setErrors({ submit: 'Failed to save preferences' })
        } finally {
            setLoading(false)
        }
    }, [preferences, updatePreferences])

    // Handle discard changes
    const handleDiscardChanges = useCallback(() => {
        if (userPreferences) {
            setPreferences(prev => ({
                ...prev,
                categories: userPreferences.categories || [],
                priceRange: userPreferences.priceRange || { min: 0, max: 50000 },
                currency: userPreferences.currency || 'INR',
                notifications: userPreferences.notifications || {
                    email: true,
                    push: true,
                    orderUpdates: true,
                    deals: true,
                    newArrivals: false
                }
            }))
        }
        setErrors({})
    }, [userPreferences])

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
            <div className="p-6 border-b border-gray-200 bg-white">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <AdjustmentsHorizontalIcon className="h-8 w-8 text-gray-600" />
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Preferences</h1>
                            <p className="text-gray-600 mt-1">Customize your shopping experience</p>
                        </div>
                    </div>

                    {/* Unsaved Changes Indicator */}
                    {hasChanges && (
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

                {/* Shopping Preferences */}
                <div className="bg-gray-50 rounded-xl p-6">
                    <div className="flex items-center gap-2 mb-6">
                        <CurrencyDollarIcon className="h-5 w-5 text-gray-600" />
                        <h2 className="text-lg font-semibold text-gray-900">Shopping Preferences</h2>
                    </div>

                    <div className="space-y-6">
                        {/* Currency */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Currency
                            </label>
                            <select
                                value={preferences.currency}
                                onChange={(e) => handlePreferenceChange('currency', e.target.value)}
                                disabled={loading}
                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-black focus:border-black transition-all duration-200"
                            >
                                <option value="INR">₹ Indian Rupee (INR)</option>
                                <option value="USD">$ US Dollar (USD)</option>
                                <option value="EUR">€ Euro (EUR)</option>
                            </select>
                        </div>

                        {/* Price Range */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-4">
                                Price Range
                            </label>
                            <PriceRangeSlider
                                min={preferences.priceRange.min}
                                max={preferences.priceRange.max}
                                onChange={(min, max) => handlePreferenceChange('priceRange', { min, max })}
                                disabled={loading}
                            />
                        </div>

                        {/* Categories */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-4">
                                Preferred Categories
                            </label>
                            <CategorySelector
                                categories={availableCategories}
                                selectedCategories={preferences.categories}
                                onChange={(categories) => handlePreferenceChange('categories', categories)}
                                disabled={loading}
                            />
                        </div>
                    </div>
                </div>

                {/* Notification Settings */}
                <div className="bg-gray-50 rounded-xl p-6">
                    <div className="flex items-center gap-2 mb-6">
                        <BellIcon className="h-5 w-5 text-gray-600" />
                        <h2 className="text-lg font-semibold text-gray-900">Notification Settings</h2>
                    </div>

                    <div className="space-y-1 divide-y divide-gray-200">
                        <ToggleSwitch
                            name="email"
                            label="Email Notifications"
                            description="Receive important updates via email"
                            checked={preferences.notifications.email}
                            onChange={(checked) => handlePreferenceChange('notifications', {
                                ...preferences.notifications,
                                email: checked
                            })}
                            disabled={loading}
                        />
                        <ToggleSwitch
                            name="orderUpdates"
                            label="Order Updates"
                            description="Get notified about order status changes"
                            checked={preferences.notifications.orderUpdates}
                            onChange={(checked) => handlePreferenceChange('notifications', {
                                ...preferences.notifications,
                                orderUpdates: checked
                            })}
                            disabled={loading}
                        />
                        <ToggleSwitch
                            name="deals"
                            label="Deals & Offers"
                            description="Receive notifications about special deals"
                            checked={preferences.notifications.deals}
                            onChange={(checked) => handlePreferenceChange('notifications', {
                                ...preferences.notifications,
                                deals: checked
                            })}
                            disabled={loading}
                        />
                        <ToggleSwitch
                            name="newArrivals"
                            label="New Arrivals"
                            description="Get notified about new products"
                            checked={preferences.notifications.newArrivals}
                            onChange={(checked) => handlePreferenceChange('notifications', {
                                ...preferences.notifications,
                                newArrivals: checked
                            })}
                            disabled={loading}
                        />
                    </div>
                </div>

                {/* Error Display */}
                {errors.submit && (
                    <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                        <div className="flex items-center gap-2">
                            <ExclamationTriangleIcon className="h-5 w-5 text-red-600" />
                            <p className="text-red-700 font-medium">{errors.submit}</p>
                        </div>
                    </div>
                )}

                {/* Save/Discard Buttons */}
                {hasChanges && (
                    <div className="bg-white border border-gray-200 rounded-xl p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-sm font-medium text-gray-900">Unsaved Changes</h3>
                                <p className="text-xs text-gray-500 mt-1">You have unsaved changes to your preferences</p>
                            </div>
                            <div className="flex gap-3">
                                <button
                                    onClick={handleDiscardChanges}
                                    disabled={loading}
                                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 disabled:opacity-50 transition-colors duration-200"
                                >
                                    Discard Changes
                                </button>
                                <button
                                    onClick={handleSaveChanges}
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
            </div>
        </div>
    )
}
