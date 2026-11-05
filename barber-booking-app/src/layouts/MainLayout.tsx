import { Outlet, Link } from "react-router-dom";
import devLogo from "../assets/Dev.png";

export default function MainLayout() {
  return (
    <div className="min-h-screen font-sans flex flex-col relative overflow-hidden bg-[#F2F7FB] text-[#0A1930] transition-colors duration-500">
      {/* 
        VISIONARY AURORA BACKGROUND 
        Active on all pages to unify the aesthetic
      */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute -top-[20%] -left-[10%] w-[70%] h-[70%] rounded-full bg-[#B3CDE0] mix-blend-multiply filter blur-[120px] opacity-60" />
        <div className="absolute -bottom-[20%] -right-[10%] w-[60%] h-[80%] rounded-full bg-[#698FB8] mix-blend-multiply filter blur-[150px] opacity-70" />
        <div className="absolute top-[20%] right-[10%] w-[40%] h-[40%] rounded-full bg-[#E5D4ED] mix-blend-multiply filter blur-[100px] opacity-80" />
      </div>

      {/* 
        UNIFIED DARK NAVBAR 
        Forced to Deep Navy (#0A1930) with white text across the entire application
      */}
      <nav className="fixed top-0 w-full z-50 border-b border-white/10 bg-[#0A1930] backdrop-blur-xl shadow-md">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          {/* Brand Logo & Name */}
          <Link to="/" className="flex items-center gap-3 group">
            <img
              src={devLogo}
              alt="DevCut Logo"
              className="w-10 h-10 rounded-full border border-white/20 group-hover:border-[#FF5A7A] transition-all object-cover"
            />
            <span className="text-2xl font-bold tracking-tight text-white transition-colors duration-500">
              Dev<span className="text-[#FF5A7A]">Cut</span>
            </span>
          </Link>

          {/* Navigation Links */}
          <div className="flex gap-6 items-center">
            <Link
              to="/portal/login"
              className="text-sm font-semibold text-white/90 hover:text-[#FF5A7A] transition-colors duration-500"
            >
              Barber Portal
            </Link>
          </div>
        </div>
      </nav>

      {/* Page Content Layer */}
      <main className="flex-grow pt-20 relative z-10">
        <Outlet />
      </main>
    </div>
  );
}
