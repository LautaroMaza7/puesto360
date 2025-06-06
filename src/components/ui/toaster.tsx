"use client"

import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
  type ToastProps,
} from "./toast"
import { useToast } from "./use-toast"
import { motion, AnimatePresence } from "framer-motion"
import { CheckCircle, XCircle, Info, ShoppingCart } from "lucide-react"
import { useRouter } from "next/navigation"

type ToastVariant = NonNullable<ToastProps["variant"]>

const icons = {
  default: Info,
  success: CheckCircle,
  destructive: XCircle,
  cart: ShoppingCart,
} as const

export function Toaster() {
  const { toasts } = useToast()
  const router = useRouter()

  const handleToastClick = (variant?: ToastVariant) => {
    if (variant === 'cart') {
      router.push('/cart')
    }
  }

  return (
    <ToastProvider>
      <AnimatePresence>
        {toasts.map(({ id, title, description, action, variant = "default", ...props }) => {
          const Icon = icons[variant as keyof typeof icons] || icons.default
          return (
            <motion.div
              key={id}
              initial={{ opacity: 0, y: 50, scale: 0.3 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.2 } }}
              transition={{
                type: "spring",
                stiffness: 500,
                damping: 30
              }}
              onClick={() => handleToastClick(variant as ToastVariant)}
              className={variant === 'cart' ? 'cursor-pointer' : ''}
            >
              <Toast variant={variant} {...props}>
                <div className="grid gap-1">
                  {title && (
                    <ToastTitle className="flex items-center gap-2">
                      <Icon className="h-4 w-4" />
                      {title}
                    </ToastTitle>
                  )}
                  {description && (
                    <ToastDescription>{description}</ToastDescription>
                  )}
                </div>
                {action}
                <ToastClose />
              </Toast>
            </motion.div>
          )
        })}
      </AnimatePresence>
      <ToastViewport />
    </ToastProvider>
  )
} 