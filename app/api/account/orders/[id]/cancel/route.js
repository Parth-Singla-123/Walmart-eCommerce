import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import connectDB from '@/lib/mongodb'
import Order from '@/models/Order'
import User from '@/models/User'

export async function POST(request, { params }) {
    try {
        const supabase = await createClient()
        const { data: { user }, error } = await supabase.auth.getUser()

        if (error || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        await connectDB()

        const mongoUser = await User.findOne({ supabaseId: user.id })
        if (!mongoUser) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 })
        }

        const order = await Order.findOne({
            _id: params.id,
            userId: mongoUser._id
        })

        if (!order) {
            return NextResponse.json({ error: 'Order not found' }, { status: 404 })
        }

        // Check if order can be cancelled
        if (!['pending', 'confirmed'].includes(order.status)) {
            return NextResponse.json({
                error: 'Order cannot be cancelled at this stage'
            }, { status: 400 })
        }

        // Update order status
        order.status = 'cancelled'
        await order.save()

        return NextResponse.json({ success: true, order })
    } catch (error) {
        console.error('Order cancel error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
