import { Router } from "express";
import { UserController } from "./user.controller";

export class UserRoutes {
  public router = Router();
  private controller = new UserController();

  constructor() {
    /**
     * @openapi
     * /api/users:
     *   get:
     *     tags: [Users]
     *     summary: List all users
     *     description: Returns all registered business accounts. Passwords are excluded.
     *     security:
     *       - bearerAuth: []
     *     responses:
     *       200:
     *         description: Array of user objects
     *         content:
     *           application/json:
     *             schema:
     *               type: array
     *               items:
     *                 $ref: '#/components/schemas/UserResponse'
     *       401:
     *         description: Unauthorized
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/ErrorResponse'
     */
    this.router.get("/", this.controller.getAll);

    /**
     * @openapi
     * /api/users/{id}:
     *   get:
     *     tags: [Users]
     *     summary: Get a user by ID
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         schema:
     *           type: string
     *           format: uuid
     *         description: User UUID
     *     responses:
     *       200:
     *         description: User object (password excluded)
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/UserResponse'
     *       404:
     *         description: User not found
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/ErrorResponse'
     */
    this.router.get("/:id", this.controller.getById);

    /**
     * @openapi
     * /api/users/{id}/deactivate:
     *   patch:
     *     tags: [Users]
     *     summary: Deactivate a user account
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         schema:
     *           type: string
     *           format: uuid
     *         description: User UUID
     *     responses:
     *       200:
     *         description: User deactivated successfully
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 message:
     *                   type: string
     *                   example: User deactivated
     *       404:
     *         description: User not found
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/ErrorResponse'
     */
    this.router.patch("/:id/deactivate", this.controller.deactivate);
  }
}
