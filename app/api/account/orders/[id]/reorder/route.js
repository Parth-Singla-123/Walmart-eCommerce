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

        // Add items to cart (you'll need to implement cart logic)
        const cartItems = order.items.map(item => ({
            productId: item.productId,
            name: item.name,
            price: item.price,
            quantity: item.quantity,
            size: item.size,
            color: item.color
        }))

        // Here you would add items to the user's cart
        // For now, we'll just return the items

        return NextResponse.json({ success: true, cartItems })
    } catch (error) {
        console.error('Reorder error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
