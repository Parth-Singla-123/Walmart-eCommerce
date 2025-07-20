'use client'

import { useState, useEffect, useMemo, useCallback, memo, useRef } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useUser } from '@/hooks/useUser'
import {
    CubeIcon,
    PhotoIcon,
    XMarkIcon,
    CheckCircleIcon,
    ExclamationTriangleIcon,
    ArrowLeftIcon,
    CloudArrowUpIcon,
    PlusIcon,
    TrashIcon,
    EyeIcon,
    ArchiveBoxXMarkIcon
} from '@heroicons/react/24/outline'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import Image from 'next/image'

// Memoized Loading Skeleton Component
const LoadingSkeleton = memo(() => (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse space-y-8">
            <div className="h-8 bg-gray-200 rounded w-1/4"></div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-6">
                    {[...Array(6)].map((_, i) => (
                        <div key={i} className="space-y-2">
                            <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                            <div className="h-12 bg-gray-200 rounded"></div>
                        </div>
                    ))}
                </div>
                <div className="h-64 bg-gray-200 rounded-xl"></div>
            </div>
        </div>
    </div>
))
LoadingSkeleton.displayName = 'LoadingSkeleton'

// Memoized Page Header Component
const PageHeader = memo(({ productName, onBack, onViewProduct, onDeleteProduct, deleteLoading }) => (
    <div className="mb-8">
        <div className="flex items-center gap-4 mb-4">
            <button
                onClick={onBack}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors duration-200"
            >
                <ArrowLeftIcon className="h-5 w-5" />
            </button>
            <div className="flex-1">
                <h1 className="text-3xl font-bold text-gray-900">Edit Product</h1>
                <p className="text-gray-600 mt-2">Update {productName} details and settings</p>
            </div>
            <div className="flex items-center gap-3">
                <button
                    onClick={onViewProduct}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors duration-200"
                >
                    <EyeIcon className="h-4 w-4" />
                    View Product
                </button>
                <button
                    onClick={onDeleteProduct}
                    disabled={deleteLoading}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-700 bg-red-50 border border-red-200 rounded-xl hover:bg-red-100 transition-colors duration-200 disabled:opacity-50"
                >
                    {deleteLoading ? (
                        <LoadingSpinner size="sm" className="border-red-600" />
                    ) : (
                        <ArchiveBoxXMarkIcon className="h-4 w-4" />
                    )}
                    Delete Product
                </button>
            </div>
        </div>
    </div>
))
PageHeader.displayName = 'PageHeader'

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

// Memoized Error Message Component
const ErrorMessage = memo(({ message, className = '' }) => {
    if (!message) return null

    return (
        <div className={`bg-red-50 border border-red-200 rounded-xl p-3 ${className}`}>
            <div className="flex items-center gap-2">
                <ExclamationTriangleIcon className="h-4 w-4 text-red-600" />
                <p className="text-red-700 text-sm">{message}</p>
            </div>
        </div>
    )
})
ErrorMessage.displayName = 'ErrorMessage'

