import * as React from "react";
import * as RadioGroupPrimitive from "@radix-ui/react-radio-group";
import { CheckIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export const RadioGroup = React.forwardRef(({ className, value, onValueChange, children, ...props }, ref) => (
  <RadioGroupPrimitive.Root
    ref={ref}
    value={value}
    onValueChange={onValueChange}
    className={cn("flex gap-4", className)}
    {...props}
  >
    {children}
  </RadioGroupPrimitive.Root>
));



export const Radio = React.forwardRef(({ className, value, label, disabled, ...props }, ref) => (
  <label className="flex items-center gap-2 cursor-pointer select-none">
    <RadioGroupPrimitive.Item
      ref={ref}
      value={value}
      disabled={disabled}
      className={cn(
        "peer w-6 h-6 shrink-0 mb-1.5 rounded-full border border-gray-300 bg-white flex items-center justify-center transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50 disabled:pointer-events-none",
        "data-[state=checked]:bg-purple-500 data-[state=checked]:border-transparent",
        className
      )}
      {...props}
    >
      <RadioGroupPrimitive.Indicator className="flex items-center justify-center text-white">
        <CheckIcon className="w-4 h-4" />
      </RadioGroupPrimitive.Indicator>
    </RadioGroupPrimitive.Item>
    {label && <span className="text-[18px] font-medium">{label}</span>}
  </label>
));

