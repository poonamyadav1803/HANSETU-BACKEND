import { Response, NextFunction } from "express";
import { AdminRequest } from "../../middlewares/admin.middleware";
import { AdminService } from "./admin.service";
import { UserRepository } from "../user/user.repository";
import { NavService } from "../nav/nav.service";
import { RawMaterialService } from "../raw-material/raw-material.service";
import { RawMaterialRepository } from "../raw-material/raw-material.repository";
import { z } from "zod";

const adminService = new AdminService(new UserRepository());
const navService = new NavService();
const rmService = new RawMaterialService(new RawMaterialRepository());

const updateRoleSchema = z.object({
  role: z.enum(["user", "admin"]),
});

const rmCategorySchema = z.object({
  label: z.string().min(1),
  slug: z.string().min(1),
  groupName: z.string().nullable().optional(),
  subcategories: z.array(z.string()).optional(),
  sortOrder: z.number().optional(),
  isActive: z.boolean().optional(),
});

const rmProductSchema = z.object({
  categorySlug: z.string().min(1),
  subcategory: z.string().nullable().optional(),
  name: z.string().min(1),
  grade: z.string().nullable().optional(),
  unit: z.string().nullable().optional(),
  priceMin: z.string().nullable().optional(),
  priceMax: z.string().nullable().optional(),
  specifications: z.record(z.union([z.string(), z.number()])).nullable().optional(),
  isActive: z.boolean().optional(),
});

export class AdminController {
  async getStats(req: AdminRequest, res: Response, next: NextFunction) {
    try {
      const stats = await adminService.getStats();
      res.json(stats);
    } catch (err) {
      next(err);
    }
  }

  async getAllUsers(req: AdminRequest, res: Response, next: NextFunction) {
    try {
      const users = await adminService.getAllUsers();
      res.json(users);
    } catch (err) {
      next(err);
    }
  }

  async getUserById(req: AdminRequest, res: Response, next: NextFunction) {
    try {
      const user = await adminService.getUserById(req.params.id);
      res.json(user);
    } catch (err) {
      next(err);
    }
  }

  async activateUser(req: AdminRequest, res: Response, next: NextFunction) {
    try {
      const result = await adminService.activateUser(req.params.id);
      res.json(result);
    } catch (err) {
      next(err);
    }
  }

  async deactivateUser(req: AdminRequest, res: Response, next: NextFunction) {
    try {
      const result = await adminService.deactivateUser(req.params.id);
      res.json(result);
    } catch (err) {
      next(err);
    }
  }

  async updateUserRole(req: AdminRequest, res: Response, next: NextFunction) {
    try {
      const { role } = updateRoleSchema.parse(req.body);
      const user = await adminService.updateUserRole(req.params.id, role);
      res.json(user);
    } catch (err) {
      next(err);
    }
  }

  // ── Raw Material Catalog: Categories ──────────────────────────────────────

  async getRMCategories(_req: AdminRequest, res: Response, next: NextFunction) {
    try {
      res.json(await navService.getAllRawMaterials());
    } catch (err) {
      next(err);
    }
  }

  async createRMCategory(req: AdminRequest, res: Response, next: NextFunction) {
    try {
      const data = rmCategorySchema.parse(req.body);
      res.status(201).json(await navService.createRawMaterial(data));
    } catch (err) {
      next(err);
    }
  }

  async updateRMCategory(req: AdminRequest, res: Response, next: NextFunction) {
    try {
      const data = rmCategorySchema.partial().parse(req.body);
      res.json(await navService.updateRawMaterial(req.params.id, data));
    } catch (err) {
      next(err);
    }
  }

  async deleteRMCategory(req: AdminRequest, res: Response, next: NextFunction) {
    try {
      res.json(await navService.deleteRawMaterial(req.params.id));
    } catch (err) {
      next(err);
    }
  }

  // ── Raw Material Catalog: Products ────────────────────────────────────────

  async getRMProducts(req: AdminRequest, res: Response, next: NextFunction) {
    try {
      const { categorySlug } = req.query;
      const filters: { categorySlug?: string } = {};
      if (typeof categorySlug === "string") filters.categorySlug = categorySlug;
      res.json(await rmService.getAllProductsAdmin(filters));
    } catch (err) {
      next(err);
    }
  }

  async createRMProduct(req: AdminRequest, res: Response, next: NextFunction) {
    try {
      const data = rmProductSchema.parse(req.body);
      res.status(201).json(await rmService.createProduct(data as any));
    } catch (err) {
      next(err);
    }
  }

  async updateRMProduct(req: AdminRequest, res: Response, next: NextFunction) {
    try {
      const data = rmProductSchema.partial().parse(req.body);
      res.json(await rmService.updateProduct(req.params.id, data as any));
    } catch (err) {
      next(err);
    }
  }

  async deleteRMProduct(req: AdminRequest, res: Response, next: NextFunction) {
    try {
      res.json(await rmService.deleteProduct(req.params.id));
    } catch (err) {
      next(err);
    }
  }
}
