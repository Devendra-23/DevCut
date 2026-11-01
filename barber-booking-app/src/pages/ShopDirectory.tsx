import { Link } from "react-router-dom";

export default function ShopDirectory() {
  const shops = [
    {
      id: "paanis-hair-studio",
      name: "Paani's Hair Studio",
      location: "Mumbai, Maharashtra",
      image: "✂️",
    },
  ];

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <div className="mb-12 text-center">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-3">
          Select a Barbershop
        </h1>
        <p className="text-neutral-400">
          Choose a location to book your appointment.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {shops.map((shop) => (
          <Link
            key={shop.id}
            to={`/${shop.id}`}
            className="p-6 rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 hover:border-neutral-500 transition-all cursor-pointer flex items-center gap-4 group"
          >
            <div className="text-4xl bg-black p-4 rounded-xl border border-white/10 group-hover:border-white/30 transition-all">
              {shop.image}
            </div>
            <div>
              <h3 className="text-xl font-semibold text-neutral-200 group-hover:text-white transition-colors">
                {shop.name}
              </h3>
              <p className="text-sm text-neutral-400">{shop.location}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
