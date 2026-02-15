"use client"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { ReactNode } from "react"

interface ConfirmDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title?: string
  message?: string
  positiveLabel?: string
  negativeLabel?: string
  onConfirm: () => void | Promise<void>
  loading?: boolean
   children?: ReactNode
   hideButtons?: boolean
}

export default function ConfirmDialog({
  open,
  onOpenChange,
  title = "Alert",
  message = "Do you really want to continue with this action?",
  positiveLabel = "Yes",
  negativeLabel = "No",
  onConfirm,
  loading = false,
  children,
  hideButtons=false
}: ConfirmDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{message}</AlertDialogDescription>
        </AlertDialogHeader>

        {children}
       

        <AlertDialogFooter hidden={hideButtons} >
          <AlertDialogCancel disabled={loading}>
            {negativeLabel}
          </AlertDialogCancel>

          <AlertDialogAction
            disabled={loading}
            onClick={async () => {
              await onConfirm()
              onOpenChange(false)
            }}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            {loading ? "Processing..." : positiveLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
