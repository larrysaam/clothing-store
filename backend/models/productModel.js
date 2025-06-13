import mongoose from "mongoose";

const { Schema } = mongoose;

const userPhotoSchema = new Schema({
  imageUrl: { type: String, required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  uploadDate: { type: Date, default: Date.now }
});

const productSchema = new Schema({
    name: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    image: { type: Array, required: true },
    category: { type: String, required: true },
    subcategory: { type: String, required: true },
    subsubcategory: { type: String, required: true },
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
    },
    label: {
      type: String,
      enum: ['New model', 'Limited Edition', ''],
      default: ''
    },
    reviews: [{
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
      },
      userName: {
        type: String,
        required: true
      },
      rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5
      },
      comment: {
        type: String,
        required: true
      },
      createdAt: {
        type: Date,
        default: Date.now
      }
    }],
    averageRating: {
      type: Number,
      default: 0
    },
    totalReviews: {
      type: Number,
      default: 0
    },
    userPhotos: [userPhotoSchema]
  })
    

// Add method to calculate average rating
productSchema.methods.calculateAverageRating = function() {
  if (this.reviews.length === 0) {
    this.averageRating = 0;
    this.totalReviews = 0;
  } else {
    const sum = this.reviews.reduce((acc, review) => acc + review.rating, 0);
    this.averageRating = Math.round((sum / this.reviews.length) * 10) / 10;
    this.totalReviews = this.reviews.length;
  }
}

export default mongoose.model('Product', productSchema)