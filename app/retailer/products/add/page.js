'use client'

import { useState, useEffect, useMemo, useCallback, memo, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useUser } from '@/hooks/useUser'
import {
    XMarkIcon,
    CheckCircleIcon,
    ExclamationTriangleIcon,
    ArrowLeftIcon,
    CloudArrowUpIcon
} from '@heroicons/react/24/outline'
import LoadingSpinner from '@/components/ui/LoadingSpinner'

// Memoized Loading Skeleton Component
const LoadingSkeleton = memo(() => (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse space-y-8">
            <div className="h-8 bg-gray-200 rounded w-1/4"></div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-6">
                    {[...Array(4)].map((_, i) => (
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
const PageHeader = memo(({ onBack }) => (
    <div className="mb-8">
        <div className="flex items-center gap-4 mb-4">
            <button
                onClick={onBack}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors duration-200"
            >
                <ArrowLeftIcon className="h-5 w-5" />
            </button>
            <div>
                <h1 className="text-3xl font-bold text-gray-900">Add New Product</h1>
                <p className="text-gray-600 mt-2">Create and list a new product in your store</p>
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

// Memoized Image Upload Component
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
                            <img
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

// Memoized Form Input Component
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
                className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-black focus:border-black resize-none transition-all duration-200 ${error ? 'border-red-300 bg-red-50' : 'border-gray-300'
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
                className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-black focus:border-black transition-all duration-200 ${error ? 'border-red-300 bg-red-50' : 'border-gray-300'
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

// Memoized Form Select Component
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
            className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-black focus:border-black transition-all duration-200 ${error ? 'border-red-300 bg-red-50' : 'border-gray-300'
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

// Memoized Product Form Component
const ProductForm = memo(({ onSubmit, loading }) => {
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

    // Memoized category options
    const categoryOptions = useMemo(() => [
        { value: 'electronics', label: 'Electronics' },
        { value: 'clothing', label: 'Clothing' },
        { value: 'books', label: 'Books' },
        { value: 'home', label: 'Home & Garden' },
        { value: 'sports', label: 'Sports & Outdoors' },
        { value: 'toys', label: 'Toys & Games' }
    ], [])

    // Auto-generate SKU when product name changes
    useEffect(() => {
        if (formData.name && !formData.sku) {
            const sku = formData.name
                .toUpperCase()
                .replace(/[^A-Z0-9]/g, '')
                .slice(0, 6) + '-' + Date.now().toString().slice(-3)
            setFormData(prev => ({ ...prev, sku }))
        }
    }, [formData.name, formData.sku])

    const handleInputChange = useCallback((e) => {
        const { name, value, type } = e.target
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

        const productData = {
            ...formData,
            price: parseFloat(formData.price),
            compareAtPrice: formData.compareAtPrice ? parseFloat(formData.compareAtPrice) : null,
            stock: parseInt(formData.stock),
            images: images.map(img => img.url)
        }

        const result = await onSubmit(productData)
        if (!result.success) {
            setErrors({ submit: result.error })
        }
    }, [formData, images, validateForm, onSubmit])

    const handleSaveDraft = useCallback(async () => {
        const draftData = {
            ...formData,
            status: 'draft',
            images: images.map(img => img.url)
        }

        const result = await onSubmit(draftData)
        if (!result.success) {
            setErrors({ submit: result.error })
        }
    }, [formData, images, onSubmit])

    return (
        <form onSubmit={handleSubmit} className="space-y-8">
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
                                { value: 'inactive', label: 'Inactive' }
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
                    onClick={handleSaveDraft}
                    disabled={loading}
                    className="flex-1 px-6 py-3 text-sm font-semibold text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 disabled:opacity-50 transition-colors duration-200"
                >
                    Save as Draft
                </button>
                <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 px-6 py-3 text-sm font-semibold text-white bg-black rounded-xl hover:bg-gray-800 disabled:opacity-50 transition-colors duration-200 flex items-center justify-center gap-2"
                >
                    {loading ? (
                        <>
                            <LoadingSpinner size="sm" className="border-white" />
                            Publishing Product...
                        </>
                    ) : (
                        <>
                            <CheckCircleIcon className="h-4 w-4" />
                            Publish Product
                        </>
                    )}
                </button>
            </div>
        </form>
    )
})
ProductForm.displayName = 'ProductForm'

// Main Add Product Page Component
export default function AddProductPage() {
    const { user, loading } = useUser()
    const router = useRouter()
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [success, setSuccess] = useState({ show: false, message: '' })

    // Memoized navigation handlers
    const handleBack = useCallback(() => {
        router.push('/retailer/products')
    }, [router])

    const handleCloseSuccess = useCallback(() => {
        setSuccess({ show: false, message: '' })
    }, [])

    // Handle form submission
    const handleSubmitProduct = useCallback(async (productData) => {
        setIsSubmitting(true)

        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 2000))

            // Mock success response - replace with actual API call
            console.log('Product data:', productData)

            setSuccess({
                show: true,
                message: `Product "${productData.name}" ${productData.status === 'draft' ? 'saved as draft' : 'published'} successfully!`
            })

            // Redirect after success
            setTimeout(() => {
                router.push('/retailer/products')
            }, 2000)

            return { success: true }
        } catch (error) {
            console.error('Error creating product:', error)
            return { success: false, error: 'Failed to create product. Please try again.' }
        } finally {
            setIsSubmitting(false)
        }
    }, [router])

    if (loading) {
        return <LoadingSkeleton />
    }

    return (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <PageHeader onBack={handleBack} />

            <SuccessMessage
                show={success.show}
                message={success.message}
                onClose={handleCloseSuccess}
            />

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
                <ProductForm
                    onSubmit={handleSubmitProduct}
                    loading={isSubmitting}
                />
            </div>
        </div>
    )
}
