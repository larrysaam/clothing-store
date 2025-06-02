import Category from '../models/categoryModel.js'

export const getCategories = async (req, res) => {
  try {
    const categories = await Category.findOne()
    console.log('Fetched categories:', categories)
    
    res.json({ success: true, categories })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}


export const addSubcategory = async (req, res) => {
  try {
    const { mainCategory, subcategory } = req.body

    // Input validation
    if (!mainCategory || !subcategory) {
      return res.status(400).json({
        success: false,
        message: 'Main category and subcategory are required'
      })
    }

    // Find or create the category document
    let category = await Category.findOne()
    
    if (!category) {
      // If no category document exists, create a new one with proper write concern
      category = new Category({
        [mainCategory]: [subcategory]
      })
    } else {
      // If category exists but mainCategory doesn't
      if (!category[mainCategory]) {
        category[mainCategory] = [subcategory]
      }
      // If mainCategory exists, add subcategory if not already present
      else if (!category[mainCategory].includes(subcategory)) {
        category[mainCategory].push(subcategory)
      } else {
        return res.status(400).json({
          success: false,
          message: 'Subcategory already exists'
        })
      }
    }

    // Save with proper write concern options
    await category.save({ 
      writeConcern: { 
        w: 1,
        wtimeout: 5000 
      }
    })

    res.json({
      success: true,
      message: 'Subcategory added successfully',
      category: category[mainCategory]
    })
  } catch (error) {
    console.error('Add subcategory error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to add subcategory',
      error: error.message
    })
  }
}


export const updateSubcategory = async (req, res) => {
  try {
    const { mainCategory, oldSubcategory, newSubcategory } = req.body

    // Input validation
    if (!mainCategory || !oldSubcategory || !newSubcategory) {
      return res.status(400).json({
        success: false,
        message: 'Main category, old subcategory and new subcategory are required'
      })
    }

    const category = await Category.findOne()
    
    if (!category || !category[mainCategory]) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      })
    }

    const index = category[mainCategory].indexOf(oldSubcategory)
    if (index !== -1) {
      category[mainCategory][index] = newSubcategory
      await category.save({ 
        writeConcern: { 
          w: 1,
          wtimeout: 5000 
        }
      })

      console.log(`Updated subcategory from ${oldSubcategory} to ${newSubcategory} in ${mainCategory}`) 

      return res.json({
        success: true,
        message: 'Subcategory updated successfully',
        category: category[mainCategory]
      })
    }


  } catch (error) {
    console.error('Update subcategory error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to update subcategory',
      error: error.message
    })
  }
}

export const deleteSubcategory = async (req, res) => {
  try {
    const { mainCategory, subcategory } = req.body

    // Input validation
    if (!mainCategory || !subcategory) {
      return res.status(400).json({
        success: false,
        message: 'Main category and subcategory are required'
      })
    }

    // Find category document
    const category = await Category.findOne()
    
    // Check if category and mainCategory exist
    if (!category || !category[mainCategory]) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      })
    }

    // Check if subcategory exists
    if (!category[mainCategory].includes(subcategory)) {
      return res.status(404).json({
        success: false,
        message: 'Subcategory not found'
      })
    }

    // Remove subcategory
    category[mainCategory] = category[mainCategory].filter(item => item !== subcategory)
    
    // Save with proper write concern
    await category.save({ 
      writeConcern: { 
        w: 1,
        wtimeout: 5000 
      }
    })

    console.log(`Deleted subcategory ${subcategory} from ${mainCategory}`)

    res.json({
      success: true,
      message: 'Subcategory deleted successfully',
      category: category[mainCategory]
    })
  } catch (error) {
    console.error('Delete subcategory error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to delete subcategory',
      error: error.message
    })
  }
}