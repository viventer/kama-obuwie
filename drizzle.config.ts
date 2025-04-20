import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./database/schemas",
  out: "./migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
