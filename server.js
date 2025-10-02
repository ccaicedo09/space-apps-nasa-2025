import cookieParser from "cookie-parser";
import express from "express";
import config from "./src/config/config.js";
import connectDB from "./src/libs/conn.js";
import authRouter from "./src/routes/auth.route.js";
import recoveryRouter from "./src/routes/recovery.route.js"
import dataRouter from "./src/routes/data.route.js";

const app = express();

app.use(express.json());
app.use(cookieParser());

connectDB();

app.use("/api/v1/auth", authRouter);
app.use("/api/v1/recovery", recoveryRouter);
app.use("/api/v1/data", dataRouter)

app.listen(config.port, () => {
  console.log(`Server listening on port ${config.port}`);
});