import mongoose from 'mongoose'

const preorderSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    items: {type: Array, required: true},
    address: {type: Object, required: true},
    status: {type: String, required: true, default: 'Order Placed'},
    estimatedDeliveryDate: {
        type: Date,
        required: true
    },
    paymentMethod: {type: String, required: true},
    payment: {type: Boolean, required: true, default: false},
    createdAt: {
        type: Date,
        default: Date.now
    }
    }, {
    timestamps: true
    })

// Add a new schema for preorder cart items (separate from completed preorders)
const preorderCartSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true
    },
    cartData: {
        type: Object,
        default: {}
    }
}, {
    timestamps: true
})

const PreOrder = mongoose.model('PreOrder', preorderSchema)
const PreorderCart = mongoose.model('PreorderCart', preorderCartSchema)

export default PreOrder
export { PreorderCart }