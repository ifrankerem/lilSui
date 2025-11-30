// src/components/ui/liquid-glass-button.tsx
import { type ButtonHTMLAttributes, forwardRef } from "react";

interface LiquidButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "light" | "glass";
  size?: "sm" | "md" | "lg" | "xl";
  glow?: boolean;
}

export const LiquidButton = forwardRef<HTMLButtonElement, LiquidButtonProps>(
  (
    { className = "", variant = "primary", size = "md", glow = true, children, ...props },
    ref
  ) => {
    const baseStyles = `
      relative overflow-hidden
      rounded-2xl font-semibold
      transition-all duration-500 ease-out
      backdrop-blur-xl
      border
      active:scale-[0.97]
      disabled:opacity-50 disabled:cursor-not-allowed
      cursor-pointer
      group
    `;

    const glowStyles = glow ? `
      before:absolute before:inset-0 before:rounded-2xl
      before:bg-gradient-to-r before:from-transparent before:via-white/30 before:to-transparent
      before:translate-x-[-200%] before:transition-transform before:duration-700 before:ease-out
      hover:before:translate-x-[200%]
      after:absolute after:inset-[-2px] after:rounded-2xl after:opacity-0
      after:bg-gradient-to-r after:from-purple-500/50 after:via-pink-500/50 after:to-cyan-500/50
      after:blur-lg after:-z-10 after:transition-opacity after:duration-500
      hover:after:opacity-100
    ` : "";

    const variantStyles = {
      primary: `
        bg-gradient-to-br from-purple-600/90 via-violet-600/80 to-indigo-600/90
        text-white
        border-purple-400/30
        shadow-lg shadow-purple-500/25
        hover:shadow-xl hover:shadow-purple-500/40
        hover:border-purple-300/50
        hover:from-purple-500/95 hover:via-violet-500/90 hover:to-indigo-500/95
      `,
      secondary: `
        bg-white/10
        text-white
        border-white/20
        shadow-lg shadow-black/10
        hover:bg-white/20
        hover:border-white/30
        hover:shadow-xl hover:shadow-purple-500/20
      `,
      ghost: `
        bg-transparent
        text-white
        border-white/10
        hover:bg-white/10 
        hover:border-white/25
        hover:shadow-lg hover:shadow-purple-500/15
      `,
      light: `
        bg-white/95
        text-slate-900
        border-white/80
        shadow-lg shadow-black/10
        hover:bg-white 
        hover:shadow-xl hover:shadow-purple-500/20
        hover:border-purple-200/50
      `,
      glass: `
        bg-gradient-to-br from-white/20 via-white/10 to-white/5
        text-white
        border-white/25
        shadow-xl shadow-black/20
        hover:from-white/30 hover:via-white/20 hover:to-white/10
        hover:border-white/40
        hover:shadow-2xl hover:shadow-purple-500/30
      `,
    };

    const sizeStyles = {
      sm: "px-5 py-2.5 text-sm min-h-[40px]",
      md: "px-7 py-3.5 text-base min-h-[48px]",
      lg: "px-9 py-4.5 text-lg min-h-[56px]",
      xl: "px-12 py-5 text-xl min-h-[64px]",
    };

    return (
      <button
        ref={ref}
        className={`
          ${baseStyles}
          ${glowStyles}
          ${variantStyles[variant]}
          ${sizeStyles[size]}
          ${className}
        `}
        {...props}
      >
        {/* Inner glow effect */}
        <span className="absolute inset-0 rounded-2xl bg-gradient-to-t from-transparent via-white/5 to-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        
        {/* Content */}
        <span className="relative z-10 flex items-center justify-center gap-3">
          {children}
        </span>
      </button>
    );
  }
);

LiquidButton.displayName = "LiquidButton";

export default LiquidButton;
