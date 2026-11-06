import { Outlet, Link } from "react-router-dom";
import devLogo from "../assets/Dev.png";
import { useAuth } from "../contexts/AuthContext";
export default function MainLayout() {
  const { user } = useAuth();
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
          <Link to="/" className="flex items-center gap-3 group">
            <img
              src={devLogo}
              alt="DevCut Logo"
              className="w-10 h-10 rounded-full border border-white/20 group-hover:border-sunshine-yellow group-hover:shadow-yellow-glow transition-all object-cover"
            />
            <span className="text-2xl font-bold tracking-tight text-white transition-colors duration-500">
              Dev<span className="text-rose-red">Cut</span>
            </span>
          </Link>

          <div className="flex gap-6 items-center">
            {/* Show Dashboard link ONLY if the user is logged in */}
            {user && (
              <Link
                to="/dashboard"
                className="text-sm font-semibold text-white/90 hover:text-sunshine-yellow transition-colors duration-500"
              >
                My Dashboard
              </Link>
            )}

            <Link
              to="/portal/login"
              className="text-sm font-semibold text-white/90 hover:text-sunshine-yellow transition-colors duration-500"
            >
              Barber Portal
            </Link>
          </div>
        </div>
      </nav>

      <main className="flex-grow pt-20 relative z-10">
        <Outlet />
      </main>
    </div>
  );
}
