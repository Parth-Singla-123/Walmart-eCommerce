import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import connectDB from '@/lib/mongodb'
import Order from '@/models/Order'
import User from '@/models/User'

// GET - Fetch user orders
export async function GET(request) {
    try {
        const supabase = await createClient()
        const { data: { user }, error } = await supabase.auth.getUser()

        if (error || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        await connectDB()

        // Get user from MongoDB to get the ObjectId
        const mongoUser = await User.findOne({ supabaseId: user.id })
        if (!mongoUser) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 })
        }

        const { searchParams } = new URL(request.url)
        const status = searchParams.get('status')
        const dateRange = searchParams.get('dateRange')
        const search = searchParams.get('search')

        // Build query
        const query = { userId: mongoUser._id }

        if (status) {
            query.status = status
        }

        if (dateRange) {
            const days = parseInt(dateRange)
            const startDate = new Date()
            startDate.setDate(startDate.getDate() - days)
            query['timestamps.orderDate'] = { $gte: startDate }
        }

        if (search) {
            query.$or = [
                { orderNumber: { $regex: search, $options: 'i' } },
                { 'items.name': { $regex: search, $options: 'i' } }
            ]
        }

        const orders = await Order.find(query)
            .sort({ 'timestamps.orderDate': -1 })
            .limit(50)

        return NextResponse.json({ orders })
    } catch (error) {
        console.error('Orders fetch error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
