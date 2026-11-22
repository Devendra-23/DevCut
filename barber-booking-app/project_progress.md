# DevCut - Premium Barber Booking Application

DevCut is a modern, premium barber booking platform designed to provide a seamless scheduling experience with a highly polished, aesthetic user interface.

## 🎨 Brand Design System

The application utilizes a custom "Visionary Intelligence" design system.

- **Primary Colors:** Saffron Cherry (#6F0317), Rose Red (#E52150), Sunshine Yellow (#F4EB06).
- **Backgrounds:** Warm Ivory & Cream.
- **UI Aesthetic:** Frosted Glassmorphism (`bg-white/60`, `backdrop-blur-xl`), Aurora gradient ambient backgrounds, and soft neon-glow drop shadows.

## 💻 Tech Stack

- **Frontend:** React 18, Vite, TypeScript
- **Styling:** Tailwind CSS (with custom theme extensions and responsive media queries)
- **Routing:** React Router v6
- **Backend & Auth:** Supabase (PostgreSQL, Row Level Security, Edge Functions, Database Webhooks)
- **Email Automation:** Resend API (via Deno Edge Functions)
- **Data Visualization:** Recharts
- **Animations:** Framer Motion (for 3D Barber Cards)

## 🚀 Completed Milestones (Built from Scratch)

### 1. Global Architecture & Layout

- Configured `tailwind.config.js` with custom color palettes and shadow tokens.
- Developed `MainLayout.tsx` featuring a global Aurora background and a unified frosted-glass navigation bar.
- Mobile-First Navigation: Engineered a responsive Hamburger menu that automatically collapses on route changes.

### 2. User Authentication (`Auth.tsx`)

- Integrated Supabase Authentication.
- Built dynamic Login and Registration forms using glassmorphism.
- Implemented automatic redirect logic routing users securely to the Home/Dashboard post-login.
- Engineered a secure Route Guard utilizing React Router (`replace: true`) to intercept browser history traversal (the back-button bug), preventing authenticated users from rendering the login screen.
- Optimized UI padding for mobile screens and added native touch-state feedback (`active:scale`).

### 3. Core Directory (`Home.tsx` & `ShopDirectory.tsx`)

- Home: Designed a premium landing page with high-contrast typography and dynamic CTA buttons.
- Directory: Built interactive, frosted-glass shop selection cards that stack dynamically on mobile devices.

### 4. The Booking Engine & Slot Management (`BookingFlow.tsx`)

- Engineered a fully responsive 4-step progressive booking flow (Service → Barber → Date → Time).
- Built a custom horizontal scrolling Date Picker.
- Connected the UI securely to Supabase, capturing the `user_id` to strictly link appointments to logged-in customers.
- Proactive Time Filtering: Evaluates local device time to automatically hide past time slots for the current day.
- Real-Time Slot Blocking: Queries the database dynamically to cross out and disable time slots already booked by other customers, preventing double-booking.
- Daily Limits / Anti-Spam: Implemented a database query check to prevent a single user from booking more than one haircut on the same day, displaying a styled "Limit Reached" lock screen.
- Dynamic Team Rendering: Filters database queries using the `is_bookable` flag so shop admins are hidden from the public booking page.

### 5. Customer Dashboard (`Dashboard.tsx`)

- Developed a protected user portal to view upcoming and past appointments.
- Built out the UI framework to enforce business rules (Maximum of 2 rearrangements, Cancellation flows).
- Implemented dynamic status indicators (e.g., dynamically showing "COMPLETED" for past dates and distinguishing between user vs. shop cancellations).
- Penalty Logic UI: Designed a pure CSS tooltip utilizing Tailwind's `group-hover` utility to proactively warn users of the ₹50 fine upon exceeding the 2-rearrangement limit.
- Inline Rescheduling Engine: Transformed the reschedule button into a seamless inline date/time picker that fetches available slots in real-time, increments rearrangement counts, safely updates the database, and locks the selection to the original barber to maintain calendar integrity.

### 6. Barber Portal, Multi-Tenancy & Admin Controls (`BarberPortal.tsx`)

- Engineered a protected dashboard strictly for verified barbers.
- Row-Level Filtering / Multi-Tenancy: Reads the logged-in barber's identity and strictly filters the database so they only see their own customer schedule.
- Granular Role-Based Access Control (RBAC): Implemented `is_owner` flags granting shop admins access to a dedicated 'Manage Shop' dashboard.
- Dynamic Menu & Staff Control: Owners can dynamically add new services, update pricing, and add/remove staff members (including barber notification emails) directly from the UI, cascading instantly to the public booking page and email router.
- Analytics Engine: Built an interactive data visualization dashboard using Recharts to track total revenue, cancellation rates, daily revenue timelines, and service distribution.
- Implemented conditional rendering in `MainLayout.tsx` to completely hide the portal link from standard customers.

### 7. User Profiles (`Profile.tsx`)

- Engineered a dedicated `/profile` view for customers to manage their account details.
- Synced display names directly with Supabase Authentication metadata across the application UI, replacing raw email displays with customized user greetings.
- Built a dynamic statistics engine that queries the user's history to display their total lifetime haircuts and calculates their most frequently visited "Top Barber".

### 8. Secure Database Architecture

- Designed and executed the PostgreSQL schema in Supabase across `bookings`, `shops`, `services`, `barbers`, and `profiles`.
- Lock-and-Key Architecture: Built a `barbers` table linking user authentication IDs and notification email addresses to specific shop roles.
- Configured Row Level Security (RLS) ensuring users can only read, insert, and update their own booking records.
- Authored strict RLS INSERT and DELETE policies enabling shop owners to autonomously manage their staff and services without compromising global database security.
- Developed a PostgreSQL Database Trigger (`handle_new_user`) with an existing-user SQL backfill that automatically clones customer metadata (Name, Phone, and Email) from `auth.users` into `public.profiles`.
- Enabled Supabase Database Webhooks (`pg_net`) to emit real-time event payloads on `bookings` inserts.

### 9. Real-Time Automated Email Notifications (`send-booking-email`)

- Built and deployed a Supabase Edge Function (Deno/TypeScript) triggered automatically by the `bookings` `INSERT` Database Webhook.
- Performs live parallel lookups across `profiles`, `shops`, `services`, and `barbers` to dynamically resolve customer contact info, shop details, service pricing, and the assigned barber's email.
- Dispatches dual branded HTML emails in real time:
  - **Customer Confirmation:** Confirms shop, chosen barber, service & price, date, and slot timing.
  - **Barber Alert:** Notifies the assigned barber with the customer's name, phone number, service, date, and slot timing.
- Includes a `TEST_MODE` toggle for safe sandbox testing via Resend with live production-recipient logging before switching to live delivery.

## 🔜 Next Steps & Upcoming Features

- **Production Email Delivery:** Migrate `send-booking-email` from Resend sandbox mode to free Gmail SMTP (via Google App Password) for live customer and barber inbox delivery on Vercel without requiring a custom domain.
- **Deployment:** Push codebase to GitHub and deploy to Vercel for live public access and shop demos.
- **Barber Portal Customer Details:** Display live customer names and clickable phone numbers from `public.profiles` on appointment cards instead of raw user UUIDs.
- **Admin Dashboard:** Build a master view for platform owners to monitor all shops, track total appointments, and manage users across the ecosystem.
- **Payment Integration:** Implement a mock Stripe/Razorpay checkout flow for prepaying for haircuts or handling the ₹50 penalty fees.
