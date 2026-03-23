import express, { Application } from "express";
import cors from "cors";
import authRoutes from "./modules/auth/auth.routes";
import userRoutes from "./modules/users/user.routes";
import eventRoutes from "./modules/events/event.routes";
import invitationRoutes from "./modules/invitations/invitation.routes";
import { notFoundMiddleware } from "./middlewares/notFound.middleware";
import { errorMiddleware } from "./middlewares/error.middleware";

const app: Application = express();

app.use(cors());
app.use(express.json());

app.get("/api/health", (_req, res) => {
    res.status(200).json({
        success: true,
        message: "Event Planner API is running"
    });
});

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/events", eventRoutes);
app.use("/api", invitationRoutes);

app.use(notFoundMiddleware);
app.use(errorMiddleware);

export default app;