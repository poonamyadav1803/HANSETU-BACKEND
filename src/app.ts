import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import swaggerUi from "swagger-ui-express";
import { AuthRoutes } from "./modules/auth/auth.routes";
import { UserRoutes } from "./modules/user/user.routes";
import { IndustryRoutes } from "./modules/industry/industry.routes";
import { CategoryRoutes } from "./modules/category/category.routes";
import { ProductRoutes } from "./modules/product/product.routes";
import { ManufacturerRoutes } from "./modules/manufacturer/manufacturer.routes";
import { RawMaterialRoutes } from "./modules/raw-material/raw-material.routes";
import { MachineRoutes } from "./modules/machine/machine.routes";
import { OfferRoutes } from "./modules/offer/offer.routes";
import { CalibrationServiceRoutes } from "./modules/calibration-service/calibration-service.routes";
import { TestingServiceRoutes } from "./modules/testing-service/testing-service.routes";
import { HrServiceRoutes } from "./modules/hr-service/hr-service.routes";
import { TrainingProgramRoutes } from "./modules/training-program/training-program.routes";
import { StudentServiceRoutes } from "./modules/student-service/student-service.routes";
import { FinancialServiceRoutes } from "./modules/financial-service/financial-service.routes";
import { SupplierRoutes } from "./modules/supplier/supplier.routes";
import { AdminRoutes } from "./modules/admin/admin.routes";
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
  app.use("/api/industries", new IndustryRoutes().router);
  app.use("/api/categories", new CategoryRoutes().router);
  app.use("/api/products", new ProductRoutes().router);
  app.use("/api/manufacturers", new ManufacturerRoutes().router);
  app.use("/api/raw-materials", new RawMaterialRoutes().router);
  app.use("/api/machines", new MachineRoutes().router);
  app.use("/api/offers", new OfferRoutes().router);
  app.use("/api/calibration-services", new CalibrationServiceRoutes().router);
  app.use("/api/testing-services", new TestingServiceRoutes().router);
  app.use("/api/hr-services", new HrServiceRoutes().router);
  app.use("/api/training-programs", new TrainingProgramRoutes().router);
  app.use("/api/student-services", new StudentServiceRoutes().router);
  app.use("/api/financial-services", new FinancialServiceRoutes().router);
  app.use("/api/suppliers", new SupplierRoutes().router);
  app.use("/api/admin", new AdminRoutes().router);

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
