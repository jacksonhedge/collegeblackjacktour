import * as React from "react"
import { cn } from "../../lib/utils"

const CardModern = React.forwardRef(({ className, gradient, glow, ...props }, ref) => {
  const baseClasses = "rounded-2xl bg-white dark:bg-gray-800 shadow-lg hover:shadow-xl transition-all duration-300"
  const gradientClasses = gradient ? `bg-gradient-to-br ${gradient}` : ""
  const glowClasses = glow ? "shadow-2xl shadow-purple-500/20" : ""
  
  return (
    <div
      ref={ref}
      className={cn(baseClasses, gradientClasses, glowClasses, className)}
      {...props}
    />
  )
})
CardModern.displayName = "CardModern"

const CardHeaderModern = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5 p-6", className)}
    {...props}
  />
))
CardHeaderModern.displayName = "CardHeaderModern"

const CardTitleModern = React.forwardRef(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      "text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent",
      className
    )}
    {...props}
  />
))
CardTitleModern.displayName = "CardTitleModern"

const CardDescriptionModern = React.forwardRef(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-gray-600 dark:text-gray-400", className)}
    {...props}
  />
))
CardDescriptionModern.displayName = "CardDescriptionModern"

const CardContentModern = React.forwardRef(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
))
CardContentModern.displayName = "CardContentModern"

const CardFooterModern = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center p-6 pt-0", className)}
    {...props}
  />
))
CardFooterModern.displayName = "CardFooterModern"

export { 
  CardModern, 
  CardHeaderModern, 
  CardTitleModern, 
  CardDescriptionModern, 
  CardContentModern, 
  CardFooterModern 
}