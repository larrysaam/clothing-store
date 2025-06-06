import orderModel from "../models/orderModel.js";
import userModel from "../models/userModel.js";
import Stripe from 'stripe'
import { sendOrderNotification } from '../utils/emailService.js'

//global variables
const currency = process.env.CURRENCY || 'EUR' // Default currency symbol
const deliveryCharge = 10

//Gateway initialize
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

//Placing orders using COD method
const placeOrder = async (req, res) => {
    try {
        const { userId, items, amount, address } = req.body;

        const orderData = {
            userId,
            items,
            address,
            amount,
            paymentMethod: "COD",
            payment: false,
            date: Date.now()
        }

        const newOrder = new orderModel(orderData)
        await newOrder.save({ writeConcern: { w: 1 } }) // Set write concern to primary only

        // Send email notification
        await sendOrderNotification(newOrder)

        //clear the cart
        await userModel.findByIdAndUpdate(
            userId,
            { cartData: {} },
            { writeConcern: { w: 1 } }
        )

        res.json({
            success: true,
            message: 'Order placed'
        })
    } catch (error) {
        console.log(error)
        res.json({
            success: false,
            message: error.message
        })
    }
}


//Placing orders using Stripe method
const placeOrderStripe = async  (req,res) => {
    try {
        const { userId, items, amount, address, payment } = req.body;
        const { origin } = req.headers;
        const orderData = {
            userId,
            items,
            address,
            amount,
            paymentMethod: "Stripe",
            payment,
            date: Date.now()
        }

        const newOrder = new orderModel(orderData)
        await newOrder.save()

        const line_items = items.map((item)=> ({
            price_data: {
                currency: currency,
                product_data: {
                    name: item.name,
                },
                unit_amount: item.price * 100
            },
            quantity: item.quantity
        }))

        line_items.push({
            price_data: {
                currency: currency,
                product_data: {
                    name: "Delivery fee",
                },
                unit_amount: deliveryCharge * 100
            },
            quantity: 1,      
        })

        const session = await stripe.checkout.sessions.create({
            success_url: `${origin}/verify?success=true&orderId=${newOrder._id}`,
            cancel_url: `${origin}/verify?success=false&orderId=${newOrder._id}`,
            line_items,
            mode: 'payment',
        })

        res.json({
            success: true,
            session_url: session.url
        })
    } catch (error) {
        console.log(error)
        res.json({
            success: false,
            message: error.message
        })
    }
}

//verify Stripe
const verifyStripe = async (req,res) => {
    const { orderId, success, userId } = req.body;
    try {
        if (success === 'true') {
            //update status and clear the cart
            await orderModel.findByIdAndUpdate(orderId,{payment: true})
            await userModel.findByIdAndUpdate(userId,{cartData: {}})
            res.json({
                success: true
            })
        } else {
            await orderModel.findByIdAndDelete(orderId)
            res.json({
                success: false
            })
        }

    } catch (error) {
        console.log(error)
        res.json({
            success: false,
            message: error.message
        })
    }
}

//All orders data for Admin panel
const allOrders = async  (req,res) => {
    try {
        
        const orders = await orderModel.find({})
        res.json({ success:true, orders })
    } catch (error) {
        console.log(error)
        res.json({ success: false ,message: error.message })
    }
}

//User order data for frontend
const userOrders = async  (req,res) => {
    try {
        
        const { userId } = req.body

        const orders = await orderModel.find({userId})
        res.json({success: true, orders})

    } catch (error) {
        console.log(error)
        res.json({success: false, message: error.message})
    }
}

const validatePayment = async (req, res) => {
    try {
        const { orderId } = req.body;
        
        const order = await orderModel.findByIdAndUpdate(
            orderId,
            { payment: true },
            { 
                new: true,
                writeConcern: { w: 'majority' } // Proper write concern configuration
            }
        );

        console.log(order);

        if (!order) {
            return res.json({
                success: false,
                message: "Order not found"
            });
        }

        res.json({
            success: true,
            message: "Payment validated successfully"
        });
    } catch (error) {
        console.log(error);
        res.json({
            success: false,
            message: error.message
        });
    }
};



//Update Order Status from Admin panel
const updateStatus = async  (req,res) => {
    try {
        const { orderId, status } = req.body

        await orderModel.findByIdAndUpdate(orderId, { status })
        res.json({success: true, message: 'Status updated'})
    } catch (error) {
        console.log(error)
        res.json({success: false, message: error.message})  
    }
}

// Create Payment Intent
const createPaymentIntent = async (req, res) => {
  try {
    const { amount, address, orderData } = req.body;

    console.log('Creating payment intent with amount:', amount, 'and order data:', address);

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100),
      currency: process.env.CURRENCY || 'EUR',
      metadata: {
        customerEmail: address.email,
      }
    });

    res.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id
    });
  } catch (error) {
    console.error('Payment intent creation error:', error);
    res.status(500).json({
      error: error.message
    });
  }
};

// Handle successful payment and create order
const createOrder = async (req, res) => {
  try {
    const { address, items, amount, paymentIntentId } = req.body;
    const userId = req.user._id;

    // Verify payment intent status
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    
    if (paymentIntent.status !== 'succeeded') {
      throw new Error('Payment has not been completed');
    }

    // Create order
    const order = new orderModel({
      userId,
      items,
      address,
      amount,
      paymentMethod: 'stripe',
      paymentId: paymentIntentId,
      payment: true,
      status: 'processing',
      date: new Date()
    });

    await order.save();

    // Clear user's cart
    await userModel.findByIdAndUpdate(
      userId,
      { cartData: {} },
      { new: true }
    );

    // Send email notification
    await sendOrderNotification(order);

    res.json({
      success: true,
      message: 'Order created successfully',
      order
    });
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to create order'
    });
  }
};

export { placeOrder, placeOrderStripe, allOrders, userOrders, updateStatus, verifyStripe, validatePayment, createPaymentIntent, createOrder }