import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { backendUrl, currency } from '../App'
import { toast } from "sonner"
import { assets } from '../assets/assets'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const Orders = ({token}) => {
  const [orders, setOrders] = useState([])
  const [currentPage, setCurrentPage] = useState(1)
  const ordersPerPage = 5

  const fetchAllOrders = async () => {
    if (!token) {
      return null
    }

    try {
      const response = await axios.post(backendUrl + '/api/order/list',{},{headers: {token}})
      if (response.data.success) {
        setOrders(response.data.orders.reverse())
      } else {
        toast.error(response.data.message)
      }
    } catch (error) {
      console.log(error)
      toast.error(error.message)
    }
  }

  const statusHandler = async (value, orderId) => {
    try {
      const response = await axios.post(backendUrl + '/api/order/status', 
        {orderId, status: value}, {headers: {token}})

        if (response.data.success) {
          toast(response.data.message)
          fetchAllOrders()
        }
    } catch (error) {
      console.log(error)
      toast.error(error.message)
    }
  }

  const paymentHandler = async (orderId) => {
    try {
      const response = await axios.post(
        backendUrl + '/api/order/payment', 
        { orderId }, 
        { headers: { token }}
      );

      console.log(response.data.success);
      if (response.data.success) {
        toast.success(response.data.message);
        fetchAllOrders();
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    }
  };

  // Get current orders
  const indexOfLastOrder = currentPage * ordersPerPage
  const indexOfFirstOrder = indexOfLastOrder - ordersPerPage
  const currentOrders = orders.slice(indexOfFirstOrder, indexOfLastOrder)
  const totalPages = Math.ceil(orders.length / ordersPerPage)

  // Change page
  const paginate = (pageNumber) => setCurrentPage(pageNumber)

  useEffect(() => {
    fetchAllOrders()
  }),[token]

  return (
    <div>
      <h3>Order Page</h3>
      <div>
        {currentOrders.map((order, index) => (
          <div key={index} className='grid grid-cols-1 sm:grid-cols-[0.5fr_2fr_1fr] lg:grid-cols-[0.5fr_2fr_1fr_1fr_1fr] 
          gap-3 items-start border-2 border-gray-200 p-5 md:p-8 my-3 md:my-4 text-xs sm:text-sm text-gray-700'>
            <img src={assets.parcelIcon} alt='parcel-icon' className='w-8' />
            <div>

              <div>
                {
                  order.items.map((item, index) => {
                    if (index === order.items.length - 1) {
                      return <p className='py-0.5' key={index}>{item.name} x {item.quantity} <span>{item.size}</span></p>
                    }
                    else {
                      return <p className='py-0.5' key={index}>{item.name} x {item.quantity} <span>{item.size}</span>,</p>
                    }
                  })
                }
              </div>
              <p className='mt-3 mb-2 font-medium'>{order.address.firstName + " " + order.address.lastName}</p>
              <div>
                <p>{order.address.street + ","}</p>
                <p>{order.address.city + ", " + order.address.state + ", " + order.address.country + ", " + order.address.zipcode}</p>
              </div>
              <p>{order.address.phone}</p>
            </div>

            <div>
              <p className='text-sm sm:text-[15px]'>Items : {order.items.length}</p>
              <p className='mt-3'>Payment method : {order.paymentMethod}</p>
              <p>Payment : {order.payment ? 'Done' : 'Pending'}</p>
              <p>Date : {new Date(order.date).toLocaleDateString()}</p>
            </div>

            <p className='text-sm sm:text-[15px] self-center'>{currency}{order.amount}</p>

            <div className='flex flex-col items-start justify-start gap-5'>
              <Select defaultValue={order.status} value={order.status} onValueChange={(value)=> statusHandler(value, order._id)}
                className='p-2 font-semibold'>
                <SelectTrigger className="w-[180px]">
                  <SelectValue /> 
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Order Placed">Order placed</SelectItem>
                  <SelectItem value="Packing">Packing</SelectItem>
                  <SelectItem value="Shipped">Shipped</SelectItem>
                  <SelectItem value="Delivery in progress">Delivery in progress</SelectItem>
                  <SelectItem value="Delivered">Delivered</SelectItem>
                </SelectContent>
              </Select>

              {/* validate payment */}
               {!order.payment && (
                  <button
                    onClick={() => paymentHandler(order._id)}
                    className="px-3 py-1 text-xs cursor-pointer bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors"
                  >
                    Validate Payment
                  </button>
                )}
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      {orders.length > ordersPerPage && (
        <div className="flex justify-center gap-2 mt-6">
          <button
            onClick={() => paginate(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-3 py-1 text-sm border rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
          >
            Previous
          </button>
          
          {[...Array(totalPages)].map((_, index) => (
            <button
              key={index + 1}
              onClick={() => paginate(index + 1)}
              className={`px-3 py-1 text-sm border rounded-md hover:bg-gray-100 
                ${currentPage === index + 1 ? 'bg-gray-200' : ''}`}
            >
              {index + 1}
            </button>
          ))}

          <button
            onClick={() => paginate(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="px-3 py-1 text-sm border rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
          >
            Next
          </button>
        </div>
      )}
    </div>
  )
}

export default Orders