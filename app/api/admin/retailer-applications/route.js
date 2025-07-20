import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import connectDB from '@/lib/mongodb'
import RetailerApplication from '@/models/RetailerApplication'
import User from '@/models/User'

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

        // Fetch applications with user data populated
        const applications = await RetailerApplication.find()
            .populate('userId', 'profile email')
            .sort({ createdAt: -1 })
            .lean()

        return NextResponse.json(applications)
    } catch (err) {
        console.error('Error fetching retailer applications:', err)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
