/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        sable: '#F1E6D2',
        'sable-dark': '#E4D5B8',
        encre: '#1B2430',
        jaune: '#F4B400',
        'jaune-dark': '#C99000',
        atlantique: '#1D5C8A',
        savane: '#3F7D53',
        laterite: '#B33F2E',
      },
      fontFamily: {
        display: ['var(--font-fraunces)', 'Georgia', 'serif'],
        body: ['var(--font-worksans)', 'Helvetica', 'Arial', 'sans-serif'],
      },
      borderRadius: {
        none: '0px',
        sm: '2px',
        DEFAULT: '2px',
      },
    },
  },
  plugins: [],
};
