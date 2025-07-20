import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import connectDB from '@/lib/mongodb'
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

        // Fetch all users with essential information only
        const users = await User.find()
            .select('profile email role createdAt retailerVerification')
            .sort({ createdAt: -1 })
            .lean()

        return NextResponse.json(users)
    } catch (err) {
        console.error('Error fetching users:', err)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
