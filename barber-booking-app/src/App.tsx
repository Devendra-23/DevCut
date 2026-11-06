import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import MainLayout from "./layouts/MainLayout";
import Home from "./pages/Home";
import BookingFlow from "./pages/BookingFlow";
import ShopDirectory from "./pages/ShopDirectory";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard"; // New import

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<MainLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/shops" element={<ShopDirectory />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/dashboard" element={<Dashboard />} />{" "}
            {/* New route */}
            <Route path="/:shop_slug" element={<BookingFlow />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
