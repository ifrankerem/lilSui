// src/components/ui/liquid-glass-button.tsx
import { type ButtonHTMLAttributes, forwardRef } from "react";

interface LiquidButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost";
  size?: "sm" | "md" | "lg";
}

export const LiquidButton = forwardRef<HTMLButtonElement, LiquidButtonProps>(
  (
    { className = "", variant = "primary", size = "md", children, ...props },
    ref
  ) => {
    const baseStyles = `
      relative overflow-hidden
      rounded-2xl font-semibold
      transition-all duration-300 ease-out
      backdrop-blur-md
      border border-white/20
      shadow-lg shadow-black/10
      hover:shadow-xl hover:shadow-purple-500/20
      hover:border-white/30
      active:scale-[0.98]
      disabled:opacity-50 disabled:cursor-not-allowed
      before:absolute before:inset-0 before:rounded-2xl
      before:bg-gradient-to-b before:from-white/20 before:to-transparent
      before:opacity-0 before:transition-opacity before:duration-300
      hover:before:opacity-100
      after:absolute after:inset-0 after:rounded-2xl
      after:bg-gradient-to-r after:from-transparent after:via-white/10 after:to-transparent
      after:translate-x-[-100%] after:transition-transform after:duration-500
      hover:after:translate-x-[100%]
    `;

    const variantStyles = {
      primary: `
        bg-gradient-to-br from-purple-500/80 via-violet-500/70 to-indigo-500/80
        text-white
        hover:from-purple-400/90 hover:via-violet-400/80 hover:to-indigo-400/90
      `,
      secondary: `
        bg-white/10
        text-white
        hover:bg-white/20
      `,
      ghost: `
        bg-transparent
        text-white
        border-white/10
        hover:bg-white/10 hover:border-white/20
      `,
    };

    const sizeStyles = {
      sm: "px-4 py-2 text-sm",
      md: "px-6 py-3 text-base",
      lg: "px-8 py-4 text-lg",
    };

    return (
      <button
        ref={ref}
        className={`
          ${baseStyles}
          ${variantStyles[variant]}
          ${sizeStyles[size]}
          ${className}
        `}
        {...props}
      >
        <span className="relative z-10 flex items-center justify-center gap-2">
          {children}
        </span>
      </button>
    );
  }
);

LiquidButton.displayName = "LiquidButton";

export default LiquidButton;
