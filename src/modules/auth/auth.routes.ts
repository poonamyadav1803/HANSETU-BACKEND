import { Router } from 'express';
import { AuthController } from './auth.controller';
import { authMiddleware } from '../../middlewares/auth.middleware';

export class AuthRoutes {
  public router = Router();
  private controller = new AuthController();

  constructor() {
    /**
     * @openapi
     * /api/auth/gst-verify:
     *   post:
     *     tags: [Auth]
     *     summary: Verify a GSTIN and fetch business details
     *     description: |
     *       Checks the DB cache first. If not cached, calls the Masters India API,
     *       stores the result, and returns it.
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             $ref: '#/components/schemas/GstVerifyRequest'
     *     responses:
     *       200:
     *         description: GSTIN verified — business details returned
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/GstInfoResponse'
     *       400:
     *         description: Invalid GSTIN format or not found
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/ErrorResponse'
     */
    /**
     * @openapi
     * /api/auth/check-username/{username}:
     *   get:
     *     tags: [Auth]
     *     summary: Check if a username is available
     *     parameters:
     *       - in: path
     *         name: username
     *         required: true
     *         schema:
     *           type: string
     *     responses:
     *       200:
     *         description: Returns availability status
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 available:
     *                   type: boolean
     */
    this.router.get('/check-username/:username', this.controller.checkUsername);

    this.router.post('/gst-verify', this.controller.gstVerify);

    /**
     * @openapi
     * /api/auth/send-email-otp:
     *   post:
     *     tags: [Auth]
     *     summary: Send a 6-digit OTP to an email address
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             $ref: '#/components/schemas/SendOtpRequest'
     *     responses:
     *       200:
     *         description: OTP sent successfully
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/SendOtpResponse'
     */
    this.router.post('/send-email-otp', this.controller.sendEmailOtp);

    /**
     * @openapi
     * /api/auth/verify-email-otp:
     *   post:
     *     tags: [Auth]
     *     summary: Verify the email OTP and get an otpToken
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             $ref: '#/components/schemas/VerifyEmailOtpRequest'
     *     responses:
     *       200:
     *         description: OTP verified — otpToken returned
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/VerifyEmailOtpResponse'
     *       400:
     *         description: Invalid, expired, or already-used OTP
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/ErrorResponse'
     */
    this.router.post('/verify-email-otp', this.controller.verifyEmailOtp);

    /**
     * @openapi
     * /api/auth/signup:
     *   post:
     *     tags: [Auth]
     *     summary: Register a new business account
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             $ref: '#/components/schemas/SignupRequest'
     *     responses:
     *       201:
     *         description: Account created — JWT and user returned
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
     *         description: Email already registered
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/ErrorResponse'
     */
    this.router.post('/signup', this.controller.signup);

    /**
     * @openapi
     * /api/auth/login:
     *   post:
     *     tags: [Auth]
     *     summary: Login with email or username and password
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             $ref: '#/components/schemas/LoginRequest'
     *     responses:
     *       200:
     *         description: Login successful — JWT and user returned
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/AuthResponse'
     *       401:
     *         description: Invalid credentials
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/ErrorResponse'
     */
    this.router.post('/login', this.controller.login);

    /**
     * @openapi
     * /api/auth/me:
     *   get:
     *     tags: [Auth]
     *     summary: Get current authenticated user
     *     security:
     *       - bearerAuth: []
     *     responses:
     *       200:
     *         description: Current user profile
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/UserResponse'
     *       401:
     *         description: Not authenticated
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/ErrorResponse'
     */
    this.router.get('/me', authMiddleware, this.controller.me);

    /**
     * @openapi
     * /api/auth/me/profile:
     *   patch:
     *     tags: [Auth]
     *     summary: Update current user's business profile
     *     security:
     *       - bearerAuth: []
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             $ref: '#/components/schemas/UpdateProfileRequest'
     *     responses:
     *       200:
     *         description: Profile updated — full user returned
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/UserResponse'
     *       401:
     *         description: Not authenticated
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/ErrorResponse'
     */
    this.router.patch(
      '/me/profile',
      authMiddleware,
      this.controller.updateProfile,
    );

    /**
     * @openapi
     * /api/auth/complete-registration:
     *   post:
     *     tags: [Auth]
     *     summary: Complete contact/address registration step
     *     security:
     *       - bearerAuth: []
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             required: [firstName, lastName, phone]
     *             properties:
     *               firstName: { type: string }
     *               lastName: { type: string }
     *               designation: { type: string }
     *               phone: { type: string }
     *               addresses: { type: array }
     *               yearEstablished: { type: string }
     *               totalEmployees: { type: string }
     *               website: { type: string }
     *               description: { type: string }
     *     responses:
     *       200:
     *         description: Registration completed — updated user returned
     */
    this.router.post("/complete-registration", authMiddleware, this.controller.completeRegistration);

    /**
     * @openapi
     * /api/auth/send-phone-otp:
     *   post:
     *     tags: [Auth]
     *     summary: Send OTP to a mobile number (future use)
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             required: [mobile]
     *             properties:
     *               mobile:
     *                 type: string
     *                 example: "+919876543210"
     *     responses:
     *       200:
     *         description: OTP sent to mobile
     */
    this.router.post('/send-phone-otp', this.controller.sendPhoneOtp);

    /**
     * @openapi
     * /api/auth/verify-phone-otp:
     *   post:
     *     tags: [Auth]
     *     summary: Verify the phone OTP (future use)
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             required: [mobile, otp]
     *             properties:
     *               mobile:
     *                 type: string
     *               otp:
     *                 type: string
     *     responses:
     *       200:
     *         description: Phone OTP verified
     *       400:
     *         description: Invalid or expired OTP
     */
    this.router.post('/verify-phone-otp', this.controller.verifyPhoneOtp);
  }
}
