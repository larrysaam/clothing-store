import express from 'express'
import adminAuth from '../middleware/auth.js'
import authUser from '../middleware/auth.js'
import { 
  getCategories, 
  addSubcategory, 
  updateSubcategory, 
  deleteSubcategory 
} from '../controllers/categoryController.js'

const router = express.Router()

router.get('/', adminAuth, getCategories)
router.get('/user', getCategories) // For user to fetch categories
router.post('/add', adminAuth, addSubcategory)
router.put('/update', adminAuth, updateSubcategory)
router.delete('/delete', adminAuth, deleteSubcategory)

export default router
