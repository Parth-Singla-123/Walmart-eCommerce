// lib/validations/userValidation.js

// Profile validation
export const validateProfile = (data) => {
    const errors = {}

    if (!data.name || data.name.trim().length < 2) {
        errors.name = 'Name must be at least 2 characters long'
    }

    if (data.name && data.name.trim().length > 50) {
        errors.name = 'Name must be less than 50 characters'
    }

    if (data.phone && data.phone.trim()) {
        if (!validateIndianPhone(data.phone)) {
            errors.phone = 'Please enter a valid Indian mobile number'
        }
    }

    return {
        isValid: Object.keys(errors).length === 0,
        errors
    }
}

// Add this function to userValidation.js
export const validateIndianPhone = (phone) => {
    const cleaned = phone.replace(/\D/g, '')

    // Check for 10-digit number starting with 6-9
    if (cleaned.length === 10 && /^[6-9]/.test(cleaned)) {
        return true
    }

    // Check for 12-digit number starting with 91
    if (cleaned.length === 12 && cleaned.startsWith('91')) {
        const mainNumber = cleaned.slice(2)
        return /^[6-9]/.test(mainNumber)
    }

    return false
}

// Enhanced address validation with Indian specifics
export const validateAddress = (data) => {
    const errors = {}

    if (!data.street || data.street.trim().length < 5) {
        errors.street = 'Street address must be at least 5 characters long'
    }

    if (data.street && data.street.trim().length > 100) {
        errors.street = 'Street address must be less than 100 characters'
    }

    if (!data.city || data.city.trim().length < 2) {
        errors.city = 'City is required'
    }

    if (data.city && data.city.trim().length > 50) {
        errors.city = 'City name must be less than 50 characters'
    }

    if (!data.state || data.state.trim().length < 2) {
        errors.state = 'State is required'
    }

    // Validate zipCode (6 digits for India)
    if (!data.zipCode || !/^\d{6}$/.test(data.zipCode)) {
        errors.zipCode = 'Please enter a valid 6-digit PIN code'
    }


    if (data.label && data.label.trim().length < 2) {
        errors.label = 'Label must be at least 2 characters long'
    }

    if (data.label && data.label.trim().length > 20) {
        errors.label = 'Label must be less than 20 characters'
    }

    // Validate address type
    const validTypes = ['home', 'office', 'other']
    if (data.type && !validTypes.includes(data.type)) {
        errors.type = 'Invalid address type'
    }

    return {
        isValid: Object.keys(errors).length === 0,
        errors
    }
}

// Enhanced Indian phone number formatting
export const formatPhoneNumber = (phone) => {
    const cleaned = phone.replace(/\D/g, '')

    // Format 10-digit number as: 99999-99999
    if (cleaned.length === 10) {
        return `${cleaned.slice(0, 5)}-${cleaned.slice(5)}`
    }

    // Format 12-digit number starting with 91 as: +91 99999-99999
    if (cleaned.length === 12 && cleaned.startsWith('91')) {
        return `+91 ${cleaned.slice(2, 7)}-${cleaned.slice(7)}`
    }

    return phone
}

// Address formatting utility
export const formatAddress = (address) => {
    if (!address) return ''

    const parts = [
        address.street,
        address.city,
        address.state,
        address.zipCode
    ].filter(Boolean)

    return parts.join(', ')
}

// PIN code validation with basic checks
export const validatezipCode = (zipCode) => {
    if (!/^\d{6}$/.test(zipCode)) {
        return { isValid: false, error: 'PIN code must be 6 digits' }
    }

    // Basic range check for Indian PIN codes
    const pin = parseInt(zipCode)
    if (pin < 100000 || pin > 999999) {
        return { isValid: false, error: 'Invalid PIN code range' }
    }

    return { isValid: true }
}

// Add this function to your existing userValidation.js file

export const validatePreferences = (data) => {
    const errors = {}

    // Validate categories
    if (data.categories && !Array.isArray(data.categories)) {
        errors.categories = 'Categories must be an array'
    }

    // Validate price range
    if (data.priceRange) {
        if (typeof data.priceRange.min !== 'number' || data.priceRange.min < 0) {
            errors.priceRange = 'Minimum price must be a positive number'
        }
        if (typeof data.priceRange.max !== 'number' || data.priceRange.max < data.priceRange.min) {
            errors.priceRange = 'Maximum price must be greater than minimum price'
        }
    }

    // Validate currency
    if (data.currency && !['INR', 'USD', 'EUR'].includes(data.currency)) {
        errors.currency = 'Invalid currency'
    }

    // Validate notifications
    if (data.notifications) {
        const validNotificationKeys = ['email', 'push', 'orderUpdates', 'deals', 'newArrivals']
        Object.keys(data.notifications).forEach(key => {
            if (!validNotificationKeys.includes(key)) {
                errors.notifications = 'Invalid notification setting'
            }
            if (typeof data.notifications[key] !== 'boolean') {
                errors.notifications = 'Notification settings must be boolean'
            }
        })
    }

    // Validate privacy
    if (data.privacy) {
        if (data.privacy.showEmail && typeof data.privacy.showEmail !== 'boolean') {
            errors.privacy = 'showEmail must be boolean'
        }
        if (data.privacy.profileVisibility && !['public', 'private'].includes(data.privacy.profileVisibility)) {
            errors.privacy = 'profileVisibility must be public or private'
        }
    }

    return {
        isValid: Object.keys(errors).length === 0,
        errors
    }
}
