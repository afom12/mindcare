import { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import AppLayout from "../components/layout/AppLayout";
import { bookingApi } from "../api/bookingApi";
import { UserCheck, Loader2, Calendar, MessageSquare, ArrowLeft, Shield } from "lucide-react";

export default function TherapistProfile() {
  const { id } = useParams();
  const [therapist, setTherapist] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    bookingApi
      .getTherapistProfile(id)
      .then(({ data }) => setTherapist(data.therapist))
      .catch(() => setTherapist(null))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <AppLayout>
        <div className="flex-1 overflow-y-auto bg-slate-50 flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-10 h-10 text-slate-500 animate-spin" />
        </div>
      </AppLayout>
    );
  }

  if (!therapist) {
    return (
      <AppLayout>
        <div className="flex-1 overflow-y-auto bg-slate-50 flex flex-col items-center justify-center min-h-[60vh]">
          <p className="text-slate-500">Therapist not found</p>
          <Link to="/therapists" className="mt-4 text-slate-600 hover:text-slate-800 text-sm">
            ← Back to therapists
          </Link>
        </div>
      </AppLayout>
    );
  }

  const initials = therapist.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2);

  return (
    <AppLayout>
      <div className="flex-1 overflow-y-auto bg-slate-50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Link
            to="/therapists"
            className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-800 text-sm mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to therapists
          </Link>

          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="p-6 sm:p-8">
              <div className="flex flex-col sm:flex-row gap-6">
                <div className="flex-shrink-0">
                  {therapist.profilePhotoUrl ? (
                    <img
                      src={therapist.profilePhotoUrl}
                      alt={therapist.name}
                      className="w-24 h-24 rounded-2xl object-cover"
                    />
                  ) : (
                    <div className="w-24 h-24 bg-slate-200 rounded-2xl flex items-center justify-center">
                      <span className="text-2xl font-medium text-slate-500">{initials}</span>
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h1 className="text-2xl font-medium text-slate-800">{therapist.name}</h1>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                      <Shield className="w-3 h-3" />
                      Verified
                    </span>
                  </div>
                  {therapist.licenseType && (
                    <p className="text-slate-500 text-sm">
                      {therapist.licenseType}
                      {therapist.license && ` • ${therapist.license}`}
                    </p>
                  )}
                  {therapist.specialties?.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-3">
                      {therapist.specialties.map((s, i) => (
                        <span
                          key={i}
                          className="px-2.5 py-1 bg-slate-100 text-slate-600 rounded-lg text-xs"
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {therapist.bio && (
                <div className="mt-6 pt-6 border-t border-slate-100">
                  <h2 className="text-sm font-medium text-slate-500 uppercase tracking-wider mb-2">
                    About
                  </h2>
                  <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">{therapist.bio}</p>
                </div>
              )}

              {therapist.approach && (
                <div className="mt-6 pt-6 border-t border-slate-100">
                  <h2 className="text-sm font-medium text-slate-500 uppercase tracking-wider mb-2">
                    Therapeutic approach
                  </h2>
                  <p className="text-slate-700 leading-relaxed">{therapist.approach}</p>
                </div>
              )}

              <div className="flex flex-wrap gap-3 mt-8 pt-6 border-t border-slate-100">
                <Link
                  to={`/therapists?book=${therapist._id}`}
                  className="flex items-center gap-2 px-5 py-2.5 bg-slate-800 text-white rounded-xl text-sm font-medium hover:bg-slate-700"
                >
                  <Calendar className="w-4 h-4" />
                  Book session
                </Link>
                <Link
                  to={`/messages?therapist=${therapist._id}`}
                  className="flex items-center gap-2 px-5 py-2.5 border border-slate-200 text-slate-700 rounded-xl text-sm hover:bg-slate-50"
                >
                  <MessageSquare className="w-4 h-4" />
                  Message
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
