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
      {/* 3D Tool: Scissors (Top Left) */}
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
        className="absolute top-4 left-4 w-20 pointer-events-none -z-10 drop-shadow-[0_0_15px_rgba(253,89,136,0.8)]"
      />

      {/* 3D Tool: Trimmer (Top Right) */}
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
        className="absolute top-4 right-4 w-24 pointer-events-none -z-10 drop-shadow-[0_0_15px_rgba(253,89,136,0.8)]"
      />
      {/* 3D Tool: Kit / Brush (Bottom Left) */}
      <motion.img
        src={kitImg}
        alt="Barber Kit"
        initial={{ opacity: 0, scale: 0.3, x: 0, y: 0, rotate: 0 }}
        animate={{
          opacity: showTools ? 1 : 0,
          scale: showTools ? 0.6 : 0.3, // Reduced scale from 0.9 to 0.6
          x: showTools ? -40 : 0, // Pulled it slightly closer to the card
          y: showTools ? 30 : 0,
          rotate: showTools ? -15 : 0,
        }}
        transition={{ type: "spring", stiffness: 250, damping: 20, delay: 0.1 }}
        className="absolute bottom-4 left-4 w-12 pointer-events-none -z-10 drop-shadow-[0_0_15px_rgba(253,89,136,0.8)]" // Reduced base width from w-20 to w-12
      />

      {/* The 3D Tilting Card */}
      <motion.div
        onClick={onClick}
        onMouseMove={handleMouseMove}
        style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
        className={cn(
          "relative w-full rounded-2xl cursor-pointer transition-all duration-300 overflow-hidden",
          showTools
            ? "shadow-neon-glow bg-transparent ring-1 ring-crimson-pink/50"
            : "shadow-glass-panel bg-white/5"
        )}
      >
        {/* Spinning Comet Gradient Border */}
        {isSelected && (
          <div className="absolute inset-[-100%] animate-border-spin bg-[conic-gradient(from_90deg_at_50%_50%,#072D59_0%,#FD5988_50%,#072D59_100%)]" />
        )}

        {/* Inner Card Content */}
        <div
          style={{ transform: "translateZ(50px)" }} // Pops the content out in 3D
          className={cn(
            "relative m-[2px] flex flex-col items-center justify-center gap-4 rounded-xl p-8 transition-colors duration-500",
            isSelected ? "bg-navy-blue" : "bg-[#082a52] hover:bg-navy-blue"
          )}
        >
          <span className="text-5xl drop-shadow-2xl">{image}</span>
          <h3
            className={cn(
              "text-xl font-semibold transition-colors duration-300",
              showTools ? "text-crimson-pink drop-shadow-md" : "text-seal-blue"
            )}
          >
            {name}
          </h3>
        </div>
      </motion.div>
    </div>
  );
}
