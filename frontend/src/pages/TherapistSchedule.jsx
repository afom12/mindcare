import { useState, useEffect } from "react";
import AppLayout from "../components/layout/AppLayout";
import { therapistApi } from "../api/therapistApi";
import { Calendar, Loader2, Plus, Trash2, Clock, Save } from "lucide-react";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function TherapistSchedule() {
  const [availability, setAvailability] = useState([]);
  const [blockedSlots, setBlockedSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [blockModal, setBlockModal] = useState(false);
  const [blockForm, setBlockForm] = useState({ start: "", end: "", reason: "" });

  useEffect(() => {
    Promise.all([
      therapistApi.getAvailability().then(({ data }) => setAvailability(data.availability || [])),
      therapistApi.getBlockedSlots().then(({ data }) => setBlockedSlots(data.blockedSlots || []))
    ])
      .catch((err) => setError(err.response?.data?.message || "Failed to load"))
      .finally(() => setLoading(false));
  }, []);

  const addSlot = () => {
    setAvailability((prev) => [...prev, { dayOfWeek: 1, startTime: "09:00", endTime: "17:00" }]);
  };

  const updateSlot = (idx, field, value) => {
    setAvailability((prev) => {
      const next = [...prev];
      next[idx] = { ...next[idx], [field]: value };
      return next;
    });
  };

  const removeSlot = (idx) => {
    setAvailability((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSaveAvailability = async () => {
    setSaving(true);
    setError("");
    try {
      const { data } = await therapistApi.setAvailability(availability);
      setAvailability(data.availability || []);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const handleAddBlock = async (e) => {
    e.preventDefault();
    if (!blockForm.start || !blockForm.end) return;
    setSaving(true);
    setError("");
    try {
      await therapistApi.addBlockedSlot({
        start: new Date(blockForm.start).toISOString(),
        end: new Date(blockForm.end).toISOString(),
        reason: blockForm.reason
      });
      const { data } = await therapistApi.getBlockedSlots();
      setBlockedSlots(data.blockedSlots || []);
      setBlockModal(false);
      setBlockForm({ start: "", end: "", reason: "" });
    } catch (err) {
      setError(err.response?.data?.message || "Failed to add block");
    } finally {
      setSaving(false);
    }
  };

  const handleRemoveBlock = async (id) => {
    try {
      await therapistApi.deleteBlockedSlot(id);
      setBlockedSlots((prev) => prev.filter((b) => b._id !== id));
    } catch (err) {
      setError(err.response?.data?.message || "Failed to remove");
    }
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="flex-1 overflow-y-auto bg-slate-50 flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-10 h-10 text-slate-500 animate-spin" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="flex-1 overflow-y-auto bg-slate-50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-2xl font-medium text-slate-800 mb-2">Schedule and availability</h1>
          <p className="text-slate-500 mb-8">
            Set your recurring weekly hours. Clients can only book during these times.
          </p>

          {error && (
            <div className="mb-4 p-3 bg-rose-50 border border-rose-100 rounded-xl text-rose-600 text-sm">
              {error}
            </div>
          )}

          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 mb-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-slate-800 rounded-xl flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-lg font-medium text-slate-800">Recurring availability</h2>
              </div>
              <button
                onClick={addSlot}
                className="flex items-center gap-2 px-4 py-2 text-sm text-slate-600 hover:text-slate-800 border border-slate-200 rounded-xl hover:bg-slate-50"
              >
                <Plus className="w-4 h-4" />
                Add slot
              </button>
            </div>

            {availability.length === 0 ? (
              <p className="text-slate-500 text-sm py-4">
                No availability set. Add slots so clients can book sessions.
              </p>
            ) : (
              <div className="space-y-4">
                {availability.map((slot, idx) => (
                  <div key={idx} className="flex flex-wrap items-center gap-3 p-4 bg-slate-50 rounded-xl">
                    <select
                      value={slot.dayOfWeek}
                      onChange={(e) => updateSlot(idx, "dayOfWeek", parseInt(e.target.value, 10))}
                      className="px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white"
                    >
                      {DAYS.map((d, i) => (
                        <option key={i} value={i}>
                          {d}
                        </option>
                      ))}
                    </select>
                    <input
                      type="time"
                      value={slot.startTime}
                      onChange={(e) => updateSlot(idx, "startTime", e.target.value)}
                      className="px-3 py-2 border border-slate-200 rounded-lg text-sm"
                    />
                    <span className="text-slate-400">to</span>
                    <input
                      type="time"
                      value={slot.endTime}
                      onChange={(e) => updateSlot(idx, "endTime", e.target.value)}
                      className="px-3 py-2 border border-slate-200 rounded-lg text-sm"
                    />
                    <button
                      onClick={() => removeSlot(idx)}
                      className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <button
              onClick={handleSaveAvailability}
              disabled={saving}
              className="mt-6 flex items-center gap-2 px-4 py-2.5 bg-slate-800 text-white rounded-xl text-sm hover:bg-slate-700 disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {saving ? "Saving..." : "Save availability"}
            </button>
          </div>

          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
                  <Clock className="w-5 h-5 text-amber-600" />
                </div>
                <h2 className="text-lg font-medium text-slate-800">Blocked times</h2>
              </div>
              <button
                onClick={() => setBlockModal(true)}
                className="flex items-center gap-2 px-4 py-2 text-sm text-slate-600 hover:text-slate-800 border border-slate-200 rounded-xl hover:bg-slate-50"
              >
                <Plus className="w-4 h-4" />
                Block time
              </button>
            </div>

            {blockedSlots.length === 0 ? (
              <p className="text-slate-500 text-sm py-4">
                No blocked times. Add blocks for vacation, admin time, etc.
              </p>
            ) : (
              <div className="space-y-3">
                {blockedSlots.map((b) => (
                  <div key={b._id} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                    <div>
                      <p className="text-sm font-medium text-slate-800">
                        {new Date(b.start).toLocaleString()} to {new Date(b.end).toLocaleString()}
                      </p>
                      {b.reason && <p className="text-xs text-slate-500 mt-1">{b.reason}</p>}
                    </div>
                    <button
                      onClick={() => handleRemoveBlock(b._id)}
                      className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {blockModal && (
        <>
          <div
            className="fixed inset-0 bg-black/40 z-40"
            onClick={() => !saving && setBlockModal(false)}
          />
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
              <h3 className="text-lg font-medium text-slate-800 mb-4">Block time</h3>
              <form onSubmit={handleAddBlock} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Start</label>
                  <input
                    type="datetime-local"
                    required
                    value={blockForm.start}
                    onChange={(e) => setBlockForm((p) => ({ ...p, start: e.target.value }))}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">End</label>
                  <input
                    type="datetime-local"
                    required
                    value={blockForm.end}
                    onChange={(e) => setBlockForm((p) => ({ ...p, end: e.target.value }))}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Reason (optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Vacation, admin day"
                    value={blockForm.reason}
                    onChange={(e) => setBlockForm((p) => ({ ...p, reason: e.target.value }))}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm"
                  />
                </div>
                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => !saving && setBlockModal(false)}
                    className="flex-1 px-4 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-600 hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex-1 px-4 py-2.5 bg-slate-800 text-white rounded-xl text-sm hover:bg-slate-700 disabled:opacity-50"
                  >
                    {saving ? "Adding..." : "Add block"}
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
