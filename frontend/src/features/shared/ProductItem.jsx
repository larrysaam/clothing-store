import React, { useContext } from 'react'
import { ShopContext } from '@/context/ShopContext'
import { Link } from 'react-router-dom'

const ProductItem = ({id, image, name, price}) => {

    const { currency } = useContext(ShopContext)

  return (
    <Link to={`/product/${id}`} className='text-gray-700 cursor-pointer group' >
        <div className='overflow-hidden rounded-xl'>
            <img src={image[0]} className='w-full aspect-square transistion-all duration-300 ease-in-out group-hover:scale-[115%] aspect-square object-cover' alt=''/>
        </div> 
        <p className='pt-3 pb-1 text-sm'>{name}</p>
        <p className='text-sm font-medium'>{currency}{price}</p>
    </Link>
  )
}

export default ProductItem