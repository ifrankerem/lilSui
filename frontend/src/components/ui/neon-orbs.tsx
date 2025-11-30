// src/components/ui/neon-orbs.tsx
import { useEffect, useRef } from "react";

interface NeonOrbsProps {
  className?: string;
}

export function NeonOrbs({ className = "" }: NeonOrbsProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Create animated orbs
    const orbs = container.querySelectorAll<HTMLDivElement>(".neon-orb");
    orbs.forEach((orb, index) => {
      const duration = 15 + index * 5;
      const delay = index * 2;
      orb.style.animation = `float-orb ${duration}s ease-in-out ${delay}s infinite`;
    });
  }, []);

  return (
    <div
      ref={containerRef}
      className={`fixed inset-0 overflow-hidden pointer-events-none ${className}`}
      style={{ zIndex: -1 }}
    >
      {/* Keyframes for animation */}
      <style>{`
        @keyframes float-orb {
          0%, 100% {
            transform: translate(0, 0) scale(1);
          }
          25% {
            transform: translate(10%, -10%) scale(1.1);
          }
          50% {
            transform: translate(-5%, 15%) scale(0.95);
          }
          75% {
            transform: translate(-15%, -5%) scale(1.05);
          }
        }
      `}</style>

      {/* Purple/Violet Orb - Top Right */}
      <div
        className="neon-orb absolute -top-20 -right-20 w-96 h-96 rounded-full opacity-60"
        style={{
          background:
            "radial-gradient(circle, rgba(168, 85, 247, 0.4) 0%, rgba(139, 92, 246, 0.2) 40%, transparent 70%)",
          filter: "blur(60px)",
        }}
      />

      {/* Blue/Cyan Orb - Bottom Left */}
      <div
        className="neon-orb absolute -bottom-32 -left-32 w-[500px] h-[500px] rounded-full opacity-50"
        style={{
          background:
            "radial-gradient(circle, rgba(59, 130, 246, 0.35) 0%, rgba(99, 102, 241, 0.2) 40%, transparent 70%)",
          filter: "blur(80px)",
        }}
      />

      {/* Pink/Magenta Orb - Center */}
      <div
        className="neon-orb absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full opacity-40"
        style={{
          background:
            "radial-gradient(circle, rgba(236, 72, 153, 0.3) 0%, rgba(168, 85, 247, 0.15) 50%, transparent 70%)",
          filter: "blur(70px)",
        }}
      />

      {/* White/Light Orb - Top Left */}
      <div
        className="neon-orb absolute top-20 left-20 w-64 h-64 rounded-full opacity-30"
        style={{
          background:
            "radial-gradient(circle, rgba(255, 255, 255, 0.4) 0%, rgba(200, 200, 255, 0.2) 40%, transparent 70%)",
          filter: "blur(50px)",
        }}
      />

      {/* Purple Accent - Bottom Right */}
      <div
        className="neon-orb absolute bottom-20 right-40 w-72 h-72 rounded-full opacity-45"
        style={{
          background:
            "radial-gradient(circle, rgba(139, 92, 246, 0.35) 0%, rgba(124, 58, 237, 0.2) 40%, transparent 70%)",
          filter: "blur(65px)",
        }}
      />
    </div>
  );
}

export default NeonOrbs;
