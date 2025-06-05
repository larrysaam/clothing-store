import mongoose from "mongoose";

const { Schema } = mongoose;

const productSchema = new Schema({
    name: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    image: { type: Array, required: true },
    category: { type: String, required: true },
    subcategory: { type: String, required: true },
    sizes: [{
      size: {
        type: String,
        required: true
      },
      quantity: {
        type: Number,
        required: true,
        default: 0
      }
    }],
    bestseller: { type: Boolean },
    date: {
      type: Date,
      required: true,
      default: Date.now
    },
    preorder: {
      type: Boolean,
      default: false
    }})

export default mongoose.model('Product', productSchema)