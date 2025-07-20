import { memo } from 'react'

const LoadingSpinner = memo(({ size = 'md', className = '' }) => {
    const sizeClasses = {
        sm: 'h-4 w-4',
        md: 'h-8 w-8',
        lg: 'h-12 w-12'
    }

    return (
        <div className={`animate-spin rounded-full border-b-2 border-black ${sizeClasses[size]} ${className}`} />
    )
})

LoadingSpinner.displayName = 'LoadingSpinner'

export default LoadingSpinner
