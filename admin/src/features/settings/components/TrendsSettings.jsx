import React from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import { Trash2 } from "lucide-react"
import axios from 'axios'

export const TrendsSettings = ({
  settings,
  onSettingsChange,
  trendFiles,
  onTrendImageChange,
  products = [],
  categories = {},
  backendUrl,
  token
}) => {
  // Helper function to determine link type for each trend
  const getLinkType = (trend) => {
    // Check if we have a special marker indicating the intended type
    if (trend.link._type) {
      return trend.link._type
    }
    // Fallback logic based on actual data
    if (trend.link.productId && trend.link.productId.trim() !== '') {
      return 'product'
    }
    if (trend.link.category && trend.link.category.trim() !== '') {
      return 'category'
    }
    // Default to product for new trends
    return 'product'
  }

  const handleAddTrend = () => {
    if (settings.trends.length >= 4) {
      toast.error('Maximum 4 trends allowed')
      return
    }

    onSettingsChange({
      ...settings,
      trends: [...settings.trends, {
        image: '',
        label: 'Trending Now',
        link: {
          _type: 'product', // Default to product type for new trends
          productId: '',
          category: '',
          subcategory: '',
          subsubcategory: ''
        }
      }]
    })
  }

  const handleRemoveTrend = async (index) => {
    // Show confirmation dialog
    if (!window.confirm('Are you sure you want to delete this trend? This action cannot be undone.')) {
      return
    }

    try {
      // Call backend to delete trend and associated Cloudinary image
      const response = await axios.delete(`${backendUrl}/api/settings/trend/${index}`, {
        headers: { token }
      })

      if (response.data.success) {
        // Re-initialize _type markers for the updated settings
        const settingsWithTypes = {
          ...response.data.settings,
          trends: response.data.settings.trends?.map(trend => ({
            ...trend,
            link: {
              ...trend.link,
              _type: trend.link.productId ? 'product' : 'category'
            }
          })) || []
        }
        onSettingsChange(settingsWithTypes)
        toast.success('Trend deleted successfully')
      } else {
        toast.error(response.data.message || 'Failed to delete trend')
      }
    } catch (error) {
      console.error('Error deleting trend:', error)
      toast.error('Failed to delete trend')

      // Fallback to local deletion if backend fails
      const newTrends = [...settings.trends]
      newTrends.splice(index, 1)
      onSettingsChange({
        ...settings,
        trends: newTrends
      })
    }
  }

  const handleTrendChange = (index, field, value) => {
    const newTrends = [...settings.trends]
    newTrends[index] = {
      ...newTrends[index],
      [field]: value
    }
    onSettingsChange({
      ...settings,
      trends: newTrends
    })
  }

  const handleLinkChange = (index, field, value) => {
    const newTrends = [...settings.trends]
    newTrends[index] = {
      ...newTrends[index],
      link: {
        ...newTrends[index].link,
        [field]: value
      }
    }
    onSettingsChange({
      ...settings,
      trends: newTrends
    })
  }

  const handleLinkTypeChange = (index, type) => {
    const newTrends = [...settings.trends]
    // Use a special _type marker to track intended type
    newTrends[index] = {
      ...newTrends[index],
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
      trends: newTrends
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">Trends Settings (Max 4)</h2>
        <Button 
          type="button" 
          onClick={handleAddTrend}
          disabled={settings.trends?.length >= 4}
        >
          Add Trend
        </Button>
      </div>
      
      {settings.trends?.map((trend, index) => (
        <div key={index} className="border p-4 rounded-lg space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-medium">Trend {index + 1}</h3>
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={() => handleRemoveTrend(index)}
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
              onChange={(e) => onTrendImageChange(index, e.target.files[0])}
              className="mb-2"
            />
            {trend.image && (
              <div className="relative group w-full">
                <img
                  src={trend.image}
                  alt={`Trend ${index + 1}`}
                  className="w-full h-48 object-cover rounded-lg"
                />
                <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-lg flex items-center justify-center">
                  <p className="text-white text-sm font-medium">Current Trend Image</p>
                </div>
              </div>
            )}
          </div>
          
          <div>
            <label className="block text-sm mb-2">Label</label>
            <Input
              type="text"
              value={trend.label}
              onChange={(e) => handleTrendChange(index, 'label', e.target.value)}
              placeholder="Trending Now"
            />
          </div>
          
          <div>
            <label className="block text-sm mb-2">Link Type</label>
            <Select
              value={getLinkType(trend)}
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

          {getLinkType(trend) === 'product' ? (
            <div>
              <label className="block text-sm mb-2">Select Product</label>
              <Select
                value={trend.link.productId || ''}
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
                  value={trend.link.category}
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
              
              {trend.link.category && (
                <div>
                  <label className="block text-sm mb-2">Subcategory</label>
                  <Select
                    value={trend.link.subcategory}
                    onValueChange={(value) => handleLinkChange(index, 'subcategory', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select subcategory" />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.isArray(categories[trend.link.category]) && categories[trend.link.category].map(subcategory => (
                        <SelectItem key={subcategory.name} value={subcategory.name}>
                          {subcategory.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
              
              {trend.link.subcategory && (
                <div>
                  <label className="block text-sm mb-2">Subsubcategory</label>
                  <Select
                    value={trend.link.subsubcategory}
                    onValueChange={(value) => handleLinkChange(index, 'subsubcategory', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select subsubcategory" />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.isArray(categories[trend.link.category]) &&
                       categories[trend.link.category]
                         .find(sub => sub.name === trend.link.subcategory)?.subcategories
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
