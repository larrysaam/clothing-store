import React, { useContext, useEffect, useState } from 'react'
import { ShopContext } from '@/context/ShopContext'
import Title from '@/components/Title'
import { assets } from '@/assets/assets'

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

  const {
    products,
    cartItems,
    preorderCartItems,
    token,
    updateQuantity,
    updatePreorderQuantity,
    navigate
  } = useContext(ShopContext)
  const [ cartData, setCartData ] = useState([])
  const [ preorderCartData, setPreorderCartData ] = useState([])
  const [inventoryErrors, setInventoryErrors] = useState({})
  const [hasStockError, setHasStockError] = useState(false)
  const [activeFilter, setActiveFilter] = useState('all') // 'all', 'regular', 'preorder'
  
  useEffect(() => {
    if (products.length > 0 && cartItems) {
      const tempData = [];

      for (const items in cartItems) {
        for (const cartKey in cartItems[items]) {
          if (cartItems[items][cartKey] > 0) {
            // Parse the cartKey to extract size and color (color is hex code)
            const [size, colorHex] = cartKey.includes('-') ? cartKey.split('-') : [cartKey, undefined];

            // Find the color name from the hex code
            const product = products.find(p => p._id === items);
            const colorData = colorHex && product?.colors ?
              product.colors.find(c => c.colorHex === colorHex) : null;

            tempData.push({
              id: items,
              cartKey: cartKey,
              size: size,
              color: colorData?.colorName || undefined, // Store color name for display
              colorHex: colorHex, // Store hex code for matching
              quantity: cartItems[items][cartKey]
            })
          }
        }
      }
      setCartData(tempData)
    }

  }, [cartItems, products])

  // Process preorder cart data
  useEffect(() => {
    if (products.length > 0 && preorderCartItems) {
      const tempData = [];

      for (const items in preorderCartItems) {
        for (const cartKey in preorderCartItems[items]) {
          if (preorderCartItems[items][cartKey] > 0) {
            // Parse the cartKey to extract size and color (color is hex code)
            const [size, colorHex] = cartKey.includes('-') ? cartKey.split('-') : [cartKey, undefined];

            // Find the color name from the hex code
            const product = products.find(p => p._id === items);
            const colorData = colorHex && product?.colors ?
              product.colors.find(c => c.colorHex === colorHex) : null;

            tempData.push({
              id: items,
              cartKey: cartKey,
              size: size,
              color: colorData?.colorName || undefined, // Store color name for display
              colorHex: colorHex, // Store hex code for matching
              quantity: preorderCartItems[items][cartKey]
            })
          }
        }
      }
      setPreorderCartData(tempData)
    }
  }, [preorderCartItems, products])

  const validateInventory = (productId, size, colorHex, quantity) => {
    const product = products.find(p => p._id === productId)
    let sizeData = null;

    // Check stock based on whether item has color or not
    if (colorHex && product?.colors) {
      const colorData = product.colors.find(c => c.colorHex === colorHex)
      sizeData = colorData?.sizes?.find(s => s.size === size)
    } else if (product?.sizes) {
      sizeData = product.sizes.find(s => s.size === size)
    }

    const errorKey = `${productId}-${size}-${colorHex || 'default'}`;

    if (!sizeData || quantity > sizeData.quantity) {
      setInventoryErrors(prev => ({
        ...prev,
        [errorKey]: `Only ${sizeData?.quantity || 0} items available`
      }))
      setHasStockError(true)
    } else {
      setInventoryErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[errorKey]
        setHasStockError(Object.keys(newErrors).length > 0)
        return newErrors
      })
    }
  }

  useEffect(() => {
    // Validate all items in cart
    if (products.length > 0 && cartData.length > 0) {
      cartData.forEach(item => {
        validateInventory(item.id, item.size, item.colorHex, item.quantity)
      })
    }
  }, [cartData, products])

  if (cartData.length === 0 && preorderCartData.length === 0) {
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
    const product = products.find(p => p._id === item.id)
    let sizeData = null;
    
    // Check stock based on whether item has color or not
    if (item.colorHex && product?.colors) {
      const colorData = product.colors.find(c => c.colorHex === item.colorHex)
      sizeData = colorData?.sizes?.find(s => s.size === newSize)
    } else if (product?.sizes) {
      sizeData = product.sizes.find(s => s.size === newSize)
    }
    
    if (sizeData && item.quantity <= sizeData.quantity) {
      const newCartItems = { ...cartItems }
      const newCartKey = item.colorHex ? `${newSize}-${item.colorHex}` : newSize;
      
      // Set old cart key quantity to 0 and new cart key quantity to item quantity
      newCartItems[item.id] = {
        ...newCartItems[item.id],
        [item.cartKey]: 0,
        [newCartKey]: item.quantity
      }
      
      // Update cart context with single update
      updateQuantity(item.id, newCartKey, item.quantity, newCartItems)
      
      // Validate inventory for new size
      validateInventory(item.id, newSize, item.colorHex, item.quantity)
    } else {
      // If not enough stock in new size, show error
      const errorKey = `${item.id}-${newSize}-${item.colorHex || 'default'}`;
      setInventoryErrors(prev => ({
        ...prev,
        [errorKey]: `Only ${sizeData?.quantity || 0} items available`
      }))
    }
  }

  // Add handleColorChange function
  const handleColorChange = (item, newColorName) => {
    const product = products.find(p => p._id === item.id)
    const newColorData = product?.colors?.find(c => c.colorName === newColorName)
    const sizeData = newColorData?.sizes?.find(s => s.size === item.size)
    
    if (sizeData && item.quantity <= sizeData.quantity) {
      const newCartItems = { ...cartItems }
      const newCartKey = `${item.size}-${newColorData.colorHex}`;
      
      // Set old cart key quantity to 0 and new cart key quantity to item quantity
      newCartItems[item.id] = {
        ...newCartItems[item.id],
        [item.cartKey]: 0,
        [newCartKey]: item.quantity
      }
      
      // Update cart context with single update
      updateQuantity(item.id, newCartKey, item.quantity, newCartItems)
      
      // Validate inventory for new color
      validateInventory(item.id, item.size, newColorData.colorHex, item.quantity)
    } else {
      // If not enough stock in new color, show error
      const errorKey = `${item.id}-${item.size}-${newColorData?.colorHex || 'default'}`;
      setInventoryErrors(prev => ({
        ...prev,
        [errorKey]: `Only ${sizeData?.quantity || 0} items available`
      }))
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
    <div className='px-3 sm:px-6 lg:px-14 border-t pt-8 sm:pt-14 animate-fade animate-duration-500'>
      <div className='text-xl sm:text-2xl mb-4 sm:mb-6'>
        <Title text1='YOUR' text2='CART'/>
      </div>

      {/* Filter Tabs */}
      <div className="flex justify-center mb-8">
        <div className="flex bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setActiveFilter('all')}
            className={`px-6 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
              activeFilter === 'all'
                ? 'bg-white text-black shadow-sm'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            All Items ({cartData.length + preorderCartData.length})
          </button>
          <button
            onClick={() => setActiveFilter('regular')}
            className={`px-6 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
              activeFilter === 'regular'
                ? 'bg-white text-black shadow-sm'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            Regular Orders ({cartData.length})
          </button>
          <button
            onClick={() => setActiveFilter('preorder')}
            className={`px-6 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
              activeFilter === 'preorder'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-blue-600'
            }`}
          >
            Preorders ({preorderCartData.length})
          </button>
        </div>
      </div>

      {/* Section Status Header */}
      {(cartData.length > 0 || preorderCartData.length > 0) && (
        <div className="mb-6 text-center">
          <p className="text-sm text-gray-600">
            {activeFilter === 'all' && 'Showing all items in your cart'}
            {activeFilter === 'regular' && 'Showing regular orders only'}
            {activeFilter === 'preorder' && 'Showing preorders only'}
          </p>
        </div>
      )}

      {/* Regular Cart Section */}
      {cartData.length > 0 && (activeFilter === 'all' || activeFilter === 'regular') && (
        <div className="mb-8 border rounded-lg p-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-800">
              Regular Orders
              {activeFilter === 'regular' && (
                <span className="ml-2 text-sm font-normal text-gray-600">
                  ({cartData.length} items)
                </span>
              )}
            </h3>
            <div className="text-right">
              <p className="text-sm text-gray-600">Subtotal:
                <NumberFlow
                  value={cartData?.reduce((total, item) => {
                    const product = products.find(p => p._id === item.id);
                    return total + (product?.price || 0) * (item.quantity || 0);
                  }, 0) || 0}
                  format={{
                    style: 'currency',
                    currency: import.meta.env.VITE_CURRENCY || 'EUR',
                    maximumFractionDigits: 2
                  }}
                  className="ml-2 font-medium"
                />
              </p>
            </div>
          </div>
          <div>
        {
          cartData.map((item, index) => {
            const productData = products.find((product) =>  product._id === item.id)
            if (!productData) return null;
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
                    className="cursor-pointer hover:opacity-80 transition-opacity relative"
                  >
                    <img 
                      className='w-24 h-24 sm:w-32 sm:h-32 object-cover rounded-md' 
                      src={(() => {
                        // Show color-specific image if available
                        if (item.colorHex && productData.colors) {
                          const colorData = productData.colors.find(c => c.colorHex === item.colorHex);
                          if (colorData?.colorImages && colorData.colorImages.length > 0) {
                            return colorData.colorImages[0];
                          }
                        }
                        // Fallback to main product image
                        return productData.image[0];
                      })()} 
                      alt={`${productData.name} - ${item.color || 'default'}`}
                    />
                    {/* Color indicator badge on image */}
                    {item.color && (
                      <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full border-2 border-white shadow-md"
                        style={{ 
                          backgroundColor: item.colorHex || '#ccc'
                        }}
                        title={`Color: ${item.color}`}
                      ></div>
                    )}
                  </div>
                  <div className='flex flex-col gap-2 flex-1'>
                    {/* Make product name clickable */}
                    <p 
                      onClick={() => navigate(`/product/${item.id}`)}
                      className='text-sm sm:text-lg font-medium cursor-pointer hover:text-blue-600 transition-colors'
                    >
                      {productData.name}
                    </p>
                    {/* Show color if available with color indicator */}
                    {item.color && (
                      <div className='flex items-center gap-2 text-xs sm:text-sm text-gray-600'>
                        <span>Color:</span>
                        <div className="flex items-center gap-1">
                          <div 
                            className="w-4 h-4 rounded-full border border-gray-300 shadow-sm"
                            style={{ 
                              backgroundColor: item.colorHex || '#ccc'
                            }}
                          ></div>
                          <span className="font-medium">{item.color}</span>
                        </div>
                      </div>
                    )}
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
                    <div className='flex items-center gap-2 flex-wrap'>
                      {/* Color Selection */}
                      {productData.colors && productData.colors.length > 0 && (
                        <Select
                          value={item.color || ''}
                          onValueChange={(newColor) => handleColorChange(item, newColor)}
                        >
                          <SelectTrigger className="w-[120px]">
                            <SelectValue placeholder="Color">
                              {item.color && (
                                <div className="flex items-center gap-2">
                                  <div 
                                    className="w-4 h-4 rounded-full border border-gray-300 shadow-sm flex-shrink-0"
                                    style={{ 
                                      backgroundColor: item.colorHex || '#ccc'
                                    }}
                                  ></div>
                                  <span className="truncate text-sm">{item.color}</span>
                                </div>
                              )}
                            </SelectValue>
                          </SelectTrigger>
                          <SelectContent>
                            {productData.colors.map((colorOption) => (
                              <SelectItem 
                                key={colorOption.colorName} 
                                value={colorOption.colorName}
                              >
                                <div className="flex items-center gap-2 w-full">
                                  <div 
                                    className="w-4 h-4 rounded-full border border-gray-300 shadow-sm flex-shrink-0"
                                    style={{ backgroundColor: colorOption.colorHex }}
                                  ></div>
                                  <span className="text-sm">{colorOption.colorName}</span>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                      
                      {/* Size Selection - Only show if size is not 'N/A' */}
                      {item.size !== 'N/A' && (
                        <Select
                          value={item.size}
                          onValueChange={(newSize) => handleSizeChange(item, newSize)}
                        >
                          <SelectTrigger className="w-[80px]">
                            <SelectValue placeholder="Size">
                              {item.size}
                            </SelectValue>
                          </SelectTrigger>
                          <SelectContent>
                            {(() => {
                              // Get available sizes based on selected color
                              let availableSizes = [];
                              if (item.colorHex && productData.colors) {
                                const colorData = productData.colors.find(c => c.colorHex === item.colorHex);
                                availableSizes = colorData?.sizes || [];
                              } else if (productData.sizes) {
                                availableSizes = productData.sizes;
                              }

                              // Filter out 'N/A' sizes from the dropdown
                              availableSizes = availableSizes.filter(size => size.size !== 'N/A');

                              return availableSizes.map((sizeOption) => (
                                <SelectItem
                                  key={sizeOption.size}
                                  value={sizeOption.size}
                                  disabled={sizeOption.quantity === 0}
                                >
                                  {sizeOption.size}
                                </SelectItem>
                              ));
                            })()}
                          </SelectContent>
                        </Select>
                      )}
                      
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
                            updateQuantity(item.id, item.cartKey, newValue)
                            validateInventory(item.id, item.size, item.colorHex, newValue)
                          }}
                          className='border w-16 sm:w-20 p-1 sm:px-2 rounded-md'
                        />
                      </div>
                      {/* Mobile delete button */}
                      <button 
                        onClick={()=>updateQuantity(item.id, item.cartKey, 0)}
                        className='block sm:hidden p-2 text-gray-500 hover:text-red-500'
                      >
                        <img 
                          src={assets.deleteIcon} 
                          alt='Remove item' 
                          className='w-4 h-4'
                        />
                      </button>
                    </div>
                    {inventoryErrors[`${item.id}-${item.size}-${item.colorHex || 'default'}`] && (
                      <span className="text-red-500 text-xs font-bold">
                        {inventoryErrors[`${item.id}-${item.size}-${item.colorHex || 'default'}`]}
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
                  onClick={()=>updateQuantity(item.id, item.cartKey, 0)}
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

          {/* Regular Cart Checkout Button */}
          <div className="mt-6 pt-4 border-t">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-gray-600">
                  Total: <NumberFlow
                    value={(cartData?.reduce((total, item) => {
                      const product = products.find(p => p._id === item.id);
                      return total + (product?.price || 0) * (item.quantity || 0);
                    }, 0) || 0) + (cartData.length > 0 ? 10 : 0)} // Add delivery fee if items exist
                    format={{
                      style: 'currency',
                      currency: import.meta.env.VITE_CURRENCY || 'EUR',
                      maximumFractionDigits: 2
                    }}
                    className="font-semibold"
                  />
                </p>
                <p className="text-xs text-gray-500">Includes €10 delivery fee</p>
              </div>
              <button
                onClick={() => {
                  if (!token) {
                    navigate('/login', { state: { from: '/cart' } });
                    return;
                  }
                  // Navigate to checkout with regular cart only
                  navigate('/place-order', { state: { cartType: 'regular' } });
                }}
                className={`bg-black text-white text-sm px-6 py-3 rounded-full transition-all duration-500 hover:bg-gray-800 ${activeFilter === 'regular' ? 'w-full text-base py-4' : ''}`}
              >
                {activeFilter === 'regular' ? 'Proceed to Checkout' : 'Checkout Regular Orders'}
                {activeFilter === 'regular' && (
                  <div className="text-xs mt-1">
                    {cartData.length} items • Total: €{((cartData?.reduce((total, item) => {
                      const product = products.find(p => p._id === item.id);
                      return total + (product?.price || 0) * (item.quantity || 0);
                    }, 0) || 0) + 10).toFixed(2)}
                  </div>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Preorder Cart Section */}
      {preorderCartData.length > 0 && (activeFilter === 'all' || activeFilter === 'preorder') && (
        <div className="mb-8 border border-blue-200 rounded-lg p-4 bg-blue-50">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-blue-800">
              Preorders
              {activeFilter === 'preorder' && (
                <span className="ml-2 text-sm font-normal text-blue-600">
                  ({preorderCartData.length} items)
                </span>
              )}
            </h3>
            <div className="text-right">
              <p className="text-sm text-blue-700">Subtotal:
                <NumberFlow
                  value={preorderCartData?.reduce((total, item) => {
                    const product = products.find(p => p._id === item.id);
                    return total + (product?.price || 0) * (item.quantity || 0);
                  }, 0) || 0}
                  format={{
                    style: 'currency',
                    currency: import.meta.env.VITE_CURRENCY || 'EUR',
                    maximumFractionDigits: 2
                  }}
                  className="ml-2 font-medium"
                />
              </p>
            </div>
          </div>
          <div>
        {
          preorderCartData.map((item, index) => {
            const productData = products.find((product) =>  product._id === item.id)
            if (!productData) return null;
            return (
              <div
                key={`preorder-${index}`}
                className='relative py-4 border-t last:border-y text-gray-700
                  grid grid-cols-1 sm:grid-cols-[3fr_1fr_0.5fr_0.5fr]
                  items-start sm:items-center gap-4 bg-white rounded-md'
              >
                {/* Product info section */}
                <div className='flex items-start gap-4 sm:gap-6'>
                  {/* Make image clickable */}
                  <div
                    onClick={() => navigate(`/product/${item.id}`)}
                    className="cursor-pointer hover:opacity-80 transition-opacity relative"
                  >
                    <img
                      className='w-24 h-24 sm:w-32 sm:h-32 object-cover rounded-md'
                      src={(() => {
                        // Show color-specific image if available
                        if (item.colorHex && productData.colors) {
                          const colorData = productData.colors.find(c => c.colorHex === item.colorHex);
                          if (colorData?.colorImages && colorData.colorImages.length > 0) {
                            return colorData.colorImages[0];
                          }
                        }
                        // Fallback to main product image
                        return productData.image[0];
                      })()}
                      alt={productData.name}
                    />
                    {/* Preorder badge */}
                    <div className="absolute -top-2 -right-2 bg-blue-600 text-white text-xs px-2 py-1 rounded-full">
                      Preorder
                    </div>
                  </div>

                  <div className='flex-1'>
                    <p
                      onClick={() => navigate(`/product/${item.id}`)}
                      className='text-sm sm:text-base font-medium cursor-pointer hover:text-blue-600 transition-colors'
                    >
                      {productData.name}
                    </p>

                    <div className='flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-5 mt-2'>
                      <p className='text-sm text-gray-600'>
                        <NumberFlow
                          value={productData.price}
                          format={{
                            style: 'currency',
                            currency: import.meta.env.VITE_CURRENCY || 'EUR',
                            maximumFractionDigits: 2
                          }}
                        />
                      </p>

                      {/* Color and Size display */}
                      <div className='flex items-center gap-3'>
                        {item.color && (
                          <div className='flex items-center gap-2'>
                            <div
                              className='w-4 h-4 rounded-full border border-gray-300'
                              style={{ backgroundColor: item.colorHex }}
                            ></div>
                            <span className='text-sm text-gray-600'>{item.color}</span>
                          </div>
                        )}

                        {item.size !== 'N/A' && (
                          <div className='px-2 py-1 bg-gray-100 rounded text-xs text-gray-600'>
                            {item.size}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Quantity controls */}
                <div className='flex items-center gap-2 sm:justify-center'>
                  <button
                    onClick={() => updatePreorderQuantity(item.id, item.cartKey, item.quantity - 1)}
                    className='w-8 h-8 flex items-center justify-center border border-gray-300 rounded-full hover:bg-gray-100 transition-colors'
                  >
                    -
                  </button>
                  <span className='w-8 text-center text-sm'>{item.quantity}</span>
                  <button
                    onClick={() => updatePreorderQuantity(item.id, item.cartKey, item.quantity + 1)}
                    className='w-8 h-8 flex items-center justify-center border border-gray-300 rounded-full hover:bg-gray-100 transition-colors'
                  >
                    +
                  </button>
                </div>

                {/* Total price */}
                <div className='text-center'>
                  <NumberFlow
                    value={productData.price * item.quantity}
                    format={{
                      style: 'currency',
                      currency: import.meta.env.VITE_CURRENCY || 'EUR',
                      maximumFractionDigits: 2
                    }}
                    className='text-sm font-medium'
                  />
                </div>

                {/* Remove button */}
                <div className='flex justify-center'>
                  <button
                    onClick={()=>updatePreorderQuantity(item.id, item.cartKey, 0)}
                    className='mx-auto p-1 hover:bg-red-50 rounded-full transition-colors'
                  >
                    <img
                      src={assets.deleteIcon}
                      alt='Remove item'
                      className='w-4 sm:w-5 cursor-pointer hover:scale-110 transition-all duration-300'
                    />
                  </button>
                </div>
              </div>
            )
          })
        }
          </div>

          {/* Preorder Cart Checkout Button */}
          <div className="mt-6 pt-4 border-t border-blue-200">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-blue-700">
                  Total: <NumberFlow
                    value={(preorderCartData?.reduce((total, item) => {
                      const product = products.find(p => p._id === item.id);
                      return total + (product?.price || 0) * (item.quantity || 0);
                    }, 0) || 0) + (preorderCartData.length > 0 ? 10 : 0)} // Add delivery fee if items exist
                    format={{
                      style: 'currency',
                      currency: import.meta.env.VITE_CURRENCY || 'EUR',
                      maximumFractionDigits: 2
                    }}
                    className="font-semibold"
                  />
                </p>
                <p className="text-xs text-blue-600">Includes €10 delivery fee</p>
              </div>
              <button
                onClick={() => {
                  if (!token) {
                    navigate('/login', { state: { from: '/cart' } });
                    return;
                  }
                  // Navigate to checkout with preorder cart only
                  navigate('/place-order', { state: { cartType: 'preorder' } });
                }}
                className={`bg-blue-600 text-white text-sm px-6 py-3 rounded-full transition-all duration-500 hover:bg-blue-700
                  ${activeFilter === 'preorder' ? 'w-full text-base py-4' : ''}`}
              >
                {activeFilter === 'preorder' ? 'Proceed to Checkout' : 'Checkout Preorders'}
                {activeFilter === 'preorder' && (
                  <div className="text-xs mt-1">
                    {preorderCartData.length} items • Total: €{((preorderCartData?.reduce((total, item) => {
                      const product = products.find(p => p._id === item.id);
                      return total + (product?.price || 0) * (item.quantity || 0);
                    }, 0) || 0) + 10).toFixed(2)}
                  </div>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Show message based on filter and cart state */}
      {(() => {
        const showRegular = activeFilter === 'all' || activeFilter === 'regular';
        const showPreorder = activeFilter === 'all' || activeFilter === 'preorder';
        const hasRegularItems = cartData.length > 0 && showRegular;
        const hasPreorderItems = preorderCartData.length > 0 && showPreorder;

        // Show empty message if no items are visible based on current filter
        if (!hasRegularItems && !hasPreorderItems) {
          let emptyMessage = "Your cart is empty";
          if (activeFilter === 'regular' && cartData.length === 0) {
            emptyMessage = "No regular orders in your cart";
          } else if (activeFilter === 'preorder' && preorderCartData.length === 0) {
            emptyMessage = "No preorders in your cart";
          } else if (activeFilter === 'all' && cartData.length === 0 && preorderCartData.length === 0) {
            emptyMessage = "Your cart is empty";
          }

          return (
            <div className="text-center py-20">
              <p className="text-gray-500 text-lg">{emptyMessage}</p>
              <button
                onClick={() => navigate('/collection')}
                className="mt-4 bg-black text-white px-6 py-3 rounded-full hover:bg-gray-800 transition-colors"
              >
                Continue Shopping
              </button>
            </div>
          );
        }
        return null;
      })()}

      {/* Combined Checkout Section - Only show when viewing all items and both carts have items */}
      {activeFilter === 'all' && cartData.length > 0 && preorderCartData.length > 0 && (
        <div className="mt-8 p-6 bg-gray-50 rounded-lg border">
          <h3 className="text-lg font-semibold mb-4 text-center">Choose Checkout Option</h3>
          <p className="text-sm text-gray-600 text-center mb-6">
            You have both regular orders and preorders. Please choose which type to checkout first.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => {
                navigate('/place-order', { state: { cartType: 'regular' } });
              }}
              className="flex-1 sm:flex-none bg-black text-white px-8 py-3 rounded-full transition-all duration-500 hover:bg-gray-800 text-center"
            >
              Checkout Regular Orders
              <span className="block text-xs mt-1">
                ({cartData.length} items - €{(cartData?.reduce((total, item) => {
                  const product = products.find(p => p._id === item.id);
                  return total + (product?.price || 0) * (item.quantity || 0);
                }, 0) || 0).toFixed(2)})
              </span>
            </button>
            <button
              onClick={() => {
                navigate('/place-order', { state: { cartType: 'preorder' } });
              }}
              className="flex-1 sm:flex-none bg-blue-600 text-white px-8 py-3 rounded-full transition-all duration-500 hover:bg-blue-700 text-center"
            >
              Checkout Preorders
              <span className="block text-xs mt-1">
                ({preorderCartData.length} items - €{(preorderCartData?.reduce((total, item) => {
                  const product = products.find(p => p._id === item.id);
                  return total + (product?.price || 0) * (item.quantity || 0);
                }, 0) || 0).toFixed(2)})
              </span>
            </button>
          </div>
        </div>
      )}

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