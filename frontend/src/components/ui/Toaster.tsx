import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react'

export interface Toast {
  id: string
  type: 'success' | 'error' | 'info'
  title: string
  message?: string
}

let toastId = 0
const toastListeners: Set<(toasts: Toast[]) => void> = new Set()
let toasts: Toast[] = []

export function toast(options: Omit<Toast, 'id'>) {
  const id = String(++toastId)
  const newToast = { ...options, id }
  toasts = [...toasts, newToast]
  toastListeners.forEach(listener => listener(toasts))
  
  // Auto dismiss after 5 seconds
  setTimeout(() => {
    dismissToast(id)
  }, 5000)
  
  return id
}

export function dismissToast(id: string) {
  toasts = toasts.filter(t => t.id !== id)
  toastListeners.forEach(listener => listener(toasts))
}

export function Toaster() {
  const [currentToasts, setCurrentToasts] = useState<Toast[]>([])
  
  useEffect(() => {
    const listener = (toasts: Toast[]) => setCurrentToasts([...toasts])
    toastListeners.add(listener)
    return () => {
      toastListeners.delete(listener)
    }
  }, [])

  const icons = {
    success: <CheckCircle className="w-5 h-5 text-green-400" />,
    error: <AlertCircle className="w-5 h-5 text-red-400" />,
    info: <Info className="w-5 h-5 text-blue-400" />,
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
      <AnimatePresence mode="popLayout">
        {currentToasts.map((t) => (
          <motion.div
            key={t.id}
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, x: 100, scale: 0.9 }}
            className="glass rounded-lg p-4 pr-10 min-w-[300px] max-w-[400px] relative"
          >
            <button
              onClick={() => dismissToast(t.id)}
              className="absolute top-3 right-3 text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
            <div className="flex items-start gap-3">
              {icons[t.type]}
              <div>
                <p className="font-medium">{t.title}</p>
                {t.message && (
                  <p className="text-sm text-muted-foreground mt-1">{t.message}</p>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}

