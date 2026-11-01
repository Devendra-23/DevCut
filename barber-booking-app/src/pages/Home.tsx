import { Link } from "react-router-dom";
import { RetroGrid } from "@/components/ui/retro-grid";
import { ShimmerButton } from "@/components/ui/shimmer-button";

export default function Home() {
  return (
    <main className="relative min-h-screen flex flex-col items-center justify-center bg-black overflow-hidden">
      {/* Aesthetic Background Grid */}
      <RetroGrid className="z-0 opacity-50" />

      <div className="z-10 text-center flex flex-col items-center">
        {/* Title */}
        <h1 className="text-5xl md:text-7xl font-bold tracking-tighter text-white drop-shadow-lg">
          Dev<span className="text-neutral-500">Cut</span>
        </h1>

        {/* Subtitle */}
        <p className="mt-4 mb-8 text-lg text-neutral-400 max-w-lg mx-auto">
          Premium haircuts. Effortless booking. Powered by AI.
        </p>

        {/* Glowing Call to Action Button wrapped in a Link */}
        <Link to="/shops">
          <ShimmerButton className="shadow-2xl">
            <span className="whitespace-pre-wrap text-center text-sm font-medium leading-none tracking-tight text-white dark:from-white dark:to-slate-900/10 lg:text-lg">
              Book Appointment
            </span>
          </ShimmerButton>
        </Link>
      </div>
    </main>
  );
}
