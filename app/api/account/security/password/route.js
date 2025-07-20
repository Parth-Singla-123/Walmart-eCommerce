import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request) {
    try {
        const supabase = await createClient()
        const { data: { user }, error } = await supabase.auth.getUser()

        if (error || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { currentPassword, newPassword } = await request.json()

        // Validate input
        if (!currentPassword || !newPassword) {
            return NextResponse.json({
                error: 'Current password and new password are required'
            }, { status: 400 })
        }

        if (newPassword.length < 6) {
            return NextResponse.json({
                error: 'New password must be at least 6 characters long'
            }, { status: 400 })
        }

        // Verify current password by attempting to sign in
        const { error: signInError } = await supabase.auth.signInWithPassword({
            email: user.email,
            password: currentPassword
        })

        if (signInError) {
            return NextResponse.json({
                error: 'Current password is incorrect'
            }, { status: 400 })
        }

        // Update password
        const { error: updateError } = await supabase.auth.updateUser({
            password: newPassword
        })

        if (updateError) {
            return NextResponse.json({
                error: 'Failed to update password'
            }, { status: 500 })
        }

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Password update error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
