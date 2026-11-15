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

const timeSlots = [
  "09:30 AM",
  "10:15 AM",
  "11:00 AM",
  "11:45 AM",
  "12:30 PM",
  "01:15 PM",
  "02:00 PM",
  "02:45 PM",
  "03:30 PM",
  "04:15 PM",
  "05:00 PM",
  "05:45 PM",
  "06:30 PM",
  "07:15 PM",
  "08:00 PM",
  "08:45 PM",
  "09:15 PM",
];

export default function Dashboard() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  // Reschedule State
  const [rescheduleData, setRescheduleData] = useState<{
    bookingId: string;
    shopId: string;
    barberName: string;
    currentCount: number;
  } | null>(null);
  const [newDate, setNewDate] = useState("");
  const [newTime, setNewTime] = useState("");
  const [bookedSlots, setBookedSlots] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);

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

  // Fetch booked slots dynamically when the user picks a new date during rescheduling
  useEffect(() => {
    async function fetchBookedSlots() {
      if (!rescheduleData || !newDate) return;

      const { data, error } = await supabase
        .from("bookings")
        .select("booking_time")
        .eq("shop_id", rescheduleData.shopId)
        .eq("barber_name", rescheduleData.barberName)
        .eq("booking_date", newDate)
        .neq("status", "cancelled")
        .neq("status", "cancelled_by_barber");

      if (error) {
        console.error("Error fetching booked slots:", error.message);
      } else if (data) {
        setBookedSlots(data.map((b) => b.booking_time));
      }
    }
    fetchBookedSlots();
  }, [rescheduleData, newDate]);

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

  const initiateReschedule = (booking: Booking) => {
    if (booking.rearrange_count >= 2) {
      alert(
        "You have reached the maximum number of rearrangements (2) for this appointment. Further changes will incur a ₹50 fine. Please contact the shop directly."
      );
      return;
    }

    // Open the inline reschedule form
    setRescheduleData({
      bookingId: booking.id,
      shopId: booking.shop_id,
      barberName: booking.barber_name,
      currentCount: booking.rearrange_count,
    });
    setNewDate("");
    setNewTime("");
  };

  const confirmReschedule = async () => {
    if (!rescheduleData || !newDate || !newTime) return;
    setIsSaving(true);

    try {
      const { error } = await supabase
        .from("bookings")
        .update({
          booking_date: newDate,
          booking_time: newTime,
          rearrange_count: rescheduleData.currentCount + 1,
        })
        .eq("id", rescheduleData.bookingId);

      if (error) throw error;

      // Update local state immediately
      setBookings((prev) =>
        prev.map((b) =>
          b.id === rescheduleData.bookingId
            ? {
                ...b,
                booking_date: newDate,
                booking_time: newTime,
                rearrange_count: b.rearrange_count + 1,
              }
            : b
        )
      );

      alert("Appointment successfully rescheduled!");
      setRescheduleData(null); // Close the form
    } catch (err: any) {
      alert("Failed to reschedule: " + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const getAvailableTimeSlots = () => {
    if (!newDate) return [];

    const now = new Date();
    const selectedDateObj = new Date(newDate);
    const isToday = selectedDateObj.toDateString() === now.toDateString();

    return timeSlots.filter((time) => {
      // 1. Filter out times already booked by other customers
      if (bookedSlots.includes(time)) return false;

      // 2. Filter out past times if the selected date is today
      if (isToday) {
        const [timeStr, modifier] = time.split(" ");
        let [hours, minutes] = timeStr.split(":");
        let hoursInt = parseInt(hours, 10);

        if (modifier === "PM" && hoursInt < 12) hoursInt += 12;
        if (modifier === "AM" && hoursInt === 12) hoursInt = 0;

        const slotTime = new Date(selectedDateObj);
        slotTime.setHours(hoursInt, parseInt(minutes, 10), 0, 0);

        return slotTime > now;
      }
      return true;
    });
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
              const isReschedulingThis =
                rescheduleData?.bookingId === booking.id;
              const activeTimeSlots = getAvailableTimeSlots();

              return (
                <div
                  key={booking.id}
                  className={`p-6 rounded-2xl backdrop-blur-xl border shadow-glass-panel transition-all
                    ${
                      isCancelled
                        ? "bg-white/30 border-white/40 opacity-70"
                        : displayStatus === "COMPLETED"
                        ? "bg-saffron-cherry/5 border-saffron-cherry/20 opacity-80"
                        : isReschedulingThis
                        ? "bg-white/90 border-sunshine-yellow shadow-yellow-glow scale-[1.02]"
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
                    <div className="pt-4 border-t border-saffron-cherry/10">
                      {/* INLINE RESCHEDULE FORM */}
                      {isReschedulingThis ? (
                        <div className="animate-in fade-in duration-300">
                          <p className="text-sm font-bold text-saffron-cherry mb-3">
                            Select new date & time:
                          </p>
                          <div className="flex flex-col gap-3 mb-4">
                            <input
                              type="date"
                              min={today}
                              value={newDate}
                              onChange={(e) => setNewDate(e.target.value)}
                              className="px-4 py-2.5 rounded-xl bg-white/50 border border-saffron-cherry/20 text-saffron-cherry font-bold focus:outline-none focus:border-rose-red"
                            />
                            <select
                              value={newTime}
                              onChange={(e) => setNewTime(e.target.value)}
                              disabled={!newDate}
                              className="px-4 py-2.5 rounded-xl bg-white/50 border border-saffron-cherry/20 text-saffron-cherry font-bold focus:outline-none focus:border-rose-red disabled:opacity-50 appearance-none"
                            >
                              <option value="">Select Available Time</option>
                              {activeTimeSlots.map((time) => (
                                <option key={time} value={time}>
                                  {time}
                                </option>
                              ))}
                            </select>
                          </div>
                          <div className="flex gap-3">
                            <button
                              onClick={confirmReschedule}
                              disabled={!newDate || !newTime || isSaving}
                              className="flex-1 py-2.5 rounded-xl bg-sunshine-yellow text-saffron-cherry font-bold text-sm hover:shadow-yellow-glow disabled:opacity-50 transition-all"
                            >
                              {isSaving ? "Saving..." : "Confirm"}
                            </button>
                            <button
                              onClick={() => setRescheduleData(null)}
                              className="flex-1 py-2.5 rounded-xl bg-white/50 border border-saffron-cherry/20 hover:border-rose-red hover:bg-rose-red hover:text-white text-saffron-cherry font-bold text-sm transition-all"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        /* DEFAULT BUTTONS (Reschedule & Cancel) */
                        <div className="flex gap-3">
                          <div className="relative flex-1 group">
                            <button
                              onClick={() => initiateReschedule(booking)}
                              className="w-full py-2.5 rounded-xl bg-white/50 border border-saffron-cherry/20 hover:border-sunshine-yellow hover:bg-sunshine-yellow/20 text-saffron-cherry font-bold text-sm transition-all"
                            >
                              Reschedule
                            </button>

                            {/* Tooltip */}
                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-56 p-3 bg-saffron-cherry text-white text-xs font-bold rounded-xl shadow-glass-panel opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-10 pointer-events-none text-center">
                              Max 2 reschedules allowed. Exceeding this incurs a
                              ₹50 penalty.
                              <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-saffron-cherry"></div>
                            </div>
                          </div>

                          <button
                            onClick={() => handleCancel(booking.id)}
                            className="flex-1 py-2.5 rounded-xl bg-white/50 border border-saffron-cherry/20 hover:border-rose-red hover:bg-rose-red hover:text-white text-saffron-cherry font-bold text-sm transition-all"
                          >
                            Cancel
                          </button>
                        </div>
                      )}
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
