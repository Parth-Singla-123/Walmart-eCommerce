'use client'

import { useState, useCallback, useMemo } from 'react'
import { useUser } from '@/hooks/useUser'

export function useAccountData() {
    const { user, refreshUser } = useUser()

    // Separate loading and error states for better UX and conflict prevention
    const [profileLoading, setProfileLoading] = useState(false)
    const [profileError, setProfileError] = useState(null)
    const [preferencesLoading, setPreferencesLoading] = useState(false)
    const [preferencesError, setPreferencesError] = useState(null)

    // Memoized user profile data
    const profileData = useMemo(() => ({
        name: user?.profile?.name || '',
        avatar: user?.profile?.avatar || '',
        phone: user?.profile?.phone || '',
        email: user?.email || ''
    }), [user])

    // Memoized user preferences
    const preferences = useMemo(() => ({
        categories: user?.preferences?.categories || [],
        priceRange: user?.preferences?.priceRange || { min: 0, max: 1000 },
        currency: user?.preferences?.currency || 'USD',
        notifications: user?.preferences?.notifications || {
            email: true,
            push: true,
            orderUpdates: true,
            deals: true,
            newArrivals: false
        },
        privacy: user?.preferences?.privacy || {
            showEmail: false,
            profileVisibility: 'public'
        }
    }), [user])

    // Memoized addresses
    const addresses = useMemo(() =>
        user?.addresses?.filter(addr => addr.isActive) || []
        , [user])

    // Get default address
    const defaultAddress = useMemo(() =>
        addresses.find(addr => addr.isDefault) || addresses[0] || null
        , [addresses])

    // Combined loading state for backward compatibility
    const loading = useMemo(() =>
        profileLoading || preferencesLoading
        , [profileLoading, preferencesLoading])

    // Combined error state for backward compatibility
    const error = useMemo(() =>
        profileError || preferencesError
        , [profileError, preferencesError])

    // Update profile
    const updateProfile = useCallback(async (profileData) => {
        try {
            setProfileLoading(true)
            setProfileError(null)

            const response = await fetch('/api/account/profile', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(profileData)
            })

            if (!response.ok) {
                const errorData = await response.json()
                throw new Error(errorData.error || 'Failed to update profile')
            }

            await refreshUser()
            return { success: true }
        } catch (err) {
            setProfileError(err.message)
            return { success: false, error: err.message }
        } finally {
            setProfileLoading(false)
        }
    }, [refreshUser])

    // Update preferences
    const updatePreferences = useCallback(async (newPreferences) => {
        try {
            setPreferencesLoading(true)
            setPreferencesError(null)

            const response = await fetch('/api/account/preferences', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newPreferences)
            })

            if (!response.ok) {
                const errorData = await response.json()
                throw new Error(errorData.error || 'Failed to update preferences')
            }

            await refreshUser()
            return { success: true }
        } catch (err) {
            setPreferencesError(err.message)
            return { success: false, error: err.message }
        } finally {
            setPreferencesLoading(false)
        }
    }, [refreshUser])

    return {
        user,
        profileData,
        preferences,
        addresses,
        defaultAddress,
        loading,
        error,
        profileLoading,
        profileError,
        preferencesLoading,
        preferencesError,
        updateProfile,
        updatePreferences,
        refreshUser
    }
}
