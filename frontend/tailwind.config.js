/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
       animation: {
        'ping-slow': 'ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite',
      },
      colors: {
        'dark-blue': '#1e3a8a',
        'dark-bg': '#0f172a',
        'dark-text': '#e2e8f0',
      },
    },
  },
  plugins: [],
};
