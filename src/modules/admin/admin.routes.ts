import { Router } from "express";
import { AdminController } from "./admin.controller";
import { authMiddleware } from "../../middlewares/auth.middleware";
import { requireAdmin } from "../../middlewares/rbac.middleware";

export class AdminRoutes {
  public router = Router();
  private controller = new AdminController();

  constructor() {
    // All admin routes require authentication + admin role
    this.router.use(authMiddleware, requireAdmin);

    /**
     * @openapi
     * /api/admin/stats:
     *   get:
     *     tags: [Admin]
     *     summary: Platform-wide user statistics
     *     security:
     *       - bearerAuth: []
     *     responses:
     *       200:
     *         description: Stats object
     *       403:
     *         description: Admin role required
     */
    this.router.get("/stats", this.controller.getStats);

    /**
     * @openapi
     * /api/admin/users:
     *   get:
     *     tags: [Admin]
     *     summary: List all registered users
     *     security:
     *       - bearerAuth: []
     *     responses:
     *       200:
     *         description: Array of user objects (password excluded)
     */
    this.router.get("/users", this.controller.getAllUsers);

    /**
     * @openapi
     * /api/admin/users/{id}:
     *   get:
     *     tags: [Admin]
     *     summary: Get user by ID
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         schema:
     *           type: string
     *           format: uuid
     */
    this.router.get("/users/:id", this.controller.getUserById);

    /**
     * @openapi
     * /api/admin/users/{id}/activate:
     *   patch:
     *     tags: [Admin]
     *     summary: Activate a user account
     *     security:
     *       - bearerAuth: []
     */
    this.router.patch("/users/:id/activate", this.controller.activateUser);

    /**
     * @openapi
     * /api/admin/users/{id}/deactivate:
     *   patch:
     *     tags: [Admin]
     *     summary: Deactivate a user account
     *     security:
     *       - bearerAuth: []
     */
    this.router.patch("/users/:id/deactivate", this.controller.deactivateUser);

    /**
     * @openapi
     * /api/admin/users/{id}/role:
     *   patch:
     *     tags: [Admin]
     *     summary: Change a user's role
     *     security:
     *       - bearerAuth: []
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             required: [role]
     *             properties:
     *               role:
     *                 type: string
     *                 enum: [user, admin]
     */
    this.router.patch("/users/:id/role", this.controller.updateUserRole);
  }
}
