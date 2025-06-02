import mongoose from 'mongoose'

const categorySchema = new mongoose.Schema({
  Men: {
    type: [String],
    default: []
  },
  Women: {
    type: [String],
    default: []
  },
  Kids: {
    type: [String],
    default: []
  }
})

const Category = mongoose.model('Category', categorySchema)
export default Category