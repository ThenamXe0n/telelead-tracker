/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: { DEFAULT: '#06b6d4', hover: '#22d3ee', dark: '#164e63' },
        surface: { DEFAULT: '#f8fafc', alt: '#f1f5f9' },
        muted: '#64748b',
        border: '#e2e8f0',
      },
      boxShadow: {
        sm: '0 1px 3px rgba(0, 0, 0, 0.08)',
        DEFAULT: '0 1px 3px rgba(0, 0, 0, 0.08)',
        md: '0 4px 6px -1px rgba(0, 0, 0, 0.08), 0 2px 4px -2px rgba(0, 0, 0, 0.06)',
      },
    },
  },
  plugins: [],
};
