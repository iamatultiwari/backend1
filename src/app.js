import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();

app.use(cors({
  origin: process.env.CORS_ORIGIN,
  credentials: true
}));

app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));
app.use(cookieParser());

// routes import
import userRouter from './routes/user.routes.js';

// routes declaration
app.use("/api/v1/users", userRouter);

// ✅ Add this route to fix "Cannot GET /"
app.get("/", (req, res) => {
  res.status(200).send("✅ Server is running and root route is working!");
});

export { app };

