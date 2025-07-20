import mongoose from 'mongoose'

const UserSchema = new mongoose.Schema({
    // primary identifier
    supabaseId: {
        type: String,
        required: true,
        unique: true,
        index: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true
    },
    role: {
        type: String,
        enum: ['Buyer', 'Retailer', 'Admin'],
        default: 'Buyer',
        required: true
    },
    profile: {
        name: String,
        avatar: String,
        phone: String
    },
    // address management for delivery and billing
    addresses: [{
        _id: {
            type: mongoose.Schema.Types.ObjectId,
            default: () => new mongoose.Types.ObjectId()
        },
        type: {
            type: String,
            enum: ['home', 'office', 'other'],
            default: 'home'
        },
        label: String, // like "home", "office", etc.
        street: {
            type: String,
            required: true
        },
        city: {
            type: String,
            required: true
        },
        state: {
            type: String,
            required: true
        },
        zipCode: {
            type: String,
            required: true
        },
        country: {
            type: String,
            default: 'India'
        },
        isDefault: {
            type: Boolean,
            default: false
        },
        isActive: {
            type: Boolean,
            default: true
        }
    }],
    preferences: {
        categories: [String],
        priceRange: {
            min: { type: Number, default: 0 },
            max: { type: Number, default: 1000 }
        },
        currency: { type: String, default: 'INR' },
        notifications: {  // Change from Boolean to Object
            email: { type: Boolean, default: true },
            push: { type: Boolean, default: true },
            orderUpdates: { type: Boolean, default: true },
            deals: { type: Boolean, default: true },
            newArrivals: { type: Boolean, default: false }
        },
        privacy: {
            showEmail: { type: Boolean, default: false },
            profileVisibility: { type: String, enum: ['public', 'private'], default: 'public' }
        }
    },
    // for personalization
    behavior: {
        searchHistory: [String],
        viewedProducts: [String],
        lastActive: {
            type: Date,
            default: Date.now
        }
    },
    retailerVerification: {
        status: {
            type: String,
            enum: ['none', 'pending', 'approved', 'rejected'],
            default: 'none'
        },
        appliedAt: { type: Date },
        verifiedAt: { type: Date },
        verifiedBy: { type: String }
    },
    adminPermissions: {
        grantedAt: { type: Date },
        grantedBy: { type: String },
        permissions: { type: [String], default: [] }
    }
}, {
    timestamps: true
})

// ensure only one default address per user
UserSchema.pre('save', function (next) {
    if (this.addresses && this.addresses.length > 0) {
        const defaultAddresses = this.addresses.filter(addr => addr.isDefault)
        if (defaultAddresses.length > 1) {
            // keep only the first default address
            this.addresses.forEach((addr, index) => {
                if (index > 0 && addr.isDefault) {
                    addr.isDefault = false
                }
            })
        }
    }
    next()
})

const User = mongoose.models.User || mongoose.model('User', UserSchema)

export default User
