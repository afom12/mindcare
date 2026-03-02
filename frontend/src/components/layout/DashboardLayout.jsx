export default function DashboardLayout({ sidebar, header, children, input }) {
  return (
    <div className="flex h-screen bg-gray-100">
      <div className="w-72 bg-white shadow-md">
        {sidebar}
      </div>

      <div className="flex flex-col flex-1">
        <div className="h-16 bg-white shadow-sm flex items-center px-6">
          {header}
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {children}
        </div>

        <div className="bg-white border-t p-4">
          <div className="max-w-3xl mx-auto w-full">{input}</div>
        </div>
      </div>
    </div>
  );
}
