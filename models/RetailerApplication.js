import mongoose from 'mongoose'

const RetailerApplicationSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending',
        required: true,
        index: true
    },
    businessName: {
        type: String,
        required: true,
        trim: true
    },
    businessDescription: {
        type: String,
        required: true,
        trim: true
    },
    businessCategory: {
        type: String,
        required: true,
        enum: ['Electronics', 'Clothing', 'Home & Garden', 'Books', 'Sports', 'Beauty', 'Food', 'Other']
    },
    reviewedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },
    reviewedAt: {
        type: Date,
        default: null
    },
    rejectionReason: {
        type: String,
        default: ''
    }
}, {
    timestamps: true
})

// Index for efficient queries
RetailerApplicationSchema.index({ status: 1, createdAt: -1 })

const RetailerApplication = mongoose.models.RetailerApplication ||
    mongoose.model('RetailerApplication', RetailerApplicationSchema)

export default RetailerApplication
