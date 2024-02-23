/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}', // Note the addition of the `app` directory.
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
 
    // Or if using `src` directory:
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        "slack": "#4A154B",
        "title": "#f2f3f5",
        zinc: {
          "750": ""
        }
      },
      fontFamily: {
        "message": "var(--open-sans)"
      }
    },
  },
  plugins: [],
}