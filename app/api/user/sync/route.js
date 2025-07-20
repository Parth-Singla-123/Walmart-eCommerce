import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import connectDB from '@/lib/mongodb'
import User from '@/models/User'

export async function POST(req) {
    try {
        // Check if user is authenticated
        const supabase = await createClient()
        const { data: { user }, error } = await supabase.auth.getUser()

        if (error || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // Connect to database
        await connectDB()

        // Check if user exists in MongoDB
        let mongoUser = await User.findOne({ supabaseId: user.id })

        if (!mongoUser) {
            // NEW USER: Create with Supabase data as initial values
            mongoUser = await User.create({
                supabaseId: user.id,
                email: user.email,
                name: user.user_metadata?.full_name || user.email.split('@')[0],
                avatar: user.user_metadata?.avatar_url || '',
                profile: {
                    name: user.user_metadata?.full_name || user.email.split('@')[0],
                    avatar: user.user_metadata?.avatar_url || '',
                    phone: ''
                },
                role: 'Buyer', // Default role for shopping app
                addresses: [],
                preferences: {
                    categories: [],
                    priceRange: { min: 0, max: 1000 },
                    currency: 'USD',
                    notifications: {
                        email: true,
                        push: true,
                        orderUpdates: true,
                        deals: true,
                        newArrivals: false,
                    },
                    privacy: {
                        showEmail: false,
                        profileVisibility: 'public',
                    }
                },
                searchHistory: [],
                retailerVerification: {
                    status: 'none',
                    appliedAt: null,
                    verifiedAt: null,
                    verifiedBy: null
                },
                adminPermissions: {
                    grantedAt: null,
                    grantedBy: null,
                    permissions: []
                },
                viewedProducts: [],
                orders: [],
                reviews: [],
                lastActive: new Date(),
                // Track whether profile fields have been manually edited
                profileEditedFields: {
                    name: false,
                    avatar: false,
                    preferences: false
                }
            })
        } else {
            // EXISTING USER: Only sync essential auth data, preserve profile edits
            const updateData = {
                lastActive: new Date(),
            }

            // ONLY sync email (auth-critical data)
            if (user.email && user.email !== mongoUser.email) {
                updateData.email = user.email
            }

            // CONDITIONALLY sync name and avatar ONLY if user hasn't edited them
            if (!mongoUser.profileEditedFields?.name &&
                user.user_metadata?.full_name &&
                user.user_metadata.full_name !== mongoUser.name) {
                // Update both root-level and nested profile name to keep data in sync
                updateData.name = user.user_metadata.full_name
                updateData["profile.name"] = user.user_metadata.full_name
            }

            if (!mongoUser.profileEditedFields?.avatar &&
                user.user_metadata?.avatar_url &&
                user.user_metadata.avatar_url !== mongoUser.avatar) {
                // Update both root-level and nested profile avatar to keep data in sync
                updateData.avatar = user.user_metadata.avatar_url
                updateData["profile.avatar"] = user.user_metadata.avatar_url
            }

            // Initialize missing fields for existing users (one-time migration)
            if (!mongoUser.preferences) {
                updateData.preferences = {
                    categories: [],
                    priceRange: { min: 0, max: 1000 },
                    currency: 'USD',
                    notifications: {
                        email: true,
                        push: true,
                        orderUpdates: true,
                        deals: true,
                        newArrivals: false,
                    },
                    privacy: {
                        showEmail: false,
                        profileVisibility: 'public',
                    }
                }
            }

            if (!mongoUser.searchHistory) {
                updateData.searchHistory = []
            }

            if (!mongoUser.viewedProducts) {
                updateData.viewedProducts = []
            }

            if (!mongoUser.orders) {
                updateData.orders = []
            }

            if (!mongoUser.reviews) {
                updateData.reviews = []
            }

            // Initialize retailerVerification for existing users
            if (!mongoUser.retailerVerification) {
                updateData.retailerVerification = {
                    status: 'none',
                    appliedAt: null,
                    verifiedAt: null,
                    verifiedBy: null
                }
            }

            // Initialize adminPermissions for existing users
            if (!mongoUser.adminPermissions) {
                updateData.adminPermissions = {
                    grantedAt: null,
                    grantedBy: null,
                    permissions: []
                }
            }

            // Initialize profileEditedFields for existing users
            if (!mongoUser.profileEditedFields) {
                updateData.profileEditedFields = {
                    name: false,
                    avatar: false,
                    preferences: false
                }
            }

            mongoUser = await User.findByIdAndUpdate(
                mongoUser._id,
                updateData,
                { new: true, runValidators: true }
            )
        }

        // Return safe user data for shopping app
        const safeUserData = {
            _id: mongoUser._id,
            supabaseId: mongoUser.supabaseId,
            email: mongoUser.email,
            name: mongoUser.name,
            avatar: mongoUser.avatar,
            role: mongoUser.role,
            profile: mongoUser.profile,
            addresses: mongoUser.addresses,
            preferences: mongoUser.preferences,
            searchHistory: mongoUser.searchHistory,
            viewedProducts: mongoUser.viewedProducts,
            orders: mongoUser.orders,
            reviews: mongoUser.reviews,
            retailerVerification: mongoUser.retailerVerification,
            adminPermissions: mongoUser.adminPermissions,
            createdAt: mongoUser.createdAt,
            lastActive: mongoUser.lastActive,
        }

        return NextResponse.json({ user: safeUserData }, { status: 200 })
    } catch (error) {
        console.error('User sync error:', error)

        // Handle validation errors
        if (error.name === 'ValidationError') {
            return NextResponse.json({
                error: 'User data validation failed',
                details: error.message
            }, { status: 400 })
        }

        // Handle duplicate key errors
        if (error.code === 11000) {
            return NextResponse.json({
                error: 'User already exists with this email or Supabase ID'
            }, { status: 409 })
        }

        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
