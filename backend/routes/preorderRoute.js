import express from 'express'
import  adminAuth  from '../middleware/adminAuth.js'
import auth from '../middleware/auth.js'
import { 
  createPreorder,
  getAllPreorders,
  updatePreorderStatus,
  validateDeposit,
//   deletePreorder,
//   getPreorderById
} from '../controllers/preorderController.js'

const router = express.Router()

router.post('/create', auth, createPreorder)
router.get('/list', adminAuth, getAllPreorders)
router.put('/status', adminAuth, updatePreorderStatus)
router.put('/deposit', adminAuth, validateDeposit)

export default router
