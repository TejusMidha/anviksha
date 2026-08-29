import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}', './lib/**/*.{ts,tsx}'],
  theme: {
    extend: {
      /* Every colour here is a POINTER at a CSS custom property declared in
         app/globals.css — there is one place to change a shade, and utility
         classes (bg-void/80, text-amber, border-brick/30) stay in sync with
         raw CSS automatically. The `<alpha-value>` placeholder is what keeps
         Tailwind's slash-opacity working through a variable, which is why the
         base tokens are stored as bare "R G B" triples. */
      colors: {
        void: 'rgb(var(--void-rgb) / <alpha-value>)',
        panel: 'rgb(var(--panel-rgb) / <alpha-value>)',
        paper: 'var(--paper)',
        phosphor: 'rgb(var(--phosphor-rgb) / <alpha-value>)',
        arcade: 'rgb(var(--arcade-rgb) / <alpha-value>)',
        violet: 'rgb(var(--violet-rgb) / <alpha-value>)',
        holo: 'rgb(var(--holo-rgb) / <alpha-value>)',
        amber: 'rgb(var(--amber-rgb) / <alpha-value>)',
        brick: 'rgb(var(--brick-rgb) / <alpha-value>)',
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
