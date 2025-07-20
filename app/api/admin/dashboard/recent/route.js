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

        // Fetch last 5 applications with user data populated
        const recentApplications = await RetailerApplication.find()
            .populate('userId', 'profile email')
            .sort({ createdAt: -1 })
            .limit(5)
            .lean()

        return NextResponse.json(recentApplications)
    } catch (err) {
        console.error('Error fetching recent applications:', err)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
