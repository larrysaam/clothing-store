import { v2 as cloudinary } from 'cloudinary'
import productModel from '../models/productModel.js'


// function for add products
const addProduct = async (req, res) => {
  try {
    const { name, description, price, category, subcategory, sizes, bestseller, preorder } = req.body

    // Check if req.files exists
    if (!req.files) {
      return res.status(400).json({
        success: false,
        message: 'No images uploaded'
      })
    }

    // Log the files object to debug
    console.log('Uploaded files:', req.files)

    // Validate sizes and quantities
    const formattedSizes = JSON.parse(sizes).map(size => ({
      size: size.size,
      quantity: parseInt(size.quantity)
    }))

    // Extract images from request files
    const image1 = req.files?.image1?.[0]
    const image2 = req.files?.image2?.[0]
    const image3 = req.files?.image3?.[0]
    const image4 = req.files?.image4?.[0]

    // Filter out undefined images and upload to cloudinary
    const images = [image1, image2, image3, image4].filter(Boolean)
    
    if (images.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'At least one image is required'
      })
    }

    // Upload images to cloudinary
    const imagesUrl = await Promise.all(
      images.map(async (item) => {
        try {
          const result = await cloudinary.uploader.upload(item.path, {
            resource_type: 'image'
          })
          return result.secure_url
        } catch (error) {
          console.error('Cloudinary upload error:', error)
          throw new Error('Failed to upload image')
        }
      })
    )

    // Create new product
    const newProduct = new productModel({
      name,
      description,
      price,
      category,
      subcategory,
      sizes: formattedSizes,
      bestseller: bestseller === 'true',
      preorder: preorder === 'true',
      image: imagesUrl,
      date: new Date()
    })

    // Save product
    await newProduct.save({ writeConcern: { w: 1, wtimeout: 5000 }})

    res.json({
      success: true,
      message: 'Product added successfully'
    })
  } catch (error) {
    console.error('Add product error:', error)
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to add product'
    })
  }
}

// function for list products
const listProducts = async (req,res) => {
    try { 
        const products = await productModel.find({});
        res.json({
            success: true,
            products
        })
    } catch (error) {
        console.log(error)
        res.json({
            success: false,
            message: error.message
        })
    }

}

// function for removing product
const removeProduct = async (req,res) => {
    try {
        
        const remove = await productModel.findByIdAndDelete({_id : req.body.id},
          { writeConcern: { 
            w: 1,
            wtimeout: 5000 
          }})
        if (!remove) {
          return res.json({
            success: false,
            message: "Could not find a product to delete!"
          })
        }
        res.json({
            success: true,
            message: "Product Deleted"
        })

    } catch (error) {
        console.log(error)
        res.json({
            success: false,
            message: error.message
        })
    }
}

// function for single product info
const singleProduct = async (req,res) => {
    try {
        const { productId } = req.body;
        const product = await productModel.findById(productId)

        res.json({
            success: true,
            product
        })
    } catch (error) {
        console.log(error)
        res.json({
            success: false,
            message: error.message
        })
    }
}

const updateProduct = async (req, res) => {
  try {
    const { id } = req.params
    const { name, price, category, description } = req.body

    // Validate inputs
    if (!name || !price || !category) {
      return res.status(400).json({
        success: false,
        message: 'Name, price, and category are required'
      })
    }

    // Find and update the product
    const updatedProduct = await productModel.findByIdAndUpdate(
      id,
      {
        name,
        price,
        category,
        description
      },
      { new: true }
    )

    if (!updatedProduct) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      })
    }

    res.json({
      success: true,
      message: 'Product updated successfully',
      product: updatedProduct
    })
  } catch (error) {
    console.error('Update product error:', error)
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to update product'
    })
  }
}

// Add quantity update endpoint
const updateQuantity = async (req, res) => {
  try {
    const { productId, size, quantity } = req.body

    const product = await productModel.findById(productId)
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      })
    }

    const sizeIndex = product.sizes.findIndex(s => s.size === size)
    if (sizeIndex === -1) {
      return res.status(400).json({
        success: false,
        message: 'Size not found'
      })
    }

    product.sizes[sizeIndex].quantity = quantity
    await product.save()

    res.json({
      success: true,
      message: 'Quantity updated successfully'
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({
      success: false,
      message: error.message
    })
  }
}

export { addProduct, listProducts, removeProduct, singleProduct, updateProduct, updateQuantity}