// Reuse ImageUpload component from Add Product (same code)
const ImageUpload = memo(({ images, onImagesChange, maxImages = 5 }) => {
    const fileInputRef = useRef(null)
    const [uploadLoading, setUploadLoading] = useState(false)

    const handleFileSelect = useCallback(async (e) => {
        const files = Array.from(e.target.files)
        if (!files.length) return

        setUploadLoading(true)
        try {
            // Simulate upload - replace with actual Cloudinary upload
            await new Promise(resolve => setTimeout(resolve, 1000))
            
            const newImages = files.map((file, index) => ({
                id: Date.now() + index,
                url: URL.createObjectURL(file),
                file: file,
                name: file.name
            }))

            onImagesChange([...images, ...newImages].slice(0, maxImages))
        } catch (error) {
            console.error('Upload failed:', error)
        } finally {
            setUploadLoading(false)
        }
    }, [images, onImagesChange, maxImages])

    const handleRemoveImage = useCallback((imageId) => {
        onImagesChange(images.filter(img => img.id !== imageId))
    }, [images, onImagesChange])

    const canAddMore = images.length < maxImages

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <label className="block text-sm font-semibold text-gray-700">
                    Product Images *
                </label>
                <span className="text-xs text-gray-500">
                    {images.length}/{maxImages} images
                </span>
            </div>

            {/* Image Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {images.map((image) => (
                    <div key={image.id} className="relative group">
                        <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                            <Image
                                src={image.url}
                                alt={image.name}
                                className="w-full h-full object-cover"
                            />
                        </div>
                        <button
                            onClick={() => handleRemoveImage(image.id)}
                            className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                        >
                            <XMarkIcon className="h-4 w-4" />
                        </button>
                    </div>
                ))}

                {/* Upload Button */}
                {canAddMore && (
                    <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploadLoading}
                        className="aspect-square border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center text-gray-400 hover:text-gray-600 hover:border-gray-400 transition-colors duration-200 disabled:opacity-50"
                    >
                        {uploadLoading ? (
                            <LoadingSpinner size="sm" />
                        ) : (
                            <>
                                <CloudArrowUpIcon className="h-8 w-8 mb-2" />
                                <span className="text-xs font-medium">Add Image</span>
                            </>
                        )}
                    </button>
                )}
            </div>

            {/* Hidden File Input */}
            <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
            />

            <p className="text-xs text-gray-500">
                Upload up to {maxImages} high-quality images. First image will be the main product image.
            </p>
        </div>
    )
})
ImageUpload.displayName = 'ImageUpload'

// Reuse FormInput and FormSelect components from Add Product (same code)
const FormInput = memo(({ 
    label, 
    name, 
    type = 'text', 
    value, 
    onChange, 
    error, 
    required = false, 
    placeholder,
    ...props 
}) => (
    <div className="space-y-2">
        <label className="block text-sm font-semibold text-gray-700">
            {label} {required && <span className="text-red-500">*</span>}
        </label>
        {type === 'textarea' ? (
            <textarea
                name={name}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                required={required}
                rows={4}
                className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-black focus:border-black resize-none transition-all duration-200 ${
                    error ? 'border-red-300 bg-red-50' : 'border-gray-300'
                }`}
                {...props}
            />
        ) : (
            <input
                type={type}
                name={name}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                required={required}
                className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-black focus:border-black transition-all duration-200 ${
                    error ? 'border-red-300 bg-red-50' : 'border-gray-300'
                }`}
                {...props}
            />
        )}
        {error && (
            <p className="text-sm text-red-600 flex items-center gap-1">
                <ExclamationTriangleIcon className="h-4 w-4" />
                {error}
            </p>
        )}
    </div>
))
FormInput.displayName = 'FormInput'

