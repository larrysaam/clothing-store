import React, { useContext } from 'react'
import { ShopContext } from '@/context/ShopContext'
import { Link } from 'react-router-dom'

const ProductItem = ({id, image, name, price, preorder, customLabel}) => {
    const { currency } = useContext(ShopContext)

    return (
        <Link to={`/product/${id}`} className='text-gray-700 cursor-pointer group relative' >
            <div className='overflow-hidden rounded-xl relative'>
                <img
                    src={image[0]}
                    className='w-full aspect-square transition-all duration-300 ease-in-out group-hover:scale-[115%] object-cover'
                    alt=''
                />
                {preorder && (
                    <div className='absolute top-2 right-2 bg-blue-600 text-white px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium shadow-lg z-10'>
                        Pre-order
                    </div>
                )}
            </div>
            {customLabel && customLabel !== '' && (
                <p className='pt-2 text-sm font-medium text-red-600'>{customLabel}</p>
            )}
            <p className={`${customLabel && customLabel !== '' ? 'pt-1' : 'pt-3'} pb-1 text-lg`}>{name}</p>
            <p className='text-lg font-medium'>{currency}{price}</p>
        </Link>
    )
}

export default ProductItem