import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}', './lib/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        void: '#08090d',
        panel: '#12141c',
        phosphor: '#39ff6a',
        arcade: '#ff2e7e',
        violet: '#8b5cff',
        holo: '#4ce0ff',
        amber: '#ffc93c',
      },
      fontFamily: {
        pixel: ['var(--font-pixel)', 'monospace'],
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-mono)', 'ui-monospace', 'monospace'],
      },
      boxShadow: {
        era: '0 0 var(--era-glow) var(--era-color)',
      },
      keyframes: {
        scanline: { '0%': { transform: 'translateY(-100%)' }, '100%': { transform: 'translateY(100%)' } },
        blink: { '0%,49%': { opacity: '1' }, '50%,100%': { opacity: '0' } },
        floaty: { '0%,100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-6px)' } },
      },
      animation: {
        scanline: 'scanline 6s linear infinite',
        blink: 'blink 1.1s steps(1) infinite',
        floaty: 'floaty 6s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};

export default config;
