import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { BarberCard } from "../components/ui/BarberCard";

interface Service {
  id: string;
  name: string;
  price: number;
  duration_minutes: number;
}

export default function BookingFlow() {
  const { shop_slug } = useParams();
  const navigate = useNavigate();

  // State to track booking progress
  const [step, setStep] = useState(1);
  const [selectedService, setSelectedService] = useState<string | null>(null);
  const [selectedBarber, setSelectedBarber] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  // Database State
  const [shopId, setShopId] = useState<string | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [isBooking, setIsBooking] = useState(false);

  useEffect(() => {
    async function loadShopServices() {
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

        if (servicesData) {
          setServices(servicesData);
        }
      }
      setLoading(false);
    }

    loadShopServices();
  }, [shop_slug]);

  // Final Database Insert Function
  const handleBookAppointment = async (time: string) => {
    if (!shopId || !selectedService || !selectedBarber || !selectedDate) return;

    setIsBooking(true);

    try {
      const { error } = await supabase.from("bookings").insert([
        {
          shop_id: shopId,
          service_name: selectedService,
          barber_name: selectedBarber,
          booking_date: selectedDate.toISOString().split("T")[0],
          booking_time: time,
          status: "confirmed",
        },
      ]);

      if (error) throw error;

      alert(`Success! Your appointment with ${selectedBarber} is confirmed.`);
      navigate("/"); // Send them back to home after booking
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

  const barbers = [
    { id: 1, name: "Kaana", image: "🧔🏻‍♂️" },
    { id: 2, name: "Anil", image: "🧔🏽‍♂️" },
  ];

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
    <div className="pt-12 pb-24">
      <div className="max-w-4xl mx-auto px-6">
        {/* Shop Info Header */}
        <div className="mb-12 text-center">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-4 capitalize text-navy-blue drop-shadow-sm">
            {displayShopName}
          </h1>

          <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-6 text-sm text-navy-blue/80 mb-8">
            <div className="flex items-center gap-3 max-w-sm text-center md:text-left">
              <span className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-navy-blue/10 border border-navy-blue/20">
                📍
              </span>
              <span className="leading-snug">{shopInfo.address}</span>
            </div>
            <div className="hidden md:block w-px h-10 bg-navy-blue/20"></div>
            <div className="flex items-center gap-3">
              <span className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-navy-blue/10 border border-navy-blue/20">
                🕒
              </span>
              <span className="whitespace-nowrap">{shopInfo.hours}</span>
            </div>
            <div className="hidden md:block w-px h-10 bg-navy-blue/20"></div>
            <a
              href={shopInfo.mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 md:mt-0 px-5 py-2 rounded-full bg-navy-blue text-white hover:bg-crimson-pink hover:shadow-neon-glow border border-transparent transition-all font-semibold whitespace-nowrap"
            >
              Get Directions
            </a>
          </div>

          {/* Breadcrumbs */}
          <div className="flex items-center justify-center gap-2 text-sm font-medium text-navy-blue/40">
            <span className={step >= 1 ? "text-crimson-pink font-bold" : ""}>
              Service
            </span>
            <span>→</span>
            <span className={step >= 2 ? "text-crimson-pink font-bold" : ""}>
              Barber
            </span>
            <span>→</span>
            <span className={step >= 3 ? "text-crimson-pink font-bold" : ""}>
              Date
            </span>
            <span>→</span>
            <span className={step >= 4 ? "text-crimson-pink font-bold" : ""}>
              Time
            </span>
          </div>
        </div>

        {/* STEP 1: Select Service */}
        {step === 1 && (
          <div className="animate-in fade-in duration-500">
            <h2 className="text-xl font-semibold mb-6 text-navy-blue">
              1. Select a Service
            </h2>

            {loading ? (
              <div className="text-center text-navy-blue/60 py-10 animate-pulse">
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
                    className="p-6 rounded-2xl backdrop-blur-md bg-navy-blue/5 border border-navy-blue/10 hover:border-crimson-pink hover:shadow-neon-glow hover:bg-white/50 transition-all cursor-pointer flex justify-between items-center group"
                  >
                    <div>
                      <h3 className="text-lg font-bold text-navy-blue">
                        {service.name}
                      </h3>
                      <p className="text-sm text-navy-blue/60 mt-1 font-medium">
                        {service.duration_minutes} min
                      </p>
                    </div>
                    <span className="text-lg font-bold text-crimson-pink">
                      ₹{service.price}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* STEP 2: Select Barber */}
        {step === 2 && (
          <div className="animate-in fade-in duration-500">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-navy-blue">
                2. Choose your Barber
              </h2>
              <button
                onClick={() => setStep(1)}
                className="text-sm font-medium text-navy-blue/60 hover:text-crimson-pink transition-colors"
              >
                ← Back to Services
              </button>
            </div>

            <div className="grid grid-cols-2 gap-5 mt-8">
              {barbers.map((barber) => (
                <BarberCard
                  key={barber.id}
                  name={barber.name}
                  image={barber.image}
                  isSelected={selectedBarber === barber.name}
                  onClick={() => {
                    setSelectedBarber(barber.name);
                    setTimeout(() => setStep(3), 800);
                  }}
                />
              ))}
            </div>
          </div>
        )}

        {/* STEP 3: Select Date */}
        {step === 3 && (
          <div className="animate-in fade-in duration-500">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-navy-blue">
                3. Select a Date
              </h2>
              <button
                onClick={() => setStep(2)}
                className="text-sm font-medium text-navy-blue/60 hover:text-crimson-pink transition-colors"
              >
                ← Back to Barbers
              </button>
            </div>

            <div className="bg-navy-blue/5 border border-navy-blue/10 rounded-2xl p-6 md:p-8">
              <div className="flex gap-4 overflow-x-auto pb-6 snap-x hide-scrollbar">
                {availableDates.map((date, index) => {
                  const isSelected =
                    date.toDateString() === selectedDate.toDateString();
                  const isToday = index === 0;
                  return (
                    <button
                      key={index}
                      onClick={() => setSelectedDate(date)}
                      className={`min-w-[110px] p-5 rounded-xl border snap-start transition-all flex flex-col items-center gap-2
                        ${
                          isSelected
                            ? "bg-crimson-pink border-crimson-pink shadow-neon-glow text-white"
                            : "bg-white/50 border-navy-blue/10 hover:border-crimson-pink/50 text-navy-blue"
                        }`}
                    >
                      <span
                        className={`text-xs font-bold uppercase tracking-wider ${
                          isSelected ? "text-white" : "text-navy-blue/60"
                        }`}
                      >
                        {isToday
                          ? "Today"
                          : date.toLocaleDateString("en-US", {
                              weekday: "short",
                            })}
                      </span>
                      <span className="text-2xl font-bold">
                        {date.getDate()}
                      </span>
                      <span
                        className={`text-xs font-medium ${
                          isSelected ? "text-white/80" : "text-navy-blue/60"
                        }`}
                      >
                        {date.toLocaleDateString("en-US", { month: "short" })}
                      </span>
                    </button>
                  );
                })}
              </div>
              <div className="mt-4 flex justify-end">
                <button
                  onClick={() => setStep(4)}
                  className="px-8 py-3 rounded-full bg-navy-blue text-white hover:bg-crimson-pink font-semibold hover:shadow-neon-glow hover:scale-105 transition-all"
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
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-navy-blue">
                4. Select a Time
              </h2>
              <button
                onClick={() => setStep(3)}
                className="text-sm font-medium text-navy-blue/60 hover:text-crimson-pink transition-colors"
              >
                ← Back to Date
              </button>
            </div>

            <div className="bg-navy-blue/5 border border-navy-blue/10 rounded-2xl p-6 md:p-8">
              <p className="mb-8 text-navy-blue/80 text-center md:text-left font-medium">
                Booking{" "}
                <span className="font-bold text-crimson-pink">
                  {selectedService}
                </span>{" "}
                with{" "}
                <span className="font-bold text-navy-blue">
                  {selectedBarber}
                </span>{" "}
                on{" "}
                <span className="font-bold text-navy-blue">
                  {formatDateLabel(selectedDate)}
                </span>
              </p>

              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {timeSlots.map((time, index) => (
                  <button
                    key={index}
                    disabled={isBooking}
                    onClick={() => handleBookAppointment(time)}
                    className="py-3 md:py-4 rounded-xl border border-navy-blue/10 bg-white/60 hover:bg-crimson-pink hover:border-crimson-pink hover:shadow-neon-glow hover:text-white transition-all text-sm font-bold text-navy-blue disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isBooking ? "..." : time}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
