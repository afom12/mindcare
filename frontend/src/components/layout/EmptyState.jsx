export default function EmptyState({ icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      {icon && <span className="text-5xl mb-4">{icon}</span>}
      <h3 className="text-lg font-semibold text-slate-800 mb-2">{title}</h3>
      {description && (
        <p className="text-slate-500 text-sm max-w-sm mb-6">{description}</p>
      )}
      {action}
    </div>
  );
}
