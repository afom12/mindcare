export default function TypingIndicator() {
  return (
    <div className="flex justify-start">
      <div className="bg-white shadow px-4 py-2 rounded-lg flex gap-1">
        <span className="animate-bounce">.</span>
        <span className="animate-bounce" style={{ animationDelay: "100ms" }}>.</span>
        <span className="animate-bounce" style={{ animationDelay: "200ms" }}>.</span>
      </div>
    </div>
  );
}
