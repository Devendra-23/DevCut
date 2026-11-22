import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { useAuth } from "../contexts/AuthContext";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

interface Booking {
  id: string;
  shop_id: string;
  user_id?: string;
  service_name: string;
  barber_name: string;
  booking_date: string;
  booking_time: string;
  status: string;
  rearrange_count: number;
}

interface Service {
  id: string;
  name: string;
  price: number;
  duration_minutes: number;
}

interface TeamMember {
  id: string;
  name: string;
  image: string;
  is_owner: boolean;
  email?: string | null;
}

const CHART_COLORS = ["#E52150", "#F4EB06", "#6F0317", "#fb7185", "#fca5a5"];

export default function BarberPortal() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<
    "upcoming" | "past" | "manage" | "analytics"
  >("upcoming");

  const [barberName, setBarberName] = useState<string>("");
  const [isOwner, setIsOwner] = useState(false);
  const [shopId, setShopId] = useState("");

  const [shopDetails, setShopDetails] = useState({
    name: "",
    address: "",
    hours: "",
  });
  const [services, setServices] = useState<Service[]>([]);
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  // New Team Member State
  const [newBarberName, setNewBarberName] = useState("");
  const [newBarberEmail, setNewBarberEmail] = useState("");
  const [newBarberImage, setNewBarberImage] = useState("🧔‍♂️");

  // New Service State
  const [newServiceName, setNewServiceName] = useState("");
  const [newServicePrice, setNewServicePrice] = useState("");
  const [newServiceDuration, setNewServiceDuration] = useState("");

  useEffect(() => {
    async function fetchPortalData() {
      if (!user) return;

      const { data: barberData, error: barberError } = await supabase
        .from("barbers")
        .select("name, shop_id, is_owner")
        .eq("user_id", user.id)
        .single();

      if (barberError || !barberData) {
        setLoading(false);
        return;
      }

      setBarberName(barberData.name);
      setIsOwner(barberData.is_owner || false);
      setShopId(barberData.shop_id);

      // If owner, fetch ALL shop bookings. If just a barber, fetch only theirs.
      let query = supabase
        .from("bookings")
        .select("*")
        .order("booking_date", { ascending: true })
        .order("booking_time", { ascending: true });

      if (barberData.is_owner) {
        query = query.eq("shop_id", barberData.shop_id);
      } else {
        query = query.eq("barber_name", barberData.name);
      }

      const { data: bookingData } = await query;
      if (bookingData) setBookings(bookingData);

      if (barberData.is_owner) {
        const { data: shopData } = await supabase
          .from("shops")
          .select("name, address, hours")
          .eq("id", barberData.shop_id)
          .single();

        if (shopData) {
          setShopDetails({
            name: shopData.name,
            address: shopData.address || "",
            hours: shopData.hours || "",
          });
        }

        const { data: servicesData } = await supabase
          .from("services")
          .select("*")
          .eq("shop_id", barberData.shop_id)
          .order("price", { ascending: false });

        if (servicesData) setServices(servicesData);

        const { data: teamData } = await supabase
          .from("barbers")
          .select("id, name, image, is_owner, email")
          .eq("shop_id", barberData.shop_id)
          .order("created_at", { ascending: true });

        if (teamData) setTeam(teamData);
      }

      setLoading(false);
    }

    fetchPortalData();
  }, [user]);

  const today = new Date().toISOString().split("T")[0];
  const upcomingBookings = bookings.filter(
    (b) =>
      b.booking_date >= today &&
      b.status !== "cancelled" &&
      b.status !== "cancelled_by_barber"
  );
  const pastBookings = bookings.filter(
    (b) =>
      b.booking_date < today ||
      b.status === "cancelled" ||
      b.status === "cancelled_by_barber"
  );
  const displayBookings =
    activeTab === "upcoming" ? upcomingBookings : pastBookings;

  const getDisplayStatus = (booking: Booking) => {
    if (
      booking.status === "cancelled" ||
      booking.status === "cancelled_by_barber"
    )
      return "CANCELLED";
    if (booking.booking_date < today) return "COMPLETED";
    return "CONFIRMED";
  };

  const handleBarberCancel = async (bookingId: string) => {
    const confirmCancel = window.confirm(
      "Are you sure you want to cancel this customer's appointment?"
    );
    if (!confirmCancel) return;
    try {
      const { error } = await supabase
        .from("bookings")
        .update({ status: "cancelled_by_barber" })
        .eq("id", bookingId);
      if (error) throw error;
      setBookings((prev) =>
        prev.map((b) =>
          b.id === bookingId ? { ...b, status: "cancelled_by_barber" } : b
        )
      );
    } catch (err: any) {
      alert("Failed to cancel: " + err.message);
    }
  };

  // Setup Admin handlers (Save Shop, Add Service, Add Team)
  const handleSaveShopDetails = async () => {
    if (!shopId) return;
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from("shops")
        .update({
          name: shopDetails.name,
          address: shopDetails.address,
          hours: shopDetails.hours,
        })
        .eq("id", shopId);
      if (error) throw error;
      alert("Shop details updated successfully!");
    } catch (err: any) {
      alert("Error updating shop: " + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdateServicePrice = async (
    serviceId: string,
    newPrice: number
  ) => {
    try {
      const { error } = await supabase
        .from("services")
        .update({ price: newPrice })
        .eq("id", serviceId);
      if (error) throw error;
      setServices((prev) =>
        prev.map((s) => (s.id === serviceId ? { ...s, price: newPrice } : s))
      );
    } catch (err: any) {
      alert("Failed to update price: " + err.message);
    }
  };

  const handleAddService = async () => {
    if (!newServiceName || !newServicePrice || !newServiceDuration || !shopId)
      return;
    setIsSaving(true);
    try {
      const { data, error } = await supabase
        .from("services")
        .insert([
          {
            shop_id: shopId,
            name: newServiceName,
            price: Number(newServicePrice),
            duration_minutes: Number(newServiceDuration),
          },
        ])
        .select()
        .single();
      if (error) throw error;
      setServices((prev) => [...prev, data]);
      setNewServiceName("");
      setNewServicePrice("");
      setNewServiceDuration("");
      alert(`${newServiceName} has been successfully added to your menu!`);
    } catch (err: any) {
      alert("Failed to add service: " + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddTeamMember = async () => {
    if (!newBarberName.trim() || !newBarberEmail.trim() || !shopId) return;
    setIsSaving(true);
    try {
      const { data, error } = await supabase
        .from("barbers")
        .insert([
          {
            shop_id: shopId,
            name: newBarberName.trim(),
            email: newBarberEmail.trim(),
            image: newBarberImage,
            is_owner: false,
          },
        ])
        .select()
        .single();
      if (error) throw error;
      setTeam((prev) => [...prev, data]);
      setNewBarberName("");
      setNewBarberEmail("");
      alert(`${newBarberName.trim()} has been successfully added to the team!`);
    } catch (err: any) {
      alert("Failed to add team member: " + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleRemoveTeamMember = async (barberId: string, name: string) => {
    const confirmDelete = window.confirm(
      `Are you sure you want to remove ${name}?`
    );
    if (!confirmDelete) return;
    try {
      const { error } = await supabase
        .from("barbers")
        .delete()
        .eq("id", barberId);
      if (error) throw error;
      setTeam((prev) => prev.filter((member) => member.id !== barberId));
    } catch (err: any) {
      alert("Failed to remove barber: " + err.message);
    }
  };

  // --- ANALYTICS ENGINE LOGIC ---
  const calculateAnalytics = () => {
    let totalRevenue = 0;
    let completedAppointments = 0;
    let cancelledAppointments = 0;

    const revenueByService: Record<string, number> = {};
    const revenueByDate: Record<string, number> = {};

    bookings.forEach((booking) => {
      const isCancelled =
        booking.status === "cancelled" ||
        booking.status === "cancelled_by_barber";
      if (isCancelled) {
        cancelledAppointments++;
        return;
      }
      if (booking.booking_date < today) {
        completedAppointments++;
        // Find price
        const service = services.find((s) => s.name === booking.service_name);
        const price = service ? service.price : 0;
        totalRevenue += price;

        // Group by service
        revenueByService[booking.service_name] =
          (revenueByService[booking.service_name] || 0) + price;

        // Group by date
        revenueByDate[booking.booking_date] =
          (revenueByDate[booking.booking_date] || 0) + price;
      }
    });

    const pieData = Object.keys(revenueByService)
      .map((key) => ({
        name: key,
        value: revenueByService[key],
      }))
      .sort((a, b) => b.value - a.value);

    // Sort dates chronologically for the bar chart
    const barData = Object.keys(revenueByDate)
      .sort()
      .map((date) => ({
        date: new Date(date).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        }),
        revenue: revenueByDate[date],
      }))
      .slice(-14); // Last 14 active days

    const cancellationRate =
      bookings.length > 0
        ? Math.round((cancelledAppointments / bookings.length) * 100)
        : 0;

    return {
      totalRevenue,
      completedAppointments,
      cancellationRate,
      pieData,
      barData,
    };
  };

  const analytics = calculateAnalytics();

  return (
    <div className="pt-12 pb-24 text-saffron-cherry">
      <div className="max-w-6xl mx-auto px-6">
        <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-3 text-saffron-cherry drop-shadow-sm">
              {barberName ? `${barberName}'s Portal` : "Barber Portal"}
            </h1>
            <p className="text-saffron-cherry/80 text-lg font-semibold">
              {isOwner
                ? "Manage your schedule, shop settings, and analytics."
                : "Manage your daily schedule and upcoming cuts."}
            </p>
          </div>

          {/* RESPONSIVE SCROLLABLE TAB ROW */}
          <div className="flex bg-white/40 backdrop-blur-md p-1.5 rounded-3xl md:rounded-full border border-white/60 shadow-sm gap-1 overflow-x-auto hide-scrollbar whitespace-nowrap">
            <button
              onClick={() => setActiveTab("upcoming")}
              className={`px-6 py-2.5 rounded-full font-bold text-sm transition-all flex-shrink-0 ${
                activeTab === "upcoming"
                  ? "bg-rose-red text-white shadow-rose-glow"
                  : "text-saffron-cherry hover:bg-white/50"
              }`}
            >
              Upcoming
            </button>
            <button
              onClick={() => setActiveTab("past")}
              className={`px-6 py-2.5 rounded-full font-bold text-sm transition-all flex-shrink-0 ${
                activeTab === "past"
                  ? "bg-rose-red text-white shadow-rose-glow"
                  : "text-saffron-cherry hover:bg-white/50"
              }`}
            >
              Past
            </button>
            {isOwner && (
              <>
                <button
                  onClick={() => setActiveTab("manage")}
                  className={`px-6 py-2.5 rounded-full font-bold text-sm transition-all flex items-center gap-2 flex-shrink-0 ${
                    activeTab === "manage"
                      ? "bg-sunshine-yellow text-saffron-cherry shadow-yellow-glow"
                      : "text-saffron-cherry hover:bg-white/50"
                  }`}
                >
                  Manage ⚙️
                </button>
                <button
                  onClick={() => setActiveTab("analytics")}
                  className={`px-6 py-2.5 rounded-full font-bold text-sm transition-all flex items-center gap-2 flex-shrink-0 ${
                    activeTab === "analytics"
                      ? "bg-[#6F0317] text-white shadow-md"
                      : "text-saffron-cherry hover:bg-white/50"
                  }`}
                >
                  Analytics 📊
                </button>
              </>
            )}
          </div>
        </div>

        {loading ? (
          <div className="text-center text-saffron-cherry/60 py-10 animate-pulse font-bold">
            Loading portal...
          </div>
        ) : activeTab === "analytics" && isOwner ? (
          /* --- ANALYTICS DASHBOARD --- */
          <div className="animate-in fade-in duration-500">
            {/* Top KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="p-6 rounded-2xl backdrop-blur-xl bg-white/60 border border-white/80 shadow-glass-panel">
                <p className="text-sm font-extrabold text-saffron-cherry/70 uppercase tracking-wide mb-1">
                  Total Revenue
                </p>
                <h3 className="text-4xl font-black text-rose-red">
                  ₹{analytics.totalRevenue.toLocaleString()}
                </h3>
                <p className="text-xs font-bold text-saffron-cherry/60 mt-2">
                  From completed appointments
                </p>
              </div>
              <div className="p-6 rounded-2xl backdrop-blur-xl bg-white/60 border border-white/80 shadow-glass-panel">
                <p className="text-sm font-extrabold text-saffron-cherry/70 uppercase tracking-wide mb-1">
                  Completed Cuts
                </p>
                <h3 className="text-4xl font-black text-saffron-cherry">
                  {analytics.completedAppointments}
                </h3>
                <p className="text-xs font-bold text-saffron-cherry/60 mt-2">
                  Lifetime successful bookings
                </p>
              </div>
              <div className="p-6 rounded-2xl backdrop-blur-xl bg-white/60 border border-white/80 shadow-glass-panel">
                <p className="text-sm font-extrabold text-saffron-cherry/70 uppercase tracking-wide mb-1">
                  Cancellation Rate
                </p>
                <h3 className="text-4xl font-black text-saffron-cherry">
                  {analytics.cancellationRate}%
                </h3>
                <p className="text-xs font-bold text-saffron-cherry/60 mt-2">
                  Of total scheduled appointments
                </p>
              </div>
            </div>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Daily Revenue Bar Chart */}
              <div className="p-6 rounded-2xl backdrop-blur-xl bg-white/60 border border-white/80 shadow-glass-panel">
                <h2 className="text-xl font-bold mb-6 text-saffron-cherry">
                  Revenue Timeline (Last 14 Active Days)
                </h2>
                {analytics.barData.length > 0 ? (
                  <div className="h-72 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={analytics.barData}
                        margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                      >
                        <XAxis
                          dataKey="date"
                          stroke="#6F0317"
                          fontSize={12}
                          tickLine={false}
                          axisLine={false}
                        />
                        <YAxis
                          stroke="#6F0317"
                          fontSize={12}
                          tickLine={false}
                          axisLine={false}
                          tickFormatter={(val) => `₹${val}`}
                        />
                        <RechartsTooltip
                          cursor={{ fill: "rgba(244, 235, 6, 0.2)" }}
                          contentStyle={{
                            borderRadius: "12px",
                            border: "none",
                            boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                            fontWeight: "bold",
                            color: "#6F0317",
                          }}
                        />
                        <Bar
                          dataKey="revenue"
                          fill="#E52150"
                          radius={[6, 6, 0, 0]}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="h-72 flex items-center justify-center text-saffron-cherry/50 font-bold">
                    No revenue data yet.
                  </div>
                )}
              </div>

              {/* Service Distribution Pie Chart */}
              <div className="p-6 rounded-2xl backdrop-blur-xl bg-white/60 border border-white/80 shadow-glass-panel">
                <h2 className="text-xl font-bold mb-6 text-saffron-cherry">
                  Revenue by Service
                </h2>
                {analytics.pieData.length > 0 ? (
                  <div className="h-72 w-full flex flex-col md:flex-row items-center">
                    <div className="w-full md:w-1/2 h-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={analytics.pieData}
                            innerRadius={60}
                            outerRadius={90}
                            paddingAngle={5}
                            dataKey="value"
                            stroke="none"
                          >
                            {analytics.pieData.map((_, index) => (
                              <Cell
                                key={`cell-${index}`}
                                fill={CHART_COLORS[index % CHART_COLORS.length]}
                              />
                            ))}
                          </Pie>
                          <RechartsTooltip
                            formatter={(value: number) => `₹${value}`}
                            contentStyle={{
                              borderRadius: "12px",
                              border: "none",
                              boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                              fontWeight: "bold",
                            }}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>

                    {/* Custom Legend */}
                    <div className="w-full md:w-1/2 mt-4 md:mt-0 flex flex-col gap-3">
                      {analytics.pieData.map((entry, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between"
                        >
                          <div className="flex items-center gap-2">
                            <div
                              className="w-3 h-3 rounded-full"
                              style={{
                                backgroundColor:
                                  CHART_COLORS[index % CHART_COLORS.length],
                              }}
                            ></div>
                            <span className="text-sm font-bold text-saffron-cherry truncate max-w-[120px]">
                              {entry.name}
                            </span>
                          </div>
                          <span className="text-sm font-extrabold text-rose-red">
                            ₹{entry.value}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="h-72 flex items-center justify-center text-saffron-cherry/50 font-bold">
                    No service data yet.
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : activeTab === "manage" && isOwner ? (
          /* --- MANAGE SHOP SETTINGS --- */
          <div className="animate-in fade-in duration-500">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              <div className="p-8 rounded-2xl backdrop-blur-xl bg-white/60 border border-white/80 shadow-glass-panel">
                <h2 className="text-2xl font-bold mb-6 text-saffron-cherry">
                  Shop Details
                </h2>
                <div className="space-y-5">
                  <div>
                    <label className="block text-sm font-extrabold text-saffron-cherry/70 mb-2 uppercase tracking-wide">
                      Shop Name
                    </label>
                    <input
                      type="text"
                      value={shopDetails.name}
                      onChange={(e) =>
                        setShopDetails({ ...shopDetails, name: e.target.value })
                      }
                      className="w-full px-4 py-3 rounded-xl bg-white/70 border border-white/80 text-saffron-cherry font-bold focus:outline-none focus:ring-2 focus:ring-rose-red/50 transition-all shadow-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-extrabold text-saffron-cherry/70 mb-2 uppercase tracking-wide">
                      Public Address
                    </label>
                    <input
                      type="text"
                      value={shopDetails.address}
                      onChange={(e) =>
                        setShopDetails({
                          ...shopDetails,
                          address: e.target.value,
                        })
                      }
                      className="w-full px-4 py-3 rounded-xl bg-white/70 border border-white/80 text-saffron-cherry font-bold focus:outline-none focus:ring-2 focus:ring-rose-red/50 transition-all shadow-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-extrabold text-saffron-cherry/70 mb-2 uppercase tracking-wide">
                      Business Hours
                    </label>
                    <input
                      type="text"
                      value={shopDetails.hours}
                      onChange={(e) =>
                        setShopDetails({
                          ...shopDetails,
                          hours: e.target.value,
                        })
                      }
                      placeholder="e.g., Tue-Sun: 9:30 AM - 10:00 PM"
                      className="w-full px-4 py-3 rounded-xl bg-white/70 border border-white/80 text-saffron-cherry font-bold focus:outline-none focus:ring-2 focus:ring-rose-red/50 transition-all shadow-sm"
                    />
                  </div>
                  <button
                    onClick={handleSaveShopDetails}
                    disabled={isSaving}
                    className="mt-4 w-full py-3 rounded-xl bg-rose-red text-white font-bold shadow-rose-glow hover:bg-[#C91A44] transition-all disabled:opacity-50"
                  >
                    {isSaving ? "Saving..." : "Save Shop Details"}
                  </button>
                </div>
              </div>

              <div className="p-8 rounded-2xl backdrop-blur-xl bg-white/60 border border-white/80 shadow-glass-panel flex flex-col">
                <h2 className="text-2xl font-bold mb-6 text-saffron-cherry">
                  Service Menu & Pricing
                </h2>
                <div className="space-y-4 max-h-[250px] overflow-y-auto pr-2 custom-scrollbar flex-grow">
                  {services.map((service) => (
                    <div
                      key={service.id}
                      className="p-4 rounded-xl bg-white/50 border border-white/60 flex items-center justify-between"
                    >
                      <div>
                        <h3 className="font-bold text-saffron-cherry">
                          {service.name}
                        </h3>
                        <p className="text-xs font-semibold text-saffron-cherry/60">
                          {service.duration_minutes} mins
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-black text-rose-red">₹</span>
                        <input
                          type="number"
                          defaultValue={service.price}
                          onBlur={(e) => {
                            const newPrice = Number(e.target.value);
                            if (newPrice !== service.price) {
                              handleUpdateServicePrice(service.id, newPrice);
                            }
                          }}
                          className="w-20 px-3 py-1.5 rounded-lg bg-white/80 border border-rose-red/20 font-bold text-saffron-cherry focus:outline-none focus:border-rose-red"
                        />
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-6 pt-6 border-t border-saffron-cherry/10">
                  <h3 className="text-sm font-extrabold text-saffron-cherry/70 uppercase tracking-wide mb-4">
                    Add New Service
                  </h3>
                  <div className="flex flex-col sm:flex-row gap-3 mb-4">
                    <input
                      type="text"
                      placeholder="Service Name"
                      value={newServiceName}
                      onChange={(e) => setNewServiceName(e.target.value)}
                      className="w-full sm:w-1/2 px-4 py-2.5 rounded-xl bg-white/70 border border-white/80 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-rose-red/50 transition-all shadow-sm"
                    />
                    <div className="flex gap-3 w-full sm:w-1/2">
                      <input
                        type="number"
                        placeholder="₹ Price"
                        value={newServicePrice}
                        onChange={(e) => setNewServicePrice(e.target.value)}
                        className="w-1/2 px-4 py-2.5 rounded-xl bg-white/70 border border-white/80 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-rose-red/50 transition-all shadow-sm"
                      />
                      <input
                        type="number"
                        placeholder="Mins"
                        value={newServiceDuration}
                        onChange={(e) => setNewServiceDuration(e.target.value)}
                        className="w-1/2 px-4 py-2.5 rounded-xl bg-white/70 border border-white/80 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-rose-red/50 transition-all shadow-sm"
                      />
                    </div>
                  </div>
                  <button
                    onClick={handleAddService}
                    disabled={
                      isSaving ||
                      !newServiceName ||
                      !newServicePrice ||
                      !newServiceDuration
                    }
                    className="w-full py-2.5 rounded-xl bg-sunshine-yellow text-saffron-cherry font-bold text-sm hover:shadow-yellow-glow disabled:opacity-50 transition-all"
                  >
                    {isSaving ? "Adding..." : "+ Add to Menu"}
                  </button>
                </div>
              </div>
            </div>

            <div className="p-8 rounded-2xl backdrop-blur-xl bg-white/60 border border-white/80 shadow-glass-panel">
              <h2 className="text-2xl font-bold mb-6 text-saffron-cherry">
                Team Management
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <h3 className="text-sm font-extrabold text-saffron-cherry/70 uppercase tracking-wide mb-3">
                    Current Staff
                  </h3>
                  {team.map((member) => (
                    <div
                      key={member.id}
                      className="p-4 rounded-xl bg-white/50 border border-white/60 flex items-center justify-between"
                    >
                      <div className="flex items-center gap-4">
                        <span className="text-2xl bg-white/80 w-12 h-12 flex items-center justify-center rounded-full shadow-sm">
                          {member.image}
                        </span>
                        <div>
                          <h3 className="font-bold text-saffron-cherry">
                            {member.name}
                          </h3>
                          <p className="text-xs font-semibold text-rose-red">
                            {member.is_owner ? "Shop Admin" : "Barber"}
                          </p>
                          <p className="text-xs font-medium text-saffron-cherry/60">
                            {member.email || "No notification email"}
                          </p>
                        </div>
                      </div>
                      {!member.is_owner && (
                        <button
                          onClick={() =>
                            handleRemoveTeamMember(member.id, member.name)
                          }
                          className="text-xs font-bold text-rose-red/70 hover:text-rose-red px-3 py-1.5 rounded-lg border border-rose-red/20 hover:bg-rose-red/10 transition-all"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                <div className="p-6 rounded-xl bg-saffron-cherry/5 border border-saffron-cherry/10">
                  <h3 className="text-sm font-extrabold text-saffron-cherry/70 uppercase tracking-wide mb-4">
                    Add New Barber
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-saffron-cherry/70 mb-1">
                        Barber Name
                      </label>
                      <input
                        type="text"
                        value={newBarberName}
                        onChange={(e) => setNewBarberName(e.target.value)}
                        placeholder="e.g. Rahul"
                        className="w-full px-4 py-2.5 rounded-xl bg-white/70 border border-white/80 text-saffron-cherry font-bold focus:outline-none focus:ring-2 focus:ring-rose-red/50 transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-saffron-cherry/70 mb-1">
                        Barber Email (for booking alerts)
                      </label>
                      <input
                        type="email"
                        value={newBarberEmail}
                        onChange={(e) => setNewBarberEmail(e.target.value)}
                        placeholder="e.g. rahul@gmail.com"
                        className="w-full px-4 py-2.5 rounded-xl bg-white/70 border border-white/80 text-saffron-cherry font-bold focus:outline-none focus:ring-2 focus:ring-rose-red/50 transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-saffron-cherry/70 mb-1">
                        Avatar / Emoji
                      </label>
                      <input
                        type="text"
                        value={newBarberImage}
                        onChange={(e) => setNewBarberImage(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl bg-white/70 border border-white/80 text-saffron-cherry font-bold focus:outline-none focus:ring-2 focus:ring-rose-red/50 transition-all"
                      />
                    </div>
                    <button
                      onClick={handleAddTeamMember}
                      disabled={
                        isSaving ||
                        !newBarberName.trim() ||
                        !newBarberEmail.trim()
                      }
                      className="w-full py-2.5 rounded-xl bg-sunshine-yellow text-saffron-cherry font-bold hover:shadow-yellow-glow disabled:opacity-50 transition-all"
                    >
                      {isSaving ? "Adding..." : "+ Add to Team"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : displayBookings.length === 0 ? (
          /* --- NO BOOKINGS STATE --- */
          <div className="p-10 rounded-2xl backdrop-blur-xl bg-white/60 border border-white/80 text-center shadow-glass-panel">
            <p className="text-xl font-bold mb-2 text-saffron-cherry">
              No {activeTab} appointments found.
            </p>
          </div>
        ) : (
          /* --- APPOINTMENT CARDS --- */
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {displayBookings.map((booking) => {
              const displayStatus = getDisplayStatus(booking);
              return (
                <div
                  key={booking.id}
                  className={`p-6 rounded-2xl backdrop-blur-xl border shadow-glass-panel transition-all ${
                    displayStatus === "CANCELLED"
                      ? "bg-white/30 border-white/40 opacity-70"
                      : displayStatus === "COMPLETED"
                      ? "bg-saffron-cherry/5 border-saffron-cherry/20 opacity-80"
                      : "bg-white/70 border-white/90 hover:border-sunshine-yellow hover:shadow-yellow-glow"
                  }`}
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-2xl font-bold text-saffron-cherry">
                        {new Date(booking.booking_date).toLocaleDateString(
                          "en-US",
                          { weekday: "short", month: "short", day: "numeric" }
                        )}
                      </h3>
                      <p className="text-xl font-black text-rose-red">
                        {booking.booking_time}
                      </p>
                    </div>
                    <span
                      className={`text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full ${
                        displayStatus === "CANCELLED"
                          ? "bg-saffron-cherry/10 text-saffron-cherry"
                          : displayStatus === "COMPLETED"
                          ? "bg-green-100 text-green-800"
                          : "bg-sunshine-yellow text-saffron-cherry"
                      }`}
                    >
                      {displayStatus}
                    </span>
                  </div>
                  <div className="space-y-2 mb-4 text-sm font-semibold text-saffron-cherry/90 bg-white/40 p-4 rounded-xl border border-white/50">
                    <p className="flex justify-between">
                      <span className="opacity-70">Service:</span>{" "}
                      <span className="font-extrabold">
                        {booking.service_name}
                      </span>
                    </p>
                    <p className="flex justify-between">
                      <span className="opacity-70">Barber:</span>{" "}
                      <span className="font-extrabold">
                        {booking.barber_name}
                      </span>
                    </p>
                    <p className="flex justify-between mt-2 pt-2 border-t border-saffron-cherry/10">
                      <span className="opacity-70">Customer ID:</span>{" "}
                      <span className="font-extrabold text-xs truncate max-w-[120px]">
                        {booking.user_id || "Guest"}
                      </span>
                    </p>
                  </div>
                  {booking.status !== "cancelled" &&
                    booking.status !== "cancelled_by_barber" &&
                    activeTab === "upcoming" && (
                      <div className="mt-4 pt-4 border-t border-saffron-cherry/10">
                        <button
                          onClick={() => handleBarberCancel(booking.id)}
                          className="w-full py-2.5 rounded-xl bg-white/50 border border-saffron-cherry/20 hover:border-rose-red hover:bg-rose-red hover:text-white text-saffron-cherry font-bold text-sm transition-all"
                        >
                          Cancel Appointment
                        </button>
                      </div>
                    )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
