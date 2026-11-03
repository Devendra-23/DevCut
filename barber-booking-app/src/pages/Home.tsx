import { Link } from "react-router-dom";
import { RetroGrid } from "@/components/ui/retro-grid";
import { ShimmerButton } from "@/components/ui/shimmer-button";
import { useAuth } from "../contexts/AuthContext";

export default function Home() {
  const { user, signOut } = useAuth(); // Pulling in your active session

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
          Premium haircuts, Effortless booking.
        </p>

        {/* Glowing Call to Action Button */}
        <Link to="/shops">
          <ShimmerButton className="shadow-2xl">
            <span className="whitespace-pre-wrap text-center text-sm font-medium leading-none tracking-tight text-white dark:from-white dark:to-slate-900/10 lg:text-lg">
              Book Appointment
            </span>
          </ShimmerButton>
        </Link>

        {/* Authentication State Display */}
        <div className="mt-12 text-sm text-neutral-400">
          {user ? (
            <div className="flex flex-col items-center gap-2">
              <p>
                Signed in as{" "}
                <span className="text-white font-medium">{user.email}</span>
              </p>
              <button
                onClick={signOut}
                className="text-neutral-500 hover:text-red-400 transition-colors"
              >
                Log Out
              </button>
            </div>
          ) : (
            <p>
              Already a customer?{" "}
              <Link to="/auth" className="text-white hover:underline">
                Sign In
              </Link>
            </p>
          )}
        </div>
      </div>
    </main>
  );
}
