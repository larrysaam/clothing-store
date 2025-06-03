import PreOrder from '../models/preorderModel.js'
import Product from '../models/productModel.js'
import User from '../models/userModel.js'
import { sendOrderNotification } from '../utils/emailService.js'

export const getAllPreorders = async (req, res) => {
  try {
    const preorders = await PreOrder.find()
      .sort({ createdAt: -1 })
      .lean()
      .setOptions({ writeConcern: { w: 1, wtimeout: 5000 } })

    res.json({
      success: true,
      preorders
    })
  } catch (error) {
    console.error('Get preorders error:', error)
    res.status(500).json({
      success: false,
      message: error.message
    })
  }
}

export const updatePreorderStatus = async (req, res) => {
  try {
    const { preorderId, status } = req.body

    const preorder = await PreOrder.findByIdAndUpdate(
      preorderId,
      { status },
      { 
        new: true,
        writeConcern: { w: 1, wtimeout: 5000 }
      }
    )

    if (!preorder) {
      return res.status(404).json({
        success: false,
        message: 'Preorder not found'
      })
    }

    res.json({
      success: true,
      message: 'Preorder status updated successfully'
    })
  } catch (error) {
    console.error('Update preorder status error:', error)
    res.status(500).json({
      success: false,
      message: error.message
    })
  }
}

export const validateDeposit = async (req, res) => {
  try {
    const { preorderId } = req.body

    const preorder = await PreOrder.findByIdAndUpdate(
      preorderId,
      { payment: true },
      { 
        new: true,
        writeConcern: { w: 1, wtimeout: 5000 }
      }
    )

    if (!preorder) {
      return res.status(404).json({
        success: false,
        message: 'Preorder not found'
      })
    }

    res.json({
      success: true,
      message: 'Deposit validated successfully'
    })
  } catch (error) {
    console.error('Validate deposit error:', error)
    res.status(500).json({
      success: false,
      message: error.message
    })
  }
}

export const createPreorder = async (req, res) => {
  try {
    const { userId, items, address } = req.body

    const preorderData = {
      user: userId,
      items,
      address,
      status: 'Order Placed',
      paymentMethod: 'COD',
      payment: false,
      estimatedDeliveryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      createdAt: Date.now()
    }

    const newPreorder = new PreOrder(preorderData)
    await newPreorder.save({ 
      writeConcern: { w: 1, wtimeout: 5000 }
    })

    // Send email notification with isPreorder flag
    await sendOrderNotification(newPreorder, true)

    res.json({
      success: true,
      message: 'Preorder placed successfully'
    })
  } catch (error) {
    console.error('Create preorder error:', error)
    res.status(500).json({
      success: false,
      message: error.message
    })
  }
}