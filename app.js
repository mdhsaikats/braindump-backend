import express from "express";
import authRouter from "./src/routes/authRoutes.js";
import userRouter from "./src/routes/userRoutes.js";
import ideaRoutes from "./src/routes/ideaRoutes.js";
import morgan from "morgan";
import authMiddleware from "./src/middleware/authMiddleware.js";
import limiter from "./src/utils/rateLimiter.js";
import helmet from "helmet";
import cors from "cors";
import notFound from "./src/middleware/errorHandler.js";
import publicRoutes from "./src/routes/publicRoutes.js";

const app = express();
const appRouter = express.Router();

app.use(
  cors({
    origin: "*",
  }),
);
app.use(helmet());
app.use(limiter);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));

// Routes
appRouter.use("/api/v1/health", (req, res) => {
  res.status(200).json({
    status: true,
    message: "Your sever is healthy",
  });
});

appRouter.use("/api/v1/auth", authRouter);
appRouter.use("/api/v1/users", authMiddleware, userRouter, ideaRoutes);
appRouter.use("/api/v1/public", publicRoutes);

app.use(appRouter);
app.use(notFound);

export default app;
