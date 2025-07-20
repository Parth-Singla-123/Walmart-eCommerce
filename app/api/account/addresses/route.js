import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import connectDB from '@/lib/mongodb'
import User from '@/models/User'

export async function GET(request) {
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

        const addresses = mongoUser.addresses?.filter(addr => addr.isActive) || []

        return NextResponse.json({ addresses })
    } catch (error) {
        console.error('Addresses fetch error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}

export async function POST(request) {
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

        // If this is set as default, remove default from others
        if (addressData.isDefault) {
            mongoUser.addresses.forEach(addr => {
                if (addr.isDefault) addr.isDefault = false
            })
        }

        // Create new address
        const newAddress = {
            type: addressData.type,
            label: addressData.label,
            street: addressData.street,
            city: addressData.city,
            state: addressData.state,
            zipCode: addressData.zipCode,
            country: 'India',
            isDefault: addressData.isDefault,
            isActive: true
        }

        mongoUser.addresses.push(newAddress)
        await mongoUser.save()

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Address creation error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
