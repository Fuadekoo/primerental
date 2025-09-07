import { heroui } from "@heroui/react";

export default heroui({
  themes: {
    light: {
      extend: "light",
      colors: {
        background: "#F8FAFC", // slate-50
        foreground: "#0F172A", // slate-900
        primary: {
          foreground: "#FFFFFF",
          DEFAULT: "#4F46E5", // indigo-600
          50: "#EEF2FF",
          100: "#E0E7FF",
          200: "#C7D2FE",
          300: "#A5B4FC",
          400: "#818CF8",
          500: "#6366F1",
          600: "#4F46E5",
          700: "#4338CA",
          800: "#3730A3",
          900: "#312E81",
        },
        secondary: {
          foreground: "#FFFFFF",
          DEFAULT: "#10B981", // emerald-500
          50: "#ECFDF5",
          100: "#D1FAE5",
          200: "#A7F3D0",
          300: "#6EE7B7",
          400: "#34D399",
          500: "#10B981",
          600: "#059669",
          700: "#047857",
          800: "#065F46",
          900: "#064E3B",
        },
      },
    },
    dark: {
      extend: "dark",
      colors: {
        background: "#0B1220", // deep neutral
        foreground: "#E5E7EB", // gray-200
        primary: {
          foreground: "#FFFFFF",
          DEFAULT: "#6366F1", // indigo-500 for better contrast
          50: "#EEF2FF",
          100: "#E0E7FF",
          200: "#C7D2FE",
          300: "#A5B4FC",
          400: "#818CF8",
          500: "#6366F1",
          600: "#4F46E5",
          700: "#4338CA",
          800: "#3730A3",
          900: "#312E81",
        },
        secondary: {
          foreground: "#FFFFFF",
          DEFAULT: "#34D399", // emerald-400
          50: "#ECFDF5",
          100: "#D1FAE5",
          200: "#A7F3D0",
          300: "#6EE7B7",
          400: "#34D399",
          500: "#10B981",
          600: "#059669",
          700: "#047857",
          800: "#065F46",
          900: "#064E3B",
        },
      },
    },
  },
});
