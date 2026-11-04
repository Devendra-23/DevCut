import { Link } from "react-router-dom";
import { RetroGrid } from "@/components/ui/retro-grid";
import { ShimmerButton } from "@/components/ui/shimmer-button";
import { useAuth } from "../contexts/AuthContext";

export default function Home() {
  const { user, signOut } = useAuth();

  return (
    <main className="relative min-h-screen flex flex-col items-center justify-center bg-navy-blue overflow-hidden font-sans">
      {/* Aesthetic Background Grid */}
      <RetroGrid className="z-0 opacity-20" />

      <div className="z-10 text-center flex flex-col items-center px-4">
        {/* Main Hero Typography Matching Mockup */}
        <h1 className="text-5xl md:text-7xl font-bold tracking-tight drop-shadow-lg mb-6 leading-[1.1]">
          <span className="block text-seal-blue">Premium haircuts,</span>
          <span className="block text-crimson-pink">Effortless booking.</span>
        </h1>

        {/* Subtitle / Description Text */}
        <p className="mb-10 text-sm md:text-base text-seal-blue/60 max-w-md mx-auto font-light">
          Grooming redefined with expert precision. We craft tailored styles to
          supercharge your personal transformation.
        </p>

        {/* Glowing Call to Action Button */}
        <Link to="/shops">
          {/* ShimmerButton wrapped with your new custom Tailwind classes */}
          <div className="rounded-full shadow-neon-glow transition-transform hover:scale-105 duration-300">
            <ShimmerButton
              background="#FD5988"
              shimmerColor="#ffffff"
              className="px-8 py-4"
            >
              <span className="whitespace-pre-wrap text-center text-base font-semibold leading-none tracking-tight text-white lg:text-lg">
                Book Appointment
              </span>
            </ShimmerButton>
          </div>
        </Link>

        {/* Authentication State Display (Glassmorphism effect) */}
        <div className="mt-16 text-sm text-seal-blue/70 backdrop-blur-md bg-white/5 p-5 rounded-2xl border border-white/10 shadow-glass-panel">
          {user ? (
            <div className="flex flex-col items-center gap-3">
              <p>
                Signed in as{" "}
                <span className="text-seal-blue font-medium">{user.email}</span>
              </p>
              <button
                onClick={signOut}
                className="text-seal-blue/50 hover:text-crimson-pink transition-colors font-medium"
              >
                Log Out
              </button>
            </div>
          ) : (
            <p>
              Already a customer?{" "}
              <Link
                to="/auth"
                className="text-crimson-pink hover:text-white transition-colors font-semibold ml-1"
              >
                Sign In
              </Link>
            </p>
          )}
        </div>
      </div>
    </main>
  );
}
