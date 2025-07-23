import express, { NextFunction, Request, Response } from "express";
import * as mongoose from "mongoose";

import { envConfig } from "./configs/env.config";
import { logpath } from "./dev/logpath";
import { ApiError } from "./errors/api.error";
import { apiRouter } from "./routers/api.router";

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(logpath);
app.use("/api", apiRouter);

app.use((error: Error, req: Request, res: Response, next: NextFunction) => {
  const status = (error as ApiError).statusCode || 500;
  const message = error.message ?? "Server error";

  console.log(error.message);
  res.status(status).json({ message });
});

process.on("uncaughtException", (error) => {
  console.error("Uncaught Exception: ", error);
  process.exit(1);
});

app.listen(envConfig.APP_PORT, async () => {
  try {
    await mongoose.connect(envConfig.MONGO_URI);
  } catch {
    console.log("DB pomerla");
    process.exit(1);
  }

  console.log(
    "Server is running on http://" +
      envConfig.APP_HOST +
      ":" +
      envConfig.APP_PORT
  );
});
