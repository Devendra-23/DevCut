import { Outlet, Link, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import devLogo from "../assets/Dev.png";
import { useAuth } from "../contexts/AuthContext";
import { supabase } from "../lib/supabase";

export default function MainLayout() {
  const { user } = useAuth();
  const [isBarber, setIsBarber] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  // Auto-close the mobile menu whenever the route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location]);

  // Check if the logged-in user is in the barbers database
  useEffect(() => {
    async function checkBarberStatus() {
      if (!user) {
        setIsBarber(false);
        return;
      }

      const { data, error } = await supabase
        .from("barbers")
        .select("id")
        .eq("user_id", user.id)
        .single(); // Look for a single matching record

      if (data) {
        setIsBarber(true); // They are a barber/owner!
      } else {
        setIsBarber(false);
      }
    }

    checkBarberStatus();
  }, [user]);

  return (
    <div className="min-h-screen font-sans flex flex-col relative overflow-hidden bg-warm-ivory text-saffron-cherry transition-colors duration-500">
      {/* VISIONARY AURORA BACKGROUND */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute -top-[10%] -left-[10%] w-[60%] h-[60%] rounded-full bg-[#6F0317]/25 filter blur-[120px]" />
        <div className="absolute -bottom-[10%] -right-[5%] w-[65%] h-[65%] rounded-full bg-[#E52150]/20 filter blur-[130px]" />
        <div className="absolute top-[35%] right-[20%] w-[35%] h-[35%] rounded-full bg-[#F4EB06]/20 filter blur-[100px]" />
      </div>

      {/* UNIFIED DARK NAVBAR */}
      <nav className="fixed top-0 w-full z-50 border-b border-white/10 bg-[#6F0317] backdrop-blur-xl shadow-md">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 group z-50">
            <img
              src={devLogo}
              alt="DevCut Logo"
              className="w-10 h-10 rounded-full border border-white/20 group-hover:border-sunshine-yellow group-hover:shadow-yellow-glow transition-all object-cover"
            />
            <span className="text-2xl font-bold tracking-tight text-white transition-colors duration-500">
              Dev<span className="text-rose-red">Cut</span>
            </span>
          </Link>

          {/* DESKTOP NAVIGATION (Hidden on mobile) */}
          <div className="hidden md:flex gap-6 items-center">
            {user && (
              <>
                <Link
                  to="/dashboard"
                  className="text-sm font-semibold text-white/90 hover:text-sunshine-yellow transition-colors duration-500"
                >
                  My Dashboard
                </Link>
                <Link
                  to="/profile"
                  className="text-sm font-semibold text-white/90 hover:text-sunshine-yellow transition-colors duration-500"
                >
                  Profile
                </Link>
              </>
            )}

            {isBarber ? (
              <Link
                to="/portal"
                className="text-sm font-semibold text-white/90 hover:text-sunshine-yellow transition-colors duration-500"
              >
                Barber Portal
              </Link>
            ) : (
              !user && (
                <Link
                  to="/auth"
                  className="text-sm font-semibold text-white/90 hover:text-sunshine-yellow transition-colors duration-500"
                >
                  Sign In
                </Link>
              )
            )}
          </div>

          {/* MOBILE MENU TOGGLE BUTTON (Hidden on desktop) */}
          <button
            className="md:hidden text-white/90 hover:text-sunshine-yellow focus:outline-none z-50 transition-colors"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? (
              <svg
                className="w-8 h-8"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            ) : (
              <svg
                className="w-8 h-8"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            )}
          </button>
        </div>

        {/* MOBILE SLIDE-DOWN DROPDOWN */}
        {isMobileMenuOpen && (
          <div className="md:hidden absolute top-20 left-0 w-full bg-[#6F0317] border-b border-white/10 shadow-2xl animate-in slide-in-from-top-2 duration-300 z-40">
            <div className="flex flex-col px-6 py-6 space-y-5">
              {user && (
                <>
                  <Link
                    to="/dashboard"
                    className="text-lg font-bold text-white/90 hover:text-sunshine-yellow transition-colors"
                  >
                    My Dashboard
                  </Link>
                  <Link
                    to="/profile"
                    className="text-lg font-bold text-white/90 hover:text-sunshine-yellow transition-colors"
                  >
                    Profile
                  </Link>
                </>
              )}

              {isBarber ? (
                <Link
                  to="/portal"
                  className="text-lg font-bold text-white/90 hover:text-sunshine-yellow transition-colors"
                >
                  Barber Portal
                </Link>
              ) : (
                !user && (
                  <Link
                    to="/auth"
                    className="text-lg font-bold text-white/90 hover:text-sunshine-yellow transition-colors"
                  >
                    Sign In
                  </Link>
                )
              )}
            </div>
          </div>
        )}
      </nav>

      <main className="flex-grow pt-20 relative z-10">
        <Outlet />
      </main>
    </div>
  );
}
