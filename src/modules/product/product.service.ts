import { HttpException } from "../../core/HttpException";
import { BaseService } from "../../core/BaseService";
import { UserRepository } from "../user/user.repository";
import { CreateProductInput, UpdateProductInput } from "./product.schema";
import { ProductFilters, ProductPayload, ProductRepository, ProductUpdatePayload } from "./product.repository";

type ProductActor = {
  userId?: string;
  userRole?: string;
};

export class ProductService extends BaseService {
  constructor(
    private repo: ProductRepository,
    private userRepo = new UserRepository()
  ) {
    super();
  }

  async getAll(filters: ProductFilters) {
    const { data, total } = await this.repo.findAll(filters);
    const page = filters.page ?? 1;
    const limit = filters.limit ?? 20;
    return {
      data,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getMine(actor: ProductActor, filters: Omit<ProductFilters, "manufacturerUserId">) {
    const user = await this.requireProductManager(actor);
    return this.repo.findByManufacturer(user.id);
  }

  async getById(id: string) {
    const product = await this.repo.findById(id);
    if (!product) this.throwNotFound("Product not found");
    return product;
  }

  async getRelatedServices(id: string) {
    const product = await this.repo.rawFindById(id);
    if (!product) this.throwNotFound("Product not found");
    return this.repo.findRelatedServices(id);
  }

  async create(input: CreateProductInput, actor: ProductActor) {
    const user = await this.requireProductManager(actor);

    const manufacturerUserId =
      actor.userRole === "admin" && input.manufacturerUserId
        ? input.manufacturerUserId
        : user.id;

    if (input.categoryId) {
      await this.validateCategoryAndSubcategory(input.categoryId, input.subcategoryId);
    }

    const payload = this.toPayload({ ...input, manufacturerUserId });
    const created = await this.repo.create(payload);
    return created;
  }

  async update(id: string, input: UpdateProductInput, actor: ProductActor) {
    await this.requireProductManager(actor);

    const product = await this.repo.rawFindById(id);
    if (!product) this.throwNotFound("Product not found");
    this.assertCanModify(product, actor);

    if (input.categoryId) {
      const nextSubcategoryId =
        input.subcategoryId === undefined ? product.subcategoryId : input.subcategoryId;
      await this.validateCategoryAndSubcategory(input.categoryId, nextSubcategoryId);
    }

    const payload = this.toUpdatePayload(input, actor);
    const updated = await this.repo.update(id, payload);
    return updated;
  }

  async delete(id: string, actor: ProductActor) {
    await this.requireProductManager(actor);
    const product = await this.repo.rawFindById(id);
    if (!product) this.throwNotFound("Product not found");
    this.assertCanModify(product, actor);
    await this.repo.delete(id);
  }

  // ── Private helpers ───────────────────────────────────────────────────────────

  private async requireProductManager(actor: ProductActor) {
    if (!actor.userId) throw new HttpException(401, "Authentication required.");

    const user = await this.userRepo.findById(actor.userId);
    if (!user || !user.isActive) throw new HttpException(401, "Invalid or inactive user.");

    const canManage =
      actor.userRole === "admin" ||
      user.role === "admin" ||
      user.businessType === "manufacturer" ||
      user.businessType === "both";

    if (!canManage) throw new HttpException(403, "Only manufacturers can manage products.");
    return user;
  }

  private assertCanModify(product: { manufacturerUserId?: string | null }, actor: ProductActor) {
    if (actor.userRole === "admin") return;
    if (product.manufacturerUserId && product.manufacturerUserId === actor.userId) return;
    throw new HttpException(403, "You can only modify products created by your account.");
  }

  private async validateCategoryAndSubcategory(categoryId: string, subcategoryId?: string | null) {
    const exists = await this.repo.categoryExists(categoryId);
    if (!exists) throw new HttpException(400, "Category not found.");
    if (!subcategoryId) return;

    const sub = await this.repo.findSubcategory(subcategoryId);
    if (!sub) throw new HttpException(400, "Subcategory not found.");
    if (sub.categoryId !== categoryId)
      throw new HttpException(400, "Subcategory does not belong to the selected category.");
  }

  private toPayload(input: CreateProductInput & { manufacturerUserId?: string }): ProductPayload {
    return {
      manufacturerUserId: input.manufacturerUserId ?? null,
      industryId: input.industryId ?? null,
      categoryId: input.categoryId ?? null,
      subcategoryId: input.subcategoryId ?? null,
      name: input.name,
      description: input.description ?? null,
      thumbnailUrl: input.thumbnailUrl ?? null,
      materialType: input.materialType ?? null,
      grade: input.grade ?? null,
      specifications: (input.specifications as Record<string, string>) ?? null,
      moq: input.moq ?? null,
      leadTime: input.leadTime ?? null,
      price: input.price != null ? String(input.price) : null,
      originalPrice: input.originalPrice != null ? String(input.originalPrice) : null,
      brand: input.brand ?? null,
      samplesAvailable: input.samplesAvailable,
      inStock: input.inStock,
      rating: input.rating !== undefined ? String(input.rating) : undefined,
      reviews: input.reviews,
    };
  }

  private toUpdatePayload(input: UpdateProductInput, actor: ProductActor): ProductUpdatePayload {
    const p: ProductUpdatePayload = {};

    if (input.industryId !== undefined) p.industryId = input.industryId;
    if (input.categoryId !== undefined) p.categoryId = input.categoryId;
    if (input.subcategoryId !== undefined) p.subcategoryId = input.subcategoryId;
    if (input.name !== undefined) p.name = input.name;
    if (input.description !== undefined) p.description = input.description;
    if (input.thumbnailUrl !== undefined) p.thumbnailUrl = input.thumbnailUrl;
    if (input.materialType !== undefined) p.materialType = input.materialType;
    if (input.grade !== undefined) p.grade = input.grade;
    if (input.specifications !== undefined) p.specifications = input.specifications as Record<string, string>;
    if (input.moq !== undefined) p.moq = input.moq;
    if (input.leadTime !== undefined) p.leadTime = input.leadTime;
    if (input.price !== undefined) p.price = input.price != null ? String(input.price) : null;
    if (input.originalPrice !== undefined) p.originalPrice = input.originalPrice != null ? String(input.originalPrice) : null;
    if (input.brand !== undefined) p.brand = input.brand;
    if (input.samplesAvailable !== undefined) p.samplesAvailable = input.samplesAvailable;
    if (input.inStock !== undefined) p.inStock = input.inStock;
    if (input.rating !== undefined) p.rating = String(input.rating);
    if (input.reviews !== undefined) p.reviews = input.reviews;
    if (actor.userRole === "admin" && input.manufacturerUserId !== undefined) {
      p.manufacturerUserId = input.manufacturerUserId;
    }

    return p;
  }
}
