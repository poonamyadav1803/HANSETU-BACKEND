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
        GstVerifyRequest: {
          type: "object",
          required: ["gstNumber"],
          properties: {
            gstNumber: {
              type: "string",
              minLength: 15,
              maxLength: 20,
              pattern: "^[0-9A-Z]+$",
              example: "22AAAAA0000A1Z5",
              description: "15-character GSTIN — digits and uppercase letters only",
            },
          },
        },
        GstInfoResponse: {
          type: "object",
          properties: {
            success: { type: "boolean", example: true },
            data: {
              type: "object",
              properties: {
                gstNumber: { type: "string", example: "22AAAAA0000A1Z5" },
                legalName: { type: "string", example: "ACME INDUSTRIES PVT LTD" },
                tradeName: { type: "string", example: "ACME" },
                registrationStatus: { type: "string", example: "Active" },
                dateOfRegistration: { type: "string", example: "01/04/2019" },
                constitutionOfBusiness: { type: "string", example: "Private Limited Company" },
                principalPlaceOfBusiness: { type: "string", example: "Plot 12, MIDC, Pune, Maharashtra" },
                natureOfBusinessActivities: { type: "string", example: "Manufacturer, Wholesale Business" },
                stateJurisdiction: {
                  type: "string",
                  nullable: true,
                  example: "ADYAR",
                  description: "Jurisdiction name (stj from GSTN)",
                },
                stateJurisdictionCode: {
                  type: "string",
                  nullable: true,
                  example: "TG001",
                  description: "Jurisdiction code (stjCd from GSTN)",
                },
                dealerType: {
                  type: "string",
                  nullable: true,
                  enum: ["Regular", "Composition"],
                  example: "Regular",
                  description: "Dealer type (dty from GSTN)",
                },
                cancellationDate: {
                  type: "string",
                  format: "date",
                  nullable: true,
                  example: null,
                  description: "Populated only when registrationStatus = Cancelled",
                },
                additionalAddresses: {
                  type: "array",
                  nullable: true,
                  items: { type: "object" },
                  description: "Additional branch/warehouse addresses (adadr from GSTN)",
                },
                lastUpdatedAtGstn: {
                  type: "string",
                  format: "date",
                  nullable: true,
                  example: "2024-11-01",
                  description: "Date GSTN last updated this record (lstupdt)",
                },
                lastVerifiedAt: {
                  type: "string",
                  format: "date-time",
                  nullable: true,
                  example: "2025-04-20T10:30:00Z",
                  description: "Timestamp when this app last re-verified this GSTIN",
                },
                fromCache: {
                  type: "boolean",
                  example: false,
                  description: "true if result was served from DB cache",
                },
              },
            },
          },
        },
        SendOtpRequest: {
          type: "object",
          required: ["email"],
          properties: {
            email: { type: "string", format: "email", example: "business@company.com" },
          },
        },
        SendOtpResponse: {
          type: "object",
          properties: {
            success: { type: "boolean", example: true },
            message: { type: "string", example: "OTP sent to your email" },
          },
        },
        VerifyEmailOtpRequest: {
          type: "object",
          required: ["email", "otp"],
          properties: {
            email: { type: "string", format: "email", example: "business@company.com" },
            otp: { type: "string", minLength: 6, maxLength: 6, example: "482910" },
          },
        },
        VerifyEmailOtpResponse: {
          type: "object",
          properties: {
            success: { type: "boolean", example: true },
            otpToken: {
              type: "string",
              description: "Short-lived JWT used to authorize the final signup call (valid 30 min)",
              example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
            },
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
