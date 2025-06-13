import express from 'express'
import cors from 'cors'
import 'dotenv/config'
import connectDB from './config/mongodb.js'
import connectCloudinary from './config/cloudinary.js'
import userRouter from './routes/userRoute.js'
import productRouter from './routes/productRoute.js'
import cartRouter from './routes/cartRoute.js'
import orderRouter from './routes/orderRoute.js'
import DashboardRouter from './routes/dashboardRoute.js'
import CategoryRouter from './routes/categoryRoute.js'
import PreorderRouter from './routes/preorderRoute.js'
import settingRoute from './routes/settingRoute.js'
import reviewRoutes from './routes/reviewRoutes.js'
import photoRouter from './routes/PhotoRoute.js'

//App config

const app = express()
const port = process.env.PORT || 4000
connectDB()
connectCloudinary()




//middlewares

app.use(express.json())
app.use(cors())

//api endpoints
app.use('/api/user', userRouter)
app.use('/api/product', productRouter)
app.use('/api/cart', cartRouter)
app.use('/api/order', orderRouter)
app.use('/api/preorder', PreorderRouter)
app.use('/api/admin', DashboardRouter)
app.use('/api/categories', CategoryRouter)
app.use('/api/settings', settingRoute)
app.use('/api/reviews', reviewRoutes)
app.use('/api/photos', photoRouter)

app.get('/', (req, res) => {
    res.send("API working")
})

app.listen(port, ()=> console.log('Server started on port:' + port))