import { Outlet, Link } from "react-router-dom";
import devLogo from "../assets/Dev.png";

export default function MainLayout() {
  return (
    <div className="min-h-screen font-sans flex flex-col bg-gradient-to-b from-[#DBF2FC] via-[#3a7da8] to-[#072D59] text-navy-blue selection:bg-crimson-pink selection:text-white">
      {/* Translucent Seal Blue Navbar */}
      <nav className="fixed top-0 w-full z-50 border-b border-navy-blue/10 bg-[#DBF2FC]/70 backdrop-blur-md shadow-sm">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          {/* Brand Logo & Name */}
          <Link to="/" className="flex items-center gap-3 group">
            <img
              src={devLogo}
              alt="DevCut Logo"
              className="w-10 h-10 rounded-full border border-navy-blue/20 group-hover:border-crimson-pink group-hover:shadow-neon-glow transition-all object-cover"
            />
            <span className="text-2xl font-bold tracking-tight text-navy-blue">
              Dev<span className="text-crimson-pink">Cut</span>
            </span>
          </Link>

          {/* Navigation Links */}
          <div className="flex gap-6 items-center">
            <Link
              to="/portal/login"
              className="text-sm font-semibold text-navy-blue/80 hover:text-crimson-pink transition-colors"
            >
              Barber Portal
            </Link>
          </div>
        </div>
      </nav>

      {/* Page Content */}
      <main className="flex-grow pt-20">
        <Outlet />
      </main>
    </div>
  );
}
