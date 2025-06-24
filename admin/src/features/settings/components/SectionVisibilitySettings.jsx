import React from 'react'
import { Checkbox } from '@/components/ui/checkbox'

export const SectionVisibilitySettings = ({
  settings,
  onSettingsChange
}) => {
  const handleVisibilityChange = (section, value) => {
    onSettingsChange({
      ...settings,
      sectionVisibility: {
        ...settings.sectionVisibility,
        [section]: value
      }
    })
  }

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold">Section Visibility</h2>
      <p className="text-sm text-gray-600">
        Control which sections are displayed on the homepage
      </p>
      
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <Checkbox 
            id="showNewLook"
            checked={settings.sectionVisibility?.showNewLook !== false}
            onCheckedChange={(value) => handleVisibilityChange('showNewLook', value)}
          />
          <label
            htmlFor="showNewLook"
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
          >
            Show New Look Section
          </label>
        </div>
        
        <div className="flex items-center gap-3">
          <Checkbox 
            id="showTrends"
            checked={settings.sectionVisibility?.showTrends !== false}
            onCheckedChange={(value) => handleVisibilityChange('showTrends', value)}
          />
          <label
            htmlFor="showTrends"
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
          >
            Show Trends Section
          </label>
        </div>
      </div>
      
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="text-sm font-medium text-blue-900 mb-2">Note:</h3>
        <p className="text-sm text-blue-700">
          Unchecking a section will hide it from the homepage. You can still manage the content, 
          but it won't be visible to visitors until you enable it again.
        </p>
      </div>
    </div>
  )
}
