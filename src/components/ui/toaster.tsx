
import { useToast } from "@/hooks/use-toast"
import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "@/components/ui/toast"

export function Toaster() {
  const { toasts } = useToast()

  return (
    <ToastProvider>
      {toasts.map(function ({ id, title, description, action, ...props }) {
        return (
          <Toast key={id} {...props} className="text-sm">
            <div className="grid gap-1">
              {title && <ToastTitle className="text-xs">{title}</ToastTitle>}
              {description && (
                <ToastDescription className="text-xs">{description}</ToastDescription>
              )}
            </div>
            {action}
            <ToastClose />
          </Toast>
        )
      })}
      <ToastViewport className="bottom-0 left-0 flex-col sm:top-auto sm:left-0 sm:right-auto sm:bottom-0 sm:flex-col" />
    </ToastProvider>
  )
}
