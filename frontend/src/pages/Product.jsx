import React, { useContext, useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { ShopContext } from '@/context/ShopContext'
import RelatedProducts from '@/features/product/RelatedProducts';
import { ProductSkeleton } from '@/components/ProductSkeleton';
import NotFound from '@/components/NotFound';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import axios from 'axios';
import { toast } from 'react-toastify';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"

const Product = () => {

  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const { productId } = useParams();
  const { products, currency, addToCart, token, navigate, isLoading } = useContext(ShopContext)
  const [productData, setProductData] = useState()
  const [image, setImage] = useState('')
  const [size, setSize] = useState('')
  const [hasPreordered, setHasPreordered] = useState(false)
  const [showAddressForm, setShowAddressForm] = useState(false)
  const [address, setAddress] = useState({
    firstName: '',
    lastName: '',
    email: '',
    street: '',
    city: '',
    state: '',
    country: '',
    zipcode: '',
    phone: ''
  })
  const [addressDialogOpen, setAddressDialogOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const foundProduct = products.find((item) => item._id == productId);

  useEffect(() => {

    setProductData(foundProduct);
    setImage(foundProduct?.image[0]);

  }, [productId, products]);

  const handlePreorder = async () => {
    if (!token) {
      navigate('/login')
      return
    }

    if (!size) {
      toast.error('Please select a size')
      return
    }

    setAddressDialogOpen(true)
  }

  const handlePreorderSubmit = async () => {
    try {
      if (!address.firstName || !address.lastName || !address.email || !address.phone || 
          !address.street || !address.city || !address.state || !address.country || !address.zipcode) {
        toast.error('Please fill all address fields')
        return
      }

      setIsSubmitting(true)

      const preorderItem = {
        productId: productData._id,
        name: productData.name,
        size: size,
        quantity: 1,
        price: productData.price,
        image: productData.image[0]
      }

      const response = await axios.post(`${backendUrl}/api/preorder/create`, {
        userId: token,
        items: [preorderItem],
        address
      }, {
        headers: { token }
      })

      if (response.data.success) {
        toast.success('Preorder placed successfully')
        setHasPreordered(true)
        setAddressDialogOpen(false)
        setAddress({
          firstName: '', lastName: '', email: '', street: '', city: '',
          state: '', country: '', zipcode: '', phone: ''
        })
      }
    } catch (error) {
      if (error.response?.status === 409) {
        toast.error('You have already preordered this item')
      } else {
        toast.error('Failed to place preorder')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const [selectedSize, setSelectedSize] = useState(null)
  const availableQuantity = selectedSize 
    ? productData?.sizes.find(s => s.size === selectedSize)?.quantity || 0
    : 0

  const handleAddToCart = () => {
    if (!token) {
      navigate('/login')
      return
    }
    if (!selectedSize) {
      toast.error('Please select a size')
      return
    }
    
    addToCart(productData?._id, selectedSize)
    toast.success('Product added to cart successfully!')
  }

  if (isLoading) {
    return <ProductSkeleton />
  }

  if (!foundProduct) {
    return (<NotFound />)
  }

  return (
    <div className='border-t-2 pt-10 animate-fade animate-duration-500 mx-4 sm:mx-2 sm:mt-0 md:mx-8 lg:mx-16 xl:mx-24'>
      <div>
        {/* ----------- Product Data ----------- */}
        <div className='flex gap-12 sm:gap-20 flex-col sm:flex-row'>
          {/* ----------- Product Images ----------- */}
          <div className='flex-1 flex flex-col-reverse gap-3 sm:flex-row'>
            {/* Side thumbnails */}
            <div className='flex sm:flex-col overflow-x-auto sm:overflow-y-auto 
                justify-between sm:justify-start w-full sm:w-[15%] sm:max-h-[500px]'>
              {productData?.image.map((item, index) => (
                <img 
                  src={item} 
                  alt={`product-${index + 1}`} 
                  key={index} 
                  onClick={() => setImage(item)}
                  className={`w-[24%] sm:w-full sm:h-[80px] object-cover mb-2 flex-shrink-0 
                    cursor-pointer rounded-md transition-opacity duration-200 
                    hover:opacity-80 ${image === item ? 'border-2 border-black' : ''}`}
                />
              ))}
            </div>

            {/* Main image */}
            <div className='w-full sm:w-[85%] sm:h-[500px]'>
              <img 
                src={image} 
                className='w-full h-full object-cover rounded-md' 
                alt='main-product-image' 
              />
            </div>
          </div>
          {/* ----------- Product Info ----------- */}
          <div className='flex-1'>
            <h1 className='font-medium text-2xl mt-2'>{productData?.name}</h1>
            <p className='mt-5 font-medium text-3xl'>{currency}{productData?.price}</p>
            <p className='mt-5 text-gray-500 md:w-4/5'>{productData?.description}</p>
            <div className='flex flex-col gap-4 my-8'>
              <p>Select size:</p>
              <ToggleGroup className='flex justify-start gap-2' type="single">
                {productData?.sizes.map((sizeObj) => (
                  <ToggleGroupItem
                    key={sizeObj.size}
                    value={sizeObj.size}
                    disabled={sizeObj.quantity === 0}
                    className={`transition-all duration-200
                      ${sizeObj.quantity === 0 ? 'opacity-50 cursor-not-allowed' : ''}
                      ${size === sizeObj.size ? 'bg-black text-white' : ''}`}
                    onClick={() => setSelectedSize(sizeObj.size)}
                  >
                    {sizeObj.size}
                    <span className="text-xs ml-1">({sizeObj.quantity})</span>
                  </ToggleGroupItem>
                ))}
              </ToggleGroup>
              {selectedSize && availableQuantity > 0 && (
                <p className="text-sm text-gray-600">
                  {availableQuantity} items available
                </p>
              )}
            </div>
            {/* ----------- Replace the existing buttons section ----------- */}
            {productData?.preorder ? (
              hasPreordered ? (
                <button 
                  disabled
                  className='bg-gray-400 text-white px-8 py-3 text-sm rounded-full cursor-not-allowed'
                >
                  Preordered
                </button>
              ) : (
                <button 
                  onClick={handlePreorder}
                  disabled={!selectedSize}
                  className={`bg-blue-600 text-white px-8 py-3 text-sm rounded-full ${
                    !selectedSize ? 'opacity-50 cursor-not-allowed' : 'active:bg-blue-700'
                  }`}
                >
                  PREORDER NOW
                </button>
              )
            ) : (
              <button 
                onClick={handleAddToCart}
                disabled={!selectedSize || availableQuantity === 0}
                className={`bg-black text-white px-8 py-3 text-sm rounded-full ${
                  !selectedSize || availableQuantity === 0 
                    ? 'opacity-50 cursor-not-allowed' 
                    : 'active:bg-gray-700'
                }`}
              >
                {availableQuantity === 0 ? 'OUT OF STOCK' : 'ADD TO CART'}
              </button>
            )}
            <hr className='mt-8 sm:w-4/5' />
            <div className='text-sm text-gray-500 mt-5 flex flex-col gap-1'>
              <p>100% Original Product</p>
              <p>Cash on delivery is available on this product</p>
              <p>Easy return and exchange policy within 7 days</p>
            </div>
          </div>
        </div>
        {/*  -----------Description and Tabs Section -----------*/}
        <div className='mt-20'>
          <Tabs defaultValue="description" className="">
            <TabsList className='bg-white border text-sm h-12 p-[0.5px]'>
              <TabsTrigger className='px-4 py-3 data-[state=active]:border data-[state=active]:font-semibold'
                value="description">
                  Description</TabsTrigger>
                  <TabsTrigger className='px-4 py-3 data-[state=active]:border data-[state=active]:font-semibold'
              value="specs">
                Specifications</TabsTrigger>
            </TabsList>
            <div className='text-gray-700 text-base mt-2'>
              <TabsContent
              className='p-4 mt-0 border'
              value="description">
                <div>
                This premium cotton t-shirt offers ultimate comfort and durability. Designed for everyday wear, it features a breathable fabric and a modern fit. Available in multiple colors to match any style.
                </div>
                <div className='mt-2'>
                Embrace timeless fashion with our Classic Relaxed-Fit Jacket—a versatile wardrobe staple that blends comfort with effortless style. Designed for everyday wear, this jacket offers a relaxed fit with a modern edge, perfect for layering in any season.
                </div>
              </TabsContent>
              <TabsContent 
              className='p-4 mt-0 border'
              value="specs">
                <ul>
                  <li><b>Material: </b>{`100% Organic Cotton`}</li>
                  <li><b>Fit: </b>{`Regular / Slim`}</li>
                  <li><b>Care Instructions: </b>{`Machine wash cold, tumble dry low`}</li>
                  <li><b>Country of Origin: </b>{`Italy`}</li>
                </ul>
              </TabsContent>
            </div>
          </Tabs>
        </div>
        {/*  ----------- Related Products -----------*/}
        <RelatedProducts category={productData?.category || ''} subcategory={productData?.subcategory || ''} id={productId} />
      </div>

      {/* ----------- Address Dialog ----------- */}
      <Dialog open={addressDialogOpen} onOpenChange={setAddressDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Shipping Address</DialogTitle>
            <DialogDescription>
              Please enter your shipping details to complete the preorder.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Input
                  placeholder="First Name"
                  value={address.firstName}
                  onChange={(e) => setAddress({...address, firstName: e.target.value})}
                />
              </div>
              <div className="grid gap-2">
                <Input
                  placeholder="Last Name"
                  value={address.lastName}
                  onChange={(e) => setAddress({...address, lastName: e.target.value})}
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Input
                type="email"
                placeholder="Email"
                value={address.email}
                onChange={(e) => setAddress({...address, email: e.target.value})}
              />
            </div>
            <div className="grid gap-2">
              <Input
                type="tel"
                placeholder="Phone Number"
                value={address.phone}
                onChange={(e) => setAddress({...address, phone: e.target.value})}
              />
            </div>
            <div className="grid gap-2">
              <Input
                placeholder="Street Address"
                value={address.street}
                onChange={(e) => setAddress({...address, street: e.target.value})}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Input
                placeholder="City"
                value={address.city}
                onChange={(e) => setAddress({...address, city: e.target.value})}
              />
              <Input
                placeholder="State"
                value={address.state}
                onChange={(e) => setAddress({...address, state: e.target.value})}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Input
                placeholder="Country"
                value={address.country}
                onChange={(e) => setAddress({...address, country: e.target.value})}
              />
              <Input
                placeholder="Zipcode"
                value={address.zipcode}
                onChange={(e) => setAddress({...address, zipcode: e.target.value})}
              />
            </div>
          </div>
          <div className="flex justify-end gap-4">
            <button
              onClick={() => setAddressDialogOpen(false)}
              disabled={isSubmitting}
              className={`px-4 py-2 text-sm border rounded-full transition-colors
                ${isSubmitting 
                  ? 'opacity-50 cursor-not-allowed' 
                  : 'hover:bg-gray-100'
                }`}
            >
              Cancel
            </button>
            <button
              onClick={handlePreorderSubmit}
              disabled={isSubmitting}
              className={`px-4 py-2 text-sm bg-blue-600 text-white rounded-full transition-colors
                ${isSubmitting 
                  ? 'opacity-50 cursor-not-allowed' 
                  : 'hover:bg-blue-700'
                }`}
            >
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  Processing...
                </span>
              ) : (
                'Confirm Preorder'
              )}
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default Product