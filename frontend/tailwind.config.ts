import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f5f8ff',
          500: '#2f6fed',
          700: '#1c4fb5'
        }
      }
    }
  },
  plugins: []
};

export default config;

