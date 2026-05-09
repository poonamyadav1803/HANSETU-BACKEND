import { Router } from "express";
import { AdminAuthController } from "./admin-auth.controller";
import { adminMiddleware } from "../../middlewares/admin.middleware";

export class AdminAuthRoutes {
  public router = Router();
  private controller = new AdminAuthController();

  constructor() {
    // ── Public routes ─────────────────────────────────────────────────────────

    /**
     * @openapi
     * /api/admin-auth/login:
     *   post:
     *     tags: [AdminAuth]
     *     summary: Admin login
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             required: [email, password]
     *             properties:
     *               email: { type: string }
     *               password: { type: string }
     *     responses:
     *       200:
     *         description: Login successful — JWT and admin returned
     *       401:
     *         description: Invalid credentials
     *       403:
     *         description: Account pending approval
     */
    this.router.post("/login", this.controller.login);

    /**
     * @openapi
     * /api/admin-auth/invite/{token}/validate:
     *   get:
     *     tags: [AdminAuth]
     *     summary: Validate an admin invitation token
     *     parameters:
     *       - in: path
     *         name: token
     *         required: true
     *         schema: { type: string }
     *     responses:
     *       200:
     *         description: Token valid — email returned
     *       400:
     *         description: Invalid or expired token
     */
    this.router.get("/invite/:token/validate", this.controller.validateInviteToken);

    /**
     * @openapi
     * /api/admin-auth/register:
     *   post:
     *     tags: [AdminAuth]
     *     summary: Complete admin registration via invite token
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             required: [token, firstName, lastName, username, password]
     *             properties:
     *               token: { type: string }
     *               firstName: { type: string }
     *               lastName: { type: string }
     *               username: { type: string }
     *               password: { type: string, minLength: 8 }
     *     responses:
     *       201:
     *         description: Registration submitted — pending approval
     *       400:
     *         description: Invalid or expired token
     *       409:
     *         description: Email or username already taken
     */
    this.router.post("/register", this.controller.register);

    // ── Protected routes (requires admin JWT) ─────────────────────────────────
    this.router.use(adminMiddleware);

    /**
     * @openapi
     * /api/admin-auth/me:
     *   get:
     *     tags: [AdminAuth]
     *     summary: Get current authenticated admin
     *     security:
     *       - bearerAuth: []
     */
    this.router.get("/me", this.controller.me);

    /**
     * @openapi
     * /api/admin-auth/invite:
     *   post:
     *     tags: [AdminAuth]
     *     summary: Invite a new admin by email
     *     security:
     *       - bearerAuth: []
     */
    this.router.post("/invite", this.controller.inviteAdmin);

    /**
     * @openapi
     * /api/admin-auth/pending:
     *   get:
     *     tags: [AdminAuth]
     *     summary: List admin accounts pending approval
     *     security:
     *       - bearerAuth: []
     */
    this.router.get("/pending", this.controller.getPendingRegistrations);

    /**
     * @openapi
     * /api/admin-auth/approve/{id}:
     *   patch:
     *     tags: [AdminAuth]
     *     summary: Approve a pending admin registration
     *     security:
     *       - bearerAuth: []
     */
    this.router.patch("/approve/:id", this.controller.approveRegistration);
  }
}
