/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        paper: {
          DEFAULT: '#faf9f6',
          surface: '#ffffff',
          subtle: '#f5f4ef',
          border: '#e4e2db',
        },
        ink: {
          DEFAULT: '#18181b',
          muted: '#52525b',
          subtle: '#71717a',
        },
        verified: {
          DEFAULT: '#0f766e', // deep teal
          hover: '#115e59',
          light: '#f0fdfa',
          border: '#99f6e4',
          badge: '#ccfbf1',
        },
        unverified: {
          DEFAULT: '#b45309', // warm amber
          hover: '#92400e',
          light: '#fffbeb',
          border: '#fde68a',
        },
        gap: {
          DEFAULT: '#b91c1c', // brick red
          hover: '#991b1b',
          light: '#fef2f2',
          border: '#fecaca',
        },
      },
      fontFamily: {
        serif: ['Newsreader', 'Georgia', 'Cambria', 'Times New Roman', 'serif'],
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'Consolas', 'monospace'],
      },
      boxShadow: {
        'xs': '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        'sm': '0 1px 3px 0 rgba(0, 0, 0, 0.06), 0 1px 2px -1px rgba(0, 0, 0, 0.06)',
        'md': '0 4px 6px -1px rgba(0, 0, 0, 0.06), 0 2px 4px -2px rgba(0, 0, 0, 0.04)',
      },
    },
  },
  plugins: [],
}
