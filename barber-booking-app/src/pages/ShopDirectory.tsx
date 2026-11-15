import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../lib/supabase";

interface Shop {
  id: string;
  slug: string;
  name: string;
  address: string;
}

export default function ShopDirectory() {
  const [shops, setShops] = useState<Shop[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchShops() {
      const { data, error } = await supabase.from("shops").select("*");

      if (error) {
        console.error("Error fetching shops:", error.message);
      } else if (data) {
        setShops(data);
      }
      setLoading(false);
    }

    fetchShops();
  }, []);

  return (
    <div className="py-12 md:py-16 text-saffron-cherry">
      <div className="max-w-4xl mx-auto px-6">
        {/* RESPONSIVE HEADER */}
        <div className="mb-10 md:mb-12 text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-3 text-saffron-cherry drop-shadow-sm">
            Select a Barbershop
          </h1>
          <p className="text-saffron-cherry/80 text-base md:text-lg font-semibold">
            Choose a location to book your appointment.
          </p>
        </div>

        {loading ? (
          <div className="text-center text-saffron-cherry/60 py-10 animate-pulse font-bold">
            Loading shops...
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            {shops.map((shop) => (
              <Link
                key={shop.id}
                to={`/${shop.slug}`}
                // NEW: active:scale-[0.98] creates a native app "tap" effect on mobile
                className="p-5 md:p-6 rounded-2xl backdrop-blur-xl bg-white/60 border border-white/80 hover:border-rose-red hover:bg-white/80 hover:shadow-rose-glow shadow-glass-panel transition-all duration-200 active:scale-[0.98] cursor-pointer flex items-center gap-4 md:gap-5 group"
              >
                <div className="text-3xl bg-saffron-cherry/10 p-4 rounded-xl border border-saffron-cherry/20 group-hover:border-rose-red/50 transition-all flex-shrink-0">
                  ✂️
                </div>
                <div>
                  <h3 className="text-xl font-bold text-saffron-cherry group-hover:text-rose-red transition-colors">
                    {shop.name}
                  </h3>
                  <p className="text-xs md:text-sm text-saffron-cherry/70 mt-1 font-semibold leading-relaxed">
                    {shop.address}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
