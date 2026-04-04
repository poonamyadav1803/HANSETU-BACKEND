import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import swaggerUi from "swagger-ui-express";
import { AuthRoutes } from "./modules/auth/auth.routes";
import { UserRoutes } from "./modules/user/user.routes";
import { errorMiddleware } from "./middlewares/error.middleware";
import { swaggerSpec } from "./config/swagger";
import { log } from "./utils/logger";

export function createApp() {
  const app = express();

  // ─── Core Middleware ──────────────────────────────────────────────────────────
  app.use(
    cors({
      origin: process.env.FRONTEND_URL || "http://localhost:5173",
      credentials: true,
    })
  );
  app.use(express.json());
  app.use(express.urlencoded({ extended: false }));

  // ─── Request Logger ───────────────────────────────────────────────────────────
  app.use((req: Request, res: Response, next: NextFunction) => {
    const start = Date.now();
    const path = req.path;
    let capturedJsonResponse: Record<string, unknown> | undefined;

    const originalJson = res.json.bind(res);
    res.json = function (body) {
      capturedJsonResponse = body;
      return originalJson(body);
    };

    res.on("finish", () => {
      const duration = Date.now() - start;
      if (path.startsWith("/api")) {
        let line = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
        if (capturedJsonResponse) {
          line += ` :: ${JSON.stringify(capturedJsonResponse)}`;
        }
        if (line.length > 120) line = line.slice(0, 119) + "…";
        log(line);
      }
    });

    next();
  });

  // ─── Swagger Docs ─────────────────────────────────────────────────────────────
  // Swagger UI:   http://localhost:3000/api-docs
  // OpenAPI JSON: http://localhost:3000/api/swagger.json
  //               ^ Frontend runs `npm run generate:api` against this endpoint
  app.use(
    "/api-docs",
    swaggerUi.serve,
    swaggerUi.setup(swaggerSpec, {
      customSiteTitle: "Hansetu API Docs",
      customCss: `
        .swagger-ui .topbar { background-color: #1e3a8a; }
        .swagger-ui .topbar .download-url-wrapper { display: none; }
      `,
    })
  );

  app.get("/api/swagger.json", (_req: Request, res: Response) => {
    res.setHeader("Content-Type", "application/json");
    res.send(swaggerSpec);
  });

  // ─── API Routes ───────────────────────────────────────────────────────────────
  app.use("/api/auth", new AuthRoutes().router);
  app.use("/api/users", new UserRoutes().router);

  // ─── Health Check ─────────────────────────────────────────────────────────────
  /**
   * @openapi
   * /api/health:
   *   get:
   *     tags: [Health]
   *     summary: API health check
   *     responses:
   *       200:
   *         description: Server is running
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 status:
   *                   type: string
   *                   example: ok
   *                 timestamp:
   *                   type: string
   *                   format: date-time
   */
  app.get("/api/health", (_req: Request, res: Response) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  // ─── 404 Handler ─────────────────────────────────────────────────────────────
  app.use((_req: Request, res: Response) => {
    res.status(404).json({ message: "Route not found" });
  });

  // ─── Global Error Handler ─────────────────────────────────────────────────────
  app.use(errorMiddleware);

  return app;
}
