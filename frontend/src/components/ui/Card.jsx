import { cn } from "../../utils/helpers";

export default function Card({ children, className, ...props }) {
  return (
    <div
      className={cn(
        "bg-white rounded-2xl border border-slate-100 shadow-sm",
        className
      )}
      {...props}>
      {children}
    </div>
  );
}
