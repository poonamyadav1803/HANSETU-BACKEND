import { Router } from "express";
import { AuthController } from "./auth.controller";

export class AuthRoutes {
  public router = Router();
  private controller = new AuthController();

  constructor() {
    /**
     * @openapi
     * /api/auth/signup:
     *   post:
     *     tags: [Auth]
     *     summary: Register a new business account
     *     description: |
     *       Creates a new business account after GST verification.
     *       Supports business types: manufacturer, raw_material_supplier, or both.
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             $ref: '#/components/schemas/SignupRequest'
     *     responses:
     *       201:
     *         description: Account created successfully — returns JWT token
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/AuthResponse'
     *       400:
     *         description: Validation error
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/ErrorResponse'
     *       409:
     *         description: User already exists
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/ErrorResponse'
     */
    this.router.post("/signup", this.controller.signup);

    /**
     * @openapi
     * /api/auth/login:
     *   post:
     *     tags: [Auth]
     *     summary: Log in to an existing account
     *     description: Authenticates a user by email and password. Returns a JWT token valid for 1 day.
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             $ref: '#/components/schemas/LoginRequest'
     *     responses:
     *       200:
     *         description: Login successful — returns JWT token
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/AuthResponse'
     *       400:
     *         description: Validation error
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/ErrorResponse'
     *       401:
     *         description: Invalid credentials
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/ErrorResponse'
     */
    this.router.post("/login", this.controller.login);
  }
}
