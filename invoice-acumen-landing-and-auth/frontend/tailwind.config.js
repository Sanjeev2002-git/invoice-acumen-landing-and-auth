/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        // Legacy tokens kept so existing pages (dashboards, tables, etc.) don't break
        primary: '#146356',
        secondary: '#10192E',

        // New "ledger" design system
        ink: '#10192E',       // deep navy-ink — headers, dark sections
        paper: '#F6F3EC',     // warm paper background (distinct from the generic cream default)
        ledger: {
          50: '#EEF5F2',
          100: '#D9E9E2',
          400: '#2C8A72',
          500: '#146356',     // primary emerald-ledger accent
          600: '#0F4E44',
          700: '#0B3A33',
        },
        stamp: {
          400: '#E3A94A',
          500: '#D98E2B',     // amber "paid stamp" accent
          600: '#B8721C',
        },
        slateink: {
          450: '#5B6472',
        },

        // "Evolvion" dark design system — additive only, nothing above is touched
        evo: {
          bg: '#08080D',        // page background, near-black
          surface: '#111017',   // card / panel background
          surface2: '#17151F',  // slightly raised surface (hover, inputs)
          border: 'rgba(255,255,255,0.08)',
          text: '#F5F4F8',
          muted: '#9C99AC',
          violet: '#8B5CF6',
          indigo: '#6366F1',
          blue: '#3B82F6',
        },
      },
      backgroundImage: {
        'evo-radial': 'radial-gradient(60% 60% at 50% 0%, rgba(139,92,246,0.25) 0%, rgba(8,8,13,0) 70%)',
        'evo-gradient': 'linear-gradient(90deg, #8B5CF6 0%, #6366F1 50%, #3B82F6 100%)',
      },
      fontFamily: {
        display: ['Fraunces', 'ui-serif', 'Georgia', 'serif'],
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'ui-monospace', 'monospace'],
      },
      backgroundImage: {
        'ledger-lines': 'repeating-linear-gradient(to bottom, transparent, transparent 27px, rgba(16,25,46,0.06) 28px)',
      },
    },
  },
  plugins: [],
}
