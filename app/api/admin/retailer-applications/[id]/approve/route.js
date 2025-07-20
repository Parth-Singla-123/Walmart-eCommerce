import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import connectDB from '@/lib/mongodb'
import RetailerApplication from '@/models/RetailerApplication'
import User from '@/models/User'

export async function POST(request, { params }) {
    try {
        await connectDB()

        const supabase = await createClient()
        const {
            data: { user },
            error
        } = await supabase.auth.getUser()

        if (error || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const mongoUser = await User.findOne({ supabaseId: user.id })
        if (!mongoUser || mongoUser.role !== 'Admin') {
            return NextResponse.json({ error: 'Access denied' }, { status: 403 })
        }

        const {id: applicationId} = await params

        const application = await RetailerApplication.findById(applicationId)
        if (!application) {
            return NextResponse.json({ error: 'Application not found' }, { status: 404 })
        }

        if (application.status !== 'pending') {
            return NextResponse.json({ error: 'Application already processed' }, { status: 400 })
        }

        // Update application status
        application.status = 'approved'
        application.reviewedBy = mongoUser._id
        application.reviewedAt = new Date()
        application.rejectionReason = ''

        await application.save()

        // Update user role to Retailer
        const applicantUser = await User.findById(application.userId)
        if (applicantUser) {
            applicantUser.role = 'Retailer'
            applicantUser.retailerVerification.status = 'approved'
            applicantUser.retailerVerification.verifiedAt = new Date()
            applicantUser.retailerVerification.verifiedBy = mongoUser._id.toString()
            await applicantUser.save()
        }

        return NextResponse.json({ message: 'Application approved successfully' })
    } catch (err) {
        console.error('Error approving application:', err)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
