import * as React from "react"
import * as AlertPrimitive from "@radix-ui/react-alert-dialog"

import { cn } from "@/lib/utils"

const Alert = React.forwardRef<
  React.ElementRef<typeof AlertPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof AlertPrimitive.Root> & {
    variant?: "default" | "destructive"
  }
>(({ variant, ...props }, ref) => (
  <AlertPrimitive.Root {...props} />
))
Alert.displayName = "Alert"

const AlertTrigger = AlertPrimitive.Trigger

const AlertCancel = AlertPrimitive.Cancel

const AlertAction = AlertPrimitive.Action

const AlertTitle = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h2
    ref={ref}
    className={cn("mb-4 font-logo text-lg font-semibold leading-none tracking-tight", className)}
    {...props}
  />
))
AlertTitle.displayName = "AlertTitle"

const AlertDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("text-sm [&_p]:leading-relaxed", className)}
    {...props}
  />
))
AlertDescription.displayName = "AlertDescription"

export { Alert, AlertTrigger, AlertAction, AlertCancel, AlertTitle, AlertDescription }
