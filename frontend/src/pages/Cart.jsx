import React, { useContext, useEffect, useState } from 'react'
import { ShopContext } from '@/context/ShopContext'
import Title from '@/components/Title'
import { assets } from '@/assets/assets'
import CartTotal from '@/features/shared/CartTotal'
import { Link } from 'react-router-dom'
import NumberFlow from '@number-flow/react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const Cart = () => {

  const { products, cartItems, token, updateQuantity, navigate } = useContext(ShopContext)
  const [ cartData, setCartData ] = useState([])
  const [inventoryErrors, setInventoryErrors] = useState({})
  const [hasStockError, setHasStockError] = useState(false)
  
  useEffect(() => {

    if (products.length > 0) {
      const tempData = [];

      for (const items in cartItems) {
        for (const sizes in cartItems[items]) {
          if (cartItems[items][sizes] > 0) {
            tempData.push({
              id: items,
              size: sizes,
              quantity: cartItems[items][sizes]
            })
          }
        }
      }
      setCartData(tempData)
    }

  }, [cartItems, products])

  const validateInventory = (productId, size, quantity) => {
    const product = products.find(p => p._id === productId)
    const sizeData = product?.sizes.find(s => s.size === size)
    if (sizeData && quantity > sizeData.quantity) {
      setInventoryErrors(prev => ({
        ...prev,
        [`${productId}-${size}`]: `Only ${sizeData.quantity} items available`
      }))
      setHasStockError(true)
    } else {
      setInventoryErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[`${productId}-${size}`]
        setHasStockError(Object.keys(newErrors).length > 0)
        return newErrors
      })
    }
  }

  useEffect(() => {
    // Validate all items in cart
    if (products.length > 0 && cartData.length > 0) {
      cartData.forEach(item => {
        validateInventory(item.id, item.size, item.quantity)
      })
    }
  }, [cartData, products])

  if (cartData.length == 0) {
    return ( 
      <div className='px-4 sm:px-14 min-h-[50vh] flex flex-col items-center'>
        <div className='text-2xl mb-3 self-start'>
          <Title text1='YOUR' text2='CART'/>
        </div>
        <div className='my-auto text-lg flex flex-col items-center'>
          <p>Your cart is empty! Try to add some items first.</p>
          <Link to='/collection' 
            className='bg-black text-white mt-4 px-4 py-2 w-fit transistion-all duration-500 hover:bg-slate-700'>
            Go shopping!
          </Link>
        </div>
      </div>
    )
  }

  // Update the handleSizeChange function
  const handleSizeChange = (item, newSize) => {
    // First check if the new size has enough stock
    const product = products.find(p => p._id === item.id)
    const sizeData = product?.sizes.find(s => s.size === newSize)
    
    if (sizeData && item.quantity <= sizeData.quantity) {
      // Create a new cart state with all items' quantities at 0
      const newCartItems = { ...cartItems }
      
      // Set old size quantity to 0 and new size quantity to item quantity
      newCartItems[item.id] = {
        ...newCartItems[item.id],
        [item.size]: 0,
        [newSize]: item.quantity
      }
      
      // Update cart context with single update
      updateQuantity(item.id, newSize, item.quantity, newCartItems)
      
      // Validate inventory for new size
      validateInventory(item.id, newSize, item.quantity)
    } else {
      // If not enough stock in new size, show error
      setInventoryErrors(prev => ({
        ...prev,
        [`${item.id}-${newSize}`]: `Only ${sizeData?.quantity || 0} items available`
      }))
      // Keep the original size
      setCartData(prev => prev.map(cartItem => 
        cartItem.id === item.id ? { ...cartItem, size: item.size } : cartItem
      ))
    }
  }

  // Add function to get related products
  const getRelatedProducts = () => {
    if (!cartData.length || !products.length) return [];
    
    // Get categories of items in cart
    const cartCategories = new Set(
      cartData.map(item => 
        products.find(p => p._id === item.id)?.category
      ).filter(Boolean)
    );

    // Find related products from same categories
    const related = products.filter(product => 
      cartCategories.has(product.category) && 
      !cartData.some(item => item.id === product._id)
    );

    // Return random 4 products
    return related.sort(() => 0.5 - Math.random()).slice(0, 4);
  };

  return (
    <div className='px-4 sm:px-14 border-t pt-14 animate-fade animate-duration-500'>
      <div className='text-2xl mb-3'>
        <Title text1='YOUR' text2='CART'/>
      </div>

      <div>
        {
          cartData.map((item, index) => {
            const productData = products.find((product) =>  product._id === item.id)
            return (
              <div 
                key={index} 
                className='relative py-4 border-t last:border-y text-gray-700 
                  grid grid-cols-1 sm:grid-cols-[3fr_1fr_0.5fr_0.5fr] 
                  items-start sm:items-center gap-4'
              >
                {/* Product info section */}
                <div className='flex items-start gap-4 sm:gap-6'>
                  {/* Make image clickable */}
                  <div 
                    onClick={() => navigate(`/product/${item.id}`)}
                    className="cursor-pointer hover:opacity-80 transition-opacity"
                  >
                    <img 
                      className='w-24 h-24 sm:w-32 sm:h-32 object-cover rounded-md' 
                      src={productData.image[0]} 
                      alt={productData.name}
                    />
                  </div>
                  <div className='flex flex-col gap-2 flex-1'>
                    {/* Make product name clickable */}
                    <p 
                      onClick={() => navigate(`/product/${item.id}`)}
                      className='text-sm sm:text-lg font-medium cursor-pointer hover:text-blue-600 transition-colors'
                    >
                      {productData.name}
                    </p>
                    {/* Mobile price - only shows on mobile */}
                    <p className='block sm:hidden text-sm font-medium'>
                      <NumberFlow
                        value={productData.price * item.quantity} 
                        format={{ 
                          style: 'currency', 
                          currency: import.meta.env.VITE_CURRENCY || 'EUR', 
                          maximumFractionDigits: 2 
                        }} 
                      />
                    </p>
                    <div className='flex items-center gap-4'>
                      <Select
                        value={item.size}
                        onValueChange={(newSize) => handleSizeChange(item, newSize)}
                      >
                        <SelectTrigger className="w-[80px]">
                          <SelectValue placeholder="Size" />
                        </SelectTrigger>
                        <SelectContent>
                          {productData.sizes.map((sizeOption) => (
                            <SelectItem 
                              key={sizeOption.size} 
                              value={sizeOption.size}
                              disabled={sizeOption.quantity === 0}
                            >
                              {sizeOption.size}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {/* Universal quantity input - works on both mobile and desktop */}
                      <div className="flex items-center gap-2">
                        <input 
                          type='number' 
                          min={1} 
                          value={item.quantity} 
                          onChange={(e)=> {
                            const newValue = Number(e.target.value)
                            if (e.target.value === '' || e.target.value === '0') {
                              return null
                            }
                            updateQuantity(item.id, item.size, newValue)
                            validateInventory(item.id, item.size, newValue)
                          }}
                          className='border w-16 sm:w-20 p-1 sm:px-2 rounded-md'
                        />
                      </div>
                      {/* Mobile delete button */}
                      <button 
                        onClick={()=>updateQuantity(item.id, item.size, 0)}
                        className='block sm:hidden p-2 text-gray-500 hover:text-red-500'
                      >
                        <img 
                          src={assets.deleteIcon} 
                          alt='Remove item' 
                          className='w-4 h-4'
                        />
                      </button>
                    </div>
                    {inventoryErrors[`${item.id}-${item.size}`] && (
                      <span className="text-red-500 text-xs font-bold">
                        {inventoryErrors[`${item.id}-${item.size}`]}
                      </span>
                    )}
                  </div>
                </div>

                {/* Desktop price - hidden on mobile */}
                <NumberFlow
                  className='hidden sm:block w-fit mx-auto'
                  value={productData.price * item.quantity} 
                  format={{ 
                    style: 'currency', 
                    currency: import.meta.env.VITE_CURRENCY || 'EUR', 
                    maximumFractionDigits: 2 
                  }} 
                />

                {/* Desktop delete button - hidden on mobile */}
                <button 
                  onClick={()=>updateQuantity(item.id, item.size, 0)}
                  className='hidden sm:block mx-auto'
                >
                  <img 
                    src={assets.deleteIcon} 
                    alt='Remove item' 
                    className='w-5 cursor-pointer hover:scale-110 transition-all duration-300'
                  />
                </button>
              </div>
            )
          })
        }
      </div>


      <div className='flex justify-end my-20'>
        <div className='w-full sm:w-[450px]'>
          <CartTotal/>
          <div className='w-full text-end'>
            <button 
              onClick={() => (token ? navigate('/place-order') : navigate('/login', { state: { from: '/cart' } }))} 
              disabled={hasStockError}
              className={`bg-black text-white text-sm my-8 px-4 py-3 transition-all duration-500 
                ${hasStockError 
                  ? 'opacity-50 cursor-not-allowed' 
                  : 'hover:bg-slate-700'
                }`}
            >
              Proceed to checkout
            </button>
          </div>
        </div>
      </div>

      {/* Related products section - ADDING THIS NEW SECTION */}
      <div className="mt-20 border-t pt-10">
        <div className="mb-8">
          <Title text1="RELATED" text2="PRODUCTS" />
        </div>
        
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {getRelatedProducts().map((product) => (
            <div 
              key={product._id}
              onClick={() => navigate(`/product/${product._id}`)}
              className="cursor-pointer group"
            >
              <div className="aspect-square mb-2 overflow-hidden">
                <img 
                  src={product.image[0]} 
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <p className="text-sm font-medium  transition-colors">
                {product.name}
              </p>
              <p className="text-sm text-gray-600">
                <NumberFlow
                  value={product.price}
                  format={{ 
                    style: 'currency', 
                    currency: import.meta.env.VITE_CURRENCY || 'EUR', 
                    maximumFractionDigits: 2 
                  }} 
                />
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default Cart