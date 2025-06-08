import orderModel from "../models/orderModel.js";
import userModel from "../models/userModel.js";
import productModel from "../models/productModel.js";
import Stripe from 'stripe'
import { sendOrderNotification } from '../utils/emailService.js'
import { trusted } from "mongoose";

//global variables
const currency = process.env.CURRENCY || 'EUR' // Default currency symbol
const deliveryCharge = 10

//Gateway initialize
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

//Placing orders using COD method
const placeOrder = async (req, res) => {
  try {
    const { userId, items, amount, address } = req.body;

    // Update product quantities first
    await updateProductQuantities(items);

    const orderData = {
      userId,
      items,
      address,
      amount,
      paymentMethod: "COD",
      payment: false,
      date: Date.now()
    };

    const newOrder = new orderModel(orderData);
    await newOrder.save();

    // Send email notification
    await sendOrderNotification(newOrder);

    // Clear the cart
    await userModel.findByIdAndUpdate(
      userId,
      { cartData: {} }
    );

    res.json({
      success: true,
      message: 'Order placed successfully'
    });
  } catch (error) {
    console.error('Place order error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
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

const createCheckoutSession = async (req, res) => {
  try {
    const { items, address } = req.body;
    const userId = req.body.userId; // Get userId from auth middleware

    // Create line items for Stripe with proper image handling
    const lineItems = items.map(item => {
      // Ensure image is a valid URL string and wrap it in an array
      const imageUrl = Array.isArray(item.image) ? item.image[0] : item.image;
      
      return {
        price_data: {
          currency: process.env.CURRENCY || 'usd',
          product_data: {
            name: item.name,
            description: item.description || 'No description provided',
            images: imageUrl ? [imageUrl] : [], // Must be an array with valid URLs
          },
          unit_amount: Math.round(item.price * 100),
        },
        quantity: item.quantity,
      };
    });

    // Add delivery fee
    lineItems.push({
      price_data: {
        currency: process.env.CURRENCY || 'usd',
        product_data: {
          name: 'Delivery Fee',
          description: 'Standard Shipping',
        },
        unit_amount: 1000, // $10.00
      },
      quantity: 1,
    });

    const order = new orderModel({
      userId,
      items,
      address,
      amount: items.reduce((acc, item) => acc + (item.price * item.quantity), 0) + 10,
      paymentMethod: 'stripe',
      status: 'pending',
      payment: false,
      date: new Date()
    });

    // Save with proper write concern
    await order.save({ writeConcern: { w: 1 } }); // Use w: 1 for primary acknowledgment

    const session = await stripe.checkout.sessions.create({
      customer_email: address.email,
      line_items: lineItems,
      mode: 'payment',
      success_url: `${req.headers.origin}/order-success?session_id={CHECKOUT_SESSION_ID}&order_id=${order._id}`,
      cancel_url: `${req.headers.origin}/cart`,
      metadata: {
        orderId: order._id.toString(),
        userId: userId.toString()
      },
      shipping_address_collection: {
        allowed_countries: ['US', 'CA', 'GB', 'FR'],
      },
    });

    

    res.json({ 
      success: true,
      sessionId: session.id,
      sessionUrl: session.url 
    });
  } catch (error) {
    console.error('Checkout session error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

const verifyCheckoutSession = async (req, res) => {
  try {
    const { sessionId, orderId } = req.query;

    console.log('Verifying session:', sessionId);

    const session = await stripe.checkout.sessions.retrieve(sessionId);
    console.log('Session status:', session.payment_status);

    if (session.payment_status === 'paid') {
      // Get order details first
      const order = await orderModel.findById(orderId);
      if (!order) {
        throw new Error('Order not found');
      }

      // Update product quantities
      await updateProductQuantities(order.items);

      // Update order status
      const updatedOrder = await orderModel.findByIdAndUpdate(
        orderId,
        {
          payment: true,
          status: 'processing',
          paymentId: session.payment_intent
        },
        { new: true }
      );

      // Clear cart
      await userModel.findByIdAndUpdate(
        session.metadata.userId,
        { cartData: {} }
      );

      // Send notification
      await sendOrderNotification(updatedOrder);

      res.json({
        success: true,
        order: updatedOrder
      });
    } else if (session.payment_status === 'unpaid') {
      // Payment failed
      await orderModel.findByIdAndUpdate(
        orderId,
        {
          status: 'cancelled',
          payment: false
        }
      );

      res.status(400).json({
        success: false,
        message: 'Payment was not completed'
      });
    } else {
      console.warn('Unexpected payment status:', session.payment_status);
      throw new Error(`Unexpected payment status: ${session.payment_status}`);
    }
  } catch (error) {
    console.error('Session verification error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Add this helper function
const updateProductQuantities = async (items) => {
  console.log('Updating product quantities for items:', items);
  try {
    for (const item of items) {
      const product = await productModel.findById(item._id);
      if (!product) {
        throw new Error(`Product ${item._id} not found`);
      }

      console.log('Product found:', product.name);

      // Find the size object in the sizes array
      const sizeObj = product.sizes.find(s => s.size === item.size);
      
      if (!sizeObj) {
        throw new Error(`Size ${item.size} not found for product ${product.name}`);
      }

      // Check if quantity is available
      if (sizeObj.quantity < item.quantity) {
        throw new Error(`Insufficient quantity for ${product.name} in size ${item.size}`);
      }

      // Update the quantity in the size object
      sizeObj.quantity -= item.quantity;

      // Save the updated product
      await product.save();
      console.log(`Updated quantity for ${product.name} size ${item.size}: ${sizeObj.quantity}`);
    }
  } catch (error) {
    console.error('Error updating quantities:', error);
    throw new Error(`Failed to update product quantities: ${error.message}`);
  }
};

export { placeOrder, placeOrderStripe, allOrders, userOrders, updateStatus, verifyStripe, validatePayment, createPaymentIntent, createOrder, createCheckoutSession, verifyCheckoutSession }