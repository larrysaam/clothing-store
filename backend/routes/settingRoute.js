import express from 'express'
import multer from 'multer'
import { getSettings, updateSettings, updateBannerLink, deleteLook, deleteTrend } from '../controllers/settingController.js'
import adminAuth from '../middleware/adminAuth.js'

const router = express.Router()

// Configure multer for temporary storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'temp/') // Temporary storage before uploading to cloudinary
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    cb(null, file.fieldname + '-' + uniqueSuffix + '.' + file.originalname.split('.').pop())
  }
})

const upload = multer({ storage: storage })

router.get('/', adminAuth, getSettings)
router.get('/user', getSettings)
router.put('/',
  adminAuth,
  upload.fields([
    { name: 'hero', maxCount: 5 },
    { name: 'banner', maxCount: 1 },
    { name: 'look_0', maxCount: 1 },
    { name: 'look_1', maxCount: 1 },
    { name: 'look_2', maxCount: 1 },
    { name: 'look_3', maxCount: 1 },
    { name: 'look_4', maxCount: 1 },
    { name: 'trend_0', maxCount: 1 },
    { name: 'trend_1', maxCount: 1 },
    { name: 'trend_2', maxCount: 1 },
    { name: 'trend_3', maxCount: 1 }
  ]),
  updateSettings
)
router.put('/banner-link', adminAuth, updateBannerLink)
router.delete('/look/:lookIndex', adminAuth, deleteLook)
router.delete('/trend/:trendIndex', adminAuth, deleteTrend)

export default router
