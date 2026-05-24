import { HttpException } from "../../core/HttpException";
import { BaseService } from "../../core/BaseService";
import { FileUploadService, UploadedFile } from "../../services/file-upload.service";
import { UserRepository } from "../user/user.repository";
import {
  CreateProductInput,
  ProductImageInput,
  UpdateProductInput,
} from "./product.schema";
import {
  ProductFilters,
  ProductPayload,
  ProductRepository,
  ProductUpdatePayload,
} from "./product.repository";

type ProductActor = {
  userId?: string;
  userRole?: string;
};

export class ProductService extends BaseService {
  constructor(
    private repo: ProductRepository,
    private userRepo = new UserRepository(),
    private fileUploadService = new FileUploadService()
  ) {
    super();
  }

  async getAll(filters: ProductFilters) {
    const rows = await this.repo.findAll(filters);
    return rows.map(this.parseProduct);
  }

  async getMine(actor: ProductActor, filters: Omit<ProductFilters, "manufacturerUserId">) {
    const user = await this.requireProductManager(actor);
    const rows = await this.repo.findAll({
      ...filters,
      manufacturerUserId: user.id,
    });
    return rows.map(this.parseProduct);
  }

  async getById(id: string) {
    const product = await this.repo.findById(id);
    if (!product) this.throwNotFound("Product not found");
    return this.parseProduct(product!);
  }

  async create(
    input: CreateProductInput,
    actor: ProductActor,
    files: Express.Multer.File[] = []
  ) {
    const user = await this.requireProductManager(actor);
    const manufacturerUserId =
      actor.userRole === "admin" && input.manufacturerUserId
        ? input.manufacturerUserId
        : user.id;

    if (manufacturerUserId !== user.id) {
      await this.ensureProductOwnerExists(manufacturerUserId);
    }

    await this.validateCategoryAndSubcategory(input.categoryId, input.subcategoryId);
    const uploadedImages = await this.uploadProductImages(files);

    const payload = this.toProductPayload({
      ...input,
      manufacturerUserId,
    });
    payload.images = this.mergeImages(input, uploadedImages);

    const created = await this.repo.create(payload);

    return this.parseProduct(created);
  }

  async update(
    id: string,
    input: UpdateProductInput,
    actor: ProductActor,
    files: Express.Multer.File[] = []
  ) {
    await this.requireProductManager(actor);

    const product = await this.repo.findById(id);
    if (!product) this.throwNotFound("Product not found");
    this.assertCanModify(product!, actor);

    const nextCategoryId = input.categoryId ?? product!.categoryId;
    const nextSubcategoryId =
      input.subcategoryId === undefined ? product!.subcategoryId : input.subcategoryId;
    await this.validateCategoryAndSubcategory(nextCategoryId, nextSubcategoryId);
    if (actor.userRole === "admin" && input.manufacturerUserId !== undefined) {
      await this.ensureProductOwnerExists(input.manufacturerUserId);
    }

    const uploadedImages = await this.uploadProductImages(files);
    const payload = this.toProductUpdatePayload(input, actor);
    if (input.images !== undefined || input.imageUrls !== undefined || uploadedImages.length) {
      const currentImages = this.parseImages(product!.images);
      payload.images =
        input.images !== undefined || input.imageUrls !== undefined
          ? this.mergeImages(input, uploadedImages)
          : [...currentImages, ...uploadedImages];
    }
    const updated = await this.repo.update(id, payload);
    return this.parseProduct(updated!);
  }

  async delete(id: string, actor: ProductActor) {
    await this.requireProductManager(actor);

    const product = await this.repo.findById(id);
    if (!product) this.throwNotFound("Product not found");
    this.assertCanModify(product!, actor);

    await this.repo.delete(id);
  }

  async getByCategoryId(categoryId: string) {
    const rows = await this.repo.findByCategoryId(categoryId);
    return rows.map(this.parseProduct);
  }

  private async requireProductManager(actor: ProductActor) {
    if (!actor.userId) {
      throw new HttpException(401, "Authentication required.");
    }

    const user = await this.userRepo.findById(actor.userId);
    if (!user || !user.isActive) {
      throw new HttpException(401, "Invalid or inactive user.");
    }

    const canManage =
      actor.userRole === "admin" ||
      user.role === "admin" ||
      user.businessType === "manufacturer" ||
      user.businessType === "both";

    if (!canManage) {
      throw new HttpException(
        403,
        "Only manufacturers can manage products."
      );
    }

    return user;
  }

