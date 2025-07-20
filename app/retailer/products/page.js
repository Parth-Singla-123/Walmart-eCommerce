'use client'

import { useState, useEffect, memo } from 'react'
import { useRouter } from 'next/navigation'
import { useUser } from '@/hooks/useUser'
import {
    CubeIcon,
    PlusIcon,
    PencilSquareIcon,
    TrashIcon,
    EyeIcon,
    EyeSlashIcon,
    MagnifyingGlassIcon,
    FunnelIcon,
    PhotoIcon
} from '@heroicons/react/24/outline'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import Link from 'next/link'
import Image from 'next/image'

const ProductCard = memo(({ product, onStatusToggle, onDelete, isUpdating }) => {
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

    const statusConfig = {
        active: { color: 'text-green-600', bg: 'bg-green-50', label: 'Active' },
        draft: { color: 'text-yellow-600', bg: 'bg-yellow-50', label: 'Draft' },
        inactive: { color: 'text-gray-600', bg: 'bg-gray-50', label: 'Inactive' }
    }

    const config = statusConfig[product.status] || statusConfig.draft

    return (
        <>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200">
                <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                        {product.images && product.images.length > 0 ? (
                            <Image
                                src={product.images[0]}
                                alt={product.name}
                                className="w-16 h-16 object-cover rounded-lg border border-gray-200"
                            />
                        ) : (
                            <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
                                <PhotoIcon className="h-8 w-8 text-gray-400" />
                            </div>
                        )}
                        <div className="flex-1">
                            <h3 className="font-semibold text-gray-900 mb-1">{product.name}</h3>
                            <p className="text-sm text-gray-500">{product.category}</p>
                            <div className="flex items-center gap-2 mt-1">
                                <span className={`text-xs px-2 py-1 rounded-full font-medium ${config.bg} ${config.color}`}>
                                    {config.label}
                                </span>
                                <span className="text-xs text-gray-500">
                                    Stock: {product.stock}
                                </span>
                            </div>
                        </div>
                    </div>
                    <div className="text-right">
                        <p className="text-lg font-bold text-gray-900">₹{product.price}</p>
                        {product.compareAtPrice && (
                            <p className="text-sm text-gray-500 line-through">₹{product.compareAtPrice}</p>
                        )}
                    </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                        <EyeIcon className="h-4 w-4" />
                        {product.views || 0} views
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => onStatusToggle(product.id, product.status === 'active' ? 'inactive' : 'active')}
                            disabled={isUpdating}
                            className={`p-2 rounded-lg transition-colors duration-200 ${product.status === 'active'
                                    ? 'text-green-600 hover:bg-green-50'
                                    : 'text-gray-600 hover:bg-gray-50'
                                }`}
                            title={product.status === 'active' ? 'Deactivate' : 'Activate'}
                        >
                            {product.status === 'active' ? (
                                <EyeIcon className="h-4 w-4" />
                            ) : (
                                <EyeSlashIcon className="h-4 w-4" />
                            )}
                        </button>
                        <Link href={`/retailer/products/${product.id}/edit`}>
                            <button className="p-2 rounded-lg text-blue-600 hover:bg-blue-50 transition-colors duration-200">
                                <PencilSquareIcon className="h-4 w-4" />
                            </button>
                        </Link>
                        <button
                            onClick={() => setShowDeleteConfirm(true)}
                            className="p-2 rounded-lg text-red-600 hover:bg-red-50 transition-colors duration-200"
                        >
                            <TrashIcon className="h-4 w-4" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Delete Confirmation Modal */}
            {showDeleteConfirm && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-xl max-w-md w-full p-6">
                        <div className="flex items-center gap-3 mb-4">
                            <TrashIcon className="h-6 w-6 text-red-600" />
                            <h3 className="text-lg font-semibold text-gray-900">Delete Product</h3>
                        </div>
                        <p className="text-gray-600 mb-6">
                            Are you sure you want to delete {product.name}? This action cannot be undone.
                        </p>
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => setShowDeleteConfirm(false)}
                                className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors duration-200"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => {
                                    onDelete(product.id)
                                    setShowDeleteConfirm(false)
                                }}
                                disabled={isUpdating}
                                className="flex-1 px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors duration-200"
                            >
                                {isUpdating ? 'Deleting...' : 'Delete'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    )
})
ProductCard.displayName = 'ProductCard'

