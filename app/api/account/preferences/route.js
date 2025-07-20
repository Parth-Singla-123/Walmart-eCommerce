import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import connectDB from '@/lib/mongodb'
import User from '@/models/User'
import { validatePreferences } from '@/lib/validations/userValidation'

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

        return NextResponse.json({
            preferences: mongoUser.preferences || {
                categories: [],
                priceRange: { min: 0, max: 50000 },
                currency: 'INR',
                notifications: {
                    email: true,
                    push: true,
                    orderUpdates: true,
                    deals: true,
                    newArrivals: false
                },
                privacy: {
                    showEmail: false,
                    profileVisibility: 'public'
                }
            }
        })
    } catch (error) {
        console.error('Preferences fetch error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}

export async function PUT(request) {
    try {
        const supabase = await createClient()
        const { data: { user }, error } = await supabase.auth.getUser()

        if (error || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const preferencesData = await request.json()

        // Validate preferences data
        const validation = validatePreferences(preferencesData)
        if (!validation.isValid) {
            return NextResponse.json({
                error: 'Invalid preferences data',
                details: validation.errors
            }, { status: 400 })
        }

        await connectDB()
        const mongoUser = await User.findOne({ supabaseId: user.id })

        if (!mongoUser) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 })
        }

        // Safely merge existing preferences with incoming data
        if (!mongoUser.preferences) {
            mongoUser.preferences = {};
        }

        const mergedPreferences = {
            ...mongoUser.preferences,
            ...preferencesData
        };

        // Ensure privacy object is always present
        if (preferencesData.privacy === undefined) {
            mergedPreferences.privacy = mongoUser.preferences.privacy ?? {
                showEmail: false,
                profileVisibility: 'public'
            };
        }

        mongoUser.preferences = mergedPreferences;

        await mongoUser.save()

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Preferences update error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
