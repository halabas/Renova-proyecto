import * as React from "react";
import * as SelectPrimitive from "@radix-ui/react-select";
import { CheckIcon, ChevronDownIcon, ChevronUpIcon } from "lucide-react";
import { cn } from "@/lib/utils";

function Select(props) {
  return <SelectPrimitive.Root data-slot="select" {...props} />;
}

function SelectGroup(props) {
  return <SelectPrimitive.Group data-slot="select-group" {...props} />;
}

function SelectValue(props) {
  return <SelectPrimitive.Value data-slot="select-value" {...props} />;
}

function SelectTrigger({ className, children, ...props }) {
  return (
    <SelectPrimitive.Trigger
      data-slot="select-trigger"
      className={cn(
        "flex w-full items-center justify-between rounded-[20px] border-2 border-[#d9d9d9] bg-white px-5 py-4 text-[18px] shadow-xs transition-colors outline-none focus:border-transparent focus:ring-2 focus:ring-[#9747ff] disabled:opacity-50 disabled:pointer-events-none",
        className
      )}
      {...props}
    >
      {children}
      <SelectPrimitive.Icon asChild>
        <ChevronDownIcon className="w-5 h-5 text-gray-400" />
      </SelectPrimitive.Icon>
    </SelectPrimitive.Trigger>
  );
}

function SelectContent({ className, children, position = "popper", ...props }) {
  return (
    <SelectPrimitive.Portal>
      <SelectPrimitive.Content
        data-slot="select-content"
        className={cn(
          "bg-white text-black rounded-[20px] border border-[#d9d9d9] shadow-md overflow-hidden max-h-60 min-w-[200px] w-auto",
          className
        )}
        position={position}
        {...props}
      >
        <SelectScrollUpButton />
        <SelectPrimitive.Viewport className="p-2">{children}</SelectPrimitive.Viewport>
        <SelectScrollDownButton />
      </SelectPrimitive.Content>
    </SelectPrimitive.Portal>
  );
}


function SelectLabel({ className, ...props }) {
  return (
    <SelectPrimitive.Label
      data-slot="select-label"
      className={cn("block text-[20px] font-semibold mb-2 text-[#5d5d5d]", className)}
      {...props}
    />
  );
}

function SelectItem({ className, children, ...props }) {
  return (
    <SelectPrimitive.Item
      data-slot="select-item"
      className={cn(
        "relative flex w-full cursor-default items-center gap-2 rounded-[15px] px-4 py-3 text-[18px] select-none outline-none focus:bg-linear-to-r focus:from-[#9747ff]/20 focus:to-[#ff2e88]/20 data-disabled:opacity-50 data-disabled:pointer-events-none",
        className
      )}
      {...props}
    >
      <span className="absolute right-3 flex items-center justify-center">
        <SelectPrimitive.ItemIndicator>
          <CheckIcon className="w-5 h-5 text-[#9747ff]" />
        </SelectPrimitive.ItemIndicator>
      </span>
      <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
    </SelectPrimitive.Item>
  );
}

function SelectSeparator({ className, ...props }) {
  return <SelectPrimitive.Separator data-slot="select-separator" className={cn("h-px bg-gray-200 my-1", className)} {...props} />;
}

function SelectScrollUpButton({ className, ...props }) {
  return (
    <SelectPrimitive.ScrollUpButton
      data-slot="select-scroll-up-button"
      className={cn("flex items-center justify-center py-1", className)}
      {...props}
    >
      <ChevronUpIcon className="w-5 h-5" />
    </SelectPrimitive.ScrollUpButton>
  );
}

function SelectScrollDownButton({ className, ...props }) {
  return (
    <SelectPrimitive.ScrollDownButton
      data-slot="select-scroll-down-button"
      className={cn("flex items-center justify-center py-1", className)}
      {...props}
    >
      <ChevronDownIcon className="w-5 h-5" />
    </SelectPrimitive.ScrollDownButton>
  );
}

export {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectScrollDownButton,
  SelectScrollUpButton,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
};