const FormSelect = memo(({ 
    label, 
    name, 
    value, 
    onChange, 
    error, 
    required = false, 
    options,
    placeholder = "Select an option"
}) => (
    <div className="space-y-2">
        <label className="block text-sm font-semibold text-gray-700">
            {label} {required && <span className="text-red-500">*</span>}
        </label>
        <select
            name={name}
            value={value}
            onChange={onChange}
            required={required}
            className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-black focus:border-black transition-all duration-200 ${
                error ? 'border-red-300 bg-red-50' : 'border-gray-300'
            }`}
        >
            <option value="">{placeholder}</option>
            {options.map(option => (
                <option key={option.value} value={option.value}>
                    {option.label}
                </option>
            ))}
        </select>
        {error && (
            <p className="text-sm text-red-600 flex items-center gap-1">
                <ExclamationTriangleIcon className="h-4 w-4" />
                {error}
            </p>
        )}
    </div>
))
FormSelect.displayName = 'FormSelect'

// Memoized Product Edit Form Component
const ProductEditForm = memo(({ product, onSubmit, loading }) => {
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price: '',
        compareAtPrice: '',
        sku: '',
        category: '',
        stock: '',
        status: 'active'
    })
    const [images, setImages] = useState([])
    const [errors, setErrors] = useState({})
    const [hasChanges, setHasChanges] = useState(false)

    // Memoized category options
    const categoryOptions = useMemo(() => [
        { value: 'electronics', label: 'Electronics' },
        { value: 'clothing', label: 'Clothing' },
        { value: 'books', label: 'Books' },
        { value: 'home', label: 'Home & Garden' },
        { value: 'sports', label: 'Sports & Outdoors' },
        { value: 'toys', label: 'Toys & Games' }
    ], [])

    // Initialize form with product data
    useEffect(() => {
        if (product) {
            setFormData({
                name: product.name || '',
                description: product.description || '',
                price: product.price ? product.price.toString() : '',
                compareAtPrice: product.compareAtPrice ? product.compareAtPrice.toString() : '',
                sku: product.sku || '',
                category: product.category || '',
                stock: product.stock ? product.stock.toString() : '',
                status: product.status || 'active'
            })
            
            // Convert existing images to the expected format
            if (product.images && product.images.length > 0) {
                const existingImages = product.images.map((url, index) => ({
                    id: `existing-${index}`,
                    url: url,
                    name: `image-${index + 1}.jpg`
                }))
                setImages(existingImages)
            }
        }
    }, [product])

    // Track changes for unsaved changes indicator
    useEffect(() => {
        if (!product) return
        
        const currentData = {
            name: formData.name,
            description: formData.description,
            price: parseFloat(formData.price) || 0,
            compareAtPrice: parseFloat(formData.compareAtPrice) || null,
            sku: formData.sku,
            category: formData.category,
            stock: parseInt(formData.stock) || 0,
            status: formData.status
        }

        const originalData = {
            name: product.name || '',
            description: product.description || '',
            price: product.price || 0,
            compareAtPrice: product.compareAtPrice || null,
            sku: product.sku || '',
            category: product.category || '',
            stock: product.stock || 0,
            status: product.status || 'active'
        }

        const dataChanged = JSON.stringify(currentData) !== JSON.stringify(originalData)
        const imagesChanged = images.length !== (product.images?.length || 0)
        
        setHasChanges(dataChanged || imagesChanged)
    }, [formData, images, product])

    const handleInputChange = useCallback((e) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
        
        // Clear error when user starts typing
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }))
        }
    }, [errors])

    const validateForm = useCallback(() => {
        const newErrors = {}

        if (!formData.name.trim()) newErrors.name = 'Product name is required'
        if (!formData.description.trim()) newErrors.description = 'Product description is required'
        if (!formData.price || parseFloat(formData.price) <= 0) newErrors.price = 'Valid price is required'
        if (!formData.category) newErrors.category = 'Category is required'
        if (!formData.stock || parseInt(formData.stock) < 0) newErrors.stock = 'Valid stock quantity is required'
        if (images.length === 0) newErrors.images = 'At least one product image is required'

        // Compare price validation
        if (formData.compareAtPrice && parseFloat(formData.compareAtPrice) <= parseFloat(formData.price)) {
            newErrors.compareAtPrice = 'Compare price must be higher than regular price'
        }

        return newErrors
    }, [formData, images])

    const handleSubmit = useCallback(async (e) => {
        e.preventDefault()
        
        const validationErrors = validateForm()
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors)
            return
        }

        const updatedProductData = {
            ...formData,
            price: parseFloat(formData.price),
            compareAtPrice: formData.compareAtPrice ? parseFloat(formData.compareAtPrice) : null,
            stock: parseInt(formData.stock),
            images: images.map(img => img.url)
        }

        const result = await onSubmit(updatedProductData)
        if (!result.success) {
            setErrors({ submit: result.error })
        } else {
            setHasChanges(false)
        }
    }, [formData, images, validateForm, onSubmit])

    const handleDiscardChanges = useCallback(() => {
        if (window.confirm('Are you sure you want to discard all changes?')) {
            // Reset to original product data
            if (product) {
                setFormData({
                    name: product.name || '',
                    description: product.description || '',
                    price: product.price ? product.price.toString() : '',
                    compareAtPrice: product.compareAtPrice ? product.compareAtPrice.toString() : '',
                    sku: product.sku || '',
                    category: product.category || '',
                    stock: product.stock ? product.stock.toString() : '',
                    status: product.status || 'active'
                })
                
                if (product.images && product.images.length > 0) {
                    const existingImages = product.images.map((url, index) => ({
                        id: `existing-${index}`,
                        url: url,
                        name: `image-${index + 1}.jpg`
                    }))
                    setImages(existingImages)
                } else {
                    setImages([])
                }
            }
            setErrors({})
        }
    }, [product])

    return (
        <form onSubmit={handleSubmit} className="space-y-8">
            {/* Unsaved Changes Indicator */}
            {hasChanges && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <ExclamationTriangleIcon className="h-5 w-5 text-amber-600" />
                            <span className="text-amber-700 font-medium">You have unsaved changes</span>
                        </div>
                        <button
                            type="button"
                            onClick={handleDiscardChanges}
                            className="text-sm text-amber-600 hover:text-amber-800 font-medium"
                        >
                            Discard Changes
                        </button>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Left Column - Product Details */}
                <div className="space-y-6">
                    <FormInput
                        label="Product Name"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        error={errors.name}
                        required
                        placeholder="Enter product name"
                    />

                    <FormInput
                        label="Description"
                        name="description"
                        type="textarea"
                        value={formData.description}
                        onChange={handleInputChange}
                        error={errors.description}
                        required
                        placeholder="Describe your product..."
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormInput
                            label="Price"
                            name="price"
                            type="number"
                            value={formData.price}
                            onChange={handleInputChange}
                            error={errors.price}
                            required
                            placeholder="0.00"
                            min="0"
                            step="0.01"
                        />

                        <FormInput
                            label="Compare at Price"
                            name="compareAtPrice"
                            type="number"
                            value={formData.compareAtPrice}
                            onChange={handleInputChange}
                            error={errors.compareAtPrice}
                            placeholder="0.00"
                            min="0"
                            step="0.01"
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormInput
                            label="SKU"
                            name="sku"
                            value={formData.sku}
                            onChange={handleInputChange}
                            error={errors.sku}
                            placeholder="Product SKU"
                            disabled
                        />

                        <FormSelect
                            label="Category"
                            name="category"
                            value={formData.category}
                            onChange={handleInputChange}
                            error={errors.category}
                            required
                            options={categoryOptions}
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormInput
                            label="Stock Quantity"
                            name="stock"
                            type="number"
                            value={formData.stock}
                            onChange={handleInputChange}
                            error={errors.stock}
                            required
                            placeholder="0"
                            min="0"
                        />

                        <FormSelect
                            label="Status"
                            name="status"
                            value={formData.status}
                            onChange={handleInputChange}
                            options={[
                                { value: 'active', label: 'Active' },
                                { value: 'inactive', label: 'Inactive' },
                                { value: 'draft', label: 'Draft' }
                            ]}
                        />
                    </div>
                </div>

                {/* Right Column - Images */}
                <div>
                    <ImageUpload
                        images={images}
                        onImagesChange={setImages}
                        maxImages={5}
                    />
                    <ErrorMessage message={errors.images} className="mt-4" />
                </div>
            </div>

            {/* Submit Error */}
            <ErrorMessage message={errors.submit} />

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-gray-200">
                <button
                    type="button"
                    onClick={handleDiscardChanges}
                    disabled={!hasChanges || loading}
                    className="flex-1 px-6 py-3 text-sm font-semibold text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 disabled:opacity-50 transition-colors duration-200"
                >
                    Discard Changes
                </button>
                <button
                    type="submit"
                    disabled={!hasChanges || loading}
                    className="flex-1 px-6 py-3 text-sm font-semibold text-white bg-black rounded-xl hover:bg-gray-800 disabled:opacity-50 transition-colors duration-200 flex items-center justify-center gap-2"
                >
                    {loading ? (
                        <>
                            <LoadingSpinner size="sm" className="border-white" />
                            Updating Product...
                        </>
                    ) : (
                        <>
                            <CheckCircleIcon className="h-4 w-4" />
                            Update Product
                        </>
                    )}
                </button>
            </div>
        </form>
    )
})
ProductEditForm.displayName = 'ProductEditForm'

// Main Edit Product Page Component
export default function EditProductPage() {
    const { user, loading } = useUser()
    const router = useRouter()
    const params = useParams()
    const productId = params.id

    const [product, setProduct] = useState(null)
    const [isLoading, setIsLoading] = useState(true)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [deleteLoading, setDeleteLoading] = useState(false)
    const [success, setSuccess] = useState({ show: false, message: '' })

    // Memoized fetch product function
    const fetchProduct = useCallback(async () => {
        if (!user || !productId) return
        
        try {
            setIsLoading(true)
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1000))
            
            // Mock product data - replace with actual API call
            const mockProduct = {
                id: productId,
                name: 'Wireless Bluetooth Headphones',
                description: 'High-quality wireless headphones with noise cancellation and long battery life. Perfect for music lovers and professionals.',
                price: 2999,
                compareAtPrice: 3499,
                sku: 'WBH-001',
                category: 'electronics',
                stock: 45,
                status: 'active',
                images: [
                    'https://via.placeholder.com/400x400?text=Image+1',
                    'https://via.placeholder.com/400x400?text=Image+2'
                ],
                createdAt: '2025-01-10',
                updatedAt: '2025-01-12'
            }
            
            setProduct(mockProduct)
        } catch (error) {
            console.error('Error fetching product:', error)
        } finally {
            setIsLoading(false)
        }
    }, [user, productId])

    // Memoized navigation handlers
    const handleBack = useCallback(() => {
        router.push('/retailer/products')
    }, [router])

    const handleViewProduct = useCallback(() => {
        // Navigate to product view page (storefront)
        window.open(`/product/${productId}`, '_blank')
    }, [productId])

    const handleDeleteProduct = useCallback(async () => {
        if (!window.confirm(`Are you sure you want to delete "${product?.name}"? This action cannot be undone.`)) {
            return
        }

        setDeleteLoading(true)
        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1500))
            
            // Mock success response
            console.log('Product deleted:', productId)
            
            // Redirect to products list
            router.push('/retailer/products')
        } catch (error) {
            console.error('Error deleting product:', error)
        } finally {
            setDeleteLoading(false)
        }
    }, [product, productId, router])

    const handleCloseSuccess = useCallback(() => {
        setSuccess({ show: false, message: '' })
    }, [])

    // Handle form submission
    const handleUpdateProduct = useCallback(async (productData) => {
        setIsSubmitting(true)
        
        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 2000))
            
            // Mock success response - replace with actual API call
            console.log('Updated product data:', productData)
            
            setSuccess({ 
                show: true, 
                message: `Product "${productData.name}" updated successfully!` 
            })

            // Update local product state
            setProduct(prev => ({ ...prev, ...productData }))

            return { success: true }
        } catch (error) {
            console.error('Error updating product:', error)
            return { success: false, error: 'Failed to update product. Please try again.' }
        } finally {
            setIsSubmitting(false)
        }
    }, [])

    // Effect to fetch product when user/productId changes
    useEffect(() => {
        fetchProduct()
    }, [fetchProduct])

    if (loading || isLoading) {
        return <LoadingSkeleton />
    }

    if (!product) {
        return (
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="text-center py-16">
                    <ExclamationTriangleIcon className="h-12 w-12 text-red-500 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Product not found</h3>
                    <p className="text-gray-500 mb-8">The product you&apos;re looking for doesn&apos;t exist or has been deleted.</p>
                    <button
                        onClick={handleBack}
                        className="px-6 py-3 bg-black text-white rounded-xl hover:bg-gray-800 transition-colors duration-200"
                    >
                        Back to Products
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <PageHeader 
                productName={product.name}
                onBack={handleBack}
                onViewProduct={handleViewProduct}
                onDeleteProduct={handleDeleteProduct}
                deleteLoading={deleteLoading}
            />
            
            <SuccessMessage
                show={success.show}
                message={success.message}
                onClose={handleCloseSuccess}
            />
            
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
                <ProductEditForm
                    product={product}
                    onSubmit={handleUpdateProduct}
                    loading={isSubmitting}
                />
            </div>
        </div>
    )
}
