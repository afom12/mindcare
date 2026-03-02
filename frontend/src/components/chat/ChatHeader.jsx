import { ShieldCheck } from "lucide-react";

export default function ChatHeader() {
  return (
    <div className="flex justify-between items-center w-full">
      <div>
        <h2 className="text-lg font-semibold">MindCare AI</h2>
        <p className="text-xs text-slate-500">
          Your conversations are private
        </p>
      </div>

      <div className="flex items-center gap-2 text-slate-600 text-sm">
        <ShieldCheck size={18} />
        Secure
      </div>
    </div>
  );
}
