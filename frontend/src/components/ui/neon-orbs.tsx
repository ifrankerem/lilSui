// src/components/ui/neon-orbs.tsx

interface NeonOrbsProps {
  className?: string;
}

export function NeonOrbs({ className = "" }: NeonOrbsProps) {
  return (
    <div
      className={`fixed inset-0 overflow-hidden pointer-events-none ${className}`}
      style={{ zIndex: -1 }}
    >
      {/* CSS Animations */}
      <style>{`
        @keyframes orb-float-1 {
          0%, 100% {
            transform: translate(0, 0) scale(1);
            opacity: 0.7;
          }
          25% {
            transform: translate(50px, -80px) scale(1.2);
            opacity: 0.9;
          }
          50% {
            transform: translate(-30px, 60px) scale(0.9);
            opacity: 0.6;
          }
          75% {
            transform: translate(-60px, -40px) scale(1.1);
            opacity: 0.8;
          }
        }
        
        @keyframes orb-float-2 {
          0%, 100% {
            transform: translate(0, 0) scale(1) rotate(0deg);
            opacity: 0.6;
          }
          33% {
            transform: translate(-70px, 50px) scale(1.3) rotate(120deg);
            opacity: 0.8;
          }
          66% {
            transform: translate(40px, -60px) scale(0.8) rotate(240deg);
            opacity: 0.5;
          }
        }
        
        @keyframes orb-float-3 {
          0%, 100% {
            transform: translate(0, 0) scale(1);
            opacity: 0.5;
          }
          20% {
            transform: translate(80px, 40px) scale(1.4);
            opacity: 0.7;
          }
          40% {
            transform: translate(-50px, 80px) scale(0.9);
            opacity: 0.4;
          }
          60% {
            transform: translate(-80px, -30px) scale(1.2);
            opacity: 0.6;
          }
          80% {
            transform: translate(30px, -70px) scale(1.1);
            opacity: 0.8;
          }
        }
        
        @keyframes orb-pulse {
          0%, 100% {
            transform: scale(1);
            filter: blur(80px) brightness(1);
          }
          50% {
            transform: scale(1.15);
            filter: blur(100px) brightness(1.3);
          }
        }
        
        @keyframes orb-morph {
          0%, 100% {
            border-radius: 60% 40% 30% 70% / 60% 30% 70% 40%;
            transform: rotate(0deg) scale(1);
          }
          25% {
            border-radius: 30% 60% 70% 40% / 50% 60% 30% 60%;
            transform: rotate(90deg) scale(1.1);
          }
          50% {
            border-radius: 50% 60% 30% 60% / 30% 60% 70% 40%;
            transform: rotate(180deg) scale(0.95);
          }
          75% {
            border-radius: 60% 30% 60% 40% / 70% 40% 50% 60%;
            transform: rotate(270deg) scale(1.05);
          }
        }
        
        @keyframes gradient-shift {
          0%, 100% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
        }
        
        .neon-orb-1 {
          animation: orb-float-1 20s ease-in-out infinite, orb-pulse 8s ease-in-out infinite;
        }
        
        .neon-orb-2 {
          animation: orb-float-2 25s ease-in-out infinite, orb-morph 15s ease-in-out infinite;
        }
        
        .neon-orb-3 {
          animation: orb-float-3 18s ease-in-out infinite, orb-pulse 10s ease-in-out infinite 2s;
        }
        
        .neon-orb-4 {
          animation: orb-float-1 22s ease-in-out infinite reverse, orb-morph 12s ease-in-out infinite;
        }
        
        .neon-orb-5 {
          animation: orb-float-2 30s ease-in-out infinite, orb-pulse 6s ease-in-out infinite;
        }
        
        .neon-orb-6 {
          animation: orb-float-3 16s ease-in-out infinite reverse, orb-morph 20s ease-in-out infinite;
        }
        
        .gradient-bg {
          animation: gradient-shift 15s ease infinite;
          background-size: 400% 400%;
        }
      `}</style>

      {/* Animated Gradient Background */}
      <div 
        className="absolute inset-0 gradient-bg"
        style={{
          background: "linear-gradient(-45deg, #0f172a, #1e1b4b, #0f172a, #1e3a5f, #0f172a)",
          backgroundSize: "400% 400%",
        }}
      />

      {/* Large Purple/Violet Orb - Top Right */}
      <div
        className="neon-orb-1 absolute -top-32 -right-32 w-[600px] h-[600px]"
        style={{
          background: "radial-gradient(circle at 30% 30%, rgba(168, 85, 247, 0.8) 0%, rgba(139, 92, 246, 0.4) 30%, rgba(124, 58, 237, 0.2) 50%, transparent 70%)",
          filter: "blur(60px)",
        }}
      />

      {/* Blue/Cyan Orb - Bottom Left */}
      <div
        className="neon-orb-2 absolute -bottom-40 -left-40 w-[700px] h-[700px]"
        style={{
          background: "radial-gradient(circle at 70% 70%, rgba(59, 130, 246, 0.7) 0%, rgba(99, 102, 241, 0.4) 30%, rgba(79, 70, 229, 0.2) 50%, transparent 70%)",
          filter: "blur(70px)",
        }}
      />

      {/* Pink/Magenta Orb - Center */}
      <div
        className="neon-orb-3 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px]"
        style={{
          background: "radial-gradient(circle, rgba(236, 72, 153, 0.6) 0%, rgba(219, 39, 119, 0.3) 30%, rgba(168, 85, 247, 0.15) 50%, transparent 70%)",
          filter: "blur(80px)",
        }}
      />

      {/* White/Light Orb - Top Left */}
      <div
        className="neon-orb-4 absolute top-10 left-10 w-[400px] h-[400px]"
        style={{
          background: "radial-gradient(circle at 40% 40%, rgba(255, 255, 255, 0.5) 0%, rgba(226, 232, 240, 0.3) 30%, rgba(200, 200, 255, 0.15) 50%, transparent 70%)",
          filter: "blur(50px)",
        }}
      />

      {/* Purple Accent - Bottom Right */}
      <div
        className="neon-orb-5 absolute bottom-20 right-20 w-[450px] h-[450px]"
        style={{
          background: "radial-gradient(circle at 60% 60%, rgba(139, 92, 246, 0.7) 0%, rgba(124, 58, 237, 0.4) 30%, rgba(99, 102, 241, 0.2) 50%, transparent 70%)",
          filter: "blur(65px)",
        }}
      />

      {/* Cyan Accent - Top Center */}
      <div
        className="neon-orb-6 absolute -top-20 left-1/3 w-[350px] h-[350px]"
        style={{
          background: "radial-gradient(circle, rgba(34, 211, 238, 0.5) 0%, rgba(59, 130, 246, 0.3) 40%, transparent 70%)",
          filter: "blur(55px)",
        }}
      />

      {/* Additional Small Floating Orbs */}
      <div
        className="neon-orb-1 absolute top-1/4 right-1/4 w-[200px] h-[200px]"
        style={{
          background: "radial-gradient(circle, rgba(236, 72, 153, 0.5) 0%, rgba(168, 85, 247, 0.2) 50%, transparent 70%)",
          filter: "blur(40px)",
          animationDelay: "3s",
        }}
      />

      <div
        className="neon-orb-2 absolute bottom-1/4 left-1/4 w-[250px] h-[250px]"
        style={{
          background: "radial-gradient(circle, rgba(99, 102, 241, 0.5) 0%, rgba(139, 92, 246, 0.2) 50%, transparent 70%)",
          filter: "blur(45px)",
          animationDelay: "5s",
        }}
      />

      {/* Subtle Grid Overlay */}
      <div 
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
          `,
          backgroundSize: "50px 50px",
        }}
      />
    </div>
  );
}

export default NeonOrbs;
