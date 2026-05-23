import { Router } from "express";
import { z } from "zod";
import { NavService } from "./nav.service";
import { authMiddleware } from "../../middlewares/auth.middleware";
import { requireAdmin } from "../../middlewares/rbac.middleware";

const navService = new NavService();

const rawMaterialSchema = z.object({
  industryId: z.string().uuid().optional().nullable(),
  label: z.string().trim().min(1).max(255),
  slug: z.string().trim().min(1).max(100),
  icon: z.string().trim().max(100).optional().nullable(),
  sortOrder: z.number().int().optional(),
  isActive: z.boolean().optional(),
});

const rawMaterialPatchSchema = rawMaterialSchema.partial();

const industrySchema = z.object({
  slug: z.string().trim().min(1).max(100),
  name: z.string().trim().min(1).max(255),
  icon: z.string().trim().max(100).optional().nullable(),
});

export class NavRoutes {
  public router = Router();
  private readonly uuidParam = ":id([0-9a-fA-F-]{36})";

  constructor() {
    this.router.get("/raw-materials", async (_req, res, next) => {
      try {
        res.json(await navService.getRawMaterials());
      } catch (error) {
        next(error);
      }
    });

    this.router.post("/raw-materials", authMiddleware, requireAdmin, async (req, res, next) => {
      try {
        const payload = rawMaterialSchema.parse(req.body);
        res.status(201).json(await navService.createRawMaterial(payload));
      } catch (error) {
        next(error);
      }
    });

    this.router.patch(`/raw-materials/${this.uuidParam}`, authMiddleware, requireAdmin, async (req, res, next) => {
      try {
        const payload = rawMaterialPatchSchema.parse(req.body);
        res.json(await navService.updateRawMaterial(req.params.id, payload));
      } catch (error) {
        next(error);
      }
    });

    this.router.delete(`/raw-materials/${this.uuidParam}`, authMiddleware, requireAdmin, async (req, res, next) => {
      try {
        res.json(await navService.deleteRawMaterial(req.params.id));
      } catch (error) {
        next(error);
      }
    });

    this.router.post("/industries", authMiddleware, requireAdmin, async (req, res, next) => {
      try {
        const payload = industrySchema.parse(req.body);
        res.status(201).json(await navService.createIndustry(payload));
      } catch (error) {
        next(error);
      }
    });

    this.router.delete(`/industries/${this.uuidParam}`, authMiddleware, requireAdmin, async (req, res, next) => {
      try {
        res.json(await navService.deleteIndustry(req.params.id));
      } catch (error) {
        next(error);
      }
    });
  }
}
