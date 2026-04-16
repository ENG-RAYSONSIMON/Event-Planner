import dotenv from "dotenv";

dotenv.config();

export const env = {
    port: Number(process.env.PORT) || 5000,
    dbHost: process.env.DB_HOST || "localhost",
    dbPort: Number(process.env.DB_PORT) || 5432,
    dbUser: process.env.DB_USER || "postgres",
    dbPassword: process.env.DB_PASSWORD || "",
    dbName: process.env.DB_NAME || "event_planner",
    jwtSecret: process.env.JWT_SECRET || "supersecretkey"
};
