import { Router } from "express";
import { AdminController } from "./admin.controller";
import { adminMiddleware } from "../../middlewares/admin.middleware";

export class AdminRoutes {
  public router = Router();
  private controller = new AdminController();

  constructor() {
    this.router.use(adminMiddleware);

    /**
     * @openapi
     * /api/admin/stats:
     *   get:
     *     tags: [Admin]
     *     summary: Platform-wide user statistics
     *     security:
     *       - bearerAuth: []
     */
    this.router.get("/stats", this.controller.getStats);

    /**
     * @openapi
     * /api/admin/users:
     *   get:
     *     tags: [Admin]
     *     summary: List all registered business users
     *     security:
     *       - bearerAuth: []
     */
    this.router.get("/users", this.controller.getAllUsers);

    /**
     * @openapi
     * /api/admin/users/{id}:
     *   get:
     *     tags: [Admin]
     *     summary: Get business user by ID
     *     security:
     *       - bearerAuth: []
     */
    this.router.get("/users/:id", this.controller.getUserById);

    /**
     * @openapi
     * /api/admin/users/{id}/activate:
     *   patch:
     *     tags: [Admin]
     *     summary: Activate a business user account
     *     security:
     *       - bearerAuth: []
     */
    this.router.patch("/users/:id/activate", this.controller.activateUser);

    /**
     * @openapi
     * /api/admin/users/{id}/deactivate:
     *   patch:
     *     tags: [Admin]
     *     summary: Deactivate a business user account
     *     security:
     *       - bearerAuth: []
     */
    this.router.patch("/users/:id/deactivate", this.controller.deactivateUser);

    /**
     * @openapi
     * /api/admin/users/{id}/role:
     *   patch:
     *     tags: [Admin]
     *     summary: Change a business user's role
     *     security:
     *       - bearerAuth: []
     */
    this.router.patch("/users/:id/role", this.controller.updateUserRole);

    // ── Raw Material Catalog CRUD (categories) ────────────────────────────
    this.router.get("/catalog/rm-categories", this.controller.getRMCategories);
    this.router.post("/catalog/rm-categories", this.controller.createRMCategory);
    this.router.patch("/catalog/rm-categories/:id", this.controller.updateRMCategory);
    this.router.delete("/catalog/rm-categories/:id", this.controller.deleteRMCategory);

    // ── Raw Material Catalog CRUD (products) ──────────────────────────────
    this.router.get("/catalog/rm-products", this.controller.getRMProducts);
    this.router.post("/catalog/rm-products", this.controller.createRMProduct);
    this.router.patch("/catalog/rm-products/:id", this.controller.updateRMProduct);
    this.router.delete("/catalog/rm-products/:id", this.controller.deleteRMProduct);
  }
}
