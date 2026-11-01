import { Outlet, Link } from "react-router-dom";

export default function MainLayout() {
  return (
    <div className="min-h-screen bg-black text-white font-sans flex flex-col">
      {/* Glassmorphism Navbar */}
      <nav className="fixed top-0 w-full z-50 border-b border-white/10 bg-black/50 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" className="text-xl font-bold tracking-tighter">
            Dev<span className="text-neutral-500">Cut</span>
          </Link>
          <div className="flex gap-4">
            <Link
              to="/portal/login"
              className="text-sm text-neutral-400 hover:text-white transition-colors"
            >
              Barber Portal
            </Link>
          </div>
        </div>
      </nav>

      {/* Page Content goes here */}
      <main className="flex-grow pt-16">
        <Outlet />
      </main>
    </div>
  );
}
