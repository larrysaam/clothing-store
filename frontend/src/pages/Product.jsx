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
import ReviewSection from '@/components/ReviewSection'
import PhotoUpload from '@/components/UserPhotos/PhotoUpload';

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
    <div className='border-t-2 pt-6 sm:pt-10 animate-fade animate-duration-500 mx-2 sm:mx-4 md:mx-8 lg:mx-16 xl:mx-24'>
      <div>
        {/* ----------- Product Data ----------- */}
        <div className='flex gap-4 sm:gap-12 md:gap-20 flex-col sm:flex-row'>
          {/* ----------- Product Images ----------- */}
          <div className='flex-1 flex flex-col-reverse gap-2 sm:gap-3 sm:flex-row'>
            {/* Side thumbnails */}
            <div className='flex sm:flex-col overflow-x-auto sm:overflow-y-auto 
                gap-2 sm:gap-0 justify-start sm:justify-start w-full sm:w-[15%] sm:max-h-[500px] 
                scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent'>
              {productData?.image.map((item, index) => (
                <img 
                  src={item} 
                  alt={`product-${index + 1}`} 
                  key={index} 
                  onClick={() => setImage(item)}
                  className={`w-[20%] sm:w-full sm:h-[80px] object-cover mb-0 sm:mb-2 flex-shrink-0 
                    cursor-pointer rounded-md transition-opacity duration-200 
                    hover:opacity-80 ${image === item ? 'border-2 border-black' : ''}`}
                />
              ))}
            </div>

            {/* Main image */}
            <div className='w-full sm:w-[85%] h-[300px] sm:h-[500px]'>
              <img 
                src={image} 
                className='w-full h-full object-cover rounded-md' 
                alt='main-product-image' 
              />
            </div>
          </div>

          {/* ----------- Product Info ----------- */}
          <div className='flex-1 px-2 sm:px-0'>
            <div className="flex flex-col gap-2">
              <h1 className='font-medium text-xl sm:text-2xl mt-2'>{productData?.name}</h1>
              {productData?.label && productData.label !== 'none' && (
                <span className={`
                  inline-block w-fit px-3 py-1 text-sm font-medium rounded-full
                  ${productData.label === 'New model' 
                    ? 'bg-blue-100 text-blue-800' 
                    : 'bg-purple-100 text-purple-800'
                  }
                `}>
                  {productData.label}
                </span>
              )}
            </div>
            <p className='mt-3 sm:mt-5 font-medium text-2xl sm:text-3xl'>{currency}{productData?.price}</p>
            <p className='mt-3 sm:mt-5 text-gray-500 text-sm sm:text-base'>{productData?.description}</p>
            
            {/* Size Selection */}
            <div className='flex flex-col gap-3 sm:gap-4 my-6 sm:my-8'>
              <p>Select size:</p>
              <ToggleGroup className='flex flex-wrap justify-start gap-2' type="single">
                {productData?.sizes.map((sizeObj) => (
                  <ToggleGroupItem
                    key={sizeObj.size}
                    value={sizeObj.size}
                    disabled={sizeObj.quantity === 0}
                    className={`text-sm sm:text-base px-3 py-1 sm:px-4 sm:py-2 transition-all duration-200
                      ${sizeObj.quantity === 0 ? 'opacity-50 cursor-not-allowed' : ''}
                      ${size === sizeObj.size ? 'bg-black text-white' : ''}`}
                    onClick={() => setSelectedSize(sizeObj.size)}
                  >
                    {sizeObj.size}
                  </ToggleGroupItem>
                ))}
              </ToggleGroup>
            </div>

            {/* Action Buttons */}
            <div className='w-full sm:w-auto fixed bottom-0 left-0 sm:relative p-4 sm:p-0 bg-white border-t sm:border-0'>
              {productData?.preorder ? (
                hasPreordered ? (
                  <button 
                    disabled
                    className='w-full sm:w-auto bg-gray-400 text-white px-6 sm:px-8 py-3 text-sm rounded-full cursor-not-allowed'
                  >
                    Preordered
                  </button>
                ) : (
                  <button 
                    onClick={handlePreorder}
                    disabled={!selectedSize || availableQuantity === 0}
                    className={`w-full sm:w-auto bg-blue-600 text-white px-6 sm:px-8 py-3 text-sm rounded-full ${
                      (!selectedSize || availableQuantity === 0) 
                        ? 'opacity-50 cursor-not-allowed' 
                        : 'active:bg-blue-700'
                    }`}
                  >
                    Preorder Now
                  </button>
                )
              ) : (
                <button 
                  onClick={handleAddToCart}
                  disabled={!selectedSize || availableQuantity === 0}
                  className={`w-full sm:w-auto bg-black text-white px-6 sm:px-8 py-3 text-sm rounded-full ${
                    !selectedSize || availableQuantity === 0 
                      ? 'opacity-50 cursor-not-allowed' 
                      : 'active:bg-gray-700'
                  }`}
                >
                  Add to Cart
                </button>
              )}
            </div>
          </div>
        </div>

        {/* ----------- User Photos Section ----------- */}
        <div className="mt-12 sm:mt-20 border-t pt-6 sm:pt-10">
          <h2 className="text-xl sm:text-2xl font-medium mb-4 sm:mb-6">How Others Are Wearing It</h2>
          <p className="text-sm sm:text-base text-gray-500 mb-4">
            Upload your photo or mention @OurBrand on Instagram for a chance to be featured.
          </p>
          
          <PhotoUpload productId={productId} onPhotoAdded={() => {
            // Refresh photos
          }} />

          {/* Photo Gallery - Horizontal Scroll */}
          <div className="mt-6 sm:mt-8 relative">
            <div className="flex overflow-x-auto gap-4 pb-4 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent snap-x snap-mandatory">
              {productData?.userPhotos?.map((photo, index) => (
                <div 
                  key={index} 
                  className="flex-none w-[250px] sm:w-[300px] aspect-square rounded-lg overflow-hidden snap-center"
                >
                  <img 
                    src={photo.imageUrl}
                    alt={`User photo ${index + 1}`}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
        
        {/*  -----------Description and Tabs Section -----------*/}
        {/* <div className='mt-20'>
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
         */}
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