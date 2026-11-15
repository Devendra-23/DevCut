import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { BarberCard } from "../components/ui/BarberCard";
import { useAuth } from "../contexts/AuthContext";

interface Service {
  id: string;
  name: string;
  price: number;
  duration_minutes: number;
}

interface Barber {
  id: string;
  name: string;
  image: string;
}

export default function BookingFlow() {
  const { shop_slug } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [step, setStep] = useState(1);
  const [selectedService, setSelectedService] = useState<string | null>(null);
  const [selectedBarber, setSelectedBarber] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  const [shopId, setShopId] = useState<string | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [team, setTeam] = useState<Barber[]>([]);
  const [loading, setLoading] = useState(true);
  const [isBooking, setIsBooking] = useState(false);

  const [bookedSlots, setBookedSlots] = useState<string[]>([]);
  const [hasExistingBooking, setHasExistingBooking] = useState(false);

  useEffect(() => {
    async function loadShopData() {
      if (!shop_slug) return;

      const { data: shopData } = await supabase
        .from("shops")
        .select("id")
        .eq("slug", shop_slug)
        .single();

      if (shopData) {
        setShopId(shopData.id);

        const { data: servicesData } = await supabase
          .from("services")
          .select("*")
          .eq("shop_id", shopData.id);
        if (servicesData) setServices(servicesData);

        // Fetches only bookable barbers
        const { data: barbersData } = await supabase
          .from("barbers")
          .select("id, name, image")
          .eq("shop_id", shopData.id)
          .eq("is_bookable", true)
          .order("name", { ascending: true });
        if (barbersData) setTeam(barbersData);
      }
      setLoading(false);
    }

    loadShopData();
  }, [shop_slug]);

  useEffect(() => {
    async function fetchBookedSlots() {
      if (!shopId || !selectedBarber || !selectedDate) return;
      const dateString = selectedDate.toISOString().split("T")[0];
      const { data } = await supabase
        .from("bookings")
        .select("booking_time")
        .eq("shop_id", shopId)
        .eq("barber_name", selectedBarber)
        .eq("booking_date", dateString)
        .neq("status", "cancelled")
        .neq("status", "cancelled_by_barber");

      if (data) setBookedSlots(data.map((booking) => booking.booking_time));
    }
    fetchBookedSlots();
  }, [shopId, selectedBarber, selectedDate]);

  useEffect(() => {
    async function checkUserDailyLimit() {
      if (!user || !selectedDate || !shopId) {
        setHasExistingBooking(false);
        return;
      }
      const dateString = selectedDate.toISOString().split("T")[0];
      const { data } = await supabase
        .from("bookings")
        .select("id")
        .eq("user_id", user.id)
        .eq("shop_id", shopId)
        .eq("booking_date", dateString)
        .neq("status", "cancelled")
        .neq("status", "cancelled_by_barber");

      if (data && data.length > 0) setHasExistingBooking(true);
      else setHasExistingBooking(false);
    }
    checkUserDailyLimit();
  }, [user, selectedDate, shopId]);

  const handleBookAppointment = async (time: string) => {
    if (!user) {
      alert("Please log in to book an appointment.");
      navigate("/auth");
      return;
    }
    if (!shopId || !selectedService || !selectedBarber || !selectedDate) return;

    setIsBooking(true);
    try {
      const { error } = await supabase.from("bookings").insert([
        {
          shop_id: shopId,
          user_id: user.id,
          service_name: selectedService,
          barber_name: selectedBarber,
          booking_date: selectedDate.toISOString().split("T")[0],
          booking_time: time,
          status: "confirmed",
          rearrange_count: 0,
        },
      ]);
      if (error) throw error;
      alert(`Success! Your appointment with ${selectedBarber} is confirmed.`);
      navigate("/dashboard");
    } catch (err: any) {
      console.error("Booking error:", err.message);
      alert("Failed to complete booking. Please try again.");
    } finally {
      setIsBooking(false);
    }
  };

  const formatShopName = (slug: string | undefined) => {
    if (slug === "panis-hair-studio") return "Pani's Hair Studio";
    if (!slug) return "Barbershop";
    return slug
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  const displayShopName = formatShopName(shop_slug);

  const shopInfo = {
    address:
      "Shop No. 6, Marigold Aangan, Sevaram Lalwani Rd, Mulund West, Mumbai",
    hours: "Tue-Sun: 9:30 AM - 10:00 PM",
    mapsUrl:
      "https://www.google.com/maps/dir/?api=1&destination=Paani's+Hair+Studio&destination_place_id=ChIJFd5tSwC55zsRibZxgeJZSP0",
  };

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

  const getAvailableTimeSlots = () => {
    const now = new Date();
    const isToday = selectedDate.toDateString() === now.toDateString();
    if (!isToday) return timeSlots;
    return timeSlots.filter((time) => {
      const [timeStr, modifier] = time.split(" ");
      let [hours, minutes] = timeStr.split(":");
      let hoursInt = parseInt(hours, 10);
      if (modifier === "PM" && hoursInt < 12) hoursInt += 12;
      if (modifier === "AM" && hoursInt === 12) hoursInt = 0;
      const slotTime = new Date(selectedDate);
      slotTime.setHours(hoursInt, parseInt(minutes, 10), 0, 0);
      return slotTime > now;
    });
  };

  const activeTimeSlots = getAvailableTimeSlots();

  const generateDates = () => {
    const dates = [];
    const today = new Date();
    for (let i = 0; i < 14; i++) {
      const d = new Date();
      d.setDate(today.getDate() + i);
      dates.push(d);
    }
    return dates;
  };
  const availableDates = generateDates();

  const formatDateLabel = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="pt-12 pb-24 text-saffron-cherry">
      <div className="max-w-4xl mx-auto px-6">
        {/* RESPONSIVE SHOP HEADER */}
        <div className="mb-12 text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4 capitalize drop-shadow-sm text-saffron-cherry">
            {displayShopName}
          </h1>

          <div className="flex justify-center mb-8">
            <div className="flex flex-col items-start md:flex-row md:items-center gap-5 md:gap-6 text-sm text-saffron-cherry/80 font-semibold">
              {/* ADDRESS BLOCK */}
              <div className="flex items-start md:items-center gap-3 max-w-[280px] sm:max-w-sm text-left">
                <div className="shrink-0 min-w-[32px] min-h-[32px] w-8 h-8 flex items-center justify-center rounded-full bg-saffron-cherry/10 border border-saffron-cherry/20 mt-0.5 md:mt-0">
                  📍
                </div>
                <div className="leading-snug">{shopInfo.address}</div>
              </div>

              <div className="hidden md:block w-px h-10 bg-saffron-cherry/20"></div>

              {/* CLOCK BLOCK (Now perfectly left-aligned with the pin on mobile) */}
              <div className="flex items-center gap-3 text-left">
                <div className="shrink-0 min-w-[32px] min-h-[32px] w-8 h-8 flex items-center justify-center rounded-full bg-saffron-cherry/10 border border-saffron-cherry/20">
                  🕒
                </div>
                <div className="whitespace-nowrap">{shopInfo.hours}</div>
              </div>

              <div className="hidden md:block w-px h-10 bg-saffron-cherry/20"></div>

              <a
                href={shopInfo.mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="self-center md:self-auto mt-1 md:mt-0 px-6 py-2.5 rounded-full bg-rose-red hover:bg-[#C91A44] text-white shadow-rose-glow hover:shadow-lg transition-all font-bold whitespace-nowrap shrink-0"
              >
                Get Directions
              </a>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2 md:gap-3 text-xs md:text-sm font-bold text-saffron-cherry/40">
            <span className={step >= 1 ? "text-rose-red font-extrabold" : ""}>
              Service
            </span>
            <span>→</span>
            <span className={step >= 2 ? "text-rose-red font-extrabold" : ""}>
              Barber
            </span>
            <span>→</span>
            <span className={step >= 3 ? "text-rose-red font-extrabold" : ""}>
              Date
            </span>
            <span>→</span>
            <span className={step >= 4 ? "text-rose-red font-extrabold" : ""}>
              Time
            </span>
          </div>
        </div>

        {/* STEP 1: Select Service */}
        {step === 1 && (
          <div className="animate-in fade-in duration-500">
            <h2 className="text-xl font-extrabold mb-6 text-saffron-cherry">
              1. Select a Service
            </h2>
            {loading ? (
              <div className="text-center text-saffron-cherry/60 py-10 animate-pulse font-bold">
                Loading services...
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {services.map((service) => (
                  <div
                    key={service.id}
                    onClick={() => {
                      setSelectedService(service.name);
                      setStep(2);
                    }}
                    className="p-6 rounded-2xl backdrop-blur-xl bg-white/60 border border-white/80 hover:border-rose-red hover:bg-white/80 hover:shadow-rose-glow transition-all cursor-pointer flex justify-between items-center group shadow-glass-panel"
                  >
                    <div>
                      <h3 className="text-lg font-bold text-saffron-cherry group-hover:text-rose-red transition-colors">
                        {service.name}
                      </h3>
                      <p className="text-sm text-saffron-cherry/70 mt-1 font-semibold">
                        {service.duration_minutes} min
                      </p>
                    </div>
                    <span className="text-xl font-extrabold text-rose-red">
                      ₹{service.price}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* STEP 2: Select Barber (FLEX RESPONSIVE CENTERED) */}
        {step === 2 && (
          <div className="animate-in fade-in duration-500">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <h2 className="text-xl font-extrabold text-saffron-cherry">
                2. Choose your Barber
              </h2>
              <button
                onClick={() => setStep(1)}
                className="text-sm font-bold text-saffron-cherry/70 hover:text-rose-red transition-colors text-left sm:text-right"
              >
                ← Back to Services
              </button>
            </div>

            {loading ? (
              <div className="text-center text-saffron-cherry/60 py-10 animate-pulse font-bold">
                Loading team...
              </div>
            ) : team.length === 0 ? (
              <div className="text-center p-8 bg-white/50 rounded-2xl font-bold">
                No barbers currently assigned to this shop.
              </div>
            ) : (
              <div className="flex flex-wrap justify-center gap-6 mt-8">
                {team.map((barber) => (
                  <div
                    key={barber.id}
                    className="w-full sm:w-[calc(50%-12px)] md:w-[calc(33.333%-16px)] max-w-[260px]"
                  >
                    <BarberCard
                      name={barber.name}
                      image={barber.image}
                      isSelected={selectedBarber === barber.name}
                      onClick={() => {
                        setSelectedBarber(barber.name);
                        setTimeout(() => setStep(3), 800);
                      }}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* STEP 3: Select Date */}
        {step === 3 && (
          <div className="animate-in fade-in duration-500">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <h2 className="text-xl font-extrabold text-saffron-cherry">
                3. Select a Date
              </h2>
              <button
                onClick={() => setStep(2)}
                className="text-sm font-bold text-saffron-cherry/70 hover:text-rose-red transition-colors text-left sm:text-right"
              >
                ← Back to Barbers
              </button>
            </div>
            <div className="backdrop-blur-xl bg-white/60 border border-white/80 rounded-2xl p-6 md:p-8 shadow-glass-panel">
              <div className="flex gap-4 overflow-x-auto pb-6 snap-x hide-scrollbar">
                {availableDates.map((date, index) => {
                  const isSelected =
                    date.toDateString() === selectedDate.toDateString();
                  const isToday = index === 0;
                  return (
                    <button
                      key={index}
                      onClick={() => setSelectedDate(date)}
                      className={`min-w-[110px] p-5 rounded-xl border snap-start transition-all flex flex-col items-center gap-2 ${
                        isSelected
                          ? "bg-rose-red border-rose-red shadow-rose-glow text-white font-extrabold"
                          : "bg-white/40 border-white/60 hover:border-rose-red/50 text-saffron-cherry font-bold hover:shadow-sm"
                      }`}
                    >
                      <span
                        className={`text-xs font-extrabold uppercase tracking-wider ${
                          isSelected ? "text-white" : "text-saffron-cherry/70"
                        }`}
                      >
                        {isToday
                          ? "Today"
                          : date.toLocaleDateString("en-US", {
                              weekday: "short",
                            })}
                      </span>
                      <span className="text-2xl font-black">
                        {date.getDate()}
                      </span>
                      <span
                        className={`text-xs font-bold ${
                          isSelected
                            ? "text-white/95"
                            : "text-saffron-cherry/75"
                        }`}
                      >
                        {date.toLocaleDateString("en-US", { month: "short" })}
                      </span>
                    </button>
                  );
                })}
              </div>
              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => setStep(4)}
                  className="w-full sm:w-auto px-8 py-3 rounded-full bg-rose-red text-white hover:bg-[#C91A44] hover:shadow-rose-glow font-bold transition-all"
                >
                  Continue to Time
                </button>
              </div>
            </div>
          </div>
        )}

        {/* STEP 4: Select Time & Book */}
        {step === 4 && (
          <div className="animate-in fade-in duration-500">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <h2 className="text-xl font-extrabold text-saffron-cherry">
                4. Select a Time
              </h2>
              <button
                onClick={() => setStep(3)}
                className="text-sm font-bold text-saffron-cherry/70 hover:text-rose-red transition-colors text-left sm:text-right"
              >
                ← Back to Date
              </button>
            </div>
            <div className="backdrop-blur-xl bg-white/60 border border-white/80 rounded-2xl p-6 md:p-8 shadow-glass-panel">
              <p className="mb-8 text-saffron-cherry text-center md:text-left font-bold text-lg">
                Booking{" "}
                <span className="font-extrabold text-rose-red">
                  {selectedService}
                </span>{" "}
                with{" "}
                <span className="font-extrabold text-saffron-cherry">
                  {selectedBarber}
                </span>{" "}
                on{" "}
                <span className="font-extrabold text-saffron-cherry">
                  {formatDateLabel(selectedDate)}
                </span>
              </p>
              {hasExistingBooking ? (
                <div className="p-8 text-center bg-rose-red/10 border border-rose-red/20 rounded-2xl">
                  <span className="text-4xl mb-4 block">📅</span>
                  <h3 className="text-xl font-extrabold text-rose-red mb-2">
                    Limit Reached
                  </h3>
                  <p className="text-saffron-cherry/80 font-semibold mb-6">
                    You already have an active appointment scheduled for{" "}
                    {formatDateLabel(selectedDate)}. To keep the calendar fair,
                    we limit bookings to one per day.
                  </p>
                  <button
                    onClick={() => navigate("/dashboard")}
                    className="w-full sm:w-auto px-6 py-2.5 rounded-full bg-white text-rose-red border border-rose-red/30 hover:bg-rose-red hover:text-white font-bold transition-all shadow-sm"
                  >
                    View My Dashboard
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {activeTimeSlots.map((time, index) => {
                    const isBooked = bookedSlots.includes(time);
                    return (
                      <button
                        key={index}
                        disabled={isBooking || isBooked}
                        onClick={() => handleBookAppointment(time)}
                        className={`py-3.5 md:py-4 rounded-xl border transition-all text-sm font-extrabold shadow-sm ${
                          isBooked
                            ? "bg-white/20 border-white/30 text-saffron-cherry/30 cursor-not-allowed line-through"
                            : "bg-white/60 border-white/80 hover:bg-rose-red hover:border-rose-red hover:text-white text-saffron-cherry hover:shadow-rose-glow disabled:opacity-50 disabled:cursor-not-allowed"
                        }`}
                      >
                        {isBooking && !isBooked ? "..." : time}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
