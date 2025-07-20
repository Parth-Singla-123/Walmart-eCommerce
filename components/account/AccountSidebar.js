'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useMemo, memo, useRef, useState, useEffect } from 'react'
import {
    UserIcon,
    ShoppingBagIcon,
    MapPinIcon,
    HeartIcon,
    Cog6ToothIcon,
    ShieldCheckIcon,
    AdjustmentsHorizontalIcon,
    ArrowRightStartOnRectangleIcon,
    Bars3Icon,
    XMarkIcon,
    // New icons for retailer/admin features
    BuildingStorefrontIcon,
    ChartBarIcon,
    CubeIcon,
    DocumentCheckIcon,
    UsersIcon,
    ClipboardDocumentListIcon
} from '@heroicons/react/24/outline'
import { useUser } from '@/hooks/useUser'
import Image from 'next/image'

/* ---------- Navigation Config ---------- */
const useNavigationItems = (userRole) =>
    useMemo(() => {
        // Base navigation items (available to all users)
        const baseItems = [
            {
                name: 'Account Overview',
                href: '/account',
                icon: UserIcon,
                description: 'Profile and account summary',
                roles: ['Buyer', 'Retailer', 'Admin']
            },
            {
                name: 'Profile Settings',
                href: '/account/profile',
                icon: Cog6ToothIcon,
                description: 'Manage your personal information',
                roles: ['Buyer', 'Retailer', 'Admin']
            },
            {
                name: 'Order History',
                href: '/account/orders',
                icon: ShoppingBagIcon,
                description: 'View your past orders',
                roles: ['Buyer', 'Retailer', 'Admin']
            },
            {
                name: 'Addresses',
                href: '/account/addresses',
                icon: MapPinIcon,
                description: 'Manage shipping addresses',
                roles: ['Buyer', 'Retailer', 'Admin']
            },
            {
                name: 'Wishlist',
                href: '/account/wishlist',
                icon: HeartIcon,
                description: 'Your saved items',
                roles: ['Buyer', 'Retailer', 'Admin']
            },
            {
                name: 'Preferences',
                href: '/account/preferences',
                icon: AdjustmentsHorizontalIcon,
                description: 'Shopping, notifications & privacy',
                roles: ['Buyer', 'Retailer', 'Admin']
            },
            {
                name: 'Security',
                href: '/account/security',
                icon: ShieldCheckIcon,
                description: 'Password & account protection',
                roles: ['Buyer', 'Retailer', 'Admin']
            }
        ]

        // Retailer-specific items (sorted by importance) - STORE PROFILE REMOVED
        const retailerItems = [
            {
                name: 'Retailer Dashboard',
                href: '/retailer/dashboard',
                icon: ChartBarIcon,
                description: 'Sales analytics & overview',
                roles: ['Retailer']
            },
            {
                name: 'Product Management',
                href: '/retailer/products',
                icon: CubeIcon,
                description: 'Add & manage your products',
                roles: ['Retailer']
            },
            {
                name: 'Sales Orders',
                href: '/retailer/orders',
                icon: ClipboardDocumentListIcon,
                description: 'Manage customer orders',
                roles: ['Retailer']
            }
        ]

        // Admin-specific items (sorted by importance)
        const adminItems = [
            {
                name: 'Admin Dashboard',
                href: '/admin/dashboard',
                icon: ChartBarIcon,
                description: 'Platform overview & analytics',
                roles: ['Admin']
            },
            {
                name: 'Retailer Applications',
                href: '/admin/retailer-applications',
                icon: DocumentCheckIcon,
                description: 'Review retailer applications',
                roles: ['Admin']
            },
            {
                name: 'User Management',
                href: '/admin/users',
                icon: UsersIcon,
                description: 'Manage platform users',
                roles: ['Admin']
            }
        ]

        // "Become Retailer" item for buyers who aren't retailers
        const becomeRetailerItem = {
            name: 'Become a Retailer',
            href: '/account/become-retailer',
            icon: BuildingStorefrontIcon,
            description: 'Apply to start selling',
            roles: ['Buyer']
        }

        // Combine items based on user role
        let allItems = [...baseItems]

        if (userRole === 'Admin') {
            allItems = [...baseItems, ...adminItems]
        } else if (userRole === 'Retailer') {
            allItems = [...baseItems, ...retailerItems]
        } else {
            allItems = [...baseItems, becomeRetailerItem]
        }

        return allItems.filter(item => item.roles.includes(userRole))
    }, [userRole])

/* ---------- Re-usable Components ---------- */
const NavigationItem = memo(({ item, isActive, onClick }) => {
    const { name, href, icon: Icon, description } = item
    return (
        <Link
            href={href}
            onClick={onClick}
            className={`group flex items-center px-4 py-3 rounded-xl transition-all duration-200 ${isActive ? 'bg-black text-white shadow-md' : 'text-gray-700 hover:bg-gray-100 hover:text-black'
                }`}
        >
            <Icon
                className={`h-5 w-5 mr-3 transition-colors duration-200 ${isActive ? 'text-white' : 'text-gray-500 group-hover:text-black'
                    }`}
            />
            <div className="flex-1 min-w-0">
                <p
                    className={`text-sm font-medium transition-colors duration-200 ${isActive ? 'text-white' : 'text-gray-900'
                        }`}
                >
                    {name}
                </p>
                <p
                    className={`text-xs mt-0.5 transition-colors duration-200 ${isActive ? 'text-gray-200' : 'text-gray-500'
                        }`}
                >
                    {description}
                </p>
            </div>
        </Link>
    )
})
NavigationItem.displayName = 'NavigationItem'

