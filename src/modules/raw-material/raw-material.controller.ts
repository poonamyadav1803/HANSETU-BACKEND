import { Request, Response, NextFunction } from "express";
import { RawMaterialService } from "./raw-material.service";
import { RawMaterialRepository } from "./raw-material.repository";

const service = new RawMaterialService(new RawMaterialRepository());

export class RawMaterialController {
  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const { industrySlug, category } = req.query;
      const filters: { industrySlug?: string; category?: string } = {};
      if (typeof industrySlug === "string") filters.industrySlug = industrySlug;
      if (typeof category === "string") filters.category = category;
      res.json(await service.getAll(filters));
    } catch (err) {
      next(err);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      res.json(await service.getById(req.params.id));
    } catch (err) {
      next(err);
    }
  }

  async getProducts(req: Request, res: Response, next: NextFunction) {
    try {
      const { categorySlug, subcategory } = req.query;
      const filters: { categorySlug?: string; subcategory?: string } = {};
      if (typeof categorySlug === "string") filters.categorySlug = categorySlug;
      if (typeof subcategory === "string") filters.subcategory = subcategory;
      res.json(await service.getProducts(filters));
    } catch (err) {
      next(err);
    }
  }

  async createInquiry(req: Request, res: Response, next: NextFunction) {
    try {
      const { productId, categorySlug, productName, name, email, company, phone, quantity, message } = req.body;
      // Basic validation
      if (!email || !name) {
        res.status(400).json({ message: "name and email are required" });
        return;
      }
      // For now, log and acknowledge — extend to email/CRM later
      console.log("[Inquiry]", { productId, categorySlug, productName, name, email, company, phone, quantity, message });
      res.status(201).json({ message: "Inquiry received. Our team will contact you shortly." });
    } catch (err) {
      next(err);
    }
  }
}
