import React, { useContext, useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { ShopContext } from '@/context/ShopContext'
import RelatedProducts from '@/features/product/RelatedProducts';
import { ProductSkeleton } from '@/components/ProductSkeleton';
import NotFound from '@/components/NotFound';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"


const Product = () => {

  const { productId } = useParams();
  const { products, currency, addToCart, token, navigate, isLoading } = useContext(ShopContext)
  const [productData, setProductData] = useState()
  const [image, setImage] = useState('')
  const [size, setSize] = useState('')

  const foundProduct = products.find((item) => item._id == productId);

  useEffect(() => {

    setProductData(foundProduct);
    setImage(foundProduct?.image[0]);

  }, [productId, products]);

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
            <div className='flex sm:flex-col overflow-x-auto sm:overflow-y-scroll 
                  justify-between sm:justify-normal w-full sm:w-[30%]'>
              {
                productData?.image.map((item, index) => {
                  return <img src={item} alt='image' key={index} onClick={() => setImage(item)}
                    className='w-[24%] sm:w-full sm:mb-3 flex-shrink-0 cursor-pointer rounded-md ' />
                })
              }
            </div>

            <div className='w-full sm:w-[80%]'>
              <img src={image} className='w-full h-auto rounded-md' alt='main-image' />
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
                {productData?.sizes.map((item, index) => {
                  return   <ToggleGroupItem value="a"
                  className={`border rounded-none text-base font-normal py-5 px-4 bg-gray-100 ${item == size ? 'border-black border-[1.5px]' : ''}`}
                  key={index} onClick={() => setSize(item)}>
                    {item}
                  </ToggleGroupItem>
                })}
              </ToggleGroup>
            </div>
            <button onClick={() => {
              if (token) {
                addToCart(productData?._id, size)
              } else {
                navigate('/login')
              }
            }}
              className='bg-black text-white px-8 py-3 text-sm rounded-full active:bg-gray-700'>ADD TO CART</button>
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
    </div>
  )
}

export default Product