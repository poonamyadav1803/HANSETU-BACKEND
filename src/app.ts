import express from "express";
import { AuthRoutes } from "./modules/auth/auth.routes";

export function createApp() {
  const app = express();
  app.use(express.json());

  app.use("/api/auth", new AuthRoutes().router);

  return app;
}