import React from "react";
import { cn } from "../../lib/utils";

// Simple select components
const Select = ({ children, defaultValue, value, onValueChange }) => {
  const [selectedValue, setSelectedValue] = React.useState(defaultValue || value);
  const [isOpen, setIsOpen] = React.useState(false);

  const handleValueChange = (newValue) => {
    setSelectedValue(newValue);
    setIsOpen(false);
    if (onValueChange) {
      onValueChange(newValue);
    }
  };

  return (
    <div className="relative">
      {React.Children.map(children, child => {
        if (child.type === SelectTrigger) {
          return React.cloneElement(child, { 
            isOpen, 
            setIsOpen, 
            selectedValue 
          });
        }
        if (child.type === SelectContent) {
          return React.cloneElement(child, { 
            isOpen, 
            selectedValue, 
            onValueChange: handleValueChange 
          });
        }
        return child;
      })}
    </div>
  );
};

const SelectTrigger = React.forwardRef(({ className, children, isOpen, setIsOpen, selectedValue, ...props }, ref) => {
  return (
    <button
      ref={ref}
      className={cn(
        "flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      onClick={() => setIsOpen(!isOpen)}
      {...props}
    >
      {children}
      <svg
        className={cn("h-4 w-4 opacity-50 transition-transform", isOpen && "rotate-180")}
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        viewBox="0 0 24 24"
      >
        <path d="m6 9 6 6 6-6" />
      </svg>
    </button>
  );
});
SelectTrigger.displayName = "SelectTrigger";

const SelectValue = ({ placeholder, children }) => {
  return <span>{children || placeholder}</span>;
};

const SelectContent = React.forwardRef(({ className, children, isOpen, selectedValue, onValueChange, ...props }, ref) => {
  if (!isOpen) return null;

  return (
    <div
      ref={ref}
      className={cn(
        "absolute z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md",
        "top-full mt-1 w-full",
        className
      )}
      {...props}
    >
      {React.Children.map(children, child => {
        if (child.type === SelectItem) {
          return React.cloneElement(child, { 
            selectedValue, 
            onValueChange 
          });
        }
        return child;
      })}
    </div>
  );
});
SelectContent.displayName = "SelectContent";

const SelectItem = React.forwardRef(({ className, children, value, selectedValue, onValueChange, ...props }, ref) => {
  const isSelected = selectedValue === value;

  return (
    <div
      ref={ref}
      className={cn(
        "relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none hover:bg-accent hover:text-accent-foreground",
        isSelected && "bg-accent text-accent-foreground",
        className
      )}
      onClick={() => onValueChange(value)}
      {...props}
    >
      {isSelected && (
        <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
          <svg
            className="h-4 w-4"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path d="m9 12 2 2 4-4" />
          </svg>
        </span>
      )}
      {children}
    </div>
  );
});
SelectItem.displayName = "SelectItem";

export {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
};
