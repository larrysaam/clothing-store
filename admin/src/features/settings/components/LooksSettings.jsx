import React from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import { Trash2 } from "lucide-react"
import axios from 'axios'

export const LooksSettings = ({
  settings,
  onSettingsChange,
  lookFiles,
  onLookImageChange,
  products = [],
  categories = {},
  backendUrl,
  token
}) => {
  // Helper function to determine link type for each look
  // We'll use a special marker to track the intended type
  const getLinkType = (look) => {
    // Check if we have a special marker indicating the intended type
    if (look.link._type) {
      return look.link._type
    }
    // Fallback logic based on actual data
    if (look.link.productId && look.link.productId.trim() !== '') {
      return 'product'
    }
    if (look.link.category && look.link.category.trim() !== '') {
      return 'category'
    }
    // Default to product for new looks
    return 'product'
  }
  const handleAddLook = () => {
    if (settings.looks.length >= 5) {
      toast.error('Maximum 5 looks allowed')
      return
    }

    onSettingsChange({
      ...settings,
      looks: [...settings.looks, {
        image: '',
        label: 'Shop the Look',
        link: {
          _type: 'product', // Default to product type for new looks
          productId: '',
          category: '',
          subcategory: '',
          subsubcategory: ''
        }
      }]
    })
  }

  const handleRemoveLook = async (index) => {
    // Show confirmation dialog
    if (!window.confirm('Are you sure you want to delete this look? This action cannot be undone.')) {
      return
    }

    try {
      // Call backend to delete look and associated Cloudinary image
      const response = await axios.delete(`${backendUrl}/api/settings/look/${index}`, {
        headers: { token }
      })

      if (response.data.success) {
        // Re-initialize _type markers for the updated settings
        const settingsWithTypes = {
          ...response.data.settings,
          looks: response.data.settings.looks?.map(look => ({
            ...look,
            link: {
              ...look.link,
              _type: look.link.productId ? 'product' : 'category'
            }
          })) || []
        }
        onSettingsChange(settingsWithTypes)
        toast.success('Look deleted successfully')
      } else {
        toast.error(response.data.message || 'Failed to delete look')
      }
    } catch (error) {
      console.error('Error deleting look:', error)
      toast.error('Failed to delete look')

      // Fallback to local deletion if backend fails
      const newLooks = [...settings.looks]
      newLooks.splice(index, 1)
      onSettingsChange({
        ...settings,
        looks: newLooks
      })
    }
  }

  const handleLookChange = (index, field, value) => {
    const newLooks = [...settings.looks]
    newLooks[index] = {
      ...newLooks[index],
      [field]: value
    }
    onSettingsChange({
      ...settings,
      looks: newLooks
    })
  }

  const handleLinkChange = (index, field, value) => {
    const newLooks = [...settings.looks]
    newLooks[index] = {
      ...newLooks[index],
      link: {
        ...newLooks[index].link,
        [field]: value
      }
    }
    onSettingsChange({
      ...settings,
      looks: newLooks
    })
  }

  const handleLinkTypeChange = (index, type) => {
    const newLooks = [...settings.looks]
    // Use a special _type marker to track intended type
    newLooks[index] = {
      ...newLooks[index],
      link: {
        _type: type, // Internal marker for UI state
        productId: '',
        category: '',
        subcategory: '',
        subsubcategory: ''
      }
    }
    onSettingsChange({
      ...settings,
      looks: newLooks
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">Looks Settings</h2>
        <Button 
          type="button" 
          onClick={handleAddLook}
          disabled={settings.looks?.length >= 5}
        >
          Add Look
        </Button>
      </div>
      
      {settings.looks?.map((look, index) => (
        <div key={index} className="border p-4 rounded-lg space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-medium">Look {index + 1}</h3>
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={() => handleRemoveLook(index)}
              className="flex items-center gap-2"
            >
              <Trash2 size={16} />
              Remove
            </Button>
          </div>
          
          <div>
            <label className="block text-sm mb-2">Image</label>
            <Input
              type="file"
              accept="image/*"
              onChange={(e) => onLookImageChange(index, e.target.files[0])}
              className="mb-2"
            />
            {look.image && (
              <div className="relative group w-full">
                <img
                  src={look.image}
                  alt={`Look ${index + 1}`}
                  className="w-full h-48 object-cover rounded-lg"
                />
                <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-lg flex items-center justify-center">
                  <p className="text-white text-sm font-medium">Current Look Image</p>
                </div>
              </div>
            )}
          </div>
          
          <div>
            <label className="block text-sm mb-2">Label</label>
            <Input
              type="text"
              value={look.label}
              onChange={(e) => handleLookChange(index, 'label', e.target.value)}
              placeholder="Shop the Look"
            />
          </div>
          
          <div>
            <label className="block text-sm mb-2">Link Type</label>
            <Select
              value={getLinkType(look)}
              onValueChange={(value) => handleLinkTypeChange(index, value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select link type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="product">Product Link</SelectItem>
                <SelectItem value="category">Category Link</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {getLinkType(look) === 'product' ? (
            <div>
              <label className="block text-sm mb-2">Select Product</label>
              <Select
                value={look.link.productId || ''}
                onValueChange={(value) => handleLinkChange(index, 'productId', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choose a product" />
                </SelectTrigger>
                <SelectContent>
                  {products.map(product => (
                    <SelectItem key={product._id} value={product._id}>
                      <div className="flex items-center gap-2">
                        <img
                          src={product.image[0]}
                          alt={product.name}
                          className="w-8 h-8 object-cover rounded"
                        />
                        <span>{product.name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ) : (
            <>
              <div>
                <label className="block text-sm mb-2">Category</label>
                <Select
                  value={look.link.category}
                  onValueChange={(value) => handleLinkChange(index, 'category', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.keys(categories).map(category => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              {look.link.category && (
                <div>
                  <label className="block text-sm mb-2">Subcategory</label>
                  <Select
                    value={look.link.subcategory}
                    onValueChange={(value) => handleLinkChange(index, 'subcategory', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select subcategory" />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.isArray(categories[look.link.category]) && categories[look.link.category].map(subcategory => (
                        <SelectItem key={subcategory.name} value={subcategory.name}>
                          {subcategory.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
              
              {look.link.subcategory && (
                <div>
                  <label className="block text-sm mb-2">Subsubcategory</label>
                  <Select
                    value={look.link.subsubcategory}
                    onValueChange={(value) => handleLinkChange(index, 'subsubcategory', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select subsubcategory" />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.isArray(categories[look.link.category]) &&
                       categories[look.link.category]
                         .find(sub => sub.name === look.link.subcategory)?.subcategories
                         ?.map(subsubcategory => (
                           <SelectItem key={subsubcategory} value={subsubcategory}>
                             {subsubcategory}
                           </SelectItem>
                         ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </>
          )}
        </div>
      ))}
    </div>
  )
}