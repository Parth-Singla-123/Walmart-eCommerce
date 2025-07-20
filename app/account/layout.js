'use client'

import { useUser } from '@/hooks/useUser'
import { useRouter } from 'next/navigation'
import { useEffect, useMemo } from 'react'
import AccountSidebar from '@/components/account/AccountSidebar'
import LoadingSpinner from '@/components/ui/LoadingSpinner'

export default function AccountLayout({ children }) {
    const { user, loading } = useUser()
    const router = useRouter()

    // Memoize redirect logic to prevent unnecessary recalculations
    const shouldRedirect = useMemo(() => {
        return !loading && !user
    }, [loading, user])

    useEffect(() => {
        if (shouldRedirect) {
            router.push('/login')
        }
    }, [shouldRedirect, router])

    // Show loading while checking authentication
    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 w-full">
                <LoadingSpinner />
            </div>
        )
    }

    // Redirect if not authenticated
    if (!user) {
        return null
    }

    return (
        <div className="min-h-screen bg-gray-50 w-full">
            <div className="px-4 sm:px-6 lg:px-12 py-8 w-full">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 w-full">
                    {/* Sidebar - Desktop only, Mobile handled by AccountSidebar component */}
                    <div className="lg:col-span-1">
                        <AccountSidebar user={user} />
                    </div>

                    {/* Main Content */}
                    <div className="lg:col-span-3">
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 min-h-[600px] w-full">
                            {children}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
