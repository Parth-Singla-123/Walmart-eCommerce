import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import connectDB from '@/lib/mongodb'
import User from '@/models/User'
import RetailerApplication from '@/models/RetailerApplication'

export async function GET(request) {
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

        // Get platform statistics
        const [
            totalUsers,
            totalRetailers,
            pendingApplications,
            totalApplications
        ] = await Promise.all([
            User.countDocuments(),
            User.countDocuments({ role: 'Retailer' }),
            RetailerApplication.countDocuments({ status: 'pending' }),
            RetailerApplication.countDocuments()
        ])

        const stats = {
            totalUsers,
            totalRetailers,
            pendingApplications,
            totalApplications
        }

        return NextResponse.json(stats)
    } catch (err) {
        console.error('Error fetching dashboard stats:', err)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
