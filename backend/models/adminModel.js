import mongoose from 'mongoose'

const adminSchema = new mongoose.Schema({
    name: { 
        type: String, 
        required: true 
    },
    email: { 
        type: String, 
        required: true, 
        unique: true,
        lowercase: true 
    },
    password: { 
        type: String, 
        required: true 
    },
    role: {
        type: String,
        enum: ['superadmin', 'admin'],
        default: 'admin'
    },
    permissions: {
        dashboard: { type: Boolean, default: true },
        products: {
            view: { type: Boolean, default: true },
            add: { type: Boolean, default: false },
            edit: { type: Boolean, default: false },
            delete: { type: Boolean, default: false }
        },
        orders: {
            view: { type: Boolean, default: true },
            edit: { type: Boolean, default: false }
        },
        preorders: {
            view: { type: Boolean, default: true },
            edit: { type: Boolean, default: false }
        },
        categories: {
            view: { type: Boolean, default: true },
            manage: { type: Boolean, default: false }
        },
        settings: {
            view: { type: Boolean, default: false },
            edit: { type: Boolean, default: false }
        },
        messages: {
            view: { type: Boolean, default: true }
        },
        subscribers: {
            view: { type: Boolean, default: true },
            manage: { type: Boolean, default: false }
        },
        newsletter: {
            send: { type: Boolean, default: false }
        },
        adminManagement: {
            view: { type: Boolean, default: false },
            manage: { type: Boolean, default: false }
        }
    },
    isActive: { 
        type: Boolean, 
        default: true 
    },    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Admin',
        required: false
    }
}, { 
    timestamps: true 
})

const adminModel = mongoose.models.Admin || mongoose.model('Admin', adminSchema)

export default adminModel
