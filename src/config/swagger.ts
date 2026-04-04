import swaggerJsdoc from "swagger-jsdoc";

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Hansetu API",
      version: "1.0.0",
      description:
        "Hansetu Industrial B2B Marketplace — RESTful API documentation. " +
        "Run `npm run generate:api` in hansetu-frontend to generate TypeScript types from this spec.",
      contact: {
        name: "Hansetu Engineering",
      },
    },
    servers: [
      {
        url: "http://localhost:3000",
        description: "Development server",
      },
      {
        url: "https://api.hansetu.com",
        description: "Production server",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
          description: "JWT token obtained from /api/auth/login or /api/auth/signup",
        },
      },
      schemas: {
        SignupRequest: {
          type: "object",
          required: ["gstNumber", "email", "mobile", "username", "password", "businessType"],
          properties: {
            gstNumber: {
              type: "string",
              minLength: 15,
              maxLength: 20,
              example: "22AAAAA0000A1Z5",
              description: "15-digit GST number of the business",
            },
            email: {
              type: "string",
              format: "email",
              example: "business@company.com",
            },
            mobile: {
              type: "string",
              minLength: 10,
              maxLength: 15,
              example: "+919876543210",
            },
            username: {
              type: "string",
              minLength: 3,
              maxLength: 100,
              example: "precisionmfg",
            },
            password: {
              type: "string",
              minLength: 8,
              example: "SecurePass@123",
            },
            businessType: {
              type: "string",
              enum: ["manufacturer", "raw_material_supplier", "both"],
              example: "manufacturer",
              description: "Business type — manufacturer, raw_material_supplier, or both",
            },
          },
        },
        LoginRequest: {
          type: "object",
          required: ["email", "password"],
          properties: {
            email: {
              type: "string",
              format: "email",
              example: "business@company.com",
            },
            password: {
              type: "string",
              example: "SecurePass@123",
            },
          },
        },
        AuthResponse: {
          type: "object",
          properties: {
            token: {
              type: "string",
              description: "JWT access token (valid for 1 day)",
              example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
            },
          },
        },
        UserResponse: {
          type: "object",
          properties: {
            id: { type: "string", format: "uuid" },
            gstNumber: { type: "string", example: "22AAAAA0000A1Z5" },
            email: { type: "string", format: "email" },
            mobile: { type: "string" },
            username: { type: "string" },
            businessType: {
              type: "string",
              enum: ["manufacturer", "raw_material_supplier", "both"],
            },
            emailVerified: { type: "boolean" },
            mobileVerified: { type: "boolean" },
            isActive: { type: "boolean" },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" },
          },
        },
        ErrorResponse: {
          type: "object",
          properties: {
            message: { type: "string", example: "Resource not found" },
          },
        },
      },
    },
    security: [],
  },
  apis: ["./src/modules/**/*.routes.ts", "./src/modules/**/*.controller.ts"],
};

export const swaggerSpec = swaggerJsdoc(options);
