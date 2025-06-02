import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { backendUrl, currency } from '../App'
import { toast } from "sonner"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const Preorders = ({token}) => {
  const [preorders, setPreorders] = useState([])
  const [currentPage, setCurrentPage] = useState(1)
  const preordersPerPage = 5

  const fetchPreorders = async () => {
    if (!token) return null

    try {
      const response = await axios.get(`${backendUrl}/api/preorder/list`, {
        headers: { token }
      })
      if (response.data.success) {
        setPreorders(response.data.preorders)
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to fetch preorders')
    }
  }

  const statusHandler = async (value, preorderId) => {
    try {
      const response = await axios.put(
        `${backendUrl}/api/preorder/status`,
        { preorderId, status: value },
        { headers: { token } }
      )

      if (response.data.success) {
        toast.success(response.data.message)
        fetchPreorders()
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update status')
    }
  }

  const depositHandler = async (preorderId) => {
    try {
      const response = await axios.put(
        `${backendUrl}/api/preorder/deposit`,
        { preorderId },
        { headers: { token } }
      )

      if (response.data.success) {
        toast.success(response.data.message)
        fetchPreorders()
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to validate deposit')
    }
  }

  // Pagination logic
  const indexOfLastPreorder = currentPage * preordersPerPage
  const indexOfFirstPreorder = indexOfLastPreorder - preordersPerPage
  const currentPreorders = preorders.slice(indexOfFirstPreorder, indexOfLastPreorder)
  const totalPages = Math.ceil(preorders.length / preordersPerPage)

  const paginate = (pageNumber) => setCurrentPage(pageNumber)

  useEffect(() => {
    fetchPreorders()
  }, [token])

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Preorders</h1>
      
      <div className="space-y-4">
        {currentPreorders.map((preorder) => (
          <div key={preorder._id} className="border rounded-lg p-4 space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <h3 className="font-semibold">Customer Details</h3>
                <p>{preorder.address.firstName} {preorder.address.lastName}</p>
                <p>{preorder.address.email}</p>
                <p>{preorder.address.phone}</p>
              </div>
              
              <div>
                <h3 className="font-semibold">Items</h3>
                {preorder.items.map((item, index) => (
                  <p key={index}>
                    {item.name} - {item.size} x{item.quantity}
                  </p>
                ))}
              </div>

              <div>
                <h3 className="font-semibold">Deposit</h3>
                <p>Amount: {currency}{preorder.items[0].price}</p>
                <p>Status: {preorder.payment ? 'Paid' : 'Pending'}</p>
                {!preorder.payment && (
                  <button
                    onClick={() => depositHandler(preorder._id)}
                    className="mt-2 px-3 py-1 bg-green-500 text-white rounded-md text-sm"
                  >
                    Validate Deposit
                  </button>
                )}
              </div>

              <div>
                <h3 className="font-semibold">Status</h3>
                <Select
                  defaultValue={preorder.status}
                  onValueChange={(value) => statusHandler(value, preorder._id)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Pending">Pending</SelectItem>
                    <SelectItem value="Confirmed">Confirmed</SelectItem>
                    <SelectItem value="Processing">Processing</SelectItem>
                    <SelectItem value="Ready">Ready</SelectItem>
                    <SelectItem value="Cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      {preorders.length > preordersPerPage && (
        <div className="flex justify-center gap-2 mt-6">
          <button
            onClick={() => paginate(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-3 py-1 text-sm border rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          
          {[...Array(totalPages)].map((_, index) => (
            <button
              key={index + 1}
              onClick={() => paginate(index + 1)}
              className={`px-3 py-1 text-sm border rounded-md
                ${currentPage === index + 1 ? 'bg-gray-200' : ''}`}
            >
              {index + 1}
            </button>
          ))}

          <button
            onClick={() => paginate(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="px-3 py-1 text-sm border rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      )}
    </div>
  )
}

export default Preorders