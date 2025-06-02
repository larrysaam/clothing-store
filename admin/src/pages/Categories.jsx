import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { backendUrl } from '../App'
import { toast } from 'sonner'
import { BsTrash, BsPencil, BsPlus } from 'react-icons/bs'

const Categories = ({ token }) => {
  const [categories, setCategories] = useState({
    Men: [],
    Women: [],
    Kids: []
  })
  const [editMode, setEditMode] = useState(null)
  const [newSubcategory, setNewSubcategory] = useState('')
  const [selectedMainCategory, setSelectedMainCategory] = useState('Men')
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Fetch categories
  const fetchCategories = async () => {
    if (!token) return

    setIsLoading(true)
    try {
      const response = await axios.get(`${backendUrl}/api/categories`, {
        headers: { token }
      })
      if (response.data.success) {
        // Destructure to exclude _id and __v
        const { _id, __v, ...categoriesData } = response.data.categories || {
          Men: [],
          Women: [],
          Kids: []
        }

        // Convert any non-array values to empty arrays
        Object.keys(categoriesData).forEach(key => {
          if (!Array.isArray(categoriesData[key])) {
            categoriesData[key] = []
          }
        })
        
        setCategories(categoriesData)
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to fetch categories')
    } finally {
      setIsLoading(false)
    }
  }

  // Add new subcategory
  const handleAdd = async (e) => {
    e.preventDefault()
    if (!newSubcategory.trim()) {
      toast.error('Please enter a subcategory name')
      return
    }

    setIsSubmitting(true)
    try {
      const response = await axios.post(`${backendUrl}/api/categories/add`, {
        mainCategory: selectedMainCategory,
        subcategory: newSubcategory.trim()
      }, {
        headers: { token }
      })

      if (response.data.success) {
        toast.success('Subcategory added successfully')
        setNewSubcategory('')
        await fetchCategories()
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add subcategory')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Update subcategory
  const handleUpdate = async (mainCategory, oldSubcategory, newValue) => {
    if (!newValue.trim() || newValue === oldSubcategory) {
      setEditMode(null)
      return
    }

    try {
      const response = await axios.put(`${backendUrl}/api/categories/update`, {
        mainCategory,
        oldSubcategory,
        newSubcategory: newValue.trim()
      }, {
        headers: { token }
      })

      if (response.data.success) {
        toast.success('Subcategory updated successfully')
        await fetchCategories()
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update subcategory')
    } finally {
      setEditMode(null)
    }
  }

  // Delete subcategory
  const handleDelete = async (mainCategory, subcategory) => {
    if (!window.confirm('Are you sure you want to delete this subcategory?')) {
      return
    }

    try {
      const response = await axios.delete(`${backendUrl}/api/categories/delete`, {
        headers: { token },
        data: { mainCategory, subcategory }
      })

      if (response.data.success) {
        toast.success('Subcategory deleted successfully')
        await fetchCategories()
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete subcategory')
    }
  }

  useEffect(() => {
    fetchCategories()
  }, [token])

  if (isLoading) {
    return (
      <div className="p-6 flex justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  return (
    <div className="p-4 sm:p-6">
      <h1 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">Category Management</h1>

      {/* Add new subcategory section */}
      <form onSubmit={handleAdd} className="mb-6 sm:mb-8 bg-white p-4 sm:p-6 rounded-lg shadow-sm">
        <h2 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">Add New Subcategory</h2>
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
          <select
            value={selectedMainCategory}
            onChange={(e) => setSelectedMainCategory(e.target.value)}
            className="border rounded-md px-3 py-2 w-full sm:w-auto"
            disabled={isSubmitting}
          >
            {Object.keys(categories).map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
          <input
            type="text"
            value={newSubcategory}
            onChange={(e) => setNewSubcategory(e.target.value)}
            placeholder="Enter subcategory name"
            className="border rounded-md px-3 py-2 w-full"
            disabled={isSubmitting}
          />
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex items-center justify-center gap-2 bg-black text-white px-4 py-2 rounded-md 
            hover:bg-gray-800 w-full sm:w-auto disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <BsPlus size={20} />
            {isSubmitting ? 'Adding...' : 'Add'}
          </button>
        </div>
      </form>

      {/* Categories list */}
      <div className="grid grid-cols-1 gap-4 sm:gap-6">
        {Object.entries(categories).map(([mainCategory, subcategories]) => (
          <div key={mainCategory} className="bg-white p-4 sm:p-6 rounded-lg shadow-sm">
            <h2 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">{mainCategory}</h2>
            {Array.isArray(subcategories) && subcategories.length === 0 ? (
              <p className="text-gray-500 text-sm">No subcategories yet</p>
            ) : (
              <ul className="space-y-2">
                {Array.isArray(subcategories) ? subcategories.map((subcategory, index) => (
                  <li key={`${mainCategory}-${subcategory}-${index}`} 
                      className="flex items-center justify-between py-2 border-b text-sm sm:text-base">
                    {editMode === `${mainCategory}-${subcategory}` ? (
                      <input
                        type="text"
                        defaultValue={subcategory}
                        onBlur={(e) => handleUpdate(mainCategory, subcategory, e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            e.target.blur()
                          }
                        }}
                        className="border rounded-md px-2 py-1 w-full mr-2 text-sm"
                        autoFocus
                      />
                    ) : (
                      <span className="break-words flex-1 pr-2">{subcategory}</span>
                    )}
                    <div className="flex gap-2 shrink-0">
                      <button
                        onClick={() => setEditMode(`${mainCategory}-${subcategory}`)}
                        className="p-2 hover:text-blue-600 transition-colors"
                      >
                        <BsPencil size={14} className="sm:w-4 sm:h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(mainCategory, subcategory)}
                        className="p-2 hover:text-red-600 transition-colors"
                      >
                        <BsTrash size={14} className="sm:w-4 sm:h-4" />
                      </button>
                    </div>
                  </li>
                )) : (
                  <p className="text-gray-500 text-sm">Invalid subcategories data</p>
                )}
              </ul>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

export default Categories