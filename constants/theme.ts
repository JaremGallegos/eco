import { Platform } from 'react-native';

export const Colors = {
  // Colores primarios
  primary: '#275258',
  primaryLight: '#3A7580',
  primaryDark: '#1a3a3e',

  // Colores secundarios
  secondary: '#F05B23',
  secondaryLight: '#FF7043',
  secondaryDark: '#d94e1f',

  // Colores de acento
  accent: '#00BCD4',

  // Estados
  success: '#4CAF50',
  successLight: '#81C784',
  warning: '#FF9800',
  error: '#F44336',
  info: '#2196F3',

  // Estados de reportes
  statusReported: '#E91E63',
  statusInReview: '#FF9800',
  statusOnWay: '#2196F3',
  statusResolved: '#4CAF50',
  statusClosed: '#607D8B',
  statusEscalated: '#9C27B0',

  // Servicios
  water: '#2196F3',
  waterLight: '#64B5F6',
  waterAccent: '#29B6F6',
  electric: '#FFC107',
  electricLight: '#FFD54F',
  electricAccent: '#FFCA28',

  // Grises
  gray50: '#FAFAFA',
  gray100: '#F5F5F5',
  gray200: '#EEEEEE',
  gray300: '#E0E0E0',
  gray400: '#BDBDBD',
  gray500: '#9E9E9E',
  gray600: '#757575',
  gray700: '#616161',
  gray800: '#424242',
  gray900: '#212121',

  // Colores comunes
  white: '#FAFAFA',
  offWhite: '#F8F9FA',
  lightGray: '#F0F0F0',
  mediumGray: '#CCCCCC',
  darkGray: '#999999',
  textGray: '#666666',
  textDark: '#333333',

  // Mapa de calor
  heatmapStart: 'rgba(0,0,0,0)',
  heatmapCool: '#4FC3F7',
  heatmapMid: '#29B6F6',
  heatmapWarm: '#FFCA28',
  heatmapHot: '#FF7043',

  // Alerta
  warningDark: '#E65100',
  warningDarker: '#BF360C',
  warningBg: '#FFF3E0',
  warningBorder: '#FFE0B2',

  errorBg: '#FFEBEE',
  errorDark: '#D32F2F',
  errorDarker: '#C62828',
  errorDarkest: '#B71C1C',

  successBg: '#E8F5E9',
  successDark: '#388E3C',
  successDarker: '#1B5E20',

  infoBg: '#FFF8E1',
  infoDark: '#F57C00',
  infoDarker: '#E65100',

  // Transparencia
  primaryAlpha: 'rgba(39, 82, 88, 0.1)',
  secondaryAlpha: 'rgba(240, 91, 35, 0.1)',
  secondaryAlphaMedium: 'rgba(240, 91, 35, 0.9)',
  waterAlpha: 'rgba(33, 150, 243, 0.1)',
  electricAlpha: 'rgba(255, 193, 7, 0.1)',
  warningAlpha: 'rgba(255, 193, 7, 0.2)',
  errorAlpha: 'rgba(211, 47, 47, 0.2)',
  successAlpha: 'rgba(46, 125, 50, 0.2)',
  blackAlpha: 'rgba(0, 0, 0, 0.6)',

  // Severidad
  severityCritical: '#D32F2F',
  severityHigh: '#F57C00',
  severityMedium: '#FBC02D',
  severityLow: '#388E3C',
  purple: '#7b1fa2',

  // UI adicionales
  darkBackground: '#393e42',
  darkBackgroundAlt: '#303337',
  iconGray: '#86939e',
  lightBackground: '#f5f5f5',
  greenDark: '#1b5e20',

  light: {
    text: '#11181C',
    textSecondary: '#666666',
    background: '#fff',
    backgroundAlt: '#f8f9fa',
    tint: '#275258',
    icon: '#687076',
    tabIconDefault: '#687076',
    tabIconSelected: '#275258',
    error: '#F05B23',
    success: '#2e7d32',
    border: '#E0E0E0',
    card: '#ffffff',
  },
  dark: {
    text: '#ECEDEE',
    textSecondary: '#9BA1A6',
    background: '#151718',
    backgroundAlt: '#1E1E1E',
    tint: '#3A7580',
    icon: '#9BA1A6',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: '#3A7580',
    error: '#FF7043',
    success: '#4caf50',
    border: '#2C2C2C',
    card: '#1E1E1E',
  },
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 40,
  xxxl: 48,
};

export const BorderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  round: 999,
};

export const Shadows = {
  none: {
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  xl: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
  colored: {
    primary: {
      shadowColor: '#275258',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 6,
    },
    secondary: {
      shadowColor: '#F05B23',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 6,
    },
  },
};

export const Gradients = {
  primary: ['#275258', '#1a3a3e', '#0f2528'] as const,
  secondary: ['#F05B23', '#d94e1f', '#c0441b'] as const,
};

export const Typography = {
  sizes: {
    xs: 12,
    sm: 13,
    base: 14,
    md: 15,
    lg: 16,
    xl: 18,
    xxl: 20,
    xxxl: 24,
    huge: 32,
    massive: 42,
  },
  weights: {
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
  },
};

export const Fonts = Platform.select({
  ios: {
    sans: 'system-ui',
    serif: 'ui-serif',
    rounded: 'ui-rounded',
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
