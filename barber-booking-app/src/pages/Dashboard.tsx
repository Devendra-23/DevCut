import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { useAuth } from "../contexts/AuthContext";

interface Booking {
  id: string;
  shop_id: string;
  service_name: string;
  barber_name: string;
  booking_date: string;
  booking_time: string;
  status: string;
  rearrange_count: number;
}

export default function Dashboard() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchUserBookings() {
      if (!user) return;

      const { data, error } = await supabase
        .from("bookings")
        .select("*")
        .eq("user_id", user.id)
        .order("booking_date", { ascending: true });

      if (error) {
        console.error("Error fetching bookings:", error.message);
      } else if (data) {
        const mappedData = data.map((b) => ({
          ...b,
          rearrange_count: b.rearrange_count || 0,
        }));
        setBookings(mappedData);
      }
      setLoading(false);
    }

    fetchUserBookings();
  }, [user]);

  const handleCancel = async (bookingId: string) => {
    const confirmCancel = window.confirm(
      "Are you sure you want to cancel this appointment?"
    );
    if (!confirmCancel) return;

    try {
      const { error } = await supabase
        .from("bookings")
        .update({ status: "cancelled" })
        .eq("id", bookingId);

      if (error) throw error;

      setBookings((prev) =>
        prev.map((b) =>
          b.id === bookingId ? { ...b, status: "cancelled" } : b
        )
      );
      alert("Appointment cancelled successfully.");
    } catch (err: any) {
      alert("Failed to cancel appointment: " + err.message);
    }
  };

  const handleReschedule = async (
    bookingId: string,
    rearrangeCount: number
  ) => {
    if (rearrangeCount >= 2) {
      alert(
        "You have reached the maximum number of rearrangements (2) for this appointment. Further changes will incur a ₹50 fine. Please contact the shop directly."
      );
      return;
    }

    alert(
      `Rescheduling appointment. You have used ${rearrangeCount}/2 rearrangements.`
    );
    // Future expansion: Actually update the database count here and navigate to picking a new time
  };

  if (!user) {
    return (
      <div className="pt-24 text-center text-saffron-cherry font-bold">
        Please{" "}
        <Link
          to="/auth"
          className="text-rose-red hover:text-[#C91A44] transition-colors underline"
        >
          log in
        </Link>{" "}
        to view your dashboard.
      </div>
    );
  }

  const today = new Date().toISOString().split("T")[0];

  const getDisplayStatus = (booking: Booking) => {
    if (
      booking.status === "cancelled" ||
      booking.status === "cancelled_by_barber"
    )
      return "CANCELLED";
    if (booking.booking_date < today) return "COMPLETED";
    return "CONFIRMED";
  };

  return (
    <div className="pt-12 pb-24 text-saffron-cherry">
      <div className="max-w-5xl mx-auto px-6">
        <div className="mb-12">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-3 text-saffron-cherry drop-shadow-sm">
            My Appointments
          </h1>
          <p className="text-saffron-cherry/80 text-lg font-semibold">
            Manage your upcoming haircuts and view past bookings.
          </p>
        </div>

        {loading ? (
          <div className="text-center text-saffron-cherry/60 py-10 animate-pulse font-bold">
            Loading your schedule...
          </div>
        ) : bookings.length === 0 ? (
          <div className="p-10 rounded-2xl backdrop-blur-xl bg-white/60 border border-white/80 text-center shadow-glass-panel">
            <p className="text-xl font-bold mb-4 text-saffron-cherry">
              You have no upcoming appointments.
            </p>
            <Link
              to="/shops"
              className="inline-block px-8 py-3 rounded-full bg-rose-red text-white hover:bg-[#C91A44] shadow-rose-glow font-bold transition-all mt-2"
            >
              Book a Haircut
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {bookings.map((booking) => {
              const displayStatus = getDisplayStatus(booking);
              const isCancelled = displayStatus === "CANCELLED";

              return (
                <div
                  key={booking.id}
                  className={`p-6 rounded-2xl backdrop-blur-xl border shadow-glass-panel transition-all
                    ${
                      isCancelled
                        ? "bg-white/30 border-white/40 opacity-70"
                        : displayStatus === "COMPLETED"
                        ? "bg-saffron-cherry/5 border-saffron-cherry/20 opacity-80"
                        : "bg-white/60 border-white/80 hover:border-rose-red hover:shadow-rose-glow"
                    }
                  `}
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <span
                        className={`text-xs font-extrabold uppercase tracking-wider px-3 py-1 rounded-full 
                        ${
                          isCancelled
                            ? "bg-saffron-cherry/20 text-saffron-cherry"
                            : displayStatus === "COMPLETED"
                            ? "bg-green-100 text-green-800"
                            : "bg-sunshine-yellow/50 text-saffron-cherry"
                        }
                      `}
                      >
                        {displayStatus}
                      </span>
                      <h3 className="text-2xl font-bold mt-3 text-saffron-cherry">
                        {new Date(booking.booking_date).toLocaleDateString(
                          "en-US",
                          { weekday: "short", month: "short", day: "numeric" }
                        )}
                      </h3>
                      <p className="text-lg font-extrabold text-rose-red">
                        {booking.booking_time}
                      </p>
                    </div>
                    <div className="text-4xl">✂️</div>
                  </div>

                  {booking.status === "cancelled_by_barber" && (
                    <div className="mb-4 bg-rose-red/10 border border-rose-red/20 rounded-xl p-3 text-sm font-bold text-rose-red">
                      Sorry, your appointment was cancelled by the shop.
                    </div>
                  )}

                  <div className="space-y-1 mb-6 text-sm font-semibold text-saffron-cherry/80">
                    <p>
                      Service:{" "}
                      <span className="font-bold text-saffron-cherry">
                        {booking.service_name}
                      </span>
                    </p>
                    <p>
                      Barber:{" "}
                      <span className="font-bold text-saffron-cherry">
                        {booking.barber_name}
                      </span>
                    </p>
                    {!isCancelled && displayStatus !== "COMPLETED" && (
                      <p className="text-xs mt-2 text-saffron-cherry/60">
                        Rearrangements used: {booking.rearrange_count}/2
                      </p>
                    )}
                  </div>

                  {!isCancelled && displayStatus !== "COMPLETED" && (
                    <div className="flex gap-3 pt-4 border-t border-saffron-cherry/10">
                      <button
                        onClick={() =>
                          handleReschedule(booking.id, booking.rearrange_count)
                        }
                        className="flex-1 py-2.5 rounded-xl bg-white/50 border border-saffron-cherry/20 hover:border-sunshine-yellow hover:bg-sunshine-yellow/20 text-saffron-cherry font-bold text-sm transition-all"
                      >
                        Reschedule
                      </button>
                      <button
                        onClick={() => handleCancel(booking.id)}
                        className="flex-1 py-2.5 rounded-xl bg-white/50 border border-saffron-cherry/20 hover:border-rose-red hover:bg-rose-red hover:text-white text-saffron-cherry font-bold text-sm transition-all"
                      >
                        Cancel
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
