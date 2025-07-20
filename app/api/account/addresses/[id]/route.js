import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import connectDB from '@/lib/mongodb'
import User from '@/models/User'

export async function PUT(request, { params }) {
    try {
        const supabase = await createClient()
        const { data: { user }, error } = await supabase.auth.getUser()

        if (error || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const addressData = await request.json()
        await connectDB()

        const mongoUser = await User.findOne({ supabaseId: user.id })
        if (!mongoUser) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 })
        }

        const address = mongoUser.addresses.id(params.id)
        if (!address) {
            return NextResponse.json({ error: 'Address not found' }, { status: 404 })
        }

        // If this is set as default, remove default from others
        if (addressData.isDefault) {
            mongoUser.addresses.forEach(addr => {
                if (addr._id.toString() !== params.id && addr.isDefault) {
                    addr.isDefault = false
                }
            })
        }

        // Update address
        address.type = addressData.type
        address.label = addressData.label
        address.street = addressData.street
        address.city = addressData.city
        address.state = addressData.state
        address.zipCode = addressData.zipCode
        address.isDefault = addressData.isDefault

        await mongoUser.save()

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Address update error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}

export async function DELETE(request, { params }) {
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

        const address = mongoUser.addresses.id(params.id)
        if (!address) {
            return NextResponse.json({ error: 'Address not found' }, { status: 404 })
        }

        // Mark as inactive instead of deleting
        address.isActive = false
        await mongoUser.save()

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Address deletion error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
