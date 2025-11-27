import * as React from "react";
import { cn } from "@/lib/utils";

const Textarea = React.forwardRef(({ className, label, error, required, ...props }, ref) => {
  return (
    <div className="w-full">
      {label && (
        <label className="block mb-2 text-[20px] font-semibold text-[#5d5d5d]">
          {label}
          {required && <span className="text-[#ff2e88]"> *</span>}
        </label>
      )}

      <textarea
        ref={ref}
        {...props}
        data-slot="textarea"
        className={cn(
          "flex w-full min-w-0 rounded-[20px] border-2 border-[#d9d9d9] bg-white px-5 py-4 text-[18px] shadow-xs placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground transition-[color,box-shadow] outline-none resize-none",
          "focus:border-transparent focus:ring-2 focus:ring-[#9747ff]",
          "disabled:pointer-events-none disabled:opacity-50 disabled:cursor-not-allowed",
          error && "border-red-500 focus:ring-red-500",
          className
        )}
      />

      {error && (
        <p className="mt-1 text-red-500 text-sm font-semibold">{error}</p>
      )}
    </div>
  );
});

Textarea.displayName = "Textarea";

export { Textarea };
