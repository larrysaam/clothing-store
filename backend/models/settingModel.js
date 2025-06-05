import mongoose from 'mongoose'

const settingSchema = new mongoose.Schema({
  currency: {
    name: { type: String, default: process.env.CURRENCY || 'EUR'},
    sign: { type: String, default: process.env.CURRENCY_SYMBOL || '€' }
  },
  email: {
    notifications: { type: String, required: true }
  },
  images: {
    hero: [{ type: String }], // Changed to array
    banner: { type: String }
  }
}, {
  timestamps: true
})

const Setting = mongoose.model('Setting', settingSchema)
export default Setting