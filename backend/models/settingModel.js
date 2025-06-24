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
  },
  text: {
    hero: { type: String, default: 'Welcome to our store!' }, // Default text for hero section
    banner: { type: String, default: 'Welcome to our store!' } // Default text for banner
  },
  herolink: {
    productId: { type: String }, // Default link for banner
    category: { type: String },
    subcategory: { type: String },  
    subsubcategory: { type: String }
  },
  link: {
    productId: { type: String }, // Default link for banner
    category: { type: String },
    subcategory: { type: String },  
    subsubcategory: { type: String }
  },
  looks: [{
    image: { type: String, required: true },
    label: { type: String, default: 'Shop the Look' },
    link: {
      productId: { type: String },
      category: { type: String },
      subcategory: { type: String },
      subsubcategory: { type: String }
    }
  }],
  trends: [{
    image: { type: String, required: true },
    label: { type: String, default: 'Trending Now' },
    link: {
      productId: { type: String },
      category: { type: String },
      subcategory: { type: String },
      subsubcategory: { type: String }
    }
  }],
  sectionVisibility: {
    showNewLook: { type: Boolean, default: true },
    showTrends: { type: Boolean, default: true }
  }
  
}, {
  timestamps: true
})

const Setting = mongoose.model('Setting', settingSchema)
export default Setting
