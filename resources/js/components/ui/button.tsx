import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-[1.5rem] text-white font-bold transition-transform transition-shadow duration-200 ease-in-out disabled:pointer-events-none disabled:opacity-50 outline-none focus-visible:ring-4 focus-visible:ring-purple-500/50 hover:scale-105 active:scale-95 hover:shadow-lg",
  {
    variants: {
      variant: {
        default: "bg-gradient-to-r from-[#9747FF] to-[#FF2E88] shadow-md",
        delete: "bg-gradient-to-r from-[#FF4B4B] to-[#D40000] shadow-md",
        confirm: "bg-gradient-to-r from-[#28C76F] to-[#12B76A] shadow-md",
        secondary: "bg-gradient-to-r from-[#9747FF] to-[#2F88FF] shadow-md",
        outlineGray: "border border-gray-300 text-black bg-transparent",
        outlinePurple: "border border-[#9747FF] text-black bg-transparent",
      },
      size: {
        default: "py-2 px-6 text-base",
        sm: "py-1.5 px-4 text-sm",
        lg: "py-3 px-8 text-lg",
        icon: "p-2",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);



function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  }) {
  const Comp = asChild ? Slot : "button";

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };
