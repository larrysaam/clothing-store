import express from 'express'
import { 
    getAllAdmins, 
    addAdmin, 
    updateAdminPermissions, 
    deleteAdmin, 
    getAdminProfile 
} from '../controllers/adminController.js'
import adminAuth, { superAdminOnly } from '../middleware/enhancedAdminAuth.js'

const adminRouter = express.Router()

// Get current admin profile
adminRouter.get('/profile', adminAuth, getAdminProfile)

// Superadmin only routes
adminRouter.get('/list', adminAuth, superAdminOnly, getAllAdmins)
adminRouter.post('/add', adminAuth, superAdminOnly, addAdmin)
adminRouter.put('/permissions', adminAuth, superAdminOnly, updateAdminPermissions)
adminRouter.delete('/delete', adminAuth, superAdminOnly, deleteAdmin)

export default adminRouter
