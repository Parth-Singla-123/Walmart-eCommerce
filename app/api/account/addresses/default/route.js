import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import connectDB from '@/lib/mongodb'
import User from '@/models/User'

export async function PUT(request) {
    try {
        const supabase = await createClient()
        const { data: { user }, error } = await supabase.auth.getUser()

        if (error || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { addressId } = await request.json()
        await connectDB()

        const mongoUser = await User.findOne({ supabaseId: user.id })
        if (!mongoUser) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 })
        }

        // Remove default from all addresses
        mongoUser.addresses.forEach(addr => {
            addr.isDefault = false
        })

        // Set new default
        const targetAddress = mongoUser.addresses.id(addressId)
        if (!targetAddress) {
            return NextResponse.json({ error: 'Address not found' }, { status: 404 })
        }

        targetAddress.isDefault = true
        await mongoUser.save()

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Default address update error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
