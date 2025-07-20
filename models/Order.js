import mongoose from 'mongoose'

const OrderSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    orderNumber: {
        type: String,
        required: true,
        unique: true
    },
    status: {
        type: String,
        enum: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'returned'],
        default: 'pending'
    },
    items: [{
        productId: String,
        name: String,
        image: String,
        price: Number,
        quantity: Number,
        size: String,
        color: String
    }],
    totals: {
        subtotal: Number,
        tax: Number,
        shipping: Number,
        discount: Number,
        total: Number
    },
    shippingAddress: {
        street: String,
        city: String,
        state: String,
        zipCode: String,
        country: String
    },
    tracking: {
        number: String,
        carrier: String,
        estimatedDelivery: Date
    },
    paymentMethod: {
        type: String,
        last4: String
    },
    timestamps: {
        orderDate: { type: Date, default: Date.now },
        confirmedAt: Date,
        shippedAt: Date,
        deliveredAt: Date
    }
}, {
    timestamps: true
})

const Order = mongoose.models.Order || mongoose.model('Order', OrderSchema)
export default Order
