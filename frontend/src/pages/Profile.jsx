import { useAuth } from "../context/AuthContext";
import AppLayout from "../components/layout/AppLayout";
import Card from "../components/ui/Card";
import { User, Mail, Shield, Calendar, Edit2 } from "lucide-react";
import { Link } from "react-router-dom";

export default function Profile() {
  const { user } = useAuth();

  return (
    <AppLayout>
      <div className="flex-1 overflow-y-auto p-8">
        <div className="max-w-2xl mx-auto">
          {/* Header with edit button */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl font-semibold text-slate-800">Profile</h1>
              <p className="text-slate-500 text-sm mt-1">Your account information</p>
            </div>
            <Link
              to="/profile/edit"
              className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors text-sm"
            >
              <Edit2 size={14} />
              Edit profile
            </Link>
          </div>

          {/* Profile Card */}
          <Card className="border border-slate-100 overflow-hidden">
            {/* Simple header accent */}
            <div className="h-2 bg-gradient-to-r from-slate-600 to-slate-800" />
            
            <div className="p-8">
              {/* Avatar placeholder */}
              <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-6">
                <span className="text-2xl text-slate-600 font-medium">
                  {user?.name?.charAt(0) || "U"}
                </span>
              </div>

              {/* Info grid */}
              <div className="space-y-5">
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <User className="w-4 h-4 text-slate-600" />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-400 uppercase tracking-wider mb-1">
                      Full name
                    </label>
                    <p className="text-slate-800">{user?.name || "Not set"}</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Mail className="w-4 h-4 text-slate-600" />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-400 uppercase tracking-wider mb-1">
                      Email address
                    </label>
                    <p className="text-slate-800">{user?.email || "Not set"}</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Shield className="w-4 h-4 text-slate-600" />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-400 uppercase tracking-wider mb-1">
                      Account type
                    </label>
                    <p className="text-slate-800 capitalize">{user?.role || "user"}</p>
                    {user?.role === "therapist" && user?.therapistVerification === "rejected" && user?.rejectionReason && (
                      <p className="text-sm text-rose-600 mt-2 bg-rose-50 px-3 py-2 rounded-lg">
                        Application note: {user.rejectionReason}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Calendar className="w-4 h-4 text-slate-600" />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-400 uppercase tracking-wider mb-1">
                      Member since
                    </label>
                    <p className="text-slate-800">
                      {user?.createdAt
                        ? new Date(user.createdAt).toLocaleDateString("en-US", {
                            month: "long",
                            year: "numeric"
                          })
                        : "—"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Footer Note */}
          <p className="text-xs text-slate-400 mt-8 text-center">
            MindCare AI is not a replacement for professional help.
          </p>
        </div>
      </div>
    </AppLayout>
  );
}