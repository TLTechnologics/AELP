import { Button as ButtonPrimitive } from "@base-ui/react/button"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex shrink-0 items-center justify-center rounded-full border border-transparent bg-clip-padding text-sm font-bold uppercase tracking-wider transition-all outline-none select-none focus-visible:border-brand-yellow focus-visible:ring-2 focus-visible:ring-brand-yellow/20 active:scale-95 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-5 gap-2 shadow-sm",
  {
    variants: {
      variant: {
        primary: "bg-brand-dark text-white hover:bg-brand-dark/90 shadow-md",
        secondary: "bg-brand-yellow text-brand-dark hover:scale-105 shadow-md",
        ghost: "bg-transparent text-brand-dark hover:bg-muted shadow-none",
        destructive: "bg-red-500 text-white hover:bg-red-600 shadow-md",
        outline: "border-border bg-white text-brand-dark hover:bg-muted shadow-sm",
        default: "bg-brand-dark text-white hover:bg-brand-dark/90 shadow-md",
      },
      size: {
        default: "px-4 py-3 sm:px-5 sm:py-3.5",
        sm: "px-3 py-2 text-xs",
        lg: "px-6 py-4 sm:px-8 sm:py-4 text-base",
        icon: "w-12 h-12 rounded-full p-0 flex items-center justify-center",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "default",
  size = "default",
  ...props
}: ButtonPrimitive.Props & VariantProps<typeof buttonVariants>) {
  return (
    <ButtonPrimitive
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }

