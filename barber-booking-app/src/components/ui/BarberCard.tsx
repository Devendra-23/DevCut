import { useState } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { cn } from "../../lib/utils";

// Local asset imports
import trimmerImg from "../../assets/trimmer.png";
import scissorsImg from "../../assets/Scissors.png";
import kitImg from "../../assets/Brush.png";

interface BarberCardProps {
  name: string;
  image: string;
  isSelected: boolean;
  onClick: () => void;
}

export function BarberCard({
  name,
  image,
  isSelected,
  onClick,
}: BarberCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  // 3D Tilt Engine
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const mouseXSpring = useSpring(x, { stiffness: 300, damping: 30 });
  const mouseYSpring = useSpring(y, { stiffness: 300, damping: 30 });
  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["15deg", "-15deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-15deg", "15deg"]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    x.set(mouseX / width - 0.5);
    y.set(mouseY / height - 0.5);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    x.set(0);
    y.set(0);
  };

  const showTools = isHovered || isSelected;

  return (
    <div
      className="relative w-full z-0 group"
      style={{ perspective: 1200 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
    >
      {/* 3D Tool: Scissors (Top Left) - Rose Red Glow */}
      <motion.img
        src={scissorsImg}
        alt="Scissors"
        initial={{ opacity: 0, scale: 0.5, x: 0, y: 0, rotate: 0 }}
        animate={{
          opacity: showTools ? 1 : 0,
          scale: showTools ? 1 : 0.5,
          x: showTools ? -60 : 0,
          y: showTools ? -40 : 0,
          rotate: showTools ? -35 : 0,
        }}
        transition={{ type: "spring", stiffness: 250, damping: 20 }}
        className="absolute top-4 left-4 w-20 pointer-events-none -z-10 drop-shadow-[0_0_15px_rgba(229,33,80,0.6)]"
      />

      {/* 3D Tool: Trimmer (Top Right) - Rose Red Glow */}
      <motion.img
        src={trimmerImg}
        alt="Trimmer"
        initial={{ opacity: 0, scale: 0.5, x: 0, y: 0, rotate: 0 }}
        animate={{
          opacity: showTools ? 1 : 0,
          scale: showTools ? 1.1 : 0.5,
          x: showTools ? 60 : 0,
          y: showTools ? -30 : 0,
          rotate: showTools ? 25 : 0,
        }}
        transition={{
          type: "spring",
          stiffness: 250,
          damping: 20,
          delay: 0.05,
        }}
        className="absolute top-4 right-4 w-24 pointer-events-none -z-10 drop-shadow-[0_0_15px_rgba(229,33,80,0.6)]"
      />

      {/* 3D Tool: Kit / Brush (Bottom Left) - Sunshine Yellow Glow */}
      <motion.img
        src={kitImg}
        alt="Barber Kit"
        initial={{ opacity: 0, scale: 0.3, x: 0, y: 0, rotate: 0 }}
        animate={{
          opacity: showTools ? 1 : 0,
          scale: showTools ? 0.6 : 0.3,
          x: showTools ? -40 : 0,
          y: showTools ? 30 : 0,
          rotate: showTools ? -15 : 0,
        }}
        transition={{ type: "spring", stiffness: 250, damping: 20, delay: 0.1 }}
        className="absolute bottom-4 left-4 w-12 pointer-events-none -z-10 drop-shadow-[0_0_15px_rgba(244,235,6,0.6)]"
      />

      {/* The 3D Tilting Card */}
      <motion.div
        onClick={onClick}
        onMouseMove={handleMouseMove}
        style={{
          rotateX,
          rotateY,
          transformStyle: "preserve-3d",
          // Applies the sleek ticket cutout shapes on the left and right edges
          WebkitMaskImage:
            "radial-gradient(circle at 0 50%, transparent 16px, black 17px), radial-gradient(circle at 100% 50%, transparent 16px, black 17px)",
          WebkitMaskComposite: "destination-in",
          maskImage:
            "radial-gradient(circle at 0 50%, transparent 16px, black 17px), radial-gradient(circle at 100% 50%, transparent 16px, black 17px)",
          maskComposite: "intersect",
        }}
        className={cn(
          "relative w-full rounded-2xl cursor-pointer transition-all duration-500 overflow-hidden",
          isSelected
            ? "shadow-rose-glow ring-1 ring-rose-red/50"
            : "shadow-glass-panel hover:shadow-rose-glow"
        )}
      >
        {/* Spinning Comet Gradient Border (Saffron Cherry to Rose Red) */}
        {isSelected && (
          <div className="absolute inset-[-100%] animate-border-spin bg-[conic-gradient(from_90deg_at_50%_50%,#6F0317_0%,#E52150_50%,#6F0317_100%)]" />
        )}

        {/* Inner Card Content (Glassmorphism + Brand Colors) */}
        <div
          style={{ transform: "translateZ(50px)" }} // Pops the content out in 3D
          className={cn(
            "relative m-[2px] flex flex-col items-center justify-center gap-4 rounded-xl py-8 px-4 transition-colors duration-500 backdrop-blur-xl border",
            isSelected
              ? "bg-saffron-cherry text-white border-rose-red"
              : "bg-white/60 border-white/80 hover:bg-white/80 text-saffron-cherry hover:border-rose-red/50"
          )}
        >
          <span
            className={cn(
              "text-6xl drop-shadow-md transition-transform duration-500",
              isSelected ? "scale-110 drop-shadow-lg" : "group-hover:scale-110"
            )}
          >
            {image}
          </span>
          <h3
            className={cn(
              "text-xl font-bold tracking-tight transition-colors duration-300",
              isSelected
                ? "text-white"
                : showTools
                ? "text-rose-red drop-shadow-sm"
                : "text-saffron-cherry"
            )}
          >
            {name}
          </h3>

          {/* Selected State: Sunshine Yellow Highlight Glow inside the card */}
          {isSelected && (
            <div className="absolute inset-0 pointer-events-none rounded-xl overflow-hidden">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-1 bg-sunshine-yellow/60 blur-sm rounded-full" />
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
