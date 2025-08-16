import { heroui } from "@heroui/react";

export default heroui({
  themes: {
    light: {
      extend: "light",
      colors: {
        background: "#FFFFFF",
        foreground: "#000000",
        primary: {
          foreground: "#FFFFFF",
          DEFAULT: "#000000", // black
          50: "#F5F5F5",
          100: "#E0E0E0",
          200: "#BDBDBD",
          300: "#9E9E9E",
          400: "#757575",
          500: "#616161",
          600: "#424242",
          700: "#212121",
          800: "#121212",
          900: "#000000",
        },
        secondary: {
          foreground: "#FFFFFF",
          DEFAULT: "#FFD700", // gold
          50: "#FFFBEA",
          100: "#FFF3C4",
          200: "#FCE588",
          300: "#FADB5F",
          400: "#F7C948",
          500: "#F0B429",
          600: "#DE911D",
          700: "#CB6E17",
          800: "#B44D12",
          900: "#8D2B0B",
        },
      },
    },
    dark: {
      extend: "dark",
      colors: {
        background: "#000000",
        foreground: "#FFFFFF",
        primary: {
          foreground: "#FFFFFF",
          DEFAULT: "#000000", // black
          50: "#121212",
          100: "#212121",
          200: "#424242",
          300: "#616161",
          400: "#757575",
          500: "#9E9E9E",
          600: "#BDBDBD",
          700: "#E0E0E0",
          800: "#F5F5F5",
          900: "#FFFFFF",
        },
        secondary: {
          foreground: "#000000",
          DEFAULT: "#FFD700", // gold
          50: "#FFFBEA",
          100: "#FFF3C4",
          200: "#FCE588",
          300: "#FADB5F",
          400: "#F7C948",
          500: "#F0B429",
          600: "#DE911D",
          700: "#CB6E17",
          800: "#B44D12",
          900: "#8D2B0B",
        },
      },
    },
  },
});
