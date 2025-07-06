/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
    container:{
      padding:{
        md:"0rem",
      },
    },
    containerSM:{
      padding:{
        md:"4rem",
      },
    },
  },
  plugins: [],
}