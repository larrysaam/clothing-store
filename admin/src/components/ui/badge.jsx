import * as React from "react"

const badgeVariants = {
  default: "inline-flex items-center rounded-full border border-gray-200 px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-gray-950 focus:ring-offset-2 bg-gray-900 text-gray-50 hover:bg-gray-900/80",
  secondary: "inline-flex items-center rounded-full border border-gray-200 px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-gray-950 focus:ring-offset-2 bg-gray-100 text-gray-900 hover:bg-gray-100/80",
  destructive: "inline-flex items-center rounded-full border border-gray-200 px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-gray-950 focus:ring-offset-2 bg-red-500 text-gray-50 hover:bg-red-500/80",
  outline: "inline-flex items-center rounded-full border border-gray-200 px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-gray-950 focus:ring-offset-2 text-gray-950",
  success: "inline-flex items-center rounded-full border border-gray-200 px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-gray-950 focus:ring-offset-2 bg-green-500 text-gray-50 hover:bg-green-500/80"
}

function Badge({ className, variant = "default", ...props }) {
  return (
    <div className={`${badgeVariants[variant]} ${className || ''}`} {...props} />
  )
}

export { Badge, badgeVariants }
