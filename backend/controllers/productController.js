import { v2 as cloudinary } from 'cloudinary'
import productModel from '../models/productModel.js'
import User from '../models/userModel.js'


// function for add products
const addProduct = async (req, res) => {
  try {
    const {
      name,
      description,
      price,
      category,
      subcategory,
      subsubcategory,
      sizes,
      bestseller,
      preorder,
      label
    } = req.body

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
      subsubcategory,
      sizes: formattedSizes,
      bestseller: bestseller === 'true',
      preorder: preorder === 'true',
      image: imagesUrl,
      label, // Add this line
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
    const { id } = req.params;
    const updates = req.body;

    // Validate the updates
    if (!updates) {
      return res.status(400).json({
        success: false,
        message: 'No update data provided'
      });
    }

    // Find and update the product
    const updatedProduct = await productModel.findByIdAndUpdate(
      id,
      {
        $set: {
          name: updates.name,
          description: updates.description,
          category: updates.category,
          subcategory: updates.subcategory,
          price: updates.price,
          sizes: updates.sizes,
          image: updates.image
        }
      },
      { new: true }
    );

    if (!updatedProduct) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    res.json({
      success: true,
      message: 'Product updated successfully',
      product: updatedProduct
    });
  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
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


const addReview = async (req, res) => {
  try {
    const { productId, rating, comment } = req.body
    const userId = req.body.userId // Changed from req.user.id to req.user._id

    // Validate inputs
    if (!productId || !rating || !comment) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields'
      })
    }

    // Find product first and check if exists
    const product = await productModel.findById(productId)
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      })
    }

    // Get user details
    const user = await User.findById(userId)
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      })
    }

    // Check if user has already reviewed
    const existingReview = product.reviews?.find(
      review => review.userId.toString() === userId.toString()
    )

    console.log('Existing review:', existingReview)

    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: 'You have already reviewed this product'
      })
    }

    // Initialize reviews array if it doesn't exist
    if (!product.reviews) {
      product.reviews = []
    }

    // Add review
    product.reviews.push({
      userId,
      userName: `${user.name}`,
      rating: Number(rating),
      comment,
      createdAt: new Date()
    })

    // Ensure calculateAverageRating method exists
    if (typeof product.calculateAverageRating !== 'function') {
      product.averageRating = product.reviews.reduce((acc, review) => acc + review.rating, 0) / product.reviews.length
      product.totalReviews = product.reviews.length
    } else {
      product.calculateAverageRating()
    }

    // Save with proper error handling
    await product.save()

    res.json({
      success: true,
      message: 'Review added successfully',
      averageRating: product.averageRating,
      totalReviews: product.totalReviews
    })

  } catch (error) {
    console.error('Add review error:', error)
    res.status(500).json({
      success: false,
      message: 'Error adding review: ' + (error.message || 'Unknown error')
    })
  }
}

const getProductReviews = async (req, res) => {
  try {
    const { productId } = req.params
    const product = await productModel.findById(productId)
      .select('reviews averageRating totalReviews')
      .sort({ 'reviews.createdAt': -1 })

    res.json({
      success: true,
      reviews: product.reviews,
      averageRating: product.averageRating,
      totalReviews: product.totalReviews
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    })
  }
}


const addUserPhoto = async (req, res) => {
  try {
    const { productId } = req.params;
    const userId = req.body.userId; // Get userId from auth middleware
    
    if (!req.file) {
      return res.status(400).json({ 
        success: false,
        message: 'No photo uploaded' 
      });
    }

    // Upload to Cloudinary
    const result = await cloudinary.uploader.upload(req.file.path, {
      resource_type: 'image',
      folder: 'user-photos' // Optional: organize uploads in folders
    });

    const product = await productModel.findById(productId);
    if (!product) {
      return res.status(404).json({ 
        success: false,
        message: 'Product not found' 
      });
    }

    // Initialize userPhotos array if it doesn't exist
    if (!product.userPhotos) {
      product.userPhotos = [];
    }

    // Add new photo
    product.userPhotos.push({
      imageUrl: result.secure_url,
      userId: userId,
      uploadDate: new Date()
    });

    await product.save();

    res.status(200).json({ 
      success: true, 
      message: 'Photo uploaded successfully',
      userPhotos: product.userPhotos,
      uploadedPhoto: result.secure_url 
    });
  } catch (error) {
    console.error('Photo upload error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error adding photo', 
      error: error.message 
    });
  }
};

const getUserPhotos = async (req, res) => {
  try {
    const { productId } = req.params;
    
    const product = await productModel.findById(productId)
      .select('userPhotos')
      .populate('userPhotos.userId', 'name'); // Optional: populate user details

    if (!product) {
      return res.status(404).json({ 
        success: false,
        message: 'Product not found' 
      });
    }

    res.status(200).json({ 
      success: true,
      userPhotos: product.userPhotos || [] 
    });
  } catch (error) {
    console.error('Fetch photos error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error fetching photos', 
      error: error.message 
    });
  }
};

export { addProduct, listProducts, removeProduct, singleProduct, updateProduct, updateQuantity, addReview, getProductReviews, addUserPhoto, getUserPhotos }