import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import connectDB from '@/lib/mongodb'
import User from '@/models/User'
import RetailerApplication from '@/models/RetailerApplication'

export async function POST(request) {
    try {
        // Verify user authentication
        const supabase = await createClient()
        const { data: { user }, error } = await supabase.auth.getUser()

        if (error || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // Connect to database
        await connectDB()

        // Get user from MongoDB
        const mongoUser = await User.findOne({ supabaseId: user.id })
        if (!mongoUser) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 })
        }

        // Check if user is already a retailer
        if (mongoUser.role === 'Retailer') {
            return NextResponse.json({ error: 'You are already a retailer' }, { status: 400 })
        }

        // Check if user already has a pending application
        const existingApplication = await RetailerApplication.findOne({
            userId: mongoUser._id,
            status: 'pending'
        })

        if (existingApplication) {
            return NextResponse.json({
                error: 'You already have a pending application'
            }, { status: 400 })
        }

        // Prevent re-application once the user has been rejected previously
        const rejectedApplication = await RetailerApplication.findOne({
            userId: mongoUser._id,
            status: 'rejected'
        })

        if (rejectedApplication || mongoUser.retailerVerification?.status === 'rejected') {
            return NextResponse.json({
                error: 'Your previous application was rejected. You cannot apply again.'
            }, { status: 400 })
        }

        // Get request data
        const { businessName, businessDescription, businessCategory } = await request.json()

        // Validate required fields
        if (!businessName || !businessDescription || !businessCategory) {
            return NextResponse.json({
                error: 'All fields are required'
            }, { status: 400 })
        }

        // Validate business name length
        if (businessName.trim().length < 2) {
            return NextResponse.json({
                error: 'Business name must be at least 2 characters'
            }, { status: 400 })
        }

        // Validate business description length
        if (businessDescription.trim().length < 20) {
            return NextResponse.json({
                error: 'Business description must be at least 20 characters'
            }, { status: 400 })
        }

        // Validate business category
        const validCategories = ['Electronics', 'Clothing', 'Home & Garden', 'Books', 'Sports', 'Beauty', 'Food', 'Other']
        if (!validCategories.includes(businessCategory)) {
            return NextResponse.json({
                error: 'Invalid business category'
            }, { status: 400 })
        }

        // Create retailer application
        const application = await RetailerApplication.create({
            userId: mongoUser._id,
            status: 'pending',
            businessName: businessName.trim(),
            businessDescription: businessDescription.trim(),
            businessCategory,
            reviewedBy: null,
            reviewedAt: null,
            rejectionReason: ''
        })

        // Update user's retailer verification status
        await User.findByIdAndUpdate(mongoUser._id, {
            'retailerVerification.status': 'pending',
            'retailerVerification.appliedAt': new Date()
        })

        return NextResponse.json({
            success: true,
            message: 'Retailer application submitted successfully',
            application: {
                _id: application._id,
                status: application.status,
                businessName: application.businessName,
                businessDescription: application.businessDescription,
                businessCategory: application.businessCategory,
                createdAt: application.createdAt,
                reviewedBy: application.reviewedBy,
                reviewedAt: application.reviewedAt,
                rejectionReason: application.rejectionReason
            }
        }, { status: 201 })

    } catch (error) {
        console.error('Retailer application error:', error)

        // Handle validation errors
        if (error.name === 'ValidationError') {
            return NextResponse.json({
                error: 'Validation failed',
                details: error.message
            }, { status: 400 })
        }

        // Handle duplicate key errors
        if (error.code === 11000) {
            return NextResponse.json({
                error: 'Application already exists'
            }, { status: 409 })
        }

        return NextResponse.json({
            error: 'Internal server error'
        }, { status: 500 })
    }
}
