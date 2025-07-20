'use client'

import { useState, useCallback, useMemo } from 'react'
import { useUser } from '@/hooks/useUser'

export function useAddresses() {
    const { user, refreshUser } = useUser()
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)

    // Memoized active addresses
    const addresses = useMemo(() =>
        user?.addresses?.filter(addr => addr.isActive) || []
        , [user])

    // Get default address
    const defaultAddress = useMemo(() =>
        addresses.find(addr => addr.isDefault) || null
        , [addresses])

    // Add new address
    const addAddress = useCallback(async (addressData) => {
        try {
            setLoading(true)
            setError(null)

            const response = await fetch('/api/account/addresses', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(addressData)
            })

            if (!response.ok) {
                throw new Error('Failed to add address')
            }

            await refreshUser()
            return { success: true }
        } catch (err) {
            setError(err.message)
            return { success: false, error: err.message }
        } finally {
            setLoading(false)
        }
    }, [refreshUser])

    // Update address
    const updateAddress = useCallback(async (addressId, addressData) => {
        try {
            setLoading(true)
            setError(null)

            const response = await fetch(`/api/account/addresses/${addressId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(addressData)
            })

            if (!response.ok) {
                throw new Error('Failed to update address')
            }

            await refreshUser()
            return { success: true }
        } catch (err) {
            setError(err.message)
            return { success: false, error: err.message }
        } finally {
            setLoading(false)
        }
    }, [refreshUser])

    // Delete address
    const deleteAddress = useCallback(async (addressId) => {
        try {
            setLoading(true)
            setError(null)

            const response = await fetch(`/api/account/addresses/${addressId}`, {
                method: 'DELETE'
            })

            if (!response.ok) {
                throw new Error('Failed to delete address')
            }

            await refreshUser()
            return { success: true }
        } catch (err) {
            setError(err.message)
            return { success: false, error: err.message }
        } finally {
            setLoading(false)
        }
    }, [refreshUser])

    // Set default address
    const setDefaultAddress = useCallback(async (addressId) => {
        try {
            setLoading(true)
            setError(null)

            const response = await fetch('/api/account/addresses/default', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ addressId })
            })

            if (!response.ok) {
                throw new Error('Failed to set default address')
            }

            await refreshUser()
            return { success: true }
        } catch (err) {
            setError(err.message)
            return { success: false, error: err.message }
        } finally {
            setLoading(false)
        }
    }, [refreshUser])

    return {
        addresses,
        defaultAddress,
        loading,
        error,
        addAddress,
        updateAddress,
        deleteAddress,
        setDefaultAddress
    }
}
