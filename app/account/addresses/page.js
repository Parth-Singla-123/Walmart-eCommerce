'use client'

import { useState, useRef, useMemo, useCallback, useEffect, memo } from 'react'
import { useAddresses } from '@/hooks/useAddresses'
import {
    PlusIcon,
    MapPinIcon,
    PencilIcon,
    TrashIcon,
    CheckIcon,
    ExclamationTriangleIcon
} from '@heroicons/react/24/outline'
import { validateAddress, validatezipCode } from '@/lib/validations/userValidation'
import { INDIAN_STATES, ADDRESS_TYPES } from '@/utils/addressUtils'
import LoadingSpinner from '@/components/ui/LoadingSpinner'

// Enhanced address card component with improved styling
// Enhanced address card component with improved text styling
// Simplified address card component with cleaner text styling
const AddressCard = memo(({ address, isDefault, onEdit, onDelete, onSetDefault }) => {
    const [actionLoading, setActionLoading] = useState(null)

    const handleAction = useCallback(async (action, actionFn) => {
        setActionLoading(action)
        await actionFn()
        setActionLoading(null)
    }, [])

    const addressType = useMemo(() => {
        return ADDRESS_TYPES.find(type => type.value === address.type) || ADDRESS_TYPES[0]
    }, [address.type])

    return (
        <div className={`group relative bg-white rounded-2xl shadow-sm border transition-all duration-300 hover:shadow-lg ${isDefault
                ? 'border-emerald-200 bg-gradient-to-br from-emerald-50 to-white ring-1 ring-emerald-100'
                : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
            }`}>

            {/* Default Address Indicator */}
            {isDefault && (
                <div className="absolute -top-2 -right-2 z-10">
                    <div className="bg-emerald-500 text-white px-3 py-1 rounded-full text-xs font-semibold shadow-sm">
                        <CheckIcon className="h-3 w-3 inline mr-1" />
                        Default
                    </div>
                </div>
            )}

            <div className="p-6">
                {/* Header Section */}
                <div className="flex items-start justify-between mb-5">
                    <div className="flex items-center gap-3">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl ${isDefault
                                ? 'bg-emerald-100 text-emerald-600'
                                : 'bg-gray-100 text-gray-600'
                            }`}>
                            {addressType.icon}
                        </div>
                        <div>
                            <h3 className={`font-bold text-lg leading-tight ${isDefault ? 'text-emerald-900' : 'text-gray-900'
                                }`}>
                                {address.label || addressType.label}
                            </h3>
                            <p className={`text-xs font-medium uppercase tracking-wide mt-1 ${isDefault ? 'text-emerald-600' : 'text-gray-500'
                                }`}>
                                {addressType.description}
                            </p>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        <button
                            onClick={() => onEdit(address)}
                            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                            title="Edit address"
                        >
                            <PencilIcon className="h-4 w-4" />
                        </button>
                        <button
                            onClick={() => handleAction('delete', () => onDelete(address._id))}
                            disabled={actionLoading === 'delete'}
                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200 disabled:opacity-50"
                            title="Delete address"
                        >
                            {actionLoading === 'delete' ? (
                                <LoadingSpinner size="sm" className="border-red-500" />
                            ) : (
                                <TrashIcon className="h-4 w-4" />
                            )}
                        </button>
                    </div>
                </div>

                {/* Address Details with Simplified Typography */}
                <div className="space-y-3 mb-6">
                    <div className="flex items-start gap-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center mt-0.5 flex-shrink-0 ${isDefault
                                ? 'bg-emerald-100 text-emerald-600'
                                : 'bg-gray-100 text-gray-500'
                            }`}>
                            <MapPinIcon className="h-4 w-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                            {/* Street Address */}
                            <div className="mb-3">
                                <p className="text-sm font-medium text-gray-600 uppercase tracking-wide mb-1">
                                    Street Address
                                </p>
                                <p className="text-base font-semibold text-gray-900 leading-relaxed">
                                    {address.street}
                                </p>
                            </div>

                            {/* City and State */}
                            <div>
                                <p className="text-sm font-medium text-gray-600 uppercase tracking-wide mb-1">
                                    Location
                                </p>
                                <div className="flex items-center gap-2 text-gray-700">
                                    <span className="font-semibold text-gray-900">
                                        {address.city}
                                    </span>
                                    <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
                                    <span className="font-medium text-gray-700">
                                        {address.state}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Set Default Button */}
                {!isDefault && (
                    <button
                        onClick={() => handleAction('setDefault', () => onSetDefault(address._id))}
                        disabled={actionLoading === 'setDefault'}
                        className="w-full flex items-center justify-center gap-2 px-4 py-3 text-sm font-semibold text-gray-700 bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200 rounded-xl hover:from-gray-100 hover:to-gray-200 hover:border-gray-300 disabled:opacity-50 transition-all duration-200 group"
                    >
                        {actionLoading === 'setDefault' ? (
                            <>
                                <LoadingSpinner size="sm" className="border-gray-600" />
                                <span>Setting as default...</span>
                            </>
                        ) : (
                            <>
                                <CheckIcon className="h-4 w-4 group-hover:text-emerald-600 transition-colors duration-200" />
                                <span>Set as Default Address</span>
                            </>
                        )}
                    </button>
                )}
            </div>
        </div>
    )
})

AddressCard.displayName = 'AddressCard'

// Enhanced address form component
const AddressForm = memo(({ address, onSave, onCancel, loading }) => {
    const [formData, setFormData] = useState({
        type: 'home',
        label: '',
        street: '',
        city: '',
        state: '',
        zipCode: '',
        isDefault: false
    })

    const [errors, setErrors] = useState({})
    const [zipCodeValidating, setzipCodeValidating] = useState(false)

    // Form refs
    const streetRef = useRef(null)
    const cityRef = useRef(null)
    const zipCodeRef = useRef(null)

    // Initialize form data
    useEffect(() => {
        if (address) {
            setFormData({
                type: address.type || 'home',
                label: address.label || '',
                street: address.street || '',
                city: address.city || '',
                state: address.state || '',
                zipCode: address.zipCode || '',
                isDefault: address.isDefault || false
            })
        }
    }, [address])

    // Validate ZIP code on change
    const handlezipCodeChange = useCallback(async (zipCode) => {
        if (zipCode.length === 6) {
            setzipCodeValidating(true)
            const validation = validatezipCode(zipCode)

            if (!validation.isValid) {
                setErrors(prev => ({ ...prev, zipCode: validation.error }))
            } else {
                setErrors(prev => ({ ...prev, zipCode: '' }))
            }
            setzipCodeValidating(false)
        }
    }, [])

    const handleInputChange = useCallback((e) => {
        const { name, value, type, checked } = e.target

        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }))

        // Clear error when user starts typing
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }))
        }

        // Validate ZIP code
        if (name === 'zipCode') {
            handlezipCodeChange(value)
        }
    }, [errors, handlezipCodeChange])

    const handleSubmit = useCallback(async (e) => {
        e.preventDefault()

        const validation = validateAddress(formData)
        if (!validation.isValid) {
            setErrors(validation.errors)
            return
        }

        const result = await onSave(formData)
        if (result.success) {
            onCancel() // Close form
        } else {
            setErrors({ submit: result.error })
        }
    }, [formData, onSave, onCancel])

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-6">
                        {address ? 'Edit Address' : 'Add New Address'}
                    </h2>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* Address Type */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Address Type
                            </label>
                            <select
                                name="type"
                                value={formData.type}
                                onChange={handleInputChange}
                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-black focus:border-black transition-all duration-200"
                            >
                                {ADDRESS_TYPES.map(type => (
                                    <option key={type.value} value={type.value}>
                                        {type.icon} {type.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Label */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Label (Optional)
                            </label>
                            <input
                                type="text"
                                name="label"
                                value={formData.label}
                                onChange={handleInputChange}
                                placeholder="e.g., Home, Office, etc."
                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-black focus:border-black transition-all duration-200"
                            />
                        </div>

                        {/* Street Address */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Street Address *
                            </label>
                            <textarea
                                ref={streetRef}
                                name="street"
                                value={formData.street}
                                onChange={handleInputChange}
                                placeholder="House/Flat No., Building Name, Street, Area"
                                required
                                rows={3}
                                className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-black focus:border-black resize-none transition-all duration-200 ${errors.street ? 'border-red-300 bg-red-50' : 'border-gray-300'
                                    }`}
                            />
                            {errors.street && (
                                <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                                    <ExclamationTriangleIcon className="h-4 w-4" />
                                    {errors.street}
                                </p>
                            )}
                        </div>

                        {/* City and State Row */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* City */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    City *
                                </label>
                                <input
                                    ref={cityRef}
                                    type="text"
                                    name="city"
                                    value={formData.city}
                                    onChange={handleInputChange}
                                    placeholder="Enter city name"
                                    required
                                    className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-black focus:border-black transition-all duration-200 ${errors.city ? 'border-red-300 bg-red-50' : 'border-gray-300'
                                        }`}
                                />
                                {errors.city && (
                                    <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                                        <ExclamationTriangleIcon className="h-4 w-4" />
                                        {errors.city}
                                    </p>
                                )}
                            </div>

                            {/* State */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    State *
                                </label>
                                <select
                                    name="state"
                                    value={formData.state}
                                    onChange={handleInputChange}
                                    required
                                    className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-black focus:border-black transition-all duration-200 ${errors.state ? 'border-red-300 bg-red-50' : 'border-gray-300'
                                        }`}
                                >
                                    <option value="">Select State</option>
                                    {INDIAN_STATES.map(state => (
                                        <option key={state.value} value={state.value}>
                                            {state.label}
                                        </option>
                                    ))}
                                </select>
                                {errors.state && (
                                    <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                                        <ExclamationTriangleIcon className="h-4 w-4" />
                                        {errors.state}
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* ZIP Code */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                ZIP Code *
                            </label>
                            <div className="relative">
                                <input
                                    ref={zipCodeRef}
                                    type="text"
                                    name="zipCode"
                                    value={formData.zipCode}
                                    onChange={handleInputChange}
                                    placeholder="6-digit ZIP code"
                                    maxLength={6}
                                    required
                                    className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-black focus:border-black transition-all duration-200 ${errors.zipCode ? 'border-red-300 bg-red-50' : 'border-gray-300'
                                        }`}
                                />
                                {zipCodeValidating && (
                                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                                        <LoadingSpinner size="sm" />
                                    </div>
                                )}
                            </div>
                            {errors.zipCode && (
                                <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                                    <ExclamationTriangleIcon className="h-4 w-4" />
                                    {errors.zipCode}
                                </p>
                            )}
                        </div>

                        {/* Default Address */}
                        <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                            <input
                                type="checkbox"
                                name="isDefault"
                                checked={formData.isDefault}
                                onChange={handleInputChange}
                                className="h-4 w-4 text-black focus:ring-black border-gray-300 rounded"
                            />
                            <label className="text-sm font-medium text-gray-700">
                                Set as default address
                            </label>
                        </div>

                        {/* Submit Error */}
                        {errors.submit && (
                            <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                                <div className="flex items-center gap-2">
                                    <ExclamationTriangleIcon className="h-5 w-5 text-red-600" />
                                    <p className="text-sm text-red-700 font-medium">{errors.submit}</p>
                                </div>
                            </div>
                        )}

                        {/* Buttons */}
                        <div className="flex gap-3 pt-4">
                            <button
                                type="button"
                                onClick={onCancel}
                                className="flex-1 px-6 py-3 text-sm font-semibold text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors duration-200"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="flex-1 px-6 py-3 text-sm font-semibold text-white bg-black rounded-xl hover:bg-gray-800 disabled:opacity-50 transition-colors duration-200 flex items-center justify-center gap-2"
                            >
                                {loading ? (
                                    <>
                                        <LoadingSpinner size="sm" className="border-white" />
                                        Saving...
                                    </>
                                ) : (
                                    'Save Address'
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
})

AddressForm.displayName = 'AddressForm'

export default function AddressesPage() {
    const { addresses, defaultAddress, loading, error, addAddress, updateAddress, deleteAddress, setDefaultAddress } = useAddresses()

    const [showForm, setShowForm] = useState(false)
    const [editingAddress, setEditingAddress] = useState(null)
    const [formLoading, setFormLoading] = useState(false)
    const [actionMessage, setActionMessage] = useState(null)

    // Handle add address
    const handleAddAddress = useCallback(() => {
        setEditingAddress(null)
        setShowForm(true)
    }, [])

    // Handle edit address
    const handleEditAddress = useCallback((address) => {
        setEditingAddress(address)
        setShowForm(true)
    }, [])

    // Handle save address
    const handleSaveAddress = useCallback(async (addressData) => {
        setFormLoading(true)

        try {
            let result
            if (editingAddress) {
                result = await updateAddress(editingAddress._id, addressData)
            } else {
                result = await addAddress(addressData)
            }

            if (result.success) {
                setActionMessage({
                    type: 'success',
                    text: editingAddress ? 'Address updated successfully' : 'Address added successfully'
                })
                setShowForm(false)
                setEditingAddress(null)
            }

            return result
        } catch (error) {
            return { success: false, error: error.message }
        } finally {
            setFormLoading(false)
        }
    }, [editingAddress, addAddress, updateAddress])

    // Handle delete address
    const handleDeleteAddress = useCallback(async (addressId) => {
        if (window.confirm('Are you sure you want to delete this address?')) {
            const result = await deleteAddress(addressId)
            if (result.success) {
                setActionMessage({ type: 'success', text: 'Address deleted successfully' })
            } else {
                setActionMessage({ type: 'error', text: result.error })
            }
        }
    }, [deleteAddress])

    // Handle set default address
    const handleSetDefaultAddress = useCallback(async (addressId) => {
        const result = await setDefaultAddress(addressId)
        if (result.success) {
            setActionMessage({ type: 'success', text: 'Default address updated' })
        } else {
            setActionMessage({ type: 'error', text: result.error })
        }
    }, [setDefaultAddress])

    // Clear action messages
    useEffect(() => {
        if (actionMessage) {
            const timer = setTimeout(() => setActionMessage(null), 5000)
            return () => clearTimeout(timer)
        }
    }, [actionMessage])

    return (
        <div className="h-full w-full">
            {/* Header */}
            <div className="p-6 border-b border-gray-200 bg-white">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Manage Addresses</h1>
                        <p className="text-gray-600 mt-1">
                            Add and manage your delivery addresses
                        </p>
                    </div>
                    <button
                        onClick={handleAddAddress}
                        className="flex items-center gap-2 px-6 py-3 bg-black text-white rounded-xl hover:bg-gray-800 transition-colors duration-200 shadow-sm"
                    >
                        <PlusIcon className="h-4 w-4" />
                        Add Address
                    </button>
                </div>
            </div>

            {/* Action Message */}
            {actionMessage && (
                <div className={`m-6 p-4 rounded-xl border ${actionMessage.type === 'success'
                    ? 'bg-emerald-50 border-emerald-200'
                    : 'bg-red-50 border-red-200'
                    }`}>
                    <p className={`text-sm font-medium ${actionMessage.type === 'success' ? 'text-emerald-700' : 'text-red-700'
                        }`}>
                        {actionMessage.text}
                    </p>
                </div>
            )}

            {/* Content */}
            <div className="p-6">
                {loading ? (
                    <div className="flex items-center justify-center py-16">
                        <LoadingSpinner size="lg" />
                    </div>
                ) : error ? (
                    <div className="text-center py-16">
                        <ExclamationTriangleIcon className="h-12 w-12 text-red-500 mx-auto mb-4" />
                        <p className="text-red-600 font-semibold">Error loading addresses</p>
                        <p className="text-gray-500 text-sm mt-2">{error}</p>
                    </div>
                ) : addresses.length === 0 ? (
                    <div className="text-center py-16">
                        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <MapPinIcon className="h-10 w-10 text-gray-400" />
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">No addresses saved</h3>
                        <p className="text-gray-500 mb-8 max-w-md mx-auto">
                            Add your first address to get started with deliveries
                        </p>
                        <button
                            onClick={handleAddAddress}
                            className="inline-flex items-center gap-2 px-6 py-3 bg-black text-white rounded-xl hover:bg-gray-800 transition-colors duration-200"
                        >
                            <PlusIcon className="h-4 w-4" />
                            Add Your First Address
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {addresses.map((address) => (
                            <AddressCard
                                key={address._id}
                                address={address}
                                isDefault={defaultAddress?._id === address._id}
                                onEdit={handleEditAddress}
                                onDelete={handleDeleteAddress}
                                onSetDefault={handleSetDefaultAddress}
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* Address Form Modal */}
            {showForm && (
                <AddressForm
                    address={editingAddress}
                    onSave={handleSaveAddress}
                    onCancel={() => {
                        setShowForm(false)
                        setEditingAddress(null)
                    }}
                    loading={formLoading}
                />
            )}
        </div>
    )
}