  private assertCanModify(
    product: { manufacturerUserId?: string | null },
    actor: ProductActor
  ) {
    if (actor.userRole === "admin") return;
    if (product.manufacturerUserId && product.manufacturerUserId === actor.userId) {
      return;
    }

    throw new HttpException(
      403,
      "You can only modify products created by your account."
    );
  }

  private async ensureProductOwnerExists(userId: string) {
    const user = await this.userRepo.findById(userId);
    if (!user || !user.isActive) {
      throw new HttpException(400, "Manufacturer user not found or inactive.");
    }
    if (
      user.role !== "admin" &&
      user.businessType !== "manufacturer" &&
      user.businessType !== "both"
    ) {
      throw new HttpException(400, "Product owner must be a manufacturer user.");
    }
  }

  private async validateCategoryAndSubcategory(
    categoryId: string,
    subcategoryId?: string | null
  ) {
    const categoryExists = await this.repo.categoryExists(categoryId);
    if (!categoryExists) {
      throw new HttpException(400, "Category not found.");
    }

    if (!subcategoryId) return;

    const subcategory = await this.repo.findSubcategory(subcategoryId);
    if (!subcategory) {
      throw new HttpException(400, "Subcategory not found.");
    }
    if (subcategory.categoryId !== categoryId) {
      throw new HttpException(
        400,
        "Subcategory does not belong to the selected category."
      );
    }
  }

  private toProductPayload(input: CreateProductInput): ProductPayload {
    return {
      manufacturerUserId: input.manufacturerUserId,
      categoryId: input.categoryId,
      subcategoryId: input.subcategoryId ?? null,
      name: input.name,
      price: String(input.price),
      originalPrice:
        input.originalPrice === undefined || input.originalPrice === null
          ? null
          : String(input.originalPrice),
      rating: input.rating === undefined ? undefined : String(input.rating),
      reviews: input.reviews,
      brand: input.brand ?? null,
      inStock: input.inStock,
      specs: this.stringifySpecs(input.specs),
      description: input.description ?? null,
      images: this.mergeImages(input),
    };
  }

  private toProductUpdatePayload(
    input: UpdateProductInput,
    actor: ProductActor
  ): ProductUpdatePayload {
    const payload: ProductUpdatePayload = {};

    if (input.categoryId !== undefined) payload.categoryId = input.categoryId;
    if (input.subcategoryId !== undefined) payload.subcategoryId = input.subcategoryId;
    if (input.name !== undefined) payload.name = input.name;
    if (input.price !== undefined) payload.price = String(input.price);
    if (input.originalPrice !== undefined) {
      payload.originalPrice =
        input.originalPrice === null ? null : String(input.originalPrice);
    }
    if (input.rating !== undefined) payload.rating = String(input.rating);
    if (input.reviews !== undefined) payload.reviews = input.reviews;
    if (input.brand !== undefined) payload.brand = input.brand;
    if (input.inStock !== undefined) payload.inStock = input.inStock;
    if (input.specs !== undefined) payload.specs = this.stringifySpecs(input.specs);
    if (input.description !== undefined) payload.description = input.description;
    if (input.images !== undefined || input.imageUrls !== undefined) {
      payload.images = this.mergeImages(input);
    }
    if (actor.userRole === "admin" && input.manufacturerUserId !== undefined) {
      payload.manufacturerUserId = input.manufacturerUserId;
    }

    return payload;
  }

  private stringifySpecs(specs: CreateProductInput["specs"]) {
    if (specs === undefined) return undefined;
    if (specs === null) return null;
    return typeof specs === "string" ? specs : JSON.stringify(specs);
  }

  private parseProduct(row: Record<string, unknown>) {
    return {
      ...row,
      specs: this.parseSpecs(row.specs),
      images: this.parseImages(row.images),
    };
  }

  private parseSpecs(specs: unknown) {
    if (!specs || typeof specs !== "string") return specs ?? null;

    try {
      return JSON.parse(specs);
    } catch {
      return specs;
    }
  }

  private async uploadProductImages(files: Express.Multer.File[] = []) {
    return this.fileUploadService.uploadMany(files, { folder: "products" });
  }

  private mergeImages(
    input: Pick<CreateProductInput | UpdateProductInput, "images" | "imageUrls">,
    uploadedImages: UploadedFile[] = []
  ): ProductImageInput[] {
    const existingImages = input.images ?? [];
    const urlImages = (input.imageUrls ?? []).map((url) => ({ url }));

    return [...existingImages, ...urlImages, ...uploadedImages];
  }

  private parseImages(images: unknown): ProductImageInput[] {
    if (!images) return [];
    if (Array.isArray(images)) return images as ProductImageInput[];
    if (typeof images !== "string") return [];

    try {
      const parsed = JSON.parse(images);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
}
