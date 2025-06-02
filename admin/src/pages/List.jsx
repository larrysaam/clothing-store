import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { backendUrl, currency } from '../App'
import { toast } from "sonner"
import { BsPencil, BsTrash } from 'react-icons/bs'


const List = ({token}) => {

  const [list, setList] = useState([])
  const [currentPage, setCurrentPage] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [editingItem, setEditingItem] = useState(null)
  const [editForm, setEditForm] = useState({
    name: '',
    price: '',
    category: '',
    description: ''
  })
  const itemsPerPage = 5

  const fetchList = async () => {
    try {
      const response = await axios.get(backendUrl + '/api/product/list')
      if (response.data.success) {
        setList(response.data.products)
      } else {
        toast.error(response.data.message)
      }
    } catch (error) {
      console.log(error)
      toast.error(error.message)
    }
  }

  const removeProduct = async (id) => {
    try {
      
      const response = await axios.post(backendUrl + '/api/product/remove', {id}, {headers: {token}})

      if (response.data.success) {
        toast.success(response.data.message)
        await fetchList();
      } else {
        toast.error(response.data.message)
      }
      
    } catch (error) {
      console.log(error)
      toast.error(error.message)
    }
  }

  // Add handleEdit function
  const handleEdit = (item) => {
    setEditingItem(item._id)
    setEditForm({
      name: item.name,
      price: item.price,
      category: item.category,
      description: item.description
    })
  }

  // Add handleUpdate function
  const handleUpdate = async (id) => {
    try {
      const response = await axios.put(
        `${backendUrl}/api/product/update/${id}`,
        editForm,
        { headers: { token } }
      )

      if (response.data.success) {
        toast.success('Product updated successfully')
        setEditingItem(null)
        await fetchList()
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update product')
    }
  }

  // Get current products
  const indexOfLastItem = currentPage * itemsPerPage
  const indexOfFirstItem = indexOfLastItem - itemsPerPage
  const currentItems = list.slice(indexOfFirstItem, indexOfLastItem)
  const totalPages = Math.ceil(list.length / itemsPerPage)

  // Change page
  const paginate = (pageNumber) => setCurrentPage(pageNumber)

  useEffect(()=> {
    fetchList()
  },[])


  return (
  <>
    <div className='mb-2 flex items-center justify-between'>
      <p>All Products List</p>
      <p className='mr-5'>Total: {list.length}</p>
    </div>
    <div className='flex flex-col gap-2'>
      {/* -------- List Table Title --------*/}

      <div className='hidden md:grid h-12 grid-cols-[1fr_2fr_1fr_1fr_1fr] items-center py-1 px-2 border bg-gray-100 text-sm'>
        <b>Image</b>
        <b>Name</b>
        <b>Category</b>
        <b>Price</b>
        <b className='text-center'>Action</b>
      </div>

      {/* -------- Product List --------*/}

      {
        currentItems.map((item, index) => (
          <div className='grid grid-cols-[1fr_2fr_1fr] md:grid-cols-[1fr_2fr_1fr_1fr_1fr]
          items-center gap-2 py-2 px-2 border text-sm' key={index}>
            <img alt='' src={item.image[0]} className='w-auto rounded-md'/>
            {
              editingItem === item._id ? (
                <>
                  <input
                    type="text"
                    value={editForm.name}
                    onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                    className="border rounded px-2 py-1"
                  />
                  <input
                    type="text"
                    value={editForm.category}
                    onChange={(e) => setEditForm({...editForm, category: e.target.value})}
                    className="border rounded px-2 py-1"
                  />
                  <input
                    type="number"
                    value={editForm.price}
                    onChange={(e) => setEditForm({...editForm, price: e.target.value})}
                    className="border rounded px-2 py-1"
                  />
                  <div className="flex gap-2 justify-center">
                    <button
                      onClick={() => handleUpdate(item._id)}
                      className="px-3 py-1 bg-green-500 text-white rounded-md hover:bg-green-600"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => setEditingItem(null)}
                      className="px-3 py-1 bg-gray-500 text-white rounded-md hover:bg-gray-600"
                    >
                      Cancel
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <p>{item.name}</p>
                  <p>{item.category}</p>
                  <p>{currency}{item.price}</p>
                  <div className="flex gap-2 justify-center">
                    <button
                      onClick={() => handleEdit(item)}
                      className="p-2 hover:text-blue-600 transition-colors"
                    >
                      <BsPencil size={16} />
                    </button>
                    <button
                      onClick={() => removeProduct(item._id)}
                      className="p-2 hover:text-red-600 transition-colors"
                    >
                      <BsTrash size={16} />
                    </button>
                  </div>
                </>
              )
            }
          </div>
        ))
      }

      {/* Pagination */}
      {list.length > itemsPerPage && (
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
  </>
  )
}

export default List