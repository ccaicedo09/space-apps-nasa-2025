import cookieParser from "cookie-parser";
import express from "express";
import cors from "cors";
import config from "./src/config/config.js";
import connectDB from "./src/libs/conn.js";
import dataRouter from "./src/routes/data.route.js";
import aiRouter from "./src/routes/ai.route.js";


const app = express();

app.use(cors({
  origin: "http://localhost:5173",
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());

connectDB();

app.use("/api/v1/data", dataRouter);
app.use("/api/v1/ai", aiRouter);

app.listen(config.port, () => {
  console.log(`Server listening on port ${config.port}`);
});