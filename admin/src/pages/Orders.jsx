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

  // Add this pagination helper function at the top of your component
  const getPaginationRange = (currentPage, totalPages) => {
    if (totalPages <= 5) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    if (currentPage <= 3) {
      return [1, 2, 3, '...', totalPages];
    }

    if (currentPage >= totalPages - 2) {
      return [1, '...', totalPages - 2, totalPages - 1, totalPages];
    }

    return [1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages];
  };

  useEffect(() => {
    fetchAllOrders()
  }),[token]

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <h3 className="text-lg sm:text-xl font-medium mb-4">Order Page</h3>
      <div className="space-y-4">
        {currentOrders.map((order, index) => (
          <div 
            key={index} 
            className='flex flex-col gap-4 border rounded-lg p-4 sm:p-6
              bg-white shadow-sm'
          >
            {/* Order Header */}
            <div className="flex items-center gap-3">
              <img src={assets.parcelIcon} alt='parcel-icon' className='w-6 sm:w-8' />
              <p className="font-medium">
                Order #{order._id.slice(-6)}
              </p>
            </div>

            {/* Order Items */}
            <div className="space-y-2 text-sm">
              {order.items.map((item, index) => (
                <div key={index} className="flex justify-between items-start">
                  <p className='flex-1'>{item.name} 
                    <span className="text-gray-500">
                      {` (Size: ${item.size}, Qty: ${item.quantity})`}
                    </span>
                  </p>
                </div>
              ))}
            </div>

            {/* Customer Details */}
            <div className="text-sm space-y-1 border-t pt-3">
              <p className='font-medium'>
                {order.address.firstName + " " + order.address.lastName}
              </p>
              <p className="text-gray-600">
                {order.address.street},
                <br />
                {order.address.city}, {order.address.state},
                <br />
                {order.address.country}, {order.address.zipcode}
              </p>
              <p className="text-gray-600">{order.address.phone}</p>
            </div>

            {/* Order Details */}
            <div className="grid grid-cols-2 gap-4 text-sm border-t pt-3">
              <div>
                <p>Items: {order.items.length}</p>
                <p>Payment: {order.payment ? 'Done' : 'Pending'}</p>
              </div>
              <div>
                <p>Method: {order.paymentMethod}</p>
                <p>Date: {new Date(order.date).toLocaleDateString()}</p>
              </div>
              <p className="col-span-2 text-lg font-medium">
                Total: {currency}{order.amount}
              </p>
            </div>

            {/* Actions */}
            <div className='flex flex-col sm:flex-row gap-3 border-t pt-3'>
              <Select 
                defaultValue={order.status} 
                value={order.status} 
                onValueChange={(value)=> statusHandler(value, order._id)}
              >
                <SelectTrigger className="w-full sm:w-[180px]">
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

              {!order.payment && (
                <button
                  onClick={() => paymentHandler(order._id)}
                  className="w-full sm:w-auto px-4 py-2 text-sm bg-green-500 text-white 
                    rounded-md hover:bg-green-600 transition-colors"
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
        <div className="flex justify-center gap-2 mt-6 pb-6 overflow-x-auto">
          <button
            onClick={() => paginate(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-3 py-1 text-sm border rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
          >
            Previous
          </button>
          
          {getPaginationRange(currentPage, totalPages).map((pageNum, index) => (
            <React.Fragment key={index}>
              {pageNum === '...' ? (
                <span className="px-3 py-1 text-sm">...</span>
              ) : (
                <button
                  onClick={() => paginate(pageNum)}
                  className={`px-3 py-1 text-sm border rounded-md hover:bg-gray-100 
                    ${currentPage === pageNum ? 'bg-gray-200' : ''}`}
                >
                  {pageNum}
                </button>
              )}
            </React.Fragment>
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