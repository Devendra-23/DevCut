import { BrowserRouter, Routes, Route } from "react-router-dom";
import MainLayout from "@/layouts/MainLayout";
import Home from "@/pages/Home";
import BookingFlow from "@/pages/BookingFlow";
import ShopDirectory from "@/pages/ShopDirectory";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Wrap the routes in MainLayout so the Navbar shows on every page */}
        <Route element={<MainLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/shops" element={<ShopDirectory />} />
          <Route path="/:shop_slug" element={<BookingFlow />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
