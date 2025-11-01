/**
 * Learnova Design System
 * Centralized theme tokens for consistent UI/UX across all pages
 */

export const theme = {
  // Color palette
  colors: {
    primary: "hsl(var(--primary))",
    secondary: "hsl(var(--secondary))",
    success: "hsl(142, 71%, 45%)",
    warning: "hsl(38, 92%, 50%)",
    destructive: "hsl(var(--destructive))",
    muted: "hsl(var(--muted))",
    accent: "hsl(217, 91%, 60%)", // Blue accent for gradients
  },

  // Border radius (consistent rounded corners)
  radius: {
    sm: "0.5rem",    // 8px
    md: "0.75rem",   // 12px
    lg: "1rem",      // 16px
    xl: "1.5rem",    // 24px
  },

  // Shadows (soft, layered depth)
  shadows: {
    card: "0 2px 8px rgba(0, 0, 0, 0.06), 0 1px 2px rgba(0, 0, 0, 0.04)",
    hover: "0 4px 16px rgba(0, 0, 0, 0.1), 0 2px 4px rgba(0, 0, 0, 0.06)",
    focus: "0 0 0 3px rgba(59, 130, 246, 0.2)",
  },

  // Typography (Inter font family)
  typography: {
    fontFamily: "Inter, system-ui, -apple-system, sans-serif",
    fontSizes: {
      xs: "0.75rem",
      sm: "0.875rem",
      base: "1rem",
      lg: "1.125rem",
      xl: "1.25rem",
      "2xl": "1.5rem",
      "3xl": "1.875rem",
      "4xl": "2.25rem",
    },
  },

  // Animations and transitions
  animations: {
    fadeIn: "fade-in 0.5s ease-out",
    slideUp: "slide-up 0.4s ease-out",
    scaleIn: "scale-in 0.3s ease-out",
    shimmer: "shimmer 2s infinite",
  },

  transitions: {
    fast: "150ms",
    normal: "250ms",
    slow: "350ms",
  },

  // Spacing scale
  spacing: {
    xs: "0.5rem",
    sm: "0.75rem",
    md: "1rem",
    lg: "1.5rem",
    xl: "2rem",
    "2xl": "3rem",
  },
};

// Animation keyframes (add to global CSS if needed)
export const keyframes = `
  @keyframes fade-in {
    from { opacity: 0; }
    to { opacity: 1; }
  }

  @keyframes slide-up {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @keyframes scale-in {
    from {
      opacity: 0;
      transform: scale(0.95);
    }
    to {
      opacity: 1;
      transform: scale(1);
    }
  }

  @keyframes shimmer {
    0% {
      background-position: -1000px 0;
    }
    100% {
      background-position: 1000px 0;
    }
  }
`;

// Gradient utilities
export const gradients = {
  primary: "bg-gradient-to-r from-primary to-secondary",
  hero: "bg-gradient-to-br from-background via-muted to-background",
  card: "bg-gradient-to-br from-card to-card/50",
  accent: "bg-gradient-to-r from-blue-500 to-purple-600",
};

// Common CSS classes for consistent styling
export const classes = {
  card: `rounded-xl border bg-card shadow-card hover:shadow-hover transition-all duration-${theme.transitions.normal}`,
  button: `rounded-lg transition-all duration-${theme.transitions.fast}`,
  input: `rounded-lg border-input focus:ring-2 focus:ring-primary/20`,
  container: "container mx-auto px-6",
  header: "border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10",
};

export default theme;
