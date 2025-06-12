import type { ColorSystemOptions } from '@mui/material/styles';

import { california, kepple, neonBlue, nevada, redOrange, shakespeare, stormGrey } from './colors';
import type { ColorScheme } from './types';

export const colorSchemes = {
  light: {
    palette: {
      action: { disabledBackground: 'rgba(0, 0, 0, 0.06)' },
      background: {
        default: '#E0E0E0', // Light gray background for the default
        defaultChannel: '245 245 245',
        paper: '#FFFFFF', // Slightly darker gray for paper
        paperChannel: '255 255 255',
        level1: '#BDBDBD', // Darker gray for level1
        level2: '#9E9E9E', // Darker gray for level2
        level3: '#757575', // Even darker gray for level3
      },
      common: { black: '#000000', white: '#ffffff' },
      divider: 'var(--mui-palette-neutral-200)',
      dividerChannel: '220 223 228',
      error: {
        ...redOrange,
        light: redOrange[400],
        main: redOrange[500],
        dark: redOrange[600],
        contrastText: 'var(--mui-palette-common-white)',
      },
      info: {
        ...shakespeare,
        light: shakespeare[400],
        main: shakespeare[500],
        dark: shakespeare[600],
        contrastText: 'var(--mui-palette-common-white)',
      },
      neutral: { ...stormGrey },
      primary: {
        50: '#E0F7F3',
        100: '#B3EDE1',
        200: '#80E3CD',
        300: '#4DD9B8',
        400: '#26D0A9',
        500: '#00BFA6', // Main primary color
        600: '#00A28C',
        700: '#008572',
        800: '#006958',
        900: '#004D3E',
        contrastText: 'var(--mui-palette-common-white)',
      },
      secondary: {
        ...nevada,
        light: nevada[600],
        main: nevada[700],
        dark: nevada[800],
        contrastText: 'var(--mui-palette-common-white)',
      },
      success: {
        ...kepple,
        light: kepple[400],
        main: kepple[500],
        dark: kepple[600],
        contrastText: 'var(--mui-palette-common-white)',
      },
      text: {
        primary: 'var(--mui-palette-neutral-900)',
        primaryChannel: '33 38 54',
        secondary: 'var(--mui-palette-neutral-500)',
        secondaryChannel: '102 112 133',
        disabled: 'var(--mui-palette-neutral-400)',
      },
      warning: {
        ...california,
        light: california[400],
        main: california[500],
        dark: california[600],
        contrastText: 'var(--mui-palette-common-white)',
      },
    },
  },
} satisfies Partial<Record<ColorScheme, ColorSystemOptions>>;
