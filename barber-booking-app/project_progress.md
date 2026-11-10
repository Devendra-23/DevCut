# DevCut - Premium Barber Booking Application

DevCut is a modern, premium barber booking platform designed to provide a seamless scheduling experience with a highly polished, aesthetic user interface. 

## 🎨 Brand Design System
The application utilizes a custom "Visionary Intelligence" design system.
* **Primary Colors:** Saffron Cherry (`#6F0317`), Rose Red (`#E52150`), Sunshine Yellow (`#F4EB06`).
* **Backgrounds:** Warm Ivory & Cream.
* **UI Aesthetic:** Frosted Glassmorphism (`bg-white/60`, `backdrop-blur-xl`), Aurora gradient ambient backgrounds, and soft neon-glow drop shadows.

## 💻 Tech Stack
* **Frontend:** React 18, Vite, TypeScript
* **Styling:** Tailwind CSS (with custom theme extensions)
* **Routing:** React Router v6
* **Backend & Auth:** Supabase (PostgreSQL, Row Level Security)
* **Animations:** Framer Motion (for 3D Barber Cards)

## 🚀 Completed Milestones (Built from Scratch)

### 1. Global Architecture & Layout
* Configured `tailwind.config.js` with custom color palettes and shadow tokens.
* Developed `MainLayout.tsx` featuring a global Aurora background and a unified frosted-glass navigation bar.

### 2. User Authentication (`Auth.tsx`)
* Integrated Supabase Authentication.
* Built dynamic Login and Registration forms using glassmorphism.
* Implemented automatic redirect logic routing users securely to the Home/Dashboard post-login.

### 3. Core Directory (`Home.tsx` & `ShopDirectory.tsx`)
* **Home:** Designed a premium landing page with high-contrast typography and dynamic CTA buttons.
* **Directory:** Built interactive, frosted-glass shop selection cards.

### 4. The Booking Engine (`BookingFlow.tsx`)
* Engineered a 4-step progressive booking flow (Service → Barber → Date → Time).
* Built a custom horizontal scrolling Date Picker.
* Connected the UI securely to Supabase, capturing the `user_id` to strictly link appointments to logged-in customers.

### 5. Customer Dashboard (`Dashboard.tsx`)
* Developed a protected user portal to view upcoming and past appointments.
* Built out the UI framework to enforce business rules (Maximum of 2 rearrangements, Cancellation flows).

### 6. Secure Database Architecture
* Designed and executed the PostgreSQL schema in Supabase.
* Built the `bookings` table with strictly typed columns (`shop_id`, `user_id`, `service_name`, `booking_date`, `rearrange_count`).
* Configured **Row Level Security (RLS)** ensuring users can only read, insert, and update their own booking records.

## 🔜 Next Steps & Upcoming Features
1. **Slot Blocking:** Update `BookingFlow.tsx` to read the database and gray-out time slots that have already been booked by other users.
2. **Daily Limits:** Enforce the business rule preventing a single user from booking more than one haircut per day.
3. **Barber Portal:** Build a secure (`/portal`) view for barbers to log in, view their daily schedule, and manage shop operations.