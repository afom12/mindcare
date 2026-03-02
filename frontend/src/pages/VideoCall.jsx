import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import AppLayout from "../components/layout/AppLayout";
import { videoApi } from "../api/videoApi";
import { Loader2, Video, ArrowLeft } from "lucide-react";

export default function VideoCall() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const bookingId = searchParams.get("booking");
  const [url, setUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!bookingId) {
      setError("No booking specified");
      setLoading(false);
      return;
    }

    videoApi
      .createMeeting(bookingId)
      .then(({ data }) => {
        setUrl(data.url);
      })
      .catch((err) => {
        setError(err.response?.data?.message || "Failed to start video call");
      })
      .finally(() => setLoading(false));
  }, [bookingId]);

  if (loading) {
    return (
      <AppLayout>
        <div className="flex-1 flex items-center justify-center bg-slate-900 min-h-[calc(100vh-4rem)]">
          <div className="text-center">
            <Loader2 className="w-12 h-12 text-white animate-spin mx-auto mb-4" />
            <p className="text-slate-300">Starting video call...</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  if (error) {
    return (
      <AppLayout>
        <div className="flex-1 flex items-center justify-center bg-slate-50 min-h-[calc(100vh-4rem)]">
          <div className="bg-white rounded-2xl p-8 max-w-md text-center shadow-sm border border-slate-100">
            <Video className="w-16 h-16 text-rose-400 mx-auto mb-4" />
            <h2 className="text-lg font-medium text-slate-800 mb-2">Could not start call</h2>
            <p className="text-slate-600 text-sm mb-6">{error}</p>
            <button
              onClick={() => navigate("/bookings")}
              className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-white rounded-xl text-sm hover:bg-slate-700 mx-auto"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to bookings
            </button>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="flex-1 flex flex-col bg-slate-900 min-h-[calc(100vh-4rem)]">
        <div className="flex items-center justify-between p-4 bg-slate-800/50">
          <button
            onClick={() => navigate("/bookings")}
            className="flex items-center gap-2 text-slate-300 hover:text-white text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            Leave call
          </button>
          <span className="text-slate-400 text-sm">Video session</span>
        </div>
        <div className="flex-1 min-h-0">
          <iframe
            src={url}
            allow="camera; microphone; fullscreen; display-capture"
            className="w-full h-full min-h-[500px] border-0"
            title="Video call"
          />
        </div>
      </div>
    </AppLayout>
  );
}
