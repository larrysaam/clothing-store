import React, { useContext, useEffect, useState } from 'react'
import { ShopContext } from '@/context/ShopContext'
import Title from '@/components/Title'
import { assets } from '@/assets/assets'
import CartTotal from '@/features/shared/CartTotal'
import { Link } from 'react-router-dom'
import NumberFlow from '@number-flow/react'

const Cart = () => {

  const { products, cartItems, updateQuantity, navigate } = useContext(ShopContext)
  const [ cartData, setCartData ] = useState([])

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
              <div key={index} className=' py-4 border-t last:border-y text-gray-700 grid grid-cols-[3fr_2fr_0.5fr_0.5fr] sm:grid-cols-[3fr_2fr_0.5fr_0.5fr] items-center gap-4'>
                <div className='flex items-start gap-6'>
                  <img className='w-20 sm:w-30 aspect-square object-cover' src={productData.image[0]} alt=''/>
                  <div className='flex flex-col justify-between h-full'>
                    <p className='text-xs sm:text-lg font-medium'>{productData.name}</p>
                    <div className='w-fit px-2 sm:py-1 border bg-slate-50'>
                      {item.size}
                    </div>
                  </div>
                </div>
                <input type='number' min={1} value={item.quantity} 
                onChange={(e)=> 
                  e.target.value === '' || e.target.value === '0' ? 
                  null : 
                  updateQuantity(item.id, item.size, Number(e.target.value))
                }
                className='border ml-auto max-w-10 sm:max-w-20 p-1 sm:px-2'/>
                <NumberFlow
                    className='w-fit mx-auto'
                    value={productData.price * item.quantity} 
                    format={{ 
                        style: 'currency', 
                        currency: 'USD', 
                        maximumFractionDigits: 2 
                    }} 
                />
                <img src={assets.deleteIcon} onClick={()=>updateQuantity(item.id, item.size, 0)} alt='' 
                className='w-4 mx-auto sm:w-5 cursor-pointer hover:fill-white hover:scale-110 transistion-all duration-300'/>
              </div>
            )
          })
        }
      </div>


      <div className='flex justify-end my-20'>
        <div className='w-full sm:w-[450px]'>
          <CartTotal/>
          <div className='w-full text-end'>
            <button onClick={()=>navigate('/place-order')} 
            className='bg-black text-white text-sm my-8 px-4 py-3 transistion-all duration-500 hover:bg-slate-700'>
              Proceed to checkout
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Cart