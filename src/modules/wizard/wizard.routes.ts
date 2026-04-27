import { Router } from "express";
import { asc } from "drizzle-orm";
import { db } from "../../db";
import {
  wizardBusinessServices,
  wizardRawMaterialCategories,
  wizardIndustryRawMaterialMap,
  wizardManufacturingCapabilities,
  wizardManufacturingProductCategories,
  wizardIndustryCategories,
  wizardIndustryPartsFilters,
} from "../../db/schema";

export class WizardRoutes {
  public router = Router();

  constructor() {
    this.router.get("/business-services", async (_req, res, next) => {
      try {
        res.json(await db.select().from(wizardBusinessServices).orderBy(asc(wizardBusinessServices.sortOrder)));
      } catch (error) {
        next(error);
      }
    });

    this.router.get("/raw-material-categories", async (_req, res, next) => {
      try {
        res.json(await db.select().from(wizardRawMaterialCategories).orderBy(asc(wizardRawMaterialCategories.sortOrder)));
      } catch (error) {
        next(error);
      }
    });

    this.router.get("/industry-raw-material-map", async (_req, res, next) => {
      try {
        res.json(await db.select().from(wizardIndustryRawMaterialMap).orderBy(asc(wizardIndustryRawMaterialMap.industrySlug)));
      } catch (error) {
        next(error);
      }
    });

    this.router.get("/manufacturing-capabilities", async (_req, res, next) => {
      try {
        res.json(await db.select().from(wizardManufacturingCapabilities).orderBy(asc(wizardManufacturingCapabilities.sortOrder)));
      } catch (error) {
        next(error);
      }
    });

    this.router.get("/manufacturing-product-categories", async (_req, res, next) => {
      try {
        res.json(await db.select().from(wizardManufacturingProductCategories).orderBy(asc(wizardManufacturingProductCategories.industrySlug)));
      } catch (error) {
        next(error);
      }
    });

    this.router.get("/industry-categories", async (_req, res, next) => {
      try {
        res.json(await db.select().from(wizardIndustryCategories).orderBy(asc(wizardIndustryCategories.sortOrder)));
      } catch (error) {
        next(error);
      }
    });

    this.router.get("/industry-parts-filters", async (_req, res, next) => {
      try {
        res.json(await db.select().from(wizardIndustryPartsFilters).orderBy(asc(wizardIndustryPartsFilters.industrySlug)));
      } catch (error) {
        next(error);
      }
    });
  }
}
