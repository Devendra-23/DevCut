import { motion } from "framer-motion";
import { cn } from "../../lib/utils";
import trimmerImg from "../../assets/trimmer.png";

// Import the newly installed Aceternity component
// (Check your exact file path if the CLI installed it elsewhere)
import { CometCard } from "./comet-card";

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
  return (
    <div className="relative w-full group z-0" onClick={onClick}>
      {/* 3D Tool Pop-Out Layer (Still functions identically!) */}
      <motion.img
        src={trimmerImg}
        alt="Barber Tool"
        initial={{ opacity: 0, scale: 0.5, y: 0, rotate: 0 }}
        animate={{
          opacity: isSelected ? 1 : 0,
          scale: isSelected ? 1.2 : 0.5,
          y: isSelected ? -45 : 0,
          x: isSelected ? 35 : 0,
          rotate: isSelected ? 15 : 0,
        }}
        transition={{ type: "spring", stiffness: 200, damping: 15 }}
        className="absolute -top-4 -right-4 w-28 md:w-32 drop-shadow-2xl pointer-events-none -z-10"
      />

      {/* The Official Aceternity Comet Card */}
      <CometCard
        rotateDepth={17.5} // Controls the dramatic 3D rotation
        translateDepth={20} // Controls how far the elements pop off the card
        className={cn(
          "w-full rounded-2xl cursor-pointer transition-all",
          isSelected
            ? "ring-2 ring-crimson-pink shadow-neon-glow"
            : "hover:ring-1 hover:ring-white/30"
        )}
      >
        {/* Inner Card UI */}
        <div
          className={cn(
            "flex flex-col items-center justify-center gap-4 h-full w-full rounded-2xl p-8 transition-colors",
            isSelected ? "bg-[#072D59]" : "bg-[#0a3566] hover:bg-[#0c3f7a]"
          )}
        >
          <span className="text-5xl drop-shadow-lg transform group-hover:scale-110 transition-transform">
            {image}
          </span>
          <h3
            className={cn(
              "text-xl font-medium transition-colors",
              isSelected
                ? "text-crimson-pink drop-shadow-md"
                : "text-seal-blue group-hover:text-white"
            )}
          >
            {name}
          </h3>
        </div>
      </CometCard>
    </div>
  );
}
