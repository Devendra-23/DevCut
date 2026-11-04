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
    <div className="py-12">
      <div className="max-w-4xl mx-auto px-6">
        <div className="mb-12 text-center">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-3 text-navy-blue drop-shadow-sm">
            Select a Barbershop
          </h1>
          <p className="text-navy-blue/70">
            Choose a location to book your appointment.
          </p>
        </div>

        {loading ? (
          <div className="text-center text-navy-blue/60 py-10 animate-pulse">
            Loading shops...
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {shops.map((shop) => (
              <Link
                key={shop.id}
                to={`/${shop.slug}`}
                className="p-6 rounded-2xl backdrop-blur-md bg-navy-blue/5 border border-navy-blue/10 hover:border-crimson-pink hover:shadow-neon-glow transition-all cursor-pointer flex items-center gap-5 group"
              >
                <div className="text-4xl bg-navy-blue/10 p-4 rounded-xl border border-navy-blue/10 group-hover:border-crimson-pink/50 transition-all">
                  ✂️
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-navy-blue transition-colors">
                    {shop.name}
                  </h3>
                  <p className="text-sm text-navy-blue/70 mt-1">
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
