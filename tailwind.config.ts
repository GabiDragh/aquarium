import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      backgroundImage: {
        night: 'linear-gradient(to bottom, #1b2735, #090a0f)',
      },
    },
  },
  plugins: [],
}

export default config