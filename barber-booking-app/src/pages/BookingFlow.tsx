import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
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

  const [step, setStep] = useState(1);
  const [selectedService, setSelectedService] = useState<string | null>(null);
  const [selectedBarber, setSelectedBarber] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

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
      navigate("/");
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
    <div className="pt-12 pb-24 text-navy-blue">
      <div className="max-w-4xl mx-auto px-6">
        {/* Shop Info Header */}
        <div className="mb-12 text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4 capitalize drop-shadow-sm text-navy-blue">
            {displayShopName}
          </h1>

          <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-6 text-sm text-navy-blue/80 mb-8 font-semibold">
            <div className="flex items-center gap-3 max-w-sm text-center md:text-left">
              <span className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-navy-blue/10 border border-navy-blue/20">
                📍
              </span>
              <span className="leading-snug">{shopInfo.address}</span>
            </div>
            <div className="hidden md:block w-px h-10 bg-navy-blue/25"></div>
            <div className="flex items-center gap-3">
              <span className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-navy-blue/10 border border-navy-blue/20">
                🕒
              </span>
              <span className="whitespace-nowrap">{shopInfo.hours}</span>
            </div>
            <div className="hidden md:block w-px h-10 bg-navy-blue/25"></div>
            <a
              href={shopInfo.mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 md:mt-0 px-6 py-2.5 rounded-full bg-[#FD5988] hover:bg-[#FD5988]/90 text-white shadow-md hover:shadow-lg transition-all font-bold whitespace-nowrap"
            >
              Get Directions
            </a>
          </div>

          {/* Breadcrumbs */}
          <div className="flex items-center justify-center gap-3 text-sm font-bold text-navy-blue/40">
            <span
              className={step >= 1 ? "text-crimson-pink font-extrabold" : ""}
            >
              Service
            </span>
            <span>→</span>
            <span
              className={step >= 2 ? "text-crimson-pink font-extrabold" : ""}
            >
              Barber
            </span>
            <span>→</span>
            <span
              className={step >= 3 ? "text-crimson-pink font-extrabold" : ""}
            >
              Date
            </span>
            <span>→</span>
            <span
              className={step >= 4 ? "text-crimson-pink font-extrabold" : ""}
            >
              Time
            </span>
          </div>
        </div>

        {/* STEP 1: Select Service */}
        {step === 1 && (
          <div className="animate-in fade-in duration-500">
            <h2 className="text-xl font-extrabold mb-6 text-navy-blue">
              1. Select a Service
            </h2>

            {loading ? (
              <div className="text-center text-navy-blue/65 py-10 animate-pulse font-bold">
                Loading services...
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* RESTORED: Services mapping block */}
                {services.map((service) => (
                  <div
                    key={service.id}
                    onClick={() => {
                      setSelectedService(service.name);
                      setStep(2);
                    }}
                    className="p-6 rounded-2xl backdrop-blur-xl bg-white/20 border border-white/40 hover:border-crimson-pink hover:bg-white/45 hover:shadow-lg transition-all cursor-pointer flex justify-between items-center group shadow-sm"
                  >
                    <div>
                      <h3 className="text-lg font-bold text-navy-blue group-hover:text-crimson-pink transition-colors">
                        {service.name}
                      </h3>
                      <p className="text-sm text-navy-blue/70 mt-1 font-semibold">
                        {service.duration_minutes} min
                      </p>
                    </div>
                    <span className="text-xl font-extrabold text-[#FD5988]">
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
              <h2 className="text-xl font-extrabold text-navy-blue">
                2. Choose your Barber
              </h2>
              <button
                onClick={() => setStep(1)}
                className="text-sm font-bold text-navy-blue/70 hover:text-crimson-pink transition-colors"
              >
                ← Back to Services
              </button>
            </div>

            <div className="grid grid-cols-2 gap-6 mt-8">
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
              <h2 className="text-xl font-extrabold text-navy-blue">
                3. Select a Date
              </h2>
              <button
                onClick={() => setStep(2)}
                className="text-sm font-bold text-navy-blue/70 hover:text-crimson-pink transition-colors"
              >
                ← Back to Barbers
              </button>
            </div>

            <div className="backdrop-blur-xl bg-white/20 border border-white/40 rounded-2xl p-6 md:p-8 shadow-sm">
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
                            ? "bg-crimson-pink border-crimson-pink shadow-md text-white font-extrabold"
                            : "bg-white/45 border-white/40 hover:border-crimson-pink/50 text-navy-blue font-bold"
                        }`}
                    >
                      <span
                        className={`text-xs font-extrabold uppercase tracking-wider ${
                          isSelected ? "text-white" : "text-navy-blue/70"
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
                          isSelected ? "text-white/95" : "text-navy-blue/75"
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
                  className="px-8 py-3 rounded-full bg-[#FD5988] text-white hover:bg-[#FD5988]/90 hover:shadow-md font-bold transition-all"
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
              <h2 className="text-xl font-extrabold text-navy-blue">
                4. Select a Time
              </h2>
              <button
                onClick={() => setStep(3)}
                className="text-sm font-bold text-navy-blue/70 hover:text-crimson-pink transition-colors"
              >
                ← Back to Date
              </button>
            </div>

            <div className="backdrop-blur-xl bg-white/20 border border-white/40 rounded-2xl p-6 md:p-8 shadow-sm">
              <p className="mb-8 text-navy-blue text-center md:text-left font-bold text-lg">
                Booking{" "}
                <span className="font-extrabold text-[#FD5988]">
                  {selectedService}
                </span>{" "}
                with{" "}
                <span className="font-extrabold text-navy-blue">
                  {selectedBarber}
                </span>{" "}
                on{" "}
                <span className="font-extrabold text-navy-blue">
                  {formatDateLabel(selectedDate)}
                </span>
              </p>

              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {timeSlots.map((time, index) => (
                  <button
                    key={index}
                    disabled={isBooking}
                    onClick={() => handleBookAppointment(time)}
                    className="py-3.5 md:py-4 rounded-xl border border-white/40 bg-white/40 hover:bg-crimson-pink hover:border-[#FD5988] hover:text-white transition-all text-sm font-extrabold text-navy-blue shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
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
