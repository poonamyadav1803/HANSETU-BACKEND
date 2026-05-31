import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import swaggerUi from "swagger-ui-express";
import { AuthRoutes } from "./modules/auth/auth.routes";
import { UserRoutes } from "./modules/user/user.routes";
import { IndustryRoutes } from "./modules/industry/industry.routes";
import { CategoryRoutes } from "./modules/category/category.routes";
import { SubcategoryRoutes } from "./modules/subcategory/subcategory.routes";
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
import { SupplierRoutes, AdminSupplierRoutes } from "./modules/supplier/supplier.routes";
import { AdminRoutes } from "./modules/admin/admin.routes";
import { AdminAuthRoutes } from "./modules/admin-auth/admin-auth.routes";
import { BusinessAdminRoutes } from "./modules/business-admin/business-admin.routes";
import { WizardRoutes } from "./modules/wizard/wizard.routes";
import { ProfileRoutes } from "./modules/profile/profile.routes";
import { NavRoutes } from "./modules/nav/nav.routes";
import { RawMaterialOrderRoutes } from "./modules/raw-material-order/raw-material-order.routes";
import { SupplierInventoryRoutes } from "./modules/supplier-inventory/supplier-inventory.routes";
import { SupplierTransactionRoutes } from "./modules/supplier-transaction/supplier-transaction.routes";
import { MfrIndustryRoutes } from "./modules/mfr-industry/mfr-industry.routes";
import { MfrCategoryRoutes } from "./modules/mfr-category/mfr-category.routes";
import { MfrProductRoutes } from "./modules/mfr-product/mfr-product.routes";
import { UserAddressRoutes } from "./modules/user-address/user-address.routes";
import { AutoOrderRoutes } from "./modules/auto-order/auto-order.routes";
import { RfqRoutes, AdminRfqRoutes } from "./modules/rfq/rfq.routes";
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
  app.use("/api/subcategories", new SubcategoryRoutes().router);
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
  app.use("/api/admin", new AdminSupplierRoutes().router);
  app.use("/api/admin", new AdminRoutes().router);
  app.use("/api/admin-auth", new AdminAuthRoutes().router);
  app.use("/api/business-admin", new BusinessAdminRoutes().router);
  app.use("/api/wizard", new WizardRoutes().router);
  app.use("/api/profile", new ProfileRoutes().router);
  app.use("/api/nav", new NavRoutes().router);
  app.use("/api/raw-material-orders", new RawMaterialOrderRoutes().router);
  app.use("/api/supplier-inventory", new SupplierInventoryRoutes().router);
  app.use("/api/supplier-transactions", new SupplierTransactionRoutes().router);
  app.use("/api/mfr-industries", new MfrIndustryRoutes().router);
  app.use("/api/mfr-categories", new MfrCategoryRoutes().router);
  app.use("/api/mfr-products", new MfrProductRoutes().router);
  app.use("/api/addresses", new UserAddressRoutes().router);
  app.use("/api/auto-orders", new AutoOrderRoutes().router);
  app.use("/api/rfq", new RfqRoutes().router);
  app.use("/api/admin", new AdminRfqRoutes().router);

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
