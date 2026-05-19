/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      screens: {
        'xs': '360px',
        'sm': '640px',
        'md': '768px',
        'lg': '1024px',
        'xl': '1280px',
        '2xl': '1536px',
        // Mobile-first breakpoints for 1080x1920
        'mobile': '360px',
        'mobile-lg': '414px',
        'tablet': '768px',
        'desktop': '1024px',
      },
      fontFamily: {
        body: ['var(--font-vazirmatn)', 'Vazirmatn', 'Tahoma', 'Arial', 'sans-serif'],
        headline: ['var(--font-vazirmatn)', 'Vazirmatn', 'Tahoma', 'Arial', 'sans-serif'],
        sans: ['var(--font-vazirmatn)', 'Vazirmatn', 'Tahoma', 'Arial', 'sans-serif'],
      },
      fontWeight: {
        thin: '100',
        extralight: '200',
        light: '300',
        normal: '400',
        medium: '500',
        semibold: '600',
        bold: '700',
        extrabold: '800',
        black: '900',
      },
      colors: {
        // Material Design 3 Colors
        'md-primary': "hsl(var(--md-primary))",
        'md-primary-container': "hsl(var(--md-primary-container))",
        'md-on-primary': "hsl(var(--md-on-primary))",
        'md-on-primary-container': "hsl(var(--md-on-primary-container))",
        'md-secondary': "hsl(var(--md-secondary))",
        'md-secondary-container': "hsl(var(--md-secondary-container))",
        'md-on-secondary': "hsl(var(--md-on-secondary))",
        'md-on-secondary-container': "hsl(var(--md-on-secondary-container))",
        'md-tertiary': "hsl(var(--md-tertiary))",
        'md-tertiary-container': "hsl(var(--md-tertiary-container))",
        'md-on-tertiary': "hsl(var(--md-on-tertiary))",
        'md-on-tertiary-container': "hsl(var(--md-on-tertiary-container))",
        'md-surface': "hsl(var(--md-surface))",
        'md-surface-dim': "hsl(var(--md-surface-dim))",
        'md-surface-bright': "hsl(var(--md-surface-bright))",
        'md-surface-container-lowest': "hsl(var(--md-surface-container-lowest))",
        'md-surface-container-low': "hsl(var(--md-surface-container-low))",
        'md-surface-container': "hsl(var(--md-surface-container))",
        'md-surface-container-high': "hsl(var(--md-surface-container-high))",
        'md-surface-container-highest': "hsl(var(--md-surface-container-highest))",
        'md-on-surface': "hsl(var(--md-on-surface))",
        'md-on-surface-variant': "hsl(var(--md-on-surface-variant))",
        'md-background': "hsl(var(--md-background))",
        'md-on-background': "hsl(var(--md-on-background))",
        'md-outline': "hsl(var(--md-outline))",
        'md-outline-variant': "hsl(var(--md-outline-variant))",
        'md-error': "hsl(var(--md-error))",
        'md-error-container': "hsl(var(--md-error-container))",
        'md-on-error': "hsl(var(--md-on-error))",
        'md-on-error-container': "hsl(var(--md-on-error-container))",
        
        // Legacy compatibility
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        border: "hsl(var(--border))",
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        gold: "hsl(var(--gold))",
        secondary: "hsl(var(--secondary))",
      },
      spacing: {
        'md-xs': 'var(--md-spacing-xs)',
        'md-sm': 'var(--md-spacing-sm)',
        'md-md': 'var(--md-spacing-md)',
        'md-lg': 'var(--md-spacing-lg)',
        'md-xl': 'var(--md-spacing-xl)',
        'md-2xl': 'var(--md-spacing-2xl)',
        'md-3xl': 'var(--md-spacing-3xl)',
        'md-4xl': 'var(--md-spacing-4xl)',
      },
      borderRadius: {
        'md-xs': 'var(--md-radius-xs)',
        'md-sm': 'var(--md-radius-sm)',
        'md-md': 'var(--md-radius-md)',
        'md-lg': 'var(--md-radius-lg)',
        'md-xl': 'var(--md-radius-xl)',
        'md-2xl': 'var(--md-radius-2xl)',
        'md-full': 'var(--md-radius-full)',
      },
      boxShadow: {
        'md-0': 'var(--md-elevation-0)',
        'md-1': 'var(--md-elevation-1)',
        'md-2': 'var(--md-elevation-2)',
        'md-3': 'var(--md-elevation-3)',
        'md-4': 'var(--md-elevation-4)',
        'md-5': 'var(--md-elevation-5)',
      },
      animation: {
        // Material Design 3 Motion
        "md-fade-in": "mdFadeIn var(--md-motion-duration-medium2) var(--md-motion-easing-standard)",
        "md-fade-out": "mdFadeOut var(--md-motion-duration-short2) var(--md-motion-easing-standard)",
        "md-slide-in": "mdSlideIn var(--md-motion-duration-medium3) var(--md-motion-easing-emphasized-decelerate)",
        "md-slide-out": "mdSlideOut var(--md-motion-duration-short3) var(--md-motion-easing-emphasized-accelerate)",
        "md-scale-in": "mdScaleIn var(--md-motion-duration-short4) var(--md-motion-easing-emphasized-decelerate)",
        "md-scale-out": "mdScaleOut var(--md-motion-duration-short2) var(--md-motion-easing-emphasized-accelerate)",
        "md-ripple": "mdRipple var(--md-motion-duration-short4) var(--md-motion-easing-standard)",
        
        // Legacy animations
        "fade-in": "fadeIn 0.5s ease-in-out",
        "slide-up": "slideUp 0.6s ease-out",
        "scale-in": "scaleIn 0.3s ease-out",
      },
      keyframes: {
        // Material Design 3 Motion Keyframes
        mdFadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        mdFadeOut: {
          "0%": { opacity: "1" },
          "100%": { opacity: "0" },
        },
        mdSlideIn: {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        mdSlideOut: {
          "0%": { opacity: "1", transform: "translateY(0)" },
          "100%": { opacity: "0", transform: "translateY(-20px)" },
        },
        mdScaleIn: {
          "0%": { opacity: "0", transform: "scale(0.8)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        mdScaleOut: {
          "0%": { opacity: "1", transform: "scale(1)" },
          "100%": { opacity: "0", transform: "scale(0.8)" },
        },
        mdRipple: {
          "0%": { transform: "scale(0)", opacity: "0.3" },
          "50%": { transform: "scale(1)", opacity: "0.1" },
          "100%": { transform: "scale(1)", opacity: "0" },
        },
        
        // Legacy keyframes
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        scaleIn: {
          "0%": { opacity: "0", transform: "scale(0.9)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
      },
    },
  },
  plugins: [],
}
