import { Router } from "express";
import { z } from "zod";
import { authMiddleware, AuthRequest } from "../../middlewares/auth.middleware";
import { ProfileService } from "./profile.service";
import { UserRepository } from "../user/user.repository";

const profileService = new ProfileService(new UserRepository());

const addressSchema = z.object({
  label: z.string().optional(),
  street: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  postalCode: z.string().optional(),
});

const completeProfileSchema = z.object({
  service: z.enum(["manufacturing", "raw_material_supply"]),
  industriesServed: z.array(z.string()).optional(),
  rawMaterialCategories: z.array(z.string()).optional(),
  materialCategories: z.record(z.array(z.string())).optional(),
  supplyCapacity: z.string().optional(),
  manufacturingCapabilities: z.array(z.string()).optional(),
  capabilitySpecs: z.record(z.record(z.unknown())).optional(),
  manufacturerIndustries: z.array(z.string()).optional(),
  industrySelections: z.record(z.array(z.string())).optional(),
  industryPartsPrefs: z.record(z.record(z.unknown())).optional(),
  productionCapacity: z.string().optional(),
  companyName: z.string().optional(),
  addresses: z.array(addressSchema).optional(),
  description: z.string().optional(),
  certifications: z.union([z.string(), z.array(z.string())]).optional(),
  existingClients: z.string().optional(),
});

export class ProfileRoutes {
  public router = Router();

  constructor() {
    this.router.use(authMiddleware);

    this.router.get("/status", async (req: AuthRequest, res, next) => {
      try {
        res.json(await profileService.getStatus(req.userId!));
      } catch (error) {
        next(error);
      }
    });

    this.router.post("/complete", async (req: AuthRequest, res, next) => {
      try {
        const payload = completeProfileSchema.parse(req.body);
        res.json(await profileService.complete(req.userId!, payload));
      } catch (error) {
        next(error);
      }
    });

    this.router.post("/complete-business", async (req: AuthRequest, res, next) => {
      try {
        const payload = completeProfileSchema.parse(req.body);
        res.json(await profileService.complete(req.userId!, payload));
      } catch (error) {
        next(error);
      }
    });
  }
}
