import express from 'express'
import { placeOrder, createPaymentIntent, placeOrderStripe, allOrders, userOrders, updateStatus, verifyStripe, validatePayment } from '../controllers/orderController.js'
import adminAuth from '../middleware/adminAuth.js'
import authUser from '../middleware/auth.js'

const orderRouter = express.Router()

//admin features
orderRouter.post('/list', adminAuth, allOrders)
orderRouter.post('/status', adminAuth, updateStatus)
orderRouter.post('/payment', adminAuth, validatePayment);

//payment features
orderRouter.post('/place', authUser, placeOrder)
orderRouter.post('/stripe', authUser, placeOrderStripe)
orderRouter.post('/create-payment-intent', authUser, createPaymentIntent)

//user features
orderRouter.post('/userorders', authUser, userOrders)

//verify payment
    orderRouter.post('/verifyStripe', authUser, verifyStripe)

export default orderRouter