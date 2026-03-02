import { cn } from "../../utils/helpers";

export default function Button({
  children,
  variant = "primary",
  size = "md",
  className,
  disabled,
  ...props
}) {
  const variants = {
    primary: "bg-slate-800 hover:bg-slate-700 text-white shadow-sm",
    secondary: "bg-slate-100 hover:bg-slate-200 text-slate-800",
    ghost: "hover:bg-slate-100 text-slate-700",
    danger: "bg-rose-600 hover:bg-rose-700 text-white"
  };

  const sizes = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2.5 text-sm font-medium",
    lg: "px-6 py-3 text-base font-medium"
  };

  return (
    <button
      className={cn(
        "rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed",
        variants[variant],
        sizes[size],
        className
      )}
      disabled={disabled}
      {...props}>
      {children}
    </button>
  );
}
