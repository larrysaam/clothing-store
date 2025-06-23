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

    // Clean up look image files
    Object.keys(files).forEach(async (key) => {
      if (key.startsWith('look_')) {
        await cleanup(files[key][0])
      }
    })
  } catch (error) {
    console.error('Cleanup error:', error)
  }
}

export const updateSettings = async (req, res) => {
  try {
    const updateData = {}

    // Convert form data to proper objects
    const formData = Object.fromEntries(
      Object.entries(req.body).map(([key, value]) => {
        try {
          return [key, JSON.parse(value)]
        } catch {
          return [key, value]
        }
      })
    )

    // Handle basic text and currency settings
    if (formData.currency) {
      updateData.currency = {
        name: formData.currency.name || '',
        sign: formData.currency.sign || ''
      }
    }

    if (formData.email) {
      updateData['email.notifications'] = formData.email.notifications
    }

    if (formData.text) {
      updateData.text = {
        banner: formData.text.banner || '',
        hero: formData.text.hero || ''
      }
    }

    // Handle link data - already in JSON string format
    if (formData.link) {
      updateData.link = typeof formData.link === 'string' 
        ? JSON.parse(formData.link)
        : formData.link
    }
    
    // Handle hero link data - already in JSON string format
    if (formData.herolink) {
      updateData.herolink = typeof formData.herolink === 'string'
        ? JSON.parse(formData.herolink)
        : formData.herolink
    }

    // Handle looks data
    if (formData.looks) {
      updateData.looks = typeof formData.looks === 'string'
        ? JSON.parse(formData.looks)
        : formData.looks
    }

    // Handle file uploads
    if (req.files) {
      // Upload banner to Cloudinary
      if (req.files.banner) {
        const bannerResult = await cloudinary.uploader.upload(req.files.banner[0].path, {
          resource_type: 'image',
          folder: 'settings/banner'
        })
        updateData['images.banner'] = bannerResult.secure_url
      }

      // Upload hero images to Cloudinary
      if (req.files.hero) {
        const heroUploads = await Promise.all(
          req.files.hero.map(file =>
            cloudinary.uploader.upload(file.path, {
              resource_type: 'image',
              folder: 'settings/hero'
            })
          )
        )
        updateData['images.hero'] = heroUploads.map(result => result.secure_url)
      }

      // Handle look images - upload to Cloudinary
      const lookImageUploads = []
      Object.keys(req.files).forEach(key => {
        if (key.startsWith('look_')) {
          const index = key.split('_')[1]
          lookImageUploads.push({ index, file: req.files[key][0] })
        }
      })

      // Upload look images to Cloudinary
      for (const { index, file } of lookImageUploads) {
        const lookResult = await cloudinary.uploader.upload(file.path, {
          resource_type: 'image',
          folder: 'settings/looks'
        })

        if (!updateData.looks) {
          updateData.looks = []
        }
        if (!updateData.looks[index]) {
          updateData.looks[index] = {}
        }
        updateData.looks[index].image = lookResult.secure_url
      }
    }

    const settings = await Setting.findOneAndUpdate(
      {},
      { $set: updateData },
      { new: true, upsert: true }
    )

    console.log('Settings updated:', settings)

    res.json({
      success: true,
      settings
    })
  } catch (error) {
    console.error('Settings update error:', error)
    res.status(500).json({
      success: false,
      message: error.message
    })
  } finally {
    await cleanupTempFiles(req.files)
  }
}

export const getSettings = async (req, res) => {

  try {
    let settings = await Setting.findOne()
    
    if (!settings) {
      settings = await Setting.create({
        currency: { name: process.env.CURRENCY || 'EUR', sign: process.env.CURRENCY_SYMBOL || '€' },
        email: { notifications: 'notifications@example.com' },
        images: { hero: [], banner: '' }
      })
    }
    
    res.json({ success: true, settings })
  } catch (error) {
    console.error('Get settings error:', error)
    res.status(500).json({ success: false, message: error.message })
  }
}

export const updateBannerLink = async (req, res) => {
  try {
    const { linkType, productId, category, subcategory, subsubcategory } = req.body;

    // Prepare the link update object
    const linkUpdate = {
      link: {}
    };

    if (linkType === 'product') {
      linkUpdate.link = {
        productId,
        category: null,
        subcategory: null,
        subsubcategory: null
      };
    } else {
      linkUpdate.link = {
        productId: null,
        category,
        subcategory,
        subsubcategory
      };
    }

    // Find and update settings
    const settings = await Setting.findOneAndUpdate(
      {},
      linkUpdate,
      { new: true, upsert: true }
    );

    res.json({
      success: true,
      settings
    });
  } catch (error) {
    console.error('Banner link update error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update banner link'
    });
  }
};

// Helper function to extract Cloudinary public ID from URL
const getCloudinaryPublicId = (url) => {
  try {
    const parts = url.split('/');
    const filename = parts[parts.length - 1];
    const publicId = filename.split('.')[0];
    // Include folder path if it exists
    const folderIndex = parts.indexOf('settings');
    if (folderIndex !== -1) {
      const folderPath = parts.slice(folderIndex, -1).join('/');
      return `${folderPath}/${publicId}`;
    }
    return publicId;
  } catch (error) {
    console.error('Error extracting public ID:', error);
    return null;
  }
};

export const deleteLook = async (req, res) => {
  try {
    const { lookIndex } = req.params;

    // Get current settings
    const currentSettings = await Setting.findOne();
    if (!currentSettings || !currentSettings.looks || !currentSettings.looks[lookIndex]) {
      return res.status(404).json({
        success: false,
        message: 'Look not found'
      });
    }

    const lookToDelete = currentSettings.looks[lookIndex];

    // Delete image from Cloudinary if it exists
    if (lookToDelete.image) {
      try {
        const publicId = getCloudinaryPublicId(lookToDelete.image);
        if (publicId) {
          await cloudinary.uploader.destroy(publicId);
          console.log(`Deleted image from Cloudinary: ${publicId}`);
        }
      } catch (cloudinaryError) {
        console.error('Error deleting from Cloudinary:', cloudinaryError);
        // Continue with database deletion even if Cloudinary deletion fails
      }
    }

    // Remove the look from the array
    const updatedLooks = [...currentSettings.looks];
    updatedLooks.splice(lookIndex, 1);

    // Update settings in database
    const settings = await Setting.findOneAndUpdate(
      {},
      { $set: { looks: updatedLooks } },
      { new: true, upsert: true }
    );

    res.json({
      success: true,
      settings,
      message: 'Look deleted successfully'
    });
  } catch (error) {
    console.error('Delete look error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete look'
    });
  }
};
