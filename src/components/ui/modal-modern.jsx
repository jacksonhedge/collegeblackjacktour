import * as React from "react"
import { cn } from "../../lib/utils"
import { X, AlertCircle, CheckCircle, AlertTriangle, Info } from "lucide-react"
import { ButtonModern } from "./button-modern"

const ModalModern = ({ 
  isOpen, 
  onClose, 
  children, 
  className,
  size = "md",
  animate = true
}) => {
  React.useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  if (!isOpen) return null

  const sizeClasses = {
    sm: "max-w-md",
    md: "max-w-lg",
    lg: "max-w-2xl",
    xl: "max-w-4xl",
    full: "max-w-7xl"
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className={cn(
          "fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300",
          animate ? "animate-in fade-in-0" : ""
        )}
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative min-h-screen flex items-center justify-center p-4">
        <div
          className={cn(
            "relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full",
            sizeClasses[size],
            animate ? "animate-in zoom-in-95 slide-in-from-bottom-10 duration-300" : "",
            className
          )}
        >
          {children}
        </div>
      </div>
    </div>
  )
}

const ModalHeader = ({ children, onClose, className }) => (
  <div className={cn("flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700", className)}>
    <div className="flex-1">{children}</div>
    {onClose && (
      <button
        onClick={onClose}
        className="ml-4 p-2 rounded-lg text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
      >
        <X className="w-5 h-5" />
      </button>
    )}
  </div>
)

const ModalTitle = ({ children, className }) => (
  <h3 className={cn("text-2xl font-bold text-gray-900 dark:text-white", className)}>
    {children}
  </h3>
)

const ModalDescription = ({ children, className }) => (
  <p className={cn("mt-2 text-gray-600 dark:text-gray-400", className)}>
    {children}
  </p>
)

const ModalBody = ({ children, className }) => (
  <div className={cn("p-6", className)}>
    {children}
  </div>
)

const ModalFooter = ({ children, className }) => (
  <div className={cn("flex items-center justify-end gap-3 p-6 border-t border-gray-200 dark:border-gray-700", className)}>
    {children}
  </div>
)

// Alert Modal Component
const AlertModal = ({ 
  isOpen, 
  onClose, 
  onConfirm,
  title, 
  description,
  type = "info",
  confirmText = "Confirm",
  cancelText = "Cancel",
  loading = false
}) => {
  const icons = {
    info: { icon: Info, color: "text-blue-600", bg: "bg-blue-100 dark:bg-blue-900/30" },
    success: { icon: CheckCircle, color: "text-green-600", bg: "bg-green-100 dark:bg-green-900/30" },
    warning: { icon: AlertTriangle, color: "text-yellow-600", bg: "bg-yellow-100 dark:bg-yellow-900/30" },
    error: { icon: AlertCircle, color: "text-red-600", bg: "bg-red-100 dark:bg-red-900/30" }
  }

  const { icon: Icon, color, bg } = icons[type]

  return (
    <ModalModern isOpen={isOpen} onClose={onClose} size="sm">
      <div className="p-6">
        <div className="flex items-start gap-4">
          <div className={cn("p-3 rounded-full", bg)}>
            <Icon className={cn("w-6 h-6", color)} />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {title}
            </h3>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              {description}
            </p>
          </div>
        </div>
      </div>
      
      <ModalFooter>
        <ButtonModern variant="ghost" onClick={onClose} disabled={loading}>
          {cancelText}
        </ButtonModern>
        <ButtonModern 
          variant={type === "error" ? "danger" : "default"} 
          onClick={onConfirm}
          loading={loading}
        >
          {confirmText}
        </ButtonModern>
      </ModalFooter>
    </ModalModern>
  )
}

export { 
  ModalModern, 
  ModalHeader, 
  ModalTitle, 
  ModalDescription, 
  ModalBody, 
  ModalFooter,
  AlertModal 
}