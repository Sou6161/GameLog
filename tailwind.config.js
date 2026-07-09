/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        // Layered base
        void: '#06090D',
        bg: '#0A0E13',
        surface: '#12171E',
        'surface-alt': '#1A212A',
        elevated: '#232C37',
        // Text
        text: '#F2F6F8',
        dim: '#AEB9C4',
        muted: '#6E7B88',
        // Accents (no purple/pink)
        teal: { DEFAULT: '#14C8B0', bright: '#2DD4BF' },
        cyan: '#22D3EE',
        blue: '#3B82F6',
        sky: '#38BDF8',
        green: '#34D399',
        lime: '#A3E635',
        gold: '#FBBF24',
        amber: '#F59E0B',
        orange: '#FB923C',
        coral: '#FF7A5C',
        yellow: '#FACC15',
        // Semantic
        primary: '#14C8B0',
        success: '#34D399',
        warning: '#F59E0B',
        error: '#EF4444',
      },
      fontFamily: {
        'orbitron': ['Orbitron_400Regular', 'Orbitron_700Bold', 'Orbitron_900Black'],
        'orbitron-bold': ['Orbitron_700Bold'],
        'orbitron-black': ['Orbitron_900Black'],
        'display': ['Audiowide_400Regular'],
        'inter': ['Inter_400Regular', 'Inter_500Medium', 'Inter_700Bold'],
      },
    },
  },
  plugins: [],
}
