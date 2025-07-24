import * as React from "react"
import { cn } from "../../lib/utils"
import { Search, X } from "lucide-react"

const InputModern = React.forwardRef(({ 
  className, 
  type = "text",
  icon: Icon,
  clearable = false,
  onClear,
  error,
  success,
  ...props 
}, ref) => {
  const [value, setValue] = React.useState(props.value || "")
  const [focused, setFocused] = React.useState(false)

  const handleClear = () => {
    setValue("")
    if (onClear) onClear()
    if (props.onChange) {
      const event = { target: { value: "" } }
      props.onChange(event)
    }
  }

  const baseClasses = "w-full px-4 py-3 rounded-xl bg-white dark:bg-gray-800 border-2 transition-all duration-300 outline-none"
  
  const borderClasses = error 
    ? "border-red-500 focus:border-red-600" 
    : success 
    ? "border-green-500 focus:border-green-600"
    : "border-gray-200 dark:border-gray-700 focus:border-purple-500 dark:focus:border-purple-400"
    
  const shadowClasses = focused 
    ? error 
      ? "shadow-lg shadow-red-500/20"
      : success
      ? "shadow-lg shadow-green-500/20"
      : "shadow-lg shadow-purple-500/20"
    : ""

  return (
    <div className="relative">
      {Icon && (
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400">
          <Icon className="w-5 h-5" />
        </div>
      )}
      
      <input
        ref={ref}
        type={type}
        value={value}
        onChange={(e) => {
          setValue(e.target.value)
          if (props.onChange) props.onChange(e)
        }}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        className={cn(
          baseClasses,
          borderClasses,
          shadowClasses,
          Icon && "pl-12",
          clearable && value && "pr-12",
          className
        )}
        {...props}
      />
      
      {clearable && value && (
        <button
          type="button"
          onClick={handleClear}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        >
          <X className="w-5 h-5" />
        </button>
      )}
      
      {error && (
        <p className="mt-2 text-sm text-red-600 dark:text-red-400">{error}</p>
      )}
      
      {success && (
        <p className="mt-2 text-sm text-green-600 dark:text-green-400">{success}</p>
      )}
    </div>
  )
})

InputModern.displayName = "InputModern"

const SearchInputModern = React.forwardRef(({ className, ...props }, ref) => (
  <InputModern
    ref={ref}
    icon={Search}
    clearable
    placeholder="Search..."
    className={cn("", className)}
    {...props}
  />
))

SearchInputModern.displayName = "SearchInputModern"

export { InputModern, SearchInputModern }