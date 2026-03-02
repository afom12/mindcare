import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import AppLayout from "../components/layout/AppLayout";
import { useAuth } from "../context/AuthContext";
import { bookingApi } from "../api/bookingApi";
import { Calendar, Loader2, ArrowRight, UserCheck, MessageSquare, Video, FileText } from "lucide-react";

const STATUS_LABELS = {
  pending: "Pending",
  confirmed: "Confirmed",
  cancelled: "Cancelled",
  completed: "Completed"
};

const STATUS_COLORS = {
  pending: "bg-amber-100 text-amber-800",
  confirmed: "bg-green-100 text-green-800",
  cancelled: "bg-slate-100 text-slate-600",
  completed: "bg-blue-100 text-blue-800"
};

export default function Bookings() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updating, setUpdating] = useState(null);
  const [notesModal, setNotesModal] = useState(null);

  const isTherapist = user?.role === "therapist";

  useEffect(() => {
    bookingApi
      .getMyBookings()
      .then(({ data }) => setBookings(data.bookings || []))
      .catch((err) => setError(err.response?.data?.message || "Failed to load bookings"))
      .finally(() => setLoading(false));
  }, []);

  const handleStatusUpdate = async (id, status) => {
    setUpdating(id);
    setError("");
    try {
      const { data } = await bookingApi.updateBookingStatus(id, status);
      setBookings((prev) =>
        prev.map((b) => (b._id === id ? data.booking : b))
      );
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update");
    } finally {
      setUpdating(null);
    }
  };

  const handleSaveNotes = async (id, notes) => {
    setUpdating(id);
    setError("");
    try {
      const { data } = await bookingApi.updateBookingNotes(id, notes);
      setBookings((prev) =>
        prev.map((b) => (b._id === id ? data.booking : b))
      );
      setNotesModal(null);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save notes");
    } finally {
      setUpdating(null);
    }
  };

  const upcoming = bookings.filter(
    (b) => b.status !== "cancelled" && new Date(b.scheduledAt) > new Date()
  );
  const past = bookings.filter(
    (b) => b.status === "cancelled" || new Date(b.scheduledAt) <= new Date()
  );

  return (
    <AppLayout>
      <div className="flex-1 overflow-y-auto bg-slate-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-2xl font-medium text-slate-800 mb-2">
            {isTherapist ? "My sessions" : "My bookings"}
          </h1>
          <p className="text-slate-500 mb-8">
            {isTherapist
              ? "View and manage your scheduled sessions"
              : "View your therapy session bookings"}
          </p>

          {!isTherapist && (
            <Link
              to="/therapists"
              className="inline-flex items-center gap-2 px-4 py-2 bg-slate-800 text-white rounded-xl text-sm hover:bg-slate-700 mb-6"
            >
              <UserCheck className="w-4 h-4" />
              Book a session
              <ArrowRight className="w-4 h-4" />
            </Link>
          )}

          {error && (
            <div className="mb-4 p-3 bg-rose-50 border border-rose-100 rounded-xl text-rose-600 text-sm">
              {error}
            </div>
          )}

          {loading ? (
            <div className="flex justify-center py-16">
              <Loader2 className="w-8 h-8 text-slate-400 animate-spin" />
            </div>
          ) : bookings.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 border border-slate-100 text-center">
              <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500">
                {isTherapist ? "No sessions scheduled" : "No bookings yet"}
              </p>
              {!isTherapist && (
                <Link
                  to="/therapists"
                  className="inline-block mt-4 text-slate-600 hover:text-slate-800 text-sm"
                >
                  Book your first session
                </Link>
              )}
            </div>
          ) : (
            <div className="space-y-6">
              {upcoming.length > 0 && (
                <div>
                  <h2 className="text-lg font-medium text-slate-800 mb-4">Upcoming</h2>
                  <div className="space-y-3">
                    {upcoming.map((b) => (
                      <BookingCard
                        key={b._id}
                        booking={b}
                        isTherapist={isTherapist}
                        onStatusUpdate={handleStatusUpdate}
                        onSaveNotes={handleSaveNotes}
                        updating={updating}
                        notesModal={notesModal}
                        setNotesModal={setNotesModal}
                      />
                    ))}
                  </div>
                </div>
              )}
              {past.length > 0 && (
                <div>
                  <h2 className="text-lg font-medium text-slate-800 mb-4">Past</h2>
                  <div className="space-y-3">
                    {past.map((b) => (
                      <BookingCard
                        key={b._id}
                        booking={b}
                        isTherapist={isTherapist}
                        onStatusUpdate={handleStatusUpdate}
                        onSaveNotes={handleSaveNotes}
                        updating={updating}
                        notesModal={notesModal}
                        setNotesModal={setNotesModal}
                        past
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}

function BookingCard({ booking, isTherapist, onStatusUpdate, onSaveNotes, updating, notesModal, setNotesModal, past }) {
  const other = isTherapist ? booking.userId : booking.therapistId;
  const therapistId = booking.therapistId?._id ?? booking.therapistId;
  const scheduled = new Date(booking.scheduledAt);

  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
      <div className="flex justify-between items-start gap-4">
        <div>
          <p className="font-medium text-slate-800">
            {isTherapist ? "Client" : "Therapist"}: {other?.name}
          </p>
          <p className="text-sm text-slate-500">{other?.email}</p>
          <p className="text-sm text-slate-600 mt-2">
            {scheduled.toLocaleDateString()} at {scheduled.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
          </p>
          <span
            className={`inline-block mt-2 text-xs px-2 py-0.5 rounded-full ${
              STATUS_COLORS[booking.status] || "bg-slate-100 text-slate-600"
            }`}
          >
            {STATUS_LABELS[booking.status]}
          </span>
        </div>
        {!past && booking.status === "pending" && (
          <div className="flex gap-2">
            {isTherapist && (
              <button
                onClick={() => onStatusUpdate(booking._id, "confirmed")}
                disabled={updating === booking._id}
                className="px-3 py-1.5 bg-green-100 text-green-800 rounded-lg text-sm hover:bg-green-200 disabled:opacity-50"
              >
                Confirm
              </button>
            )}
            {isTherapist && (
              <button
                onClick={() => onStatusUpdate(booking._id, "cancelled")}
                disabled={updating === booking._id}
                className="px-3 py-1.5 bg-slate-100 text-slate-600 rounded-lg text-sm hover:bg-slate-200 disabled:opacity-50"
              >
                Decline
              </button>
            )}
            {!isTherapist && (
              <button
                onClick={() => onStatusUpdate(booking._id, "cancelled")}
                disabled={updating === booking._id}
                className="px-3 py-1.5 bg-slate-100 text-slate-600 rounded-lg text-sm hover:bg-slate-200 disabled:opacity-50"
              >
                Cancel
              </button>
            )}
          </div>
        )}
        {!past && booking.status === "confirmed" && (
          <>
            {isTherapist && (
              <button
                onClick={() => onStatusUpdate(booking._id, "completed")}
                disabled={updating === booking._id}
                className="px-3 py-1.5 bg-blue-100 text-blue-800 rounded-lg text-sm hover:bg-blue-200 disabled:opacity-50"
              >
                Mark completed
              </button>
            )}
            <Link
              to={`/video?booking=${booking._id}`}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700"
            >
              <Video className="w-3.5 h-3.5" />
              Join session
            </Link>
          </>
        )}
        {isTherapist && past && booking.status === "completed" && (
          <button
            onClick={() => setNotesModal({ id: booking._id, notes: booking.notes || "" })}
            className="flex items-center gap-1.5 px-3 py-1.5 border border-amber-200 text-amber-700 rounded-lg text-sm hover:bg-amber-50"
          >
            <FileText className="w-3.5 h-3.5" />
            {booking.notes?.trim() ? "Edit notes" : "Add notes"}
          </button>
        )}
        {!isTherapist && therapistId && (
          <Link
            to={`/messages?therapist=${therapistId}`}
            className="flex items-center gap-1.5 px-3 py-1.5 border border-slate-200 text-slate-600 rounded-lg text-sm hover:bg-slate-50"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            Message
          </Link>
        )}
      </div>

      {notesModal?.id === booking._id && (
        <div className="mt-4 pt-4 border-t border-slate-100">
          <label className="block text-sm font-medium text-slate-700 mb-2">Session notes</label>
          <textarea
            defaultValue={notesModal.notes}
            rows={4}
            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-200"
            placeholder="Subjective, Objective, Assessment, Plan..."
            id={`notes-${booking._id}`}
          />
          <div className="flex gap-2 mt-2">
            <button
              onClick={() => {
                const notes = document.getElementById(`notes-${booking._id}`)?.value || "";
                onSaveNotes(booking._id, notes);
              }}
              disabled={updating === booking._id}
              className="px-3 py-1.5 bg-teal-600 text-white rounded-lg text-sm hover:bg-teal-700 disabled:opacity-50"
            >
              {updating === booking._id ? "Saving..." : "Save"}
            </button>
            <button
              onClick={() => setNotesModal(null)}
              className="px-3 py-1.5 bg-slate-100 text-slate-600 rounded-lg text-sm hover:bg-slate-200"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
