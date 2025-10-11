import type { Config } from "tailwindcss";

const config: Config = {
  theme: {
    screens: {
      "2xs": "24rem", // 384px
      xs: "30rem", // 480px
      sm: "40rem", // 640px
      md: "48rem", // 768px
      lg: "64rem", // 1024px
      xl: "80rem", // 1280px
      "2xl": "96rem", // 1536px
    },
  },
};

export default config;
