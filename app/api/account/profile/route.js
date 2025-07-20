import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import connectDB from '@/lib/mongodb'
import User from '@/models/User'

// GET - Fetch user profile
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

        const profileData = {
            name: mongoUser.profile?.name || '',
            avatar: mongoUser.profile?.avatar || '',
            phone: mongoUser.profile?.phone || '',
            email: mongoUser.email
        }

        return NextResponse.json({ profile: profileData })
    } catch (error) {
        console.error('Profile fetch error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}

// PUT - Update user profile
export async function PUT(request) {
    try {
        const supabase = await createClient()
        const { data: { user }, error } = await supabase.auth.getUser()

        if (error || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const updates = await request.json()
        await connectDB()

        const updateData = {}

        if (updates.profile) {
            updateData.profile = {}

            if (updates.profile.name !== undefined) {
                updateData.profile.name = updates.profile.name.trim()
            }

            if (updates.profile.phone !== undefined) {
                updateData.profile.phone = updates.profile.phone.trim()
            }

            if (updates.profile.avatar !== undefined) {
                updateData.profile.avatar = updates.profile.avatar
            }
        }

        const updatedUser = await User.findOneAndUpdate(
            { supabaseId: user.id },
            { $set: updateData },
            { new: true, runValidators: true }
        )

        if (!updatedUser) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 })
        }

        return NextResponse.json({
            success: true,
            profile: {
                name: updatedUser.profile?.name || '',
                avatar: updatedUser.profile?.avatar || '',
                phone: updatedUser.profile?.phone || '',
                email: updatedUser.email
            }
        })
    } catch (error) {
        console.error('Profile update error:', error)

        if (error.name === 'ValidationError') {
            return NextResponse.json({
                error: 'Validation failed',
                details: error.message
            }, { status: 400 })
        }

        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
