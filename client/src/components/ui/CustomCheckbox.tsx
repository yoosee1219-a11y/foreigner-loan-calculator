import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface CustomCheckboxProps {
  checked: boolean;
  onChange: () => void;
  className?: string;
}

export function CustomCheckbox({ checked, onChange, className }: CustomCheckboxProps) {
  return (
    <button
      type="button"
      onClick={onChange}
      className={cn(
        "relative w-7 h-7 rounded-lg border-2 transition-all duration-300 flex items-center justify-center",
        "shadow-md hover:shadow-lg active:scale-95",
        checked
          ? "bg-gradient-to-br from-primary to-primary/80 border-primary text-primary-foreground scale-110 shadow-xl shadow-primary/30"
          : "bg-white/90 backdrop-blur-sm border-gray-300 hover:border-primary/60 hover:bg-primary/5",
        className
      )}
      aria-checked={checked}
      role="checkbox"
    >
      {checked && (
        <Check className="h-4 w-4 animate-in zoom-in-50 duration-300 stroke-[3]" />
      )}
      {!checked && (
        <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-primary/0 to-primary/0 hover:from-primary/10 hover:to-primary/5 transition-all duration-300" />
      )}
    </button>
  );
}

