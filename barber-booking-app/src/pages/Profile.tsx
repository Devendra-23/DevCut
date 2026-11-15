import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { useAuth } from "../contexts/AuthContext";

export default function Profile() {
  const { user } = useAuth();
  const [displayName, setDisplayName] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  const [stats, setStats] = useState({
    totalBookings: 0,
    cancelled: 0,
    favoriteBarber: "None yet",
  });

  useEffect(() => {
    if (!user) return;

    // Load existing name from Supabase auth metadata
    setDisplayName(user.user_metadata?.full_name || "");

    async function fetchStats() {
      const { data, error } = await supabase
        .from("bookings")
        .select("status, barber_name")
        .eq("user_id", user.id);

      if (error) {
        console.error("Error fetching stats:", error.message);
      } else if (data) {
        const active = data.filter(
          (b) => b.status !== "cancelled" && b.status !== "cancelled_by_barber"
        );
        const cancelled = data.length - active.length;

        // Calculate favorite barber by frequency
        const barberCounts = active.reduce((acc, curr) => {
          acc[curr.barber_name] = (acc[curr.barber_name] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);

        let favBarber = "None yet";
        let maxCount = 0;
        for (const [barber, count] of Object.entries(barberCounts)) {
          if (count > maxCount) {
            maxCount = count;
            favBarber = barber;
          }
        }

        setStats({
          totalBookings: active.length,
          cancelled,
          favoriteBarber: favBarber,
        });
      }
      setLoading(false);
    }

    fetchStats();
  }, [user]);

  const handleUpdateProfile = async () => {
    if (!displayName.trim()) return;
    setIsSaving(true);

    try {
      const { error } = await supabase.auth.updateUser({
        data: { full_name: displayName },
      });

      if (error) throw error;
      alert("Profile successfully updated!");
    } catch (err: any) {
      alert("Failed to update profile: " + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  if (!user) {
    return (
      <div className="pt-24 text-center text-saffron-cherry font-bold">
        Please{" "}
        <Link to="/auth" className="text-rose-red hover:underline">
          log in
        </Link>{" "}
        to view your profile.
      </div>
    );
  }

  return (
    <div className="pt-12 pb-24 text-saffron-cherry">
      <div className="max-w-4xl mx-auto px-6">
        <div className="mb-12">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-3 text-saffron-cherry drop-shadow-sm">
            My Profile
          </h1>
          <p className="text-saffron-cherry/80 text-lg font-semibold">
            Manage your personal details and view your booking stats.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Left Column: Edit Details */}
          <div className="md:col-span-2 space-y-6">
            <div className="p-8 rounded-2xl backdrop-blur-xl bg-white/60 border border-white/80 shadow-glass-panel">
              <h2 className="text-2xl font-bold mb-6 text-saffron-cherry">
                Account Details
              </h2>

              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-extrabold text-saffron-cherry/70 mb-2 uppercase tracking-wide">
                    Email Address
                  </label>
                  <input
                    type="email"
                    disabled
                    value={user.email || ""}
                    className="w-full px-4 py-3 rounded-xl bg-white/40 border border-white/50 text-saffron-cherry/60 font-semibold cursor-not-allowed"
                  />
                </div>

                <div>
                  <label className="block text-sm font-extrabold text-saffron-cherry/70 mb-2 uppercase tracking-wide">
                    Display Name
                  </label>
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="Enter your name"
                    className="w-full px-4 py-3 rounded-xl bg-white/70 border border-white/80 text-saffron-cherry font-bold focus:outline-none focus:ring-2 focus:ring-rose-red/50 transition-all shadow-sm"
                  />
                </div>

                <button
                  onClick={handleUpdateProfile}
                  disabled={isSaving}
                  className="mt-4 px-8 py-3 rounded-full bg-rose-red text-white font-bold shadow-rose-glow hover:bg-[#C91A44] hover:shadow-lg transition-all disabled:opacity-50"
                >
                  {isSaving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: Fun Stats */}
          <div className="space-y-6">
            <div className="p-6 rounded-2xl backdrop-blur-xl bg-saffron-cherry/5 border border-saffron-cherry/10 shadow-glass-panel text-center">
              <div className="text-4xl mb-3">✂️</div>
              <p className="text-sm font-extrabold text-saffron-cherry/70 uppercase tracking-widest mb-1">
                Total Cuts
              </p>
              {loading ? (
                <div className="h-10 w-10 mx-auto bg-saffron-cherry/20 animate-pulse rounded-md" />
              ) : (
                <p className="text-4xl font-black text-rose-red">
                  {stats.totalBookings}
                </p>
              )}
            </div>

            <div className="p-6 rounded-2xl backdrop-blur-xl bg-sunshine-yellow/10 border border-sunshine-yellow/20 shadow-glass-panel text-center">
              <div className="text-4xl mb-3">🏆</div>
              <p className="text-sm font-extrabold text-saffron-cherry/70 uppercase tracking-widest mb-1">
                Top Barber
              </p>
              {loading ? (
                <div className="h-8 w-24 mx-auto bg-saffron-cherry/20 animate-pulse rounded-md mt-2" />
              ) : (
                <p className="text-2xl font-black text-saffron-cherry">
                  {stats.favoriteBarber}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
