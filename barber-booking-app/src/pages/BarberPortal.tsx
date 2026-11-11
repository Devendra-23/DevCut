import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../lib/supabase";

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

export default function BarberPortal() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"upcoming" | "past">("upcoming");

  useEffect(() => {
    async function fetchAllBookings() {
      const { data, error } = await supabase
        .from("bookings")
        .select("*")
        .order("booking_date", { ascending: true })
        .order("booking_time", { ascending: true });

      if (error) {
        console.error("Error fetching shop bookings:", error.message);
      } else if (data) {
        setBookings(data);
      }
      setLoading(false);
    }

    fetchAllBookings();
  }, []);

  const today = new Date().toISOString().split("T")[0];

  const upcomingBookings = bookings.filter(
    (b) =>
      b.booking_date >= today &&
      b.status !== "cancelled" &&
      b.status !== "cancelled_by_barber"
  );
  const pastBookings = bookings.filter(
    (b) =>
      b.booking_date < today ||
      b.status === "cancelled" ||
      b.status === "cancelled_by_barber"
  );

  const displayBookings =
    activeTab === "upcoming" ? upcomingBookings : pastBookings;

  const getDisplayStatus = (booking: Booking) => {
    if (
      booking.status === "cancelled" ||
      booking.status === "cancelled_by_barber"
    )
      return "CANCELLED";
    if (booking.booking_date < today) return "COMPLETED";
    return "CONFIRMED";
  };

  const handleBarberCancel = async (bookingId: string) => {
    const confirmCancel = window.confirm(
      "Are you sure you want to cancel this customer's appointment?"
    );
    if (!confirmCancel) return;

    try {
      const { error } = await supabase
        .from("bookings")
        .update({ status: "cancelled_by_barber" })
        .eq("id", bookingId);

      if (error) throw error;

      setBookings((prev) =>
        prev.map((b) =>
          b.id === bookingId ? { ...b, status: "cancelled_by_barber" } : b
        )
      );
      alert("Appointment successfully cancelled.");
    } catch (err: any) {
      alert("Failed to cancel appointment: " + err.message);
    }
  };

  return (
    <div className="pt-12 pb-24 text-saffron-cherry">
      <div className="max-w-6xl mx-auto px-6">
        <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-3 text-saffron-cherry drop-shadow-sm">
              Barber Portal
            </h1>
            <p className="text-saffron-cherry/80 text-lg font-semibold">
              Manage shop appointments and daily schedules.
            </p>
          </div>

          <div className="flex bg-white/40 backdrop-blur-md p-1.5 rounded-full border border-white/60 shadow-sm">
            <button
              onClick={() => setActiveTab("upcoming")}
              className={`px-6 py-2.5 rounded-full font-bold text-sm transition-all ${
                activeTab === "upcoming"
                  ? "bg-rose-red text-white shadow-rose-glow"
                  : "text-saffron-cherry hover:bg-white/50"
              }`}
            >
              Upcoming
            </button>
            <button
              onClick={() => setActiveTab("past")}
              className={`px-6 py-2.5 rounded-full font-bold text-sm transition-all ${
                activeTab === "past"
                  ? "bg-rose-red text-white shadow-rose-glow"
                  : "text-saffron-cherry hover:bg-white/50"
              }`}
            >
              Past / Cancelled
            </button>
          </div>
        </div>

        {loading ? (
          <div className="text-center text-saffron-cherry/60 py-10 animate-pulse font-bold">
            Loading schedule...
          </div>
        ) : displayBookings.length === 0 ? (
          <div className="p-10 rounded-2xl backdrop-blur-xl bg-white/60 border border-white/80 text-center shadow-glass-panel">
            <p className="text-xl font-bold mb-2 text-saffron-cherry">
              No {activeTab} appointments found.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {displayBookings.map((booking) => {
              const displayStatus = getDisplayStatus(booking);

              return (
                <div
                  key={booking.id}
                  className={`p-6 rounded-2xl backdrop-blur-xl border shadow-glass-panel transition-all
                    ${
                      displayStatus === "CANCELLED"
                        ? "bg-white/30 border-white/40 opacity-70"
                        : displayStatus === "COMPLETED"
                        ? "bg-saffron-cherry/5 border-saffron-cherry/20 opacity-80"
                        : "bg-white/70 border-white/90 hover:border-sunshine-yellow hover:shadow-yellow-glow"
                    }
                  `}
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-2xl font-bold text-saffron-cherry">
                        {new Date(booking.booking_date).toLocaleDateString(
                          "en-US",
                          { weekday: "short", month: "short", day: "numeric" }
                        )}
                      </h3>
                      <p className="text-xl font-black text-rose-red">
                        {booking.booking_time}
                      </p>
                    </div>
                    <span
                      className={`text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full 
                      ${
                        displayStatus === "CANCELLED"
                          ? "bg-saffron-cherry/10 text-saffron-cherry"
                          : displayStatus === "COMPLETED"
                          ? "bg-green-100 text-green-800"
                          : "bg-sunshine-yellow text-saffron-cherry"
                      }
                    `}
                    >
                      {displayStatus}
                    </span>
                  </div>

                  <div className="space-y-2 mb-4 text-sm font-semibold text-saffron-cherry/90 bg-white/40 p-4 rounded-xl border border-white/50">
                    <p className="flex justify-between">
                      <span className="opacity-70">Service:</span>
                      <span className="font-extrabold">
                        {booking.service_name}
                      </span>
                    </p>
                    <p className="flex justify-between">
                      <span className="opacity-70">Barber:</span>
                      <span className="font-extrabold">
                        {booking.barber_name}
                      </span>
                    </p>
                  </div>

                  {booking.status !== "cancelled" &&
                    booking.status !== "cancelled_by_barber" &&
                    activeTab === "upcoming" && (
                      <div className="mt-4 pt-4 border-t border-saffron-cherry/10">
                        <button
                          onClick={() => handleBarberCancel(booking.id)}
                          className="w-full py-2.5 rounded-xl bg-white/50 border border-saffron-cherry/20 hover:border-rose-red hover:bg-rose-red hover:text-white text-saffron-cherry font-bold text-sm transition-all"
                        >
                          Cancel Appointment
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
