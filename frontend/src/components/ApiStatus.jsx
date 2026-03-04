import { useState, useEffect } from "react";

const API_URL = import.meta.env.VITE_API_URL || "/api";
const HEALTH_URL = API_URL.replace(/\/$/, "") + "/health";

export default function ApiStatus() {
  const [offline, setOffline] = useState(false);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetch(HEALTH_URL, { method: "GET" })
      .then((res) => {
        if (cancelled) return;
        setOffline(!res.ok);
      })
      .catch(() => {
        if (!cancelled) setOffline(true);
      })
      .finally(() => {
        if (!cancelled) setChecked(true);
      });
    return () => { cancelled = true; };
  }, []);

  if (!checked || !offline) return null;

  return (
    <div className="bg-amber-500 text-white px-4 py-2 text-center text-sm">
      <strong>Cannot reach server.</strong> Make sure the backend is running on port 5000.{" "}
      <code className="bg-amber-600/50 px-1 rounded">cd backend && npm run dev</code>
    </div>
  );
}
