import dotenv from "dotenv";

dotenv.config();

export const env = {
    port: Number(process.env.PORT) || 5000,
    dbHost: process.env.DB_HOST || "localhost",
    dbUser: process.env.DB_USER || "root",
    dbPassword: process.env.DB_PASSWORD || "",
    dbName: process.env.DB_NAME || "event_planner_db",
    jwtSecret: process.env.JWT_SECRET || "supersecretkey"
};