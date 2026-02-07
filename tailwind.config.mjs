import animate from 'tailwindcss-animate';

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,ts,tsx,md,mdx}'],
  theme: {
    extend: {
      colors: {
        ink: '#0a0b0e',
        night: '#10111a',
        mist: '#f8f9fa',
        limelight: '#c6ff4c',
        'limelight-dim': '#a5d93d',
        ember: '#ff6b5a',
        cobalt: '#4aa3ff',
        graphite: '#1a1b26',
        slate: '#2a2d3e',
        gold: '#ffd700',
        silver: '#c0c0c0',
        bronze: '#cd7f32',
      },
      fontFamily: {
        body: ['"Inter"', 'system-ui', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        glow: '0 0 0 1px rgba(198,255,76,0.35), 0 20px 60px -20px rgba(198,255,76,0.5)',
        'glow-sm': '0 0 20px -5px rgba(198,255,76,0.3)',
        slate: '0 20px 50px -20px rgba(0,0,0,0.8)',
        card: '0 4px 30px -10px rgba(0,0,0,0.5)',
        'card-hover': '0 20px 60px -20px rgba(0,0,0,0.7), 0 0 40px -10px rgba(198,255,76,0.15)',
      },
      backgroundImage: {
        grain: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 400 400\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noiseFilter)\'/%3E%3C/svg%3E")',
        halo: 'radial-gradient(ellipse 80% 50% at 20% 0%, rgba(198,255,76,0.12), transparent 50%), radial-gradient(ellipse 60% 40% at 80% 20%, rgba(74,163,255,0.08), transparent 50%), radial-gradient(ellipse 50% 60% at 50% 100%, rgba(255,107,90,0.06), transparent 50%)',
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out forwards',
        'slide-up': 'slideUp 0.5s cubic-bezier(0.22, 1, 0.36, 1) forwards',
        'scale-in': 'scaleIn 0.3s ease-out forwards',
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
        'shimmer': 'shimmer 2s linear infinite',
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(198,255,76,0.4)' },
          '50%': { boxShadow: '0 0 20px 5px rgba(198,255,76,0.2)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      transitionTimingFunction: {
        spring: 'cubic-bezier(0.22, 1, 0.36, 1)',
      },
    },
  },
  plugins: [animate],
};
