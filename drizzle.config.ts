import type { Config } from "drizzle-kit";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not set");
}

const connectionString = process.env.DATABASE_URL;
const url = new URL(connectionString);

export default {
  schema: "./shared/schema.ts",
  out: "./migrations",
  dialect: "postgresql",
  dbCredentials: {
    host: url.hostname,
    port: parseInt(url.port),
    user: url.username,
    password: url.password,
    database: url.pathname.slice(1),
    ssl: true
  },
  verbose: true,
  strict: true,
} satisfies Config;
