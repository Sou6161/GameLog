/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        bg: '#0A0F1F',
        surface: '#111827',
        card: '#1A2238',
        text: '#E2E8F0',
        muted: '#94A3B8',
        primary: {
          DEFAULT: '#22D3EE',
          700: '#0EA5E9',
        },
        accent: {
          DEFAULT: '#F43F5E',
          700: '#BE123C',
        },
        success: '#22C55E',
        warning: '#F59E0B',
        error: '#EF4444',
      },
      fontFamily: {
        'orbitron': ['Orbitron_400Regular', 'Orbitron_700Bold', 'Orbitron_900Black'],
        'inter': ['Inter_400Regular', 'Inter_500Medium', 'Inter_700Bold'],
      },
      animation: {
        'glow': 'glow 2s ease-in-out infinite alternate',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        glow: {
          'from': {
            'box-shadow': '0 0 10px #22D3EE, 0 0 20px #22D3EE, 0 0 30px #22D3EE',
          },
          'to': {
            'box-shadow': '0 0 5px #22D3EE, 0 0 10px #22D3EE, 0 0 15px #22D3EE',
          }
        }
      }
    },
  },
  plugins: [],
}