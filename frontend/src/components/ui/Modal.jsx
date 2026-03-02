import { useEffect } from "react";
import { cn } from "../../utils/helpers";

export default function Modal({ open, onClose, title, children, className }) {
  useEffect(() => {
    if (open) document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <div
        className={cn(
          "relative bg-white rounded-2xl shadow-xl max-w-md w-full max-h-[90vh] overflow-auto",
          className
        )}
        onClick={(e) => e.stopPropagation()}>
        {title && (
          <div className="p-6 border-b border-slate-100">
            <h3 className="text-lg font-semibold text-slate-800">{title}</h3>
          </div>
        )}
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}
