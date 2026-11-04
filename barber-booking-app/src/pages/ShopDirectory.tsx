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
    <div className="max-w-4xl mx-auto px-6 py-12 text-white">
      <div className="mb-12 text-center">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-3">
          Select a Barbershop
        </h1>
        <p className="text-neutral-400">
          Choose a location to book your appointment.
        </p>
      </div>

      {loading ? (
        <div className="text-center text-neutral-500 animate-pulse">
          Loading shops...
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {shops.map((shop) => (
            <Link
              key={shop.id}
              to={`/${shop.slug}`}
              className="p-6 rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 hover:border-neutral-500 transition-all cursor-pointer flex items-center gap-4 group"
            >
              <div className="text-4xl bg-black p-4 rounded-xl border border-white/10 group-hover:border-white/30 transition-all">
                ✂️
              </div>
              <div>
                <h3 className="text-xl font-semibold text-neutral-200 group-hover:text-white transition-colors">
                  {shop.name}
                </h3>
                <p className="text-sm text-neutral-400">{shop.address}</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
