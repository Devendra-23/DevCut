import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import MainLayout from "./layouts/MainLayout";
import Home from "./pages/Home";
import BookingFlow from "./pages/BookingFlow";
import ShopDirectory from "./pages/ShopDirectory";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import BarberPortal from "./pages/BarberPortal"; // <-- 1. Import the new portal

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<MainLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/shops" element={<ShopDirectory />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/portal" element={<BarberPortal />} />{" "}
            {/* <-- 2. Add the route HERE (above shop_slug) */}
            <Route path="/:shop_slug" element={<BookingFlow />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
