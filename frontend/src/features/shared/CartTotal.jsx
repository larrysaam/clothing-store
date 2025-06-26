import React, { useContext } from 'react'
import { ShopContext } from '@/context/ShopContext'
import Title from '@/components/Title'
import NumberFlow from '@number-flow/react'

const CartTotal = () => {

const { deliveryFee, getCartAmount, getPreorderCartAmount } = useContext(ShopContext)

  return (
    <div className='w-full'>
        <div className='text-2xl'>
            <Title text1='CART' text2='TOTAL'/>
        </div>

        <div className='flex flex-col gap-2 mt-2 text-base'>
            {/* Regular Cart Subtotal */}
            {getCartAmount() > 0 && (
                <div className='flex justify-between'>
                    <p>Regular Orders</p>
                    <NumberFlow
                        value={getCartAmount()}
                        format={{
                            style: 'currency',
                            currency: import.meta.env.VITE_CURRENCY || 'EUR',
                            maximumFractionDigits: 2
                        }}
                    />
                </div>
            )}

            {/* Preorder Cart Subtotal */}
            {getPreorderCartAmount() > 0 && (
                <div className='flex justify-between'>
                    <p>Preorders</p>
                    <NumberFlow
                        value={getPreorderCartAmount()}
                        format={{
                            style: 'currency',
                            currency: import.meta.env.VITE_CURRENCY || 'EUR',
                            maximumFractionDigits: 2
                        }}
                    />
                </div>
            )}

            {/* Combined Subtotal */}
            <div className='flex justify-between'>
                <p>Subtotal</p>
                <NumberFlow
                    value={(getCartAmount() || 0) + (getPreorderCartAmount() || 0)}
                    format={{
                        style: 'currency',
                        currency: import.meta.env.VITE_CURRENCY || 'EUR',
                        maximumFractionDigits: 2
                    }}
                />
            </div>
            <hr/>
            <div className='flex justify-between'>
                <p>Shipping fee</p>
                <NumberFlow
                    value={deliveryFee ? deliveryFee : 0}
                    format={{
                        style: 'currency',
                        currency: import.meta.env.VITE_CURRENCY || 'EUR',
                        maximumFractionDigits: 2
                    }}
                />
            </div>
            <hr/>
            <div className='text-lg flex justify-between'>
                <b>Total</b>
                <NumberFlow
                    className='font-semibold'
                    value={((getCartAmount() || 0) + (getPreorderCartAmount() || 0)) === 0 ? 0 : (getCartAmount() || 0) + (getPreorderCartAmount() || 0) + deliveryFee}
                    format={{
                        style: 'currency',
                        currency: import.meta.env.VITE_CURRENCY || 'EUR',
                        maximumFractionDigits: 2
                    }}
                />
            </div>
        </div>
    </div>
  )
}

export default CartTotal