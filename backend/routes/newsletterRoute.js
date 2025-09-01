
import express from 'express';
import { subscribe, getAllSubscribers, sendNewsletterToSubscribers } from '../controllers/newsletterController.js';
import adminAuth from '../middleware/adminAuth.js'; // Assuming you have admin auth middleware

const router = express.Router();

router.post('/subscribe', subscribe);
router.get('/', adminAuth, getAllSubscribers); // Protect this route for admins
router.post('/send', adminAuth, sendNewsletterToSubscribers); // New route to send newsletter

export default router;
