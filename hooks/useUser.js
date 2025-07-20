'use client'

import { createClient } from '@/lib/supabase/client'
import { useEffect, useState, useCallback } from 'react'

export function useUser() {
    const [user, setUser] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const supabase = createClient()

    const CACHE_KEY = 'walmart_user_cache'
    const CACHE_DURATION = 24 * 60 * 60 * 1000 // 1 day

    // Load user from cache
    const loadUserFromCache = () => {
        try {
            const cached = sessionStorage.getItem(CACHE_KEY)
            if (cached) {
                const { user: cachedUser, timestamp } = JSON.parse(cached)
                const now = Date.now()

                if (now - timestamp < CACHE_DURATION) {
                    setUser(cachedUser)
                    return true
                } else {
                    sessionStorage.removeItem(CACHE_KEY)
                }
            }
        } catch (error) {
            console.error('Error loading user from cache:', error)
            sessionStorage.removeItem(CACHE_KEY)
        }
        return false
    }

    // Save user to cache
    const saveUserToCache = (userData) => {
        try {
            const cacheData = {
                user: userData,
                timestamp: Date.now()
            }
            sessionStorage.setItem(CACHE_KEY, JSON.stringify(cacheData))
        } catch (error) {
            console.error('Error saving user to cache:', error)
        }
    }

    // Clear user cache
    const clearUserCache = () => {
        try {
            sessionStorage.removeItem(CACHE_KEY)
        } catch (error) {
            console.error('Error clearing user cache:', error)
        }
    }

    // Fetch user data from MongoDB
    const fetchUserFromMongoDB = async (skipCache = false) => {
        // Skip if tab is not visible
        if (document.hidden) return

        // Try cache first unless explicitly skipping
        if (!skipCache && loadUserFromCache()) {
            return
        }

        try {
            setError(null)
            const response = await fetch('/api/user/sync', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                }
            })

            if (!response.ok) {
                if (response.status === 401) {
                    setUser(null)
                    clearUserCache()
                    return
                }
                throw new Error('Failed to fetch user data')
            }

            const { user: mongoUser } = await response.json()
            setUser(mongoUser)
            saveUserToCache(mongoUser)
        } catch (error) {
            console.error('Error fetching user from MongoDB:', error)
            setError(error.message)
            setUser(null)
        }
    }

    useEffect(() => {
        // Check cache first for immediate loading
        const hasCachedUser = loadUserFromCache()

        const getUser = async () => {
            try {
                const { data: { session } } = await supabase.auth.getSession()
                const supabaseUser = session?.user

                if (supabaseUser) {
                    // Only fetch from server if no cached data
                    if (!hasCachedUser) {
                        await fetchUserFromMongoDB()
                    }
                } else {
                    setUser(null)
                    clearUserCache()
                }
            } catch (error) {
                console.error('Error getting initial user:', error)
                setError(error.message)
                setUser(null)
            } finally {
                setLoading(false)
            }
        }

        getUser()

        // Listen for auth state changes (simplified)
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (event, session) => {
                try {
                    if (event === 'SIGNED_OUT' || !session?.user) {
                        setUser(null)
                        clearUserCache()
                    } else if (event === 'SIGNED_IN') {
                        // Force fresh fetch on sign in
                        await fetchUserFromMongoDB(true)
                    }
                    // Ignore TOKEN_REFRESHED to prevent unnecessary fetches
                } catch (error) {
                    console.error('Auth state change error:', error)
                    setError(error.message)
                }
            }
        )

        // Handle page visibility changes
        const handleVisibilityChange = () => {
            // Optional: refresh data when user returns after long absence
            if (!document.hidden && user) {
                const cached = sessionStorage.getItem(CACHE_KEY)
                if (cached) {
                    const { timestamp } = JSON.parse(cached)
                    const hoursSinceCache = (Date.now() - timestamp) / (1000 * 60 * 60)

                    // Refresh if cache is older than 12 hours when user returns
                    if (hoursSinceCache > 12) {
                        fetchUserFromMongoDB(true)
                    }
                }
            }
        }

        document.addEventListener('visibilitychange', handleVisibilityChange)

        return () => {
            subscription.unsubscribe()
            document.removeEventListener('visibilitychange', handleVisibilityChange)
        }
    },[]) // Empty dependency array to prevent re-runs

    // Auth functions
    const signIn = async (email, password) => {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        })
        return { data, error }
    }

    const signUp = async (email, password) => {
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
        })
        return { data, error }
    }

    const signOut = async () => {
        clearUserCache()
        const { error } = await supabase.auth.signOut()
        return { error }
    }

    // Manual refresh for when users update their profile
    const refreshUser = async () => {
        setLoading(true)
        await fetchUserFromMongoDB(true)
        setLoading(false)
    }

    const changePassword = useCallback(async (currentPassword, newPassword) => {
        try {
            const response = await fetch('/api/account/security/password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    currentPassword,
                    newPassword
                })
            })

            const result = await response.json()

            if (!response.ok) {
                throw new Error(result.error || 'Failed to change password')
            }

            return { success: true }
        } catch (error) {
            console.error('Password change error:', error)
            return { success: false, error: error.message }
        }
    }, [])

    return {
        user,
        loading,
        error,
        signIn,
        signUp,
        signOut,
        refreshUser,
        changePassword
    }
}
