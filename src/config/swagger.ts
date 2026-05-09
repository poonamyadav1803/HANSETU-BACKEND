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

        // ── Marketplace entities ───────────────────────────────────────────
        Industry: {
          type: "object",
          properties: {
            id: { type: "string", format: "uuid" },
            slug: { type: "string", example: "automobile" },
            name: { type: "string", example: "Automobile" },
            description: { type: "string", nullable: true },
            iconUrl: { type: "string", nullable: true },
            isActive: { type: "boolean" },
            createdAt: { type: "string", format: "date-time" },
          },
        },

        Category: {
          type: "object",
          properties: {
            id: { type: "string", format: "uuid" },
            slug: { type: "string", example: "industrial-tools" },
            name: { type: "string", example: "Industrial Tools" },
            description: { type: "string", nullable: true },
            primaryColor: { type: "string", nullable: true },
            secondaryColor: { type: "string", nullable: true },
            gradientColor: { type: "string", nullable: true },
            badgeColor: { type: "string", nullable: true },
            isActive: { type: "boolean" },
            subcategories: {
              type: "array",
              items: { $ref: "#/components/schemas/Subcategory" },
            },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" },
          },
        },

        CategoryCreateRequest: {
          type: "object",
          required: ["slug", "name"],
          properties: {
            slug: { type: "string", example: "electrical" },
            name: { type: "string", example: "Electrical" },
            description: { type: "string", nullable: true, example: "Electrical equipment and accessories" },
            primaryColor: { type: "string", nullable: true, example: "from-yellow-500" },
            secondaryColor: { type: "string", nullable: true, example: "to-amber-600" },
            gradientColor: { type: "string", nullable: true, example: "bg-gradient-to-r from-yellow-500 to-amber-600" },
            badgeColor: { type: "string", nullable: true, example: "bg-yellow-100 text-yellow-800" },
            isActive: { type: "boolean", example: true },
            subcategories: {
              type: "array",
              items: { type: "string", example: "Wires & Cables" },
              example: ["Wires & Cables", "Switches", "Circuit Breakers"],
            },
          },
        },

        CategoryUpdateRequest: {
          type: "object",
          description: "Send only the fields you want to update. If subcategories is sent, existing subcategories are replaced.",
          properties: {
            slug: { type: "string", example: "electrical-components" },
            name: { type: "string", example: "Electrical Components" },
            description: { type: "string", nullable: true, example: "Updated category description" },
            primaryColor: { type: "string", nullable: true, example: "from-blue-500" },
            secondaryColor: { type: "string", nullable: true, example: "to-cyan-600" },
            gradientColor: { type: "string", nullable: true, example: "bg-gradient-to-r from-blue-500 to-cyan-600" },
            badgeColor: { type: "string", nullable: true, example: "bg-blue-100 text-blue-800" },
            isActive: { type: "boolean", example: true },
            subcategories: {
              type: "array",
              items: { type: "string", example: "Control Panels" },
              example: ["Control Panels", "Relays"],
            },
          },
        },

        Subcategory: {
          type: "object",
          properties: {
            id: { type: "string", format: "uuid" },
            manufacturerUserId: { type: "string", format: "uuid", nullable: true },
            categoryId: { type: "string", format: "uuid" },
            name: { type: "string", example: "Drill Bits" },
            createdAt: { type: "string", format: "date-time" },
          },
        },

        SubcategoryWithCategory: {
          type: "object",
          properties: {
            id: { type: "string", format: "uuid" },
            categoryId: { type: "string", format: "uuid" },
            name: { type: "string", example: "Drill Bits" },
            createdAt: { type: "string", format: "date-time" },
            category: {
              type: "object",
              nullable: true,
              properties: {
                id: { type: "string", format: "uuid" },
                slug: { type: "string", example: "industrial-tools" },
                name: { type: "string", example: "Industrial Tools" },
              },
            },
          },
        },

        SubcategoryCreateRequest: {
          type: "object",
          required: ["categoryId", "name"],
          properties: {
            categoryId: { type: "string", format: "uuid" },
            name: { type: "string", example: "Drill Bits" },
          },
        },

        SubcategoryUpdateRequest: {
          type: "object",
          description: "Send only the fields you want to update.",
          properties: {
            categoryId: { type: "string", format: "uuid" },
            name: { type: "string", example: "Precision Drill Bits" },
          },
        },

        Product: {
          type: "object",
          properties: {
            id: { type: "string", format: "uuid" },
            categoryId: { type: "string", format: "uuid" },
            subcategoryId: { type: "string", format: "uuid", nullable: true },
            name: { type: "string", example: "High-Speed Drill Bit Set" },
            price: { type: "string", example: "1299.00" },
            originalPrice: { type: "string", nullable: true },
            rating: { type: "string", example: "4.5" },
            reviews: { type: "integer", example: 128 },
            brand: { type: "string", nullable: true },
            inStock: { type: "boolean" },
            specs: { type: "object", nullable: true, description: "Parsed JSON specs" },
            description: { type: "string", nullable: true },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" },
          },
        },

        Manufacturer: {
          type: "object",
          properties: {
            id: { type: "string", format: "uuid" },
            industrySlug: { type: "string", example: "automobile" },
            city: { type: "string", example: "Pune" },
            state: { type: "string", example: "Maharashtra" },
            totalEmployees: { type: "string", nullable: true, example: "500-1000" },
            turnover: { type: "string", nullable: true, example: "₹50Cr - ₹100Cr" },
            yearEstablished: { type: "string", nullable: true, example: "1998" },
            certifications: { type: "array", items: { type: "string" }, nullable: true },
            inHouseTesting: { type: "boolean" },
            importExport: { type: "boolean" },
            responseTime: { type: "string", nullable: true, example: "24 hours" },
            rating: { type: "string", example: "4.7" },
            machineCapabilities: { type: "array", items: { type: "string" }, nullable: true },
            isActive: { type: "boolean" },
            createdAt: { type: "string", format: "date-time" },
          },
        },

        RawMaterial: {
          type: "object",
          properties: {
            id: { type: "string", format: "uuid" },
            industrySlug: { type: "string", example: "aerospace" },
            name: { type: "string", example: "Aerospace Grade Aluminum 7075" },
            category: { type: "string", nullable: true, example: "Aluminum" },
            price: { type: "string", example: "₹285/kg" },
            grade: { type: "string", nullable: true },
            city: { type: "string", nullable: true },
            imported: { type: "boolean" },
            creditAvailable: { type: "boolean" },
            quantity: { type: "string", nullable: true },
            rating: { type: "string", example: "4.6" },
            description: { type: "string", nullable: true },
            specifications: { type: "object", nullable: true, description: "Parsed JSON specifications" },
            certification: { type: "string", nullable: true },
            deliveryTime: { type: "string", nullable: true },
            minOrder: { type: "string", nullable: true },
            isActive: { type: "boolean" },
            createdAt: { type: "string", format: "date-time" },
          },
        },

        Machine: {
          type: "object",
          properties: {
            id: { type: "string", format: "uuid" },
            name: { type: "string", example: "CNC Vertical Machining Center" },
            category: { type: "string", example: "CNC Machines" },
            type: { type: "string", nullable: true },
            location: { type: "string", nullable: true, example: "Chennai" },
            price: { type: "string", example: "$45,000" },
            specs: { type: "object", nullable: true, description: "Parsed JSON specs" },
            isFeatured: { type: "boolean" },
            isActive: { type: "boolean" },
            createdAt: { type: "string", format: "date-time" },
          },
        },

        Offer: {
          type: "object",
          properties: {
            id: { type: "string", format: "uuid" },
            title: { type: "string", example: "25% Off Industrial Tools" },
            description: { type: "string", nullable: true },
            discount: { type: "string", example: "25%" },
            timeRemaining: { type: "string", nullable: true, example: "3 days" },
            category: { type: "string", nullable: true },
            isFeatured: { type: "boolean" },
            isActive: { type: "boolean" },
            createdAt: { type: "string", format: "date-time" },
          },
        },

        GstInfo: {
          type: "object",
          properties: {
            id: { type: "string", format: "uuid" },
            gstNumber: { type: "string", example: "22AAAAA0000A1Z5" },
            legalName: { type: "string", nullable: true },
            tradeName: { type: "string", nullable: true },
            registrationStatus: { type: "string", nullable: true },
            dateOfRegistration: { type: "string", nullable: true },
            constitutionOfBusiness: { type: "string", nullable: true },
            principalPlaceOfBusiness: { type: "string", nullable: true },
            natureOfBusinessActivities: { type: "string", nullable: true },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" },
          },
        },

        // ── Service entities ───────────────────────────────────────────────
        CalibrationService: {
          type: "object",
          properties: {
            id: { type: "string", format: "uuid" },
            name: { type: "string", example: "Precision Gauge Calibration" },
            industrySlug: { type: "string", nullable: true },
            city: { type: "string", nullable: true },
            price: { type: "string", nullable: true, example: "₹500/instrument" },
            accreditation: { type: "string", nullable: true, example: "NABL" },
            doorDelivery: { type: "boolean" },
            visitServices: { type: "boolean" },
            responseTime: { type: "string", nullable: true },
            rating: { type: "string", example: "4.8" },
            instruments: { type: "array", items: { type: "string" }, nullable: true },
            isActive: { type: "boolean" },
            createdAt: { type: "string", format: "date-time" },
          },
        },

        TestingService: {
          type: "object",
          properties: {
            id: { type: "string", format: "uuid" },
            name: { type: "string", example: "Tensile Strength Testing" },
            category: { type: "string", nullable: true },
            provider: { type: "string", nullable: true },
            industrySlug: { type: "string", nullable: true },
            price: { type: "string", nullable: true },
            turnaround: { type: "string", nullable: true, example: "3-5 days" },
            city: { type: "string", nullable: true },
            rating: { type: "string", example: "4.5" },
            certifications: { type: "array", items: { type: "string" }, nullable: true },
            testTypes: { type: "array", items: { type: "string" }, nullable: true },
            description: { type: "string", nullable: true },
            isActive: { type: "boolean" },
            createdAt: { type: "string", format: "date-time" },
          },
        },

        HrService: {
          type: "object",
          properties: {
            id: { type: "string", format: "uuid" },
            name: { type: "string", example: "Senior CNC Operator" },
            category: { type: "string", example: "Recruitment" },
            industrySlug: { type: "string", nullable: true },
            company: { type: "string", nullable: true },
            type: { type: "string", nullable: true, example: "Full-time" },
            experience: { type: "string", nullable: true, example: "3-5 years" },
            salary: { type: "string", nullable: true, example: "₹4L - ₹6L" },
            city: { type: "string", nullable: true },
            rating: { type: "string", example: "4.3" },
            skills: { type: "array", items: { type: "string" }, nullable: true },
            description: { type: "string", nullable: true },
            isActive: { type: "boolean" },
            createdAt: { type: "string", format: "date-time" },
          },
        },

        TrainingProgram: {
          type: "object",
          properties: {
            id: { type: "string", format: "uuid" },
            name: { type: "string", example: "Advanced CNC Programming" },
            category: { type: "string", nullable: true },
            industrySlug: { type: "string", nullable: true },
            provider: { type: "string", nullable: true },
            price: { type: "string", nullable: true },
            duration: { type: "string", nullable: true, example: "5 days" },
            mode: { type: "string", nullable: true, example: "Online" },
            city: { type: "string", nullable: true },
            rating: { type: "string", example: "4.6" },
            capacity: { type: "string", nullable: true },
            certification: { type: "string", nullable: true },
            skills: { type: "array", items: { type: "string" }, nullable: true },
            description: { type: "string", nullable: true },
            isActive: { type: "boolean" },
            createdAt: { type: "string", format: "date-time" },
          },
        },

        StudentService: {
          type: "object",
          properties: {
            id: { type: "string", format: "uuid" },
            name: { type: "string", example: "Manufacturing Internship" },
            category: { type: "string", nullable: true, example: "Internship" },
            industrySlug: { type: "string", nullable: true },
            provider: { type: "string", nullable: true },
            type: { type: "string", nullable: true },
            duration: { type: "string", nullable: true, example: "6 months" },
            stipend: { type: "string", nullable: true, example: "₹10,000/month" },
            city: { type: "string", nullable: true },
            rating: { type: "string", example: "4.4" },
            skills: { type: "array", items: { type: "string" }, nullable: true },
            description: { type: "string", nullable: true },
            isActive: { type: "boolean" },
            createdAt: { type: "string", format: "date-time" },
          },
        },

        FinancialService: {
          type: "object",
          properties: {
            id: { type: "string", format: "uuid" },
            name: { type: "string", example: "MSME Business Loan" },
            category: { type: "string", nullable: true, example: "Loans" },
            industrySlug: { type: "string", nullable: true },
            provider: { type: "string", nullable: true },
            type: { type: "string", nullable: true },
            interestRate: { type: "string", nullable: true, example: "10.5%" },
            amount: { type: "string", nullable: true, example: "₹10L - ₹1Cr" },
            city: { type: "string", nullable: true },
            rating: { type: "string", example: "4.2" },
            features: { type: "array", items: { type: "string" }, nullable: true },
            description: { type: "string", nullable: true },
            isActive: { type: "boolean" },
            createdAt: { type: "string", format: "date-time" },
          },
        },

        Supplier: {
          type: "object",
          properties: {
            id: { type: "string", format: "uuid" },
            name: { type: "string", example: "MetAlloy Supplies Pvt Ltd" },
            industrySlug: { type: "string", example: "aerospace" },
            materialCategory: { type: "string", nullable: true },
            location: { type: "string", nullable: true },
            materials: { type: "array", items: { type: "string" }, nullable: true },
            rating: { type: "string", example: "4.5" },
            reviews: { type: "integer", example: 42 },
            minOrder: { type: "string", nullable: true },
            price: { type: "string", nullable: true },
            certifications: { type: "array", items: { type: "string" }, nullable: true },
            established: { type: "string", nullable: true, example: "2005" },
            employees: { type: "string", nullable: true, example: "100-250" },
            contact: { type: "string", nullable: true },
            isActive: { type: "boolean" },
            createdAt: { type: "string", format: "date-time" },
          },
        },
      },
    },
    security: [],
  },
  apis: ["./src/modules/**/*.routes.ts", "./src/modules/**/*.controller.ts"],
};

export const swaggerSpec = swaggerJsdoc(options);