const FilterControls = memo(({ filters, onFilterChange, onSearch, searchTerm, onSearchChange }) => {
    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
            <div className="flex flex-col md:flex-row gap-4">
                {/* Search */}
                <div className="flex-1">
                    <div className="relative">
                        <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => onSearchChange(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && onSearch()}
                            placeholder="Search products..."
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black focus:outline-none transition-all duration-200"
                        />
                    </div>
                </div>

                {/* Status Filter */}
                <div className="flex items-center gap-2">
                    <FunnelIcon className="h-4 w-4 text-gray-500" />
                    <select
                        value={filters.status}
                        onChange={(e) => onFilterChange('status', e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black focus:outline-none transition-all duration-200"
                    >
                        <option value="all">All Status</option>
                        <option value="active">Active</option>
                        <option value="draft">Draft</option>
                        <option value="inactive">Inactive</option>
                    </select>
                </div>

                {/* Category Filter */}
                <select
                    value={filters.category}
                    onChange={(e) => onFilterChange('category', e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black focus:outline-none transition-all duration-200"
                >
                    <option value="all">All Categories</option>
                    <option value="Electronics">Electronics</option>
                    <option value="Clothing">Clothing</option>
                    <option value="Home & Garden">Home & Garden</option>
                    <option value="Books">Books</option>
                    <option value="Sports">Sports</option>
                    <option value="Beauty">Beauty</option>
                    <option value="Food">Food</option>
                    <option value="Other">Other</option>
                </select>
            </div>
        </div>
    )
})
FilterControls.displayName = 'FilterControls'

export default function ProductsPage() {
    const { user, loading } = useUser()
    const router = useRouter()

    const [products, setProducts] = useState([])
    const [filteredProducts, setFilteredProducts] = useState([])
    const [loadingProducts, setLoadingProducts] = useState(true)
    const [updatingId, setUpdatingId] = useState(null)
    const [searchTerm, setSearchTerm] = useState('')
    const [filters, setFilters] = useState({
        status: 'all',
        category: 'all'
    })

    // Redirect if not retailer
    useEffect(() => {
        if (!loading && (!user || user.role !== 'Retailer')) {
            router.push('/account')
        }
    }, [user, loading, router])

    // Fetch products (mock data for now)
    useEffect(() => {
        const fetchProducts = async () => {
            try {
                // TODO: Replace with actual API call
                // Simulate API call with mock data
                setTimeout(() => {
                    const mockProducts = [
                        {
                            id: 1,
                            name: 'Wireless Bluetooth Headphones',
                            description: 'High-quality wireless headphones with noise cancellation',
                            category: 'Electronics',
                            price: 2999,
                            compareAtPrice: 3999,
                            stock: 25,
                            status: 'active',
                            images: ['/api/placeholder/400/300'],
                            views: 156,
                            createdAt: '2024-01-15'
                        },
                        {
                            id: 2,
                            name: 'Cotton T-Shirt',
                            description: 'Comfortable cotton t-shirt in multiple colors',
                            category: 'Clothing',
                            price: 599,
                            compareAtPrice: null,
                            stock: 0,
                            status: 'inactive',
                            images: [],
                            views: 89,
                            createdAt: '2024-01-10'
                        },
                        {
                            id: 3,
                            name: 'Smart Watch',
                            description: 'Feature-rich smartwatch with health monitoring',
                            category: 'Electronics',
                            price: 8999,
                            compareAtPrice: 12999,
                            stock: 12,
                            status: 'draft',
                            images: ['/api/placeholder/400/300'],
                            views: 0,
                            createdAt: '2024-01-20'
                        }
                    ]
                    setProducts(mockProducts)
                    setFilteredProducts(mockProducts)
                    setLoadingProducts(false)
                }, 1000)
            } catch (error) {
                console.error('Error fetching products:', error)
                setLoadingProducts(false)
            }
        }

        if (user && user.role === 'Retailer') {
            fetchProducts()
        }
    }, [user])

    // Filter products
    useEffect(() => {
        let filtered = products

        // Apply search filter
        if (searchTerm) {
            filtered = filtered.filter(product =>
                product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                product.category.toLowerCase().includes(searchTerm.toLowerCase())
            )
        }

        // Apply status filter
        if (filters.status !== 'all') {
            filtered = filtered.filter(product => product.status === filters.status)
        }

        // Apply category filter
        if (filters.category !== 'all') {
            filtered = filtered.filter(product => product.category === filters.category)
        }

        setFilteredProducts(filtered)
    }, [products, searchTerm, filters])

    const handleFilterChange = (filterType, value) => {
        setFilters(prev => ({
            ...prev,
            [filterType]: value
        }))
    }

    const handleSearch = () => {
        // Search is handled by useEffect, this is just for Enter key support
    }

    const handleStatusToggle = async (productId, newStatus) => {
        setUpdatingId(productId)
        try {
            // TODO: Replace with actual API call
            setTimeout(() => {
                setProducts(prev => prev.map(product =>
                    product.id === productId ? { ...product, status: newStatus } : product
                ))
                setUpdatingId(null)
            }, 1000)
        } catch (error) {
            console.error('Error updating product status:', error)
            setUpdatingId(null)
        }
    }

    const handleDelete = async (productId) => {
        setUpdatingId(productId)
        try {
            // TODO: Replace with actual API call
            setTimeout(() => {
                setProducts(prev => prev.filter(product => product.id !== productId))
                setUpdatingId(null)
            }, 1000)
        } catch (error) {
            console.error('Error deleting product:', error)
            setUpdatingId(null)
        }
    }

    if (loading || loadingProducts) {
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
                        <CubeIcon className="h-8 w-8 text-gray-600" />
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Product Management</h1>
                            <p className="text-gray-600 mt-1">Manage your product listings and inventory</p>
                        </div>
                    </div>
                    <Link href="/retailer/products/new">
                        <button className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors duration-200">
                            <PlusIcon className="h-4 w-4" />
                            Add Product
                        </button>
                    </Link>
                </div>
            </div>

            {/* Content */}
            <div className="p-6">
                {/* Filters */}
                <FilterControls
                    filters={filters}
                    onFilterChange={handleFilterChange}
                    onSearch={handleSearch}
                    searchTerm={searchTerm}
                    onSearchChange={setSearchTerm}
                />

                {/* Products Grid */}
                {filteredProducts.length === 0 ? (
                    <div className="text-center py-12">
                        <CubeIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                            {products.length === 0 ? 'No Products Yet' : 'No Products Found'}
                        </h3>
                        <p className="text-gray-600 mb-4">
                            {products.length === 0
                                ? 'Start by adding your first product to your store'
                                : 'Try adjusting your search or filters'
                            }
                        </p>
                        {products.length === 0 && (
                            <Link href="/retailer/products/new">
                                <button className="inline-flex items-center gap-2 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors duration-200">
                                    <PlusIcon className="h-4 w-4" />
                                    Add Your First Product
                                </button>
                            </Link>
                        )}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredProducts.map(product => (
                            <ProductCard
                                key={product.id}
                                product={product}
                                onStatusToggle={handleStatusToggle}
                                onDelete={handleDelete}
                                isUpdating={updatingId === product.id}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
