DevCut - Premium Barber Booking Application

DevCut is a modern, premium barber booking platform designed to provide a seamless scheduling experience with a highly polished, aesthetic user interface.

🎨 Brand Design System

The application utilizes a custom "Visionary Intelligence" design system.

Primary Colors: Saffron Cherry (#6F0317), Rose Red (#E52150), Sunshine Yellow (#F4EB06).

Backgrounds: Warm Ivory & Cream.

UI Aesthetic: Frosted Glassmorphism (bg-white/60, backdrop-blur-xl), Aurora gradient ambient backgrounds, and soft neon-glow drop shadows.

💻 Tech Stack

Frontend: React 18, Vite, TypeScript

Styling: Tailwind CSS (with custom theme extensions and responsive media queries)

Routing: React Router v6

Backend & Auth: Supabase (PostgreSQL, Row Level Security)

Animations: Framer Motion (for 3D Barber Cards)

🚀 Completed Milestones (Built from Scratch)

Global Architecture & Layout

Configured tailwind.config.js with custom color palettes and shadow tokens.

Developed MainLayout.tsx featuring a global Aurora background and a unified frosted-glass navigation bar.

Mobile-First Navigation: Engineered a responsive Hamburger menu that automatically collapses on route changes.

User Authentication (Auth.tsx)

Integrated Supabase Authentication.

Built dynamic Login and Registration forms using glassmorphism.

Implemented automatic redirect logic routing users securely to the Home/Dashboard post-login.

Optimized UI padding for mobile screens and added native touch-state feedback (active:scale).

Core Directory (Home.tsx & ShopDirectory.tsx)

Home: Designed a premium landing page with high-contrast typography and dynamic CTA buttons.

Directory: Built interactive, frosted-glass shop selection cards that stack dynamically on mobile devices.

The Booking Engine & Slot Management (BookingFlow.tsx)

Engineered a fully responsive 4-step progressive booking flow (Service → Barber → Date → Time).

Built a custom horizontal scrolling Date Picker.

Connected the UI securely to Supabase, capturing the user_id to strictly link appointments to logged-in customers.

Proactive Time Filtering: Evaluates local device time to automatically hide past time slots for the current day.

Real-Time Slot Blocking: Queries the database dynamically to cross out and disable time slots already booked by other customers, preventing double-booking.

Daily Limits / Anti-Spam: Implemented a database query check to prevent a single user from booking more than one haircut on the same day, displaying a styled "Limit Reached" lock screen.

Dynamic Team Rendering: Filters database queries using the is_bookable flag so shop admins are hidden from the public booking page.

Customer Dashboard (Dashboard.tsx)

Developed a protected user portal to view upcoming and past appointments.

Built out the UI framework to enforce business rules (Maximum of 2 rearrangements, Cancellation flows).

Implemented dynamic status indicators (e.g., dynamically showing "COMPLETED" for past dates and distinguishing between user vs. shop cancellations).

Penalty Logic UI: Designed a pure CSS tooltip utilizing Tailwind's group-hover utility to proactively warn users of the ₹50 fine upon exceeding the 2-rearrangement limit.

Inline Rescheduling Engine: Transformed the reschedule button into a seamless inline date/time picker that fetches available slots in real-time, increments rearrangement counts, safely updates the database, and locks the selection to the original barber to maintain calendar integrity.

Barber Portal, Multi-Tenancy & Admin Controls (BarberPortal.tsx)

Engineered a protected dashboard strictly for verified barbers.

Row-Level Filtering / Multi-Tenancy: Reads the logged-in barber's identity and strictly filters the database so they only see their own customer schedule.

Granular Role-Based Access Control (RBAC): Implemented is_owner flags granting shop admins access to a dedicated 'Manage Shop' dashboard.

Dynamic Menu & Staff Control: Owners can dynamically add new services, update pricing, and add/remove staff members directly from the UI, cascading instantly to the public booking page.

Implemented conditional rendering in MainLayout.tsx to completely hide the portal link from standard customers.

User Profiles (Profile.tsx)

Engineered a dedicated /profile view for customers to manage their account details.

Synced display names directly with Supabase Authentication metadata.

Built a dynamic statistics engine that queries the user's history to display their total lifetime haircuts and calculates their most frequently visited "Top Barber".

Secure Database Architecture

Designed and executed the PostgreSQL schema in Supabase.

Built the bookings, shops, and services tables.

Lock-and-Key Architecture: Built a barbers table linking user authentication IDs to specific shop roles.

Configured Row Level Security (RLS) ensuring users can only read, insert, and update their own booking records.

Authored strict RLS INSERT and DELETE policies enabling shop owners to autonomously manage their staff and services without compromising global database security.

🔜 Next Steps & Upcoming Features

Deployment: Push codebase to GitHub and deploy to Vercel for live public access.

Admin Dashboard: Build a master view for platform owners to monitor all shops, track total appointments, and manage users across the ecosystem.

Payment Integration: Implement a mock Stripe/Razorpay checkout flow for prepaying for haircuts or handling the ₹50 penalty fees.

Email Webhooks (Optional): Integrate Supabase database webhooks to send styled confirmation emails upon successful booking.
