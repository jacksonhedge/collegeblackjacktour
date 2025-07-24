import * as React from "react"
import { cn } from "../../lib/utils"

const buttonVariants = {
  default: "bg-gradient-to-r from-purple-600 to-purple-700 text-white hover:from-purple-700 hover:to-purple-800 shadow-lg hover:shadow-xl",
  primary: "bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 shadow-lg hover:shadow-xl",
  success: "bg-gradient-to-r from-green-600 to-green-700 text-white hover:from-green-700 hover:to-green-800 shadow-lg hover:shadow-xl",
  danger: "bg-gradient-to-r from-red-600 to-red-700 text-white hover:from-red-700 hover:to-red-800 shadow-lg hover:shadow-xl",
  warning: "bg-gradient-to-r from-yellow-600 to-yellow-700 text-white hover:from-yellow-700 hover:to-yellow-800 shadow-lg hover:shadow-xl",
  ghost: "bg-transparent hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300",
  outline: "border-2 border-purple-600 text-purple-600 hover:bg-purple-600 hover:text-white dark:border-purple-400 dark:text-purple-400",
  glow: "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-2xl shadow-purple-500/50 hover:shadow-purple-500/70",
  glass: "bg-white/10 backdrop-blur-md text-white border border-white/20 hover:bg-white/20"
}

const sizeVariants = {
  sm: "px-3 py-1.5 text-sm",
  md: "px-4 py-2 text-base",
  lg: "px-6 py-3 text-lg",
  xl: "px-8 py-4 text-xl"
}

const ButtonModern = React.forwardRef(({ 
  className, 
  variant = "default", 
  size = "md", 
  icon: Icon,
  iconPosition = "left",
  loading = false,
  pulse = false,
  children,
  ...props 
}, ref) => {
  const baseClasses = "inline-flex items-center justify-center rounded-xl font-semibold transition-all duration-300 transform hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed"
  const pulseClasses = pulse ? "animate-pulse" : ""
  
  return (
    <button
      ref={ref}
      className={cn(
        baseClasses,
        buttonVariants[variant],
        sizeVariants[size],
        pulseClasses,
        className
      )}
      disabled={loading || props.disabled}
      {...props}
    >
      {loading ? (
        <>
          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
          Loading...
        </>
      ) : (
        <>
          {Icon && iconPosition === "left" && <Icon className="w-5 h-5 mr-2" />}
          {children}
          {Icon && iconPosition === "right" && <Icon className="w-5 h-5 ml-2" />}
        </>
      )}
    </button>
  )
})

ButtonModern.displayName = "ButtonModern"

export { ButtonModern, buttonVariants }