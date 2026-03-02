import { useState, useEffect } from "react";
import AppLayout from "../components/layout/AppLayout";
import { bookingApi } from "../api/bookingApi";
import { Link } from "react-router-dom";
import { UserCheck, Loader2, Calendar, MessageSquare } from "lucide-react";

export default function Therapists() {
  const [therapists, setTherapists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [bookingModal, setBookingModal] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [slotsLoading, setSlotsLoading] = useState(false);

  useEffect(() => {
    bookingApi
      .getTherapists()
      .then(({ data }) => setTherapists(data.therapists || []))
      .catch((err) => setError(err.response?.data?.message || "Failed to load therapists"))
      .finally(() => setLoading(false));
  }, []);

  const handleBook = (therapist) => {
    setBookingModal({ therapist });
    setAvailableSlots([]);
  };

  const handleDateChange = (date) => {
    if (!bookingModal?.therapist || !date) {
      setAvailableSlots([]);
      return;
    }
    setSlotsLoading(true);
    bookingApi
      .getAvailableSlots(bookingModal.therapist._id, date)
      .then(({ data }) => setAvailableSlots(data.slots || []))
      .catch(() => setAvailableSlots([]))
      .finally(() => setSlotsLoading(false));
  };

  const handleSubmitBooking = async (e) => {
    e.preventDefault();
    if (!bookingModal) return;
    const form = e.target;
    const date = form.date?.value;
    const timeSlot = form.timeSlot?.value;
    const notes = form.notes?.value || "";

    let scheduledAt;
    if (timeSlot) {
      scheduledAt = new Date(timeSlot);
    } else if (date) {
      const time = form.time?.value || "09:00";
      scheduledAt = new Date(`${date}T${time}`);
    } else {
      setError("Please select date and time");
      return;
    }

    if (scheduledAt <= new Date()) {
      setError("Please select a future date and time");
      return;
    }

    setSubmitting(true);
    setError("");
    try {
      await bookingApi.createBooking({
        therapistId: bookingModal.therapist._id,
        scheduledAt: scheduledAt.toISOString(),
        durationMinutes: 50,
        notes
      });
      setBookingModal(null);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create booking");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AppLayout>
      <div className="flex-1 overflow-y-auto bg-slate-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-2xl font-medium text-slate-800 mb-2">Book a therapy session</h1>
          <p className="text-slate-500 mb-8">Choose a verified therapist and schedule a session</p>

          {error && (
            <div className="mb-4 p-3 bg-rose-50 border border-rose-100 rounded-xl text-rose-600 text-sm">
              {error}
            </div>
          )}

          {loading ? (
            <div className="flex justify-center py-16">
              <Loader2 className="w-8 h-8 text-slate-400 animate-spin" />
            </div>
          ) : therapists.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 border border-slate-100 text-center">
              <UserCheck className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500">No verified therapists available at the moment</p>
            </div>
          ) : (
            <div className="space-y-4">
              {therapists.map((t) => (
                <div
                  key={t._id}
                  className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm flex justify-between items-center"
                >
                  <div>
                    <p className="font-medium text-slate-800">{t.name}</p>
                    <p className="text-sm text-slate-500">{t.email}</p>
                    {t.license && (
                      <p className="text-xs text-slate-400 mt-1">License: {t.license}</p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Link
                      to={`/messages?therapist=${t._id}`}
                      className="flex items-center gap-2 px-4 py-2 border border-slate-200 text-slate-700 rounded-xl text-sm hover:bg-slate-50"
                    >
                      <MessageSquare className="w-4 h-4" />
                      Message
                    </Link>
                    <button
                      onClick={() => handleBook(t)}
                      className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-white rounded-xl text-sm hover:bg-slate-700"
                    >
                      <Calendar className="w-4 h-4" />
                      Book session
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {bookingModal && (
        <>
          <div
            className="fixed inset-0 bg-black/40 z-40"
            onClick={() => !submitting && setBookingModal(null)}
          />
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
              <h3 className="text-lg font-medium text-slate-800 mb-2">
                Book session with {bookingModal.therapist.name}
              </h3>
              <form onSubmit={handleSubmitBooking} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Date</label>
                  <input
                    type="date"
                    name="date"
                    required
                    min={new Date().toISOString().slice(0, 10)}
                    onChange={(e) => handleDateChange(e.target.value)}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm"
                  />
                </div>
                {availableSlots.length > 0 ? (
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Available times
                    </label>
                    <select
                      name="timeSlot"
                      required
                      className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm"
                    >
                      <option value="">Select a time</option>
                      {availableSlots.map((slot) => (
                        <option key={slot.start} value={slot.start}>
                          {slot.time}
                        </option>
                      ))}
                    </select>
                  </div>
                ) : slotsLoading ? (
                  <p className="text-sm text-slate-500">Loading available times...</p>
                ) : (
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Time</label>
                    <input
                      type="time"
                      name="time"
                      required
                      className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm"
                    />
                    {availableSlots.length === 0 && !slotsLoading && (
                      <p className="text-xs text-slate-500 mt-1">
                        Select a date to see available times, or pick any time if none are set.
                      </p>
                    )}
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Notes (optional)
                  </label>
                  <textarea
                    name="notes"
                    rows={2}
                    placeholder="Any preferences or topics to discuss..."
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm resize-none"
                  />
                </div>
                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => !submitting && setBookingModal(null)}
                    className="flex-1 px-4 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-600 hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 px-4 py-2.5 bg-slate-800 text-white rounded-xl text-sm hover:bg-slate-700 disabled:opacity-50"
                  >
                    {submitting ? "Booking..." : "Request booking"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </>
      )}
    </AppLayout>
  );
}
