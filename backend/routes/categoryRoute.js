import express from 'express';
import adminAuth, { checkPermission } from '../middleware/enhancedAdminAuth.js';
import {
  addMainCategory,
  addSubcategory,
  addSecondLevelSubcategory,
  deleteCategory,
  getCategories,
  getUserCategories
} from '../controllers/categoryController.js';

const router = express.Router();

router.get('/', getCategories);
router.post('/addMain', adminAuth, checkPermission('categories', 'manage'), addMainCategory);
router.post('/addSub', adminAuth, checkPermission('categories', 'manage'), addSubcategory);
router.post('/addSubSub', adminAuth, checkPermission('categories', 'manage'), addSecondLevelSubcategory);
router.delete('/delete', adminAuth, checkPermission('categories', 'manage'), deleteCategory);
router.get('/user', getUserCategories);

export default router;