const UserInfo = memo(({ user }) => {
    const initials = useMemo(() => {
        if (user.profile?.name?.trim()) return user.profile.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
        return user.email ? user.email[0].toUpperCase() : 'U'
    }, [user.profile?.name, user.email])

    const getRoleBadgeColor = (role) => {
        switch (role) {
            case 'Admin':
                return 'bg-red-100 text-red-800'
            case 'Retailer':
                return 'bg-blue-100 text-blue-800'
            default:
                return 'bg-gray-100 text-gray-800'
        }
    }

    return (
        <div className="flex items-center p-4 bg-gray-50 rounded-xl mb-6">
            {user.profile?.avatar ? (
                <Image src={user.profile.avatar} alt={user.profile?.name || 'User'} className="w-12 h-12 rounded-full object-cover border-2 border-gray-300" />
            ) : (
                <div className="w-12 h-12 bg-black text-white rounded-full flex items-center justify-center text-sm font-medium">
                    {initials}
                </div>
            )}
            <div className="ml-3 flex-1 min-w-0">
                <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-gray-900 truncate">{user.profile?.name || 'User'}</p>
                    <span className={`px-2 py-1 text-xs rounded-full font-medium ${getRoleBadgeColor(user.role)}`}>
                        {user.role}
                    </span>
                </div>
                <p className="text-xs text-gray-500 truncate">{user.email}</p>
            </div>
        </div>
    )
})
UserInfo.displayName = 'UserInfo'

const MobileMenuOverlay = memo(({ isOpen, onClose, children }) => {
    const overlayRef = useRef(null)

    useEffect(() => {
        const handleClickOutside = e => {
            if (overlayRef.current && !overlayRef.current.contains(e.target)) onClose()
        }
        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside)
            document.body.style.overflow = 'hidden'
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside)
            document.body.style.overflow = 'unset'
        }
    }, [isOpen, onClose])

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-50 lg:hidden">
            <div className="fixed inset-0 bg-black bg-opacity-50" />
            <div className="fixed inset-y-0 left-0 flex w-full max-w-sm">
                <div ref={overlayRef} className="relative flex flex-col w-full bg-white shadow-xl">
                    {children}
                </div>
            </div>
        </div>
    )
})
MobileMenuOverlay.displayName = 'MobileMenuOverlay'

/* ---------- Main Sidebar Component ---------- */
function AccountSidebar({ user }) {
    const pathname = usePathname()
    const { signOut } = useUser()
    const navigationItems = useNavigationItems(user.role || 'Buyer')
    const [mobileOpen, setMobileOpen] = useState(false)

    const isActivePath = href => (href === '/account' ? pathname === '/account' : pathname.startsWith(href))

    const SidebarContent = memo(() => (
        <div className="p-6 h-full overflow-y-auto">
            <UserInfo user={user} />

            {/* Navigation */}
            <nav className="space-y-2">
                {navigationItems.map(item => (
                    <NavigationItem key={item.href} item={item} isActive={isActivePath(item.href)} onClick={() => setMobileOpen(false)} />
                ))}
            </nav>

            {/* Sign Out */}
            <div className="mt-8 pt-6 border-t border-gray-200">
                <button
                    onClick={async () => {
                        await signOut()
                        setMobileOpen(false)
                    }}
                    className="w-full flex items-center px-4 py-3 rounded-xl text-gray-700 hover:bg-red-50 hover:text-red-600 transition-all duration-200 group"
                >
                    <ArrowRightStartOnRectangleIcon className="h-5 w-5 mr-3 text-gray-500 group-hover:text-red-600" />
                    <span className="text-sm font-medium">Sign Out</span>
                </button>
            </div>
        </div>
    ))
    SidebarContent.displayName = 'SidebarContent'

    return (
        <>
            {/* Desktop */}
            <div className="hidden lg:block bg-white rounded-xl shadow-sm border border-gray-200 sticky top-8 h-fit">
                <SidebarContent />
            </div>

            {/* Mobile Toggle */}
            <div className="lg:hidden fixed top-4 left-4 z-40">
                <button
                    onClick={() => setMobileOpen(true)}
                    className="p-3 bg-white rounded-xl shadow-lg border border-gray-200 text-gray-700 hover:text-black"
                    aria-label="Open navigation menu"
                >
                    <Bars3Icon className="h-6 w-6" />
                </button>
            </div>

            {/* Mobile Overlay */}
            <MobileMenuOverlay isOpen={mobileOpen} onClose={() => setMobileOpen(false)}>
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <h2 className="text-lg font-semibold text-gray-900">Account Menu</h2>
                    <button
                        onClick={() => setMobileOpen(false)}
                        className="p-2 rounded-xl text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                        aria-label="Close navigation menu"
                    >
                        <XMarkIcon className="h-6 w-6" />
                    </button>
                </div>
                <div className="flex-1">
                    <SidebarContent />
                </div>
            </MobileMenuOverlay>
        </>
    )
}

export default memo(AccountSidebar)
