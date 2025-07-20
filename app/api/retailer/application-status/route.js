import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import connectDB from '@/lib/mongodb'
import User from '@/models/User'
import RetailerApplication from '@/models/RetailerApplication'

export async function GET(request) {
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

        // Find retailer application for user
        const application = await RetailerApplication.findOne({ userId: mongoUser._id })

        return NextResponse.json({ application }, { status: 200 })
    } catch (error) {
        console.error('Retailer application status error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
