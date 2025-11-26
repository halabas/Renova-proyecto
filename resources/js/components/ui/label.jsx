import * as React from "react";
import * as LabelPrimitive from "@radix-ui/react-label";
import { cn } from "@/lib/utils";

const Label = React.forwardRef(
  ({ className, required, color = "#5d5d5d", children, ...props }, ref) => {
    return (
      <LabelPrimitive.Root
        ref={ref}
        data-slot="label"
        className={cn(
          "block text-[20px] font-['Helvetica_Now_Display:Bold',sans-serif] mb-2 select-none leading-none",
          `text-[${color}]`,
          className
        )}
        {...props}
      >
        {children}
        {required && <span className="text-[#ff2e88] ml-1">*</span>}
      </LabelPrimitive.Root>
    );
  }
);

Label.displayName = "Label";

export { Label };
