'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useUser } from '@/hooks/useUser'
import { EyeIcon, EyeSlashIcon, ArrowLeftIcon } from '@heroicons/react/24/outline'

export default function LoginPage() {
    const [isLogin, setIsLogin] = useState(true)
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        confirmPassword: ''
    })
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)
    const [errors, setErrors] = useState({})
    const [isSubmitting, setIsSubmitting] = useState(false)

    const { user, loading, error, signIn, signUp } = useUser()
    const router = useRouter()

    // Redirect if already logged in
    useEffect(() => {
        if (!loading && user) {
            router.push('/')
        }
    }, [user, loading, router])

    const validateForm = () => {
        const newErrors = {}

        if (!formData.email) {
            newErrors.email = 'Email is required'
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = 'Email is invalid'
        }

        if (!formData.password) {
            newErrors.password = 'Password is required'
        } else if (formData.password.length < 6) {
            newErrors.password = 'Password must be at least 6 characters'
        }

        if (!isLogin && !formData.confirmPassword) {
            newErrors.confirmPassword = 'Please confirm your password'
        } else if (!isLogin && formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = 'Passwords do not match'
        }

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        if (!validateForm()) return

        setIsSubmitting(true)
        setErrors({})

        try {
            let result
            if (isLogin) {
                result = await signIn(formData.email, formData.password)
            } else {
                result = await signUp(formData.email, formData.password)
            }

            if (result.error) {
                setErrors({ submit: result.error.message })
            } else {
                if (!isLogin) {
                    setErrors({ submit: 'Check your email to confirm your account!' })
                }
                // User will be redirected by the useEffect above
            }
        } catch (error) {
            setErrors({ submit: 'An unexpected error occurred' })
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleInputChange = (e) => {
        const { name, value } = e.target
        setFormData(prev => ({
            ...prev,
            [name]: value
        }))
        // Clear error when user starts typing
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }))
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Back to Home - Moved to Top */}
            <div className="w-full px-6 lg:px-12 py-4">
                <div className="max-w-8xl mx-auto">
                    <Link
                        href="/"
                        className="inline-flex items-center text-sm font-medium text-black hover:text-gray-600 transition-colors duration-200"
                    >
                        <ArrowLeftIcon className="h-4 w-4 mr-2" />
                        Back to home
                    </Link>
                </div>
            </div>

            <div className="flex flex-col justify-center py-4 sm:px-6 lg:px-8">
                <div className="sm:mx-auto sm:w-full sm:max-w-md">
                    {/* Brand Header - Made Larger */}
                    <div className="text-center mb-6">
                        <Link href="/" className="inline-block">
                            <h1 className="text-3xl font-bold text-black tracking-wide hover:text-gray-700 transition-colors duration-200">
                                WALMART
                            </h1>
                        </Link>
                        <p className="mt-2 text-sm text-gray-600">Save money. Live better.</p>
                    </div>

                    {/* Sign In Header - Made Smaller */}
                    <h2 className="text-center text-xl font-semibold text-black mb-4">
                        {isLogin ? 'Sign in to your account' : 'Create your account'}
                    </h2>
                </div>

                <div className="sm:mx-auto sm:w-full sm:max-w-md">
                    {/* Reduced Padding on Form Container */}
                    <div className="bg-white py-6 px-4 shadow-sm sm:rounded-xl sm:px-6 border border-gray-200">
                        {error && (
                            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl">
                                <p className="text-sm text-red-700">{error}</p>
                            </div>
                        )}

                        <form className="space-y-5" onSubmit={handleSubmit}>
                            {/* Email Field */}
                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-black mb-2">
                                    Email address
                                </label>
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    autoComplete="email"
                                    required
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    className={`w-full px-4 py-3 text-sm border-2 rounded-xl bg-white text-black placeholder:text-gray-500 focus:ring-2 focus:ring-black focus:border-black focus:outline-none transition-all duration-200 ${errors.email ? 'border-red-300' : 'border-gray-300'
                                        }`}
                                    placeholder="Enter your email"
                                />
                                {errors.email && (
                                    <p className="mt-2 text-sm text-red-600">{errors.email}</p>
                                )}
                            </div>

                            {/* Password Field */}
                            <div>
                                <label htmlFor="password" className="block text-sm font-medium text-black mb-2">
                                    Password
                                </label>
                                <div className="relative">
                                    <input
                                        id="password"
                                        name="password"
                                        type={showPassword ? 'text' : 'password'}
                                        autoComplete={isLogin ? 'current-password' : 'new-password'}
                                        required
                                        value={formData.password}
                                        onChange={handleInputChange}
                                        className={`w-full px-4 py-3 pr-12 text-sm border-2 rounded-xl bg-white text-black placeholder:text-gray-500 focus:ring-2 focus:ring-black focus:border-black focus:outline-none transition-all duration-200 ${errors.password ? 'border-red-300' : 'border-gray-300'
                                            }`}
                                        placeholder="Enter your password"
                                    />
                                    <button
                                        type="button"
                                        className="absolute inset-y-0 right-0 pr-4 flex items-center"
                                        onClick={() => setShowPassword(!showPassword)}
                                    >
                                        {showPassword ? (
                                            <EyeSlashIcon className="h-5 w-5 text-gray-600 hover:text-black transition-colors duration-200" />
                                        ) : (
                                            <EyeIcon className="h-5 w-5 text-gray-600 hover:text-black transition-colors duration-200" />
                                        )}
                                    </button>
                                </div>
                                {errors.password && (
                                    <p className="mt-2 text-sm text-red-600">{errors.password}</p>
                                )}
                            </div>

                            {/* Confirm Password Field (Sign Up Only) */}
                            {!isLogin && (
                                <div>
                                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-black mb-2">
                                        Confirm Password
                                    </label>
                                    <div className="relative">
                                        <input
                                            id="confirmPassword"
                                            name="confirmPassword"
                                            type={showConfirmPassword ? 'text' : 'password'}
                                            autoComplete="new-password"
                                            required
                                            value={formData.confirmPassword}
                                            onChange={handleInputChange}
                                            className={`w-full px-4 py-3 pr-12 text-sm border-2 rounded-xl bg-white text-black placeholder:text-gray-500 focus:ring-2 focus:ring-black focus:border-black focus:outline-none transition-all duration-200 ${errors.confirmPassword ? 'border-red-300' : 'border-gray-300'
                                                }`}
                                            placeholder="Confirm your password"
                                        />
                                        <button
                                            type="button"
                                            className="absolute inset-y-0 right-0 pr-4 flex items-center"
                                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        >
                                            {showConfirmPassword ? (
                                                <EyeSlashIcon className="h-5 w-5 text-gray-600 hover:text-black transition-colors duration-200" />
                                            ) : (
                                                <EyeIcon className="h-5 w-5 text-gray-600 hover:text-black transition-colors duration-200" />
                                            )}
                                        </button>
                                    </div>
                                    {errors.confirmPassword && (
                                        <p className="mt-2 text-sm text-red-600">{errors.confirmPassword}</p>
                                    )}
                                </div>
                            )}

                            {/* Submit Error */}
                            {errors.submit && (
                                <div className={`p-3 rounded-xl ${errors.submit.includes('email') ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
                                    }`}>
                                    <p className={`text-sm ${errors.submit.includes('email') ? 'text-green-700' : 'text-red-700'
                                        }`}>
                                        {errors.submit}
                                    </p>
                                </div>
                            )}

                            {/* Submit Button */}
                            <div>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="w-full flex justify-center py-3 px-6 border-2 border-transparent rounded-full text-sm font-medium text-white bg-black hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                                >
                                    {isSubmitting ? (
                                        <div className="flex items-center">
                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                            {isLogin ? 'Signing in...' : 'Creating account...'}
                                        </div>
                                    ) : (
                                        isLogin ? 'Sign in' : 'Create account'
                                    )}
                                </button>
                            </div>

                            {/* Toggle Auth Mode - Moved Under Button */}
                            <div className="text-center">
                                <p className="text-sm text-gray-600">
                                    {isLogin ? "Don't have an account? " : "Already have an account? "}
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setIsLogin(!isLogin)
                                            setFormData({ email: '', password: '', confirmPassword: '' })
                                            setErrors({})
                                        }}
                                        className="font-medium text-black hover:text-gray-600 transition-colors duration-200"
                                    >
                                        {isLogin ? 'Sign up here' : 'Sign in here'}
                                    </button>
                                </p>
                            </div>
                        </form>
                    </div>

                    {/* Trust Indicators */}
                    <div className="mt-6 text-center">
                        <div className="flex justify-center items-center space-x-6 text-sm text-gray-500">
                            <div className="flex items-center">
                                <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                                Secure checkout
                            </div>
                            <div className="flex items-center">
                                <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                                Data protection
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
