import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "../lib/supabase";

interface Service {
  id: string;
  name: string;
  price: number;
  duration_minutes: number;
}

export default function BookingFlow() {
  const { shop_slug } = useParams();

  // State to track booking progress
  const [step, setStep] = useState(1);
  const [selectedService, setSelectedService] = useState<string | null>(null);
  const [selectedBarber, setSelectedBarber] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  // Database State
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadShopServices() {
      if (!shop_slug) return;

      // 1. Find the shop ID based on the URL slug
      const { data: shopData } = await supabase
        .from("shops")
        .select("id")
        .eq("slug", shop_slug)
        .single();

      if (shopData) {
        // 2. Fetch only the services belonging to this specific shop
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

  // Format shop name from URL
  const formatShopName = (slug: string | undefined) => {
    if (slug === "panis-hair-studio") return "Pani's Hair Studio";
    if (!slug) return "Barbershop";
    return slug
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  const displayShopName = formatShopName(shop_slug);

  // REAL SHOP DATA pulled from Google Maps
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
    <div className="max-w-4xl mx-auto px-6 py-12">
      {/* Shop Info Header */}
      <div className="mb-10 text-center">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-4 capitalize">
          {displayShopName}
        </h1>

        <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-6 text-sm text-neutral-400 mb-8">
          <div className="flex items-center gap-3 max-w-sm text-center md:text-left">
            <span className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-white/5 border border-white/10">
              📍
            </span>
            <span className="leading-snug">{shopInfo.address}</span>
          </div>
          <div className="hidden md:block w-px h-10 bg-white/10"></div>
          <div className="flex items-center gap-3">
            <span className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-white/5 border border-white/10">
              🕒
            </span>
            <span className="whitespace-nowrap">{shopInfo.hours}</span>
          </div>
          <div className="hidden md:block w-px h-10 bg-white/10"></div>
          <a
            href={shopInfo.mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 md:mt-0 px-5 py-2 rounded-full bg-white text-black hover:bg-neutral-200 transition-colors font-semibold shadow-lg shadow-white/5 whitespace-nowrap"
          >
            Get Directions
          </a>
        </div>

        {/* Breadcrumbs */}
        <div className="flex items-center justify-center gap-2 text-sm text-neutral-500">
          <span className={step >= 1 ? "text-white font-medium" : ""}>
            Service
          </span>
          <span>→</span>
          <span className={step >= 2 ? "text-white font-medium" : ""}>
            Barber
          </span>
          <span>→</span>
          <span className={step >= 3 ? "text-white font-medium" : ""}>
            Date
          </span>
          <span>→</span>
          <span className={step >= 4 ? "text-white font-medium" : ""}>
            Time
          </span>
        </div>
      </div>

      {/* STEP 1: Select Service */}
      {step === 1 && (
        <div className="animate-in fade-in duration-500">
          <h2 className="text-xl font-semibold mb-6">1. Select a Service</h2>

          {loading ? (
            <div className="text-center text-neutral-500 py-10 animate-pulse">
              Loading services...
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {services.map((service) => (
                <div
                  key={service.id}
                  onClick={() => {
                    setSelectedService(service.name);
                    setStep(2);
                  }}
                  className="p-6 rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 hover:border-neutral-500 transition-all cursor-pointer flex justify-between items-center group"
                >
                  <div>
                    <h3 className="text-lg font-medium text-neutral-200 group-hover:text-white">
                      {service.name}
                    </h3>
                    <p className="text-sm text-neutral-400">
                      {service.duration_minutes} min
                    </p>
                  </div>
                  <span className="text-lg font-semibold text-white">
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
            <h2 className="text-xl font-semibold">2. Choose your Barber</h2>
            <button
              onClick={() => setStep(1)}
              className="text-sm text-neutral-400 hover:text-white"
            >
              ← Back to Services
            </button>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {barbers.map((barber) => (
              <div
                key={barber.id}
                onClick={() => {
                  setSelectedBarber(barber.name);
                  setStep(3);
                }}
                className="p-8 rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 hover:border-neutral-500 transition-all cursor-pointer flex flex-col items-center gap-3"
              >
                <span className="text-4xl">{barber.image}</span>
                <h3 className="text-xl font-medium text-white">
                  {barber.name}
                </h3>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* STEP 3: Select Date */}
      {step === 3 && (
        <div className="animate-in fade-in duration-500">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold">3. Select a Date</h2>
            <button
              onClick={() => setStep(2)}
              className="text-sm text-neutral-400 hover:text-white"
            >
              ← Back to Barbers
            </button>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <div className="flex gap-3 overflow-x-auto pb-4 snap-x">
              {availableDates.map((date, index) => {
                const isSelected =
                  date.toDateString() === selectedDate.toDateString();
                const isToday = index === 0;
                return (
                  <button
                    key={index}
                    onClick={() => setSelectedDate(date)}
                    className={`min-w-[100px] p-4 rounded-xl border snap-start transition-all flex flex-col items-center gap-1
                      ${
                        isSelected
                          ? "bg-white text-black border-white"
                          : "bg-black border-white/10 hover:border-white/30 text-white"
                      }`}
                  >
                    <span
                      className={`text-xs font-semibold uppercase ${
                        isSelected ? "text-neutral-600" : "text-neutral-400"
                      }`}
                    >
                      {isToday
                        ? "Today"
                        : date.toLocaleDateString("en-US", {
                            weekday: "short",
                          })}
                    </span>
                    <span className="text-xl font-bold">{date.getDate()}</span>
                    <span
                      className={`text-xs ${
                        isSelected ? "text-neutral-600" : "text-neutral-500"
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
                className="px-6 py-3 rounded-full bg-white text-black font-semibold hover:bg-neutral-200 transition-colors"
              >
                Continue to Time
              </button>
            </div>
          </div>
        </div>
      )}

      {/* STEP 4: Select Time */}
      {step === 4 && (
        <div className="animate-in fade-in duration-500">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold">4. Select a Time</h2>
            <button
              onClick={() => setStep(3)}
              className="text-sm text-neutral-400 hover:text-white"
            >
              ← Back to Date
            </button>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <p className="mb-6 text-neutral-300">
              Booking{" "}
              <span className="font-semibold text-white">
                {selectedService}
              </span>{" "}
              with{" "}
              <span className="font-semibold text-white">{selectedBarber}</span>{" "}
              on{" "}
              <span className="font-semibold text-white">
                {formatDateLabel(selectedDate)}
              </span>
            </p>

            <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {timeSlots.map((time, index) => (
                <button
                  key={index}
                  className="py-3 rounded-lg border border-white/10 bg-black hover:bg-white/10 hover:border-white/30 transition-all text-sm font-medium"
                >
                  {time}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
