import { Link } from "react-router-dom";
import { ShimmerButton } from "@/components/ui/shimmer-button";
import { useAuth } from "../contexts/AuthContext";

export default function Home() {
  const { user, signOut } = useAuth();

  return (
    // The background is now completely transparent to let the Aurora gradients from MainLayout shine through
    <div className="relative min-h-[calc(100vh-80px)] flex flex-col justify-center overflow-hidden font-sans">
      {/* 
        Layout matches the reference image: Centered on mobile, elegant left-alignment on desktop 
      */}
      <div className="z-10 px-6 w-full max-w-7xl mx-auto flex flex-col items-center text-center md:items-start md:text-left">
        {/* Main Hero Typography - Mimicking the "Visionary Intelligence" contrast */}
        <h1 className="text-5xl md:text-[5.5rem] text-deep-navy tracking-tight mb-6 leading-[1.05]">
          <span className="block font-medium">Premium haircuts,</span>
          {/* Using light italic to mimic the elegant secondary font style from the reference */}
          <span className="block font-light italic mt-2 text-deep-navy/90">
            Effortless booking.
          </span>
        </h1>

        {/* Subtitle / Description Text */}
        <p className="mb-10 text-base md:text-lg text-deep-navy/70 max-w-lg font-medium leading-relaxed">
          Grooming redefined with expert precision. We craft tailored styles to
          supercharge your personal transformation.
        </p>

        {/* Glowing Pink Call to Action Button */}
        <Link to="/shops">
          <div className="rounded-full shadow-pink-glow transition-all hover:scale-105 hover:shadow-lg duration-300">
            <ShimmerButton
              background="#FF5A7A"
              shimmerColor="#ffffff"
              className="px-10 py-4"
            >
              <span className="whitespace-pre-wrap text-center text-base font-bold leading-none tracking-wide text-white lg:text-lg">
                Book Appointment
              </span>
            </ShimmerButton>
          </div>
        </Link>

        {/* Authentication State Display (Premium Frosted Glassmorphism) */}
        <div className="mt-20 text-sm text-deep-navy backdrop-blur-xl bg-white/40 p-6 rounded-2xl border border-white/60 shadow-glass-panel inline-block transition-all">
          {user ? (
            <div className="flex flex-col md:flex-row items-center gap-4">
              <p className="font-medium">
                Signed in as{" "}
                <span className="font-bold text-vibrant-pink">
                  {user.email}
                </span>
              </p>
              <div className="hidden md:block w-px h-4 bg-deep-navy/20"></div>
              <button
                onClick={signOut}
                className="text-deep-navy/60 hover:text-vibrant-pink transition-colors font-bold"
              >
                Log Out
              </button>
            </div>
          ) : (
            <p className="font-medium">
              Already a customer?{" "}
              <Link
                to="/auth"
                className="text-vibrant-pink hover:text-[#FF7B93] transition-colors font-bold ml-1"
              >
                Sign In
              </Link>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
