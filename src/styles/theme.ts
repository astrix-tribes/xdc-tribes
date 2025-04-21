export const theme = {
  colors: {
    background: {
      primary: '#0a0a0a',
      secondary: '#4e4b51',
      tertiary: '#252729',
    },
    text: {
      primary: '#ffffff',
      secondary: '#9ca3af',
      accent: '#244B81',
    },
    border: {
      primary: '#252729',
      secondary: '#4e4b51',
    },
    button: {
      primary: '#244B81',
      secondary: '#4e4b51',
    },
  },
} as const;

export type Theme = typeof theme; 