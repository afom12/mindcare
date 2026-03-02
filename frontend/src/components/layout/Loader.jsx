export default function Loader({ size = "md", fullScreen = false }) {
  const sizes = {
    sm: "w-5 h-5",
    md: "w-8 h-8",
    lg: "w-12 h-12"
  };

  const spinner = (
    <div
      className={`${sizes[size]} border-2 border-slate-200 border-t-slate-600 rounded-full animate-spin`}
    />
  );

  if (fullScreen) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        {spinner}
      </div>
    );
  }

  return spinner;
}
