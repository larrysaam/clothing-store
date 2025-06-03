import Setting from '../models/settingModel.js'
import cloudinary from 'cloudinary'
import fs from 'fs/promises'
import path from 'path'

// Configure cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
})

// Add this function to clean up temp files
const cleanupTempFiles = async (files) => {
  try {
    if (!files) return

    const cleanup = async (file) => {
      try {
        await fs.unlink(file.path)
      } catch (error) {
        console.error(`Failed to delete temp file: ${file.path}`)
      }
    }

    if (files.hero) {
      await Promise.all(files.hero.map(cleanup))
    }
    if (files.banner) {
      await cleanup(files.banner[0])
    }
  } catch (error) {
    console.error('Cleanup error:', error)
  }
}

export const updateSettings = async (req, res) => {
  try {
    const { currency, email } = req.body
    const updatedImages = { hero: [], banner: '' }

    // Handle hero images upload to cloudinary
    if (req.files && req.files.hero) {
      const heroImagesUrl = await Promise.all(
        req.files.hero.map(async (file) => {
          let result = await cloudinary.uploader.upload(file.path, {
            resource_type: 'image',
            folder: 'e-commerce/hero'
          })
          return result.secure_url
        })
      )
      updatedImages.hero = heroImagesUrl
    }

    // Handle banner image upload
    if (req.files && req.files.banner) {
      const result = await cloudinary.uploader.upload(req.files.banner[0].path, {
        resource_type: 'image',
        folder: 'e-commerce/banner'
      })
      updatedImages.banner = result.secure_url
    }

    // Find existing settings without write concern
    const currentSettings = await Setting.findOne()

    // Update settings with proper write concern
    const settings = await Setting.findOneAndUpdate(
      {},
      {
        currency,
        email,
        images: {
          hero: updatedImages.hero.length ? updatedImages.hero : currentSettings?.images?.hero || [],
          banner: updatedImages.banner || currentSettings?.images?.banner || ''
        }
      },
      { 
        new: true, 
        upsert: true,
        writeConcern: { w: 1 } // Set write concern to primary only
      }
    )

    res.json({ success: true, settings })
  } catch (error) {
    console.error('Update settings error:', error)
    res.status(500).json({ success: false, message: error.message })
  } finally {
    await cleanupTempFiles(req.files)
  }
}

export const getSettings = async (req, res) => {
  try {
    let settings = await Setting.findOne()
    
    if (!settings) {
      settings = await Setting.create({
        currency: { name: 'USD', sign: '$' },
        email: { notifications: 'notifications@example.com' },
        images: { hero: [], banner: '' }
      }, { 
        writeConcern: { w: 1 } // Set write concern to primary only
      })
    }
    
    res.json({ success: true, settings })
  } catch (error) {
    console.error('Get settings error:', error)
    res.status(500).json({ success: false, message: error.message })
  }
}