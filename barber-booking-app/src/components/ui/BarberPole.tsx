import { motion } from "framer-motion";

interface BarberPoleProps {
  size?: "xs" | "sm" | "md" | "lg";
  variant?: "classic" | "brand";
  className?: string;
}

const SIZE_CONFIG = {
  xs: {
    orb: "w-2 h-2",
    capTop: "w-3.5 h-1",
    capBottom: "w-3.5 h-1",
    tube: "w-2.5 h-6",
    stripe: 4, // 16px loop
    duration: 1.0,
  },
  sm: {
    orb: "w-3 h-3",
    capTop: "w-5 h-1.5",
    capBottom: "w-5 h-2",
    tube: "w-4 h-9",
    stripe: 6, // 24px loop
    duration: 1.2,
  },
  md: {
    orb: "w-6 h-6",
    capTop: "w-9 h-2.5",
    capBottom: "w-9 h-3",
    tube: "w-7 h-16",
    stripe: 10, // 40px loop
    duration: 1.5,
  },
  lg: {
    orb: "w-14 h-14",
    capTop: "w-24 h-5",
    capBottom: "w-24 h-6",
    tube: "w-20 h-52",
    stripe: 20, // 80px loop
    duration: 1.8,
  },
};

export function BarberPole({
  size = "lg",
  variant = "classic",
  className = "",
}: BarberPoleProps) {
  const cfg = SIZE_CONFIG[size];
  const s = cfg.stripe;
  const cycle = s * 4;

  // "classic" = red/white/blue | "brand" = DevCut Rose Red/Cream/Saffron Cherry
  const color1 = "#E52150";
  const color2 = variant === "classic" ? "#2563EB" : "#6F0317";
  const cream = "#FFFBF7";

  const stripeGradient = `repeating-linear-gradient(
    180deg,
    ${color1} 0px,
    ${color1} ${s}px,
    ${cream} ${s}px,
    ${cream} ${s * 2}px,
    ${color2} ${s * 2}px,
    ${color2} ${s * 3}px,
    ${cream} ${s * 3}px,
    ${cream} ${cycle}px
  )`;

  return (
    <div
      className={`inline-flex flex-col items-center select-none shrink-0 ${className}`}
      aria-hidden="true"
    >
      {/* Glossy Metallic Top Sphere */}
      <div
        className={`${cfg.orb} rounded-full shadow-md relative z-10 -mb-0.5`}
        style={{
          background:
            "radial-gradient(circle at 32% 28%, #ffffff 0%, #e2e8f0 38%, #94a3b8 75%, #475569 100%)",
        }}
      />

      {/* Top Chrome Cap */}
      <div
        className={`${cfg.capTop} rounded-t-md rounded-b-sm shadow-sm relative z-10 border-b border-slate-400/50`}
        style={{
          background:
            "linear-gradient(90deg, #94a3b8 0%, #f8fafc 32%, #cbd5e1 62%, #64748b 100%)",
        }}
      />

      {/* Spinning Glass Cylinder */}
      <div
        className={`${cfg.tube} relative overflow-hidden shadow-inner border-x border-white/60`}
      >
        {/* Skewed Downward-Spiraling Stripes */}
        <div
          className="absolute inset-x-0 -top-20 -bottom-20"
          style={{ transform: "skewY(-26deg)" }}
        >
          <motion.div
            className="w-full"
            style={{
              height: `calc(100% + ${cycle * 2}px)`,
              backgroundImage: stripeGradient,
            }}
            animate={{ y: [-cycle, 0] }}
            transition={{
              duration: cfg.duration,
              repeat: Infinity,
              ease: "linear",
            }}
          />
        </div>

        {/* 3D Cylindrical Glass Lighting & Specular Reflection */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "linear-gradient(90deg, rgba(15,23,42,0.38) 0%, rgba(255,255,255,0.52) 26%, rgba(255,255,255,0.06) 52%, rgba(15,23,42,0.40) 100%)",
          }}
        />
      </div>

      {/* Bottom Chrome Cap */}
      <div
        className={`${cfg.capBottom} rounded-t-sm rounded-b-lg shadow-md relative z-10 border-t border-white/70`}
        style={{
          background:
            "linear-gradient(90deg, #94a3b8 0%, #f8fafc 32%, #cbd5e1 62%, #64748b 100%)",
        }}
      />
    </div>
  );
}
