'use client'

import { useState, useCallback, useMemo } from 'react'
import { useUser } from '@/hooks/useUser'

export function useOrders() {
    const { user } = useUser()
    const [orders, setOrders] = useState([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)

    // Fetch orders
    const fetchOrders = useCallback(async (filters = {}) => {
        try {
            setLoading(true)
            setError(null)

            const queryParams = new URLSearchParams()
            if (filters.status) queryParams.append('status', filters.status)
            if (filters.dateRange) queryParams.append('dateRange', filters.dateRange)
            if (filters.search) queryParams.append('search', filters.search)

            const response = await fetch(`/api/account/orders?${queryParams}`)

            if (!response.ok) {
                throw new Error('Failed to fetch orders')
            }

            const data = await response.json()
            setOrders(data.orders || [])
        } catch (err) {
            setError(err.message)
            setOrders([])
        } finally {
            setLoading(false)
        }
    }, [])

    // Cancel order
    const cancelOrder = useCallback(async (orderId) => {
        try {
            const response = await fetch(`/api/account/orders/${orderId}/cancel`, {
                method: 'POST'
            })

            if (!response.ok) {
                throw new Error('Failed to cancel order')
            }

            // Refresh orders
            await fetchOrders()
            return { success: true }
        } catch (err) {
            return { success: false, error: err.message }
        }
    }, [fetchOrders])

    // Reorder items
    const reorderItems = useCallback(async (orderId) => {
        try {
            const response = await fetch(`/api/account/orders/${orderId}/reorder`, {
                method: 'POST'
            })

            if (!response.ok) {
                throw new Error('Failed to reorder items')
            }

            const data = await response.json()
            return { success: true, cartItems: data.cartItems }
        } catch (err) {
            return { success: false, error: err.message }
        }
    }, [])

    return {
        orders,
        loading,
        error,
        fetchOrders,
        cancelOrder,
        reorderItems
    }
}
