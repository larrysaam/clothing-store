import { addProduct, 
    listProducts, 
    removeProduct, 
    singleProduct, 
    updateProduct, 
    updateQuantity,
    addReview, 
    getProductReviews,
    addUserPhoto, 
    getUserPhotos
} from '../controllers/productController.js'
import express from 'express'
import upload from '../middleware/multer.js';
import adminAuth from '../middleware/adminAuth.js';
import authUser from '../middleware/auth.js';

const productRouter = express.Router();

productRouter.post('/add',adminAuth, upload.fields(
    [
        {name: 'image1', maxCount:1},
        {name: 'image2', maxCount:1},
        {name: 'image3', maxCount:1},
        {name: 'image4', maxCount:1},
    ]), addProduct);

productRouter.post('/remove',adminAuth, removeProduct);
productRouter.post('/single', singleProduct);
productRouter.get('/list', listProducts);
productRouter.put('/quantity', adminAuth, updateQuantity)
productRouter.put('/update/:id', authUser, updateProduct);


productRouter.post('/reviews/add', authUser, addReview)
productRouter.get('/product/:productId', getProductReviews)


productRouter.get('/user/photo/:productId', getUserPhotos);
productRouter.post('/user/photo/:productId', (req, res)=>{
    console.log('test   .....')
});


export default productRouter