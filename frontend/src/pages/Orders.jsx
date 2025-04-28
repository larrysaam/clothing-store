import React, { useContext } from 'react'
import { ShopContext } from '@/context/ShopContext'
import Title from '@/components/Title'
import { toast } from "sonner"
import { useQuery } from "@tanstack/react-query"
import axios from "axios"

const Orders = () => {
  const { currency, backendUrl, token } = useContext(ShopContext)

  // Fetch orders using React Query
  const { data: orderData = [], isLoading, isError, refetch, isRefetching } = useQuery({
    queryKey: ['userOrders', token],
    queryFn: async () => {
      if (!token) return []
      const response = await axios.post(`${backendUrl}/api/order/userorders`, {}, { headers: { token } })
      if (response.data.success) {
        const orders = response.data.orders.flatMap(order =>
          order.items.map(item => ({
            ...item,
            status: order.status,
            payment: order.payment,
            paymentMethod: order.paymentMethod,
            date: order.date
          }))
        ).reverse()
        return orders
      } else {
        toast.error(response.data.message)
        return []
      }
    },
    enabled: !!token, // Fetch only if token exists
    staleTime: 1000 * 60 * 5, // Cache data for 5 minutes
  })

  if (isLoading) {
    return <div className='my-10 gap-6 flex justify-center items-center'>
        <div className="w-6 h-6 border-4 border-t-gray-800 border-gray-300 rounded-full animate-spin"></div>
        <p className="text-center text-gray-600">Loading your orders...</p>
    </div>
  }

  if (isError) {
    return <p className="text-center text-red-500">Failed to load orders. Please try again.</p>
  }

  return (
    <div className='border-t pt-16 animate-fade animate-duration-500'>
      <div className='text-2xl'>
        <Title text1='MY' text2='ORDERS' />
      </div>

      {/* No Orders Found */}
      {orderData.length === 0 ? (
        <p className="text-center text-gray-500 mt-6 text-lg">
          You haven't placed any orders yet. <br /> 
          <span className="text-blue-600 cursor-pointer hover:underline" onClick={() => window.location.href = '/'}>
            Start shopping now!
          </span>
        </p>
      ) : (
        orderData.map((item, index) => (
          <div key={index} className='py-4 border-y text-gray-700 flex flex-col md:flex-row
          md:items-center md:justify-between gap-4'>
            <div className='flex items-center gap-6 text-sm'>
              <img src={item.image[0]} alt="" className='w-16 sm:w-20' />
              <div>
                <p className='sm:text-base font-medium'>{item.name}</p>
                <div className='flex items-center gap-3 mt-1 text-base text-gray-700'>
                  <p>{currency}{item.price}</p>
                  <p>Quantity: {item.quantity}</p>
                  <p>Size: {item.size}</p>
                </div>
                <p>{`Date: `} 
                  <span className='text-gray-400'>{new Date(item.date).toLocaleString()}</span>
                </p>
                <p>{`Payment: `} 
                  <span className='text-gray-400'>{item.paymentMethod}</span>
                </p>
              </div>
            </div>
            <div className='md:w-1/2 flex justify-between'>
              <div className='flex items-center gap-2'>
                <p className='min-w-2 h-2 rounded-full bg-green-500'></p>
                <p className='text-sm md:text-base'>{item.status}</p>
              </div>
              <button 
                onClick={refetch}
                className={`border px-4 py-2 text-sm font-medium rounded-lg transition-all duration-300 flex items-center gap-2
                  ${isRefetching ? 'bg-gray-400 text-gray-200 cursor-not-allowed' : ''}`}
                disabled={isRefetching}
              >
                {isRefetching ? (
                  <>
                    <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></span>
                    Refreshing...
                  </>
                ) : (
                  "Track Order"
                )}
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  )
}

export default Orders
