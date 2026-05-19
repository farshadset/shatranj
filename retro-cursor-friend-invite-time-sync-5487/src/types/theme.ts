export interface ThemeColors {
  background: string
  foreground: string
  primary: string
  primaryForeground: string
  accent: string
  accentForeground: string
  border: string
  card: string
  cardForeground: string
  gold: string
  secondary: string
  muted: string
  mutedForeground: string
}

export interface ThemeTypography {
  fontFamily: string
  headlineFontFamily: string
  headerTitleFontFamily: string
  headerSubtitleFontFamily: string
  navbarFontFamily: string
  itemTitleFontFamily: string
  descriptionFontFamily: string
  descriptionBold?: boolean
  fontSize: {
    sm: string
    base: string
    lg: string
    xl: string
    '2xl': string
    '3xl': string
    '4xl': string
    '5xl': string
  }
  fontWeight: {
    normal: string
    medium: string
    semibold: string
    bold: string
  }
  lineHeight: {
    tight: string
    normal: string
    relaxed: string
  }
}

export interface ThemeHeader {
  type: 'text' | 'logo' | 'textAndLogo'
  title: string
  logoUrl?: string
  showBackground: boolean
  backgroundHeight: 'normal' | 'large'
}

export interface ThemeLayout {
  borderRadius: {
    sm: string
    md: string
    lg: string
    xl: string
  }
  shadow: {
    sm: string
    md: string
    lg: string
    xl: string
    '2xl': string
  }
  opacity: {
    card: string
    backdrop: string
    hover: string
  }
  spacing: {
    card: string
    section: string
  }
}

export interface ThemeEffects {
  hoverScale: string
  hoverTranslateY: string
  transitionDuration: string
  backdropBlur: string
}

export interface ThemeConfig {
  colors: ThemeColors
  typography: ThemeTypography
  header: ThemeHeader
  layout: ThemeLayout
  effects: ThemeEffects
}

export interface ThemePreset {
  id: string
  name: string
  config: ThemeConfig
}

// Default theme configuration
export const defaultTheme: ThemeConfig = {
  colors: {
    background: '45 56% 88%', // Warm Beige-Gold
    foreground: '0 0% 9%', // Matte Black
    primary: '0 68% 42%', // Rich Red
    primaryForeground: '0 0% 98%', // Off-White
    accent: '45 100% 51%', // Vibrant Gold
    accentForeground: '0 0% 9%', // Matte Black
    border: '0 0% 89%', // Subtle Silver
    card: '0 0% 100%', // Pure White
    cardForeground: '0 0% 9%', // Matte Black
    gold: '45 100% 51%', // Vibrant Gold
    secondary: '45 30% 90%', // Lighter Beige
    muted: '0 0% 60%', // Muted Gray
    mutedForeground: '0 0% 40%', // Darker Muted Gray
  },
  typography: {
    fontFamily: 'Vazirmatn, Tahoma, Arial, sans-serif',
    headlineFontFamily: 'Vazirmatn, Tahoma, Arial, sans-serif',
    headerTitleFontFamily: 'Montserrat, Arial, sans-serif',
    headerSubtitleFontFamily: 'Vazirmatn, Tahoma, Arial, sans-serif',
    navbarFontFamily: 'Vazirmatn, Tahoma, Arial, sans-serif',
    itemTitleFontFamily: 'Vazirmatn, Tahoma, Arial, sans-serif',
    descriptionFontFamily: 'Vazirmatn, Tahoma, Arial, sans-serif',
    fontSize: {
      sm: '0.875rem',
      base: '1rem',
      lg: '1.125rem',
      xl: '1.25rem',
      '2xl': '1.5rem',
      '3xl': '1.875rem',
      '4xl': '2.25rem',
      '5xl': '3rem',
    },
    fontWeight: {
      normal: '400',
      medium: '500',
      semibold: '600',
      bold: '700',
    },
    lineHeight: {
      tight: '1.25',
      normal: '1.5',
      relaxed: '1.75',
    },
  },
  header: {
    type: 'text',
    title: 'RETRO',
    logoUrl: '/api/placeholder/200/80/cccccc/666666?text=RETRO',
    showBackground: true,
    backgroundHeight: 'normal',
  },
  layout: {
    borderRadius: {
      sm: '0.25rem',
      md: '0.375rem',
      lg: '0.5rem',
      xl: '0.75rem',
    },
    shadow: {
      sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
      md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
      lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
      xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
      '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)',
    },
    opacity: {
      card: '0.95',
      backdrop: '0.8',
      hover: '0.9',
    },
    spacing: {
      card: '2rem',
      section: '3rem',
    },
  },
  effects: {
    hoverScale: '1.02',
    hoverTranslateY: '-0.5rem',
    transitionDuration: '300ms',
    backdropBlur: '12px',
  },
}

// Theme presets
export const themePresets: ThemePreset[] = [
  {
    id: 'default',
    name: 'پیش‌فرض (گرم و دلپذیر)',
    config: defaultTheme,
  },
  {
    id: 'dark',
    name: 'تیره (مدرن)',
    config: {
      ...defaultTheme,
      colors: {
        ...defaultTheme.colors,
        background: '0 0% 8%', // Dark background
        foreground: '0 0% 95%', // Light text
        card: '0 0% 12%', // Dark card
        cardForeground: '0 0% 95%', // Light card text
        border: '0 0% 20%', // Dark border
        muted: '0 0% 40%',
        mutedForeground: '0 0% 70%',
      },
    },
  },
  {
    id: 'minimal',
    name: 'مینیمال (ساده)',
    config: {
      ...defaultTheme,
      colors: {
        ...defaultTheme.colors,
        background: '0 0% 98%', // Almost white
        foreground: '0 0% 15%', // Dark gray
        primary: '0 0% 25%', // Neutral dark
        accent: '0 0% 50%', // Neutral gray
        card: '0 0% 100%', // Pure white
        border: '0 0% 90%', // Light border
      },
      layout: {
        ...defaultTheme.layout,
        shadow: {
          ...defaultTheme.layout.shadow,
          md: '0 1px 3px 0 rgb(0 0 0 / 0.1)',
          lg: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
          xl: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
        },
      },
    },
  },
  {
    id: 'vibrant',
    name: 'پرانرژی (رنگارنگ)',
    config: {
      ...defaultTheme,
      colors: {
        ...defaultTheme.colors,
        background: '200 100% 95%', // Light blue
        primary: '280 100% 50%', // Purple
        accent: '45 100% 60%', // Bright gold
        card: '0 0% 100%', // White
        border: '200 50% 80%', // Light blue border
      },
    },
  },
]
