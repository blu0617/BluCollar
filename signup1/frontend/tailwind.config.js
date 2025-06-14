// tailwind.config.js
const defaultTheme = require('tailwindcss/defaultTheme');

module.exports = {
  content: ["./src/**/*.{html,js,jsx,ts,tsx,vue}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Poppins", ...defaultTheme.fontFamily.sans],  // FIXED ✅
        serif: ["Merriweather", ...defaultTheme.fontFamily.serif],
        mono: ["Courier New", ...defaultTheme.fontFamily.mono],
      },
      colors: {
        navy: "#2F4156",
        teal: "#567C8D",
        skyblue: "#C8D9E6",
        beige: "#F5EFEB",
        white: "#FFFFFF",
      },
    },
  },
  plugins: [],
};
// // This file is used to configure Tailwind CSS, a utility-first CSS framework.