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

    if (input.categoryId) {
      await this.validateCategoryAndSubcategory(input.categoryId, input.subcategoryId);
    }

    const uploadedImages = await this.uploadProductImages(files);
    const payload = this.toPayload({ ...input, manufacturerUserId });
    payload.images = this.mergeImages(input, uploadedImages);
    if (!payload.thumbnailUrl && uploadedImages[0]?.url) {
      payload.thumbnailUrl = uploadedImages[0].url;
    }

    return this.repo.create(payload);
  }

  async update(
    id: string,
    input: UpdateProductInput,
    actor: ProductActor,
    files: Express.Multer.File[] = []
  ) {
    await this.requireProductManager(actor);

    const product = await this.repo.rawFindById(id);
    if (!product) this.throwNotFound("Product not found");
    this.assertCanModify(product!, actor);

    if (input.categoryId) {
      const nextSubcategoryId =
        input.subcategoryId === undefined ? product!.subcategoryId : input.subcategoryId;
      await this.validateCategoryAndSubcategory(input.categoryId, nextSubcategoryId);
    }

    const uploadedImages = await this.uploadProductImages(files);
    const payload = this.toUpdatePayload(input, actor);
    if (input.images !== undefined || input.imageUrls !== undefined || uploadedImages.length) {
      const currentImages = this.parseImages(product!.images) ?? [];
      payload.images =
        input.images !== undefined || input.imageUrls !== undefined
          ? this.mergeImages(input, uploadedImages)
          : [...currentImages, ...uploadedImages];
    }
    if (
      input.thumbnailUrl === undefined &&
      !product!.thumbnailUrl &&
      uploadedImages[0]?.url
    ) {
      payload.thumbnailUrl = uploadedImages[0].url;
    }

    return this.repo.update(id, payload);
  }

  async delete(id: string, actor: ProductActor) {
    await this.requireProductManager(actor);
    const product = await this.repo.rawFindById(id);
    if (!product) this.throwNotFound("Product not found");
    this.assertCanModify(product!, actor);
    await this.repo.delete(id);
  }

  private async requireProductManager(actor: ProductActor) {
    if (!actor.userId) throw new HttpException(401, "Authentication required.");

    const user = await this.userRepo.findById(actor.userId);
    if (!user || !user.isActive) {
      throw new HttpException(401, "Invalid or inactive user.");
    }

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

  private async validateCategoryAndSubcategory(
    categoryId: string,
    subcategoryId?: string | null
  ) {
    const exists = await this.repo.categoryExists(categoryId);
    if (!exists) throw new HttpException(400, "Category not found.");
    if (!subcategoryId) return;

    const subcategory = await this.repo.findSubcategory(subcategoryId);
    if (!subcategory) throw new HttpException(400, "Subcategory not found.");
    if (subcategory.categoryId !== categoryId) {
      throw new HttpException(400, "Subcategory does not belong to the selected category.");
    }
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
      specifications: input.specifications ?? null,
      moq: input.moq ?? null,
      leadTime: input.leadTime ?? null,
      price: input.price != null ? String(input.price) : null,
      originalPrice: input.originalPrice != null ? String(input.originalPrice) : null,
      brand: input.brand ?? null,
      samplesAvailable: input.samplesAvailable,
      inStock: input.inStock,
      rating: input.rating !== undefined ? String(input.rating) : undefined,
      reviews: input.reviews,
      images: this.mergeImages(input),
    };
  }

  private toUpdatePayload(input: UpdateProductInput, actor: ProductActor): ProductUpdatePayload {
    const payload: ProductUpdatePayload = {};

    if (input.industryId !== undefined) payload.industryId = input.industryId;
    if (input.categoryId !== undefined) payload.categoryId = input.categoryId;
    if (input.subcategoryId !== undefined) payload.subcategoryId = input.subcategoryId;
    if (input.name !== undefined) payload.name = input.name;
    if (input.description !== undefined) payload.description = input.description;
    if (input.thumbnailUrl !== undefined) payload.thumbnailUrl = input.thumbnailUrl;
    if (input.materialType !== undefined) payload.materialType = input.materialType;
    if (input.grade !== undefined) payload.grade = input.grade;
    if (input.specifications !== undefined) payload.specifications = input.specifications;
    if (input.moq !== undefined) payload.moq = input.moq;
    if (input.leadTime !== undefined) payload.leadTime = input.leadTime;
    if (input.price !== undefined) {
      payload.price = input.price != null ? String(input.price) : null;
    }
    if (input.originalPrice !== undefined) {
      payload.originalPrice =
        input.originalPrice != null ? String(input.originalPrice) : null;
    }
    if (input.brand !== undefined) payload.brand = input.brand;
    if (input.samplesAvailable !== undefined) {
      payload.samplesAvailable = input.samplesAvailable;
    }
    if (input.inStock !== undefined) payload.inStock = input.inStock;
    if (input.rating !== undefined) payload.rating = String(input.rating);
    if (input.reviews !== undefined) payload.reviews = input.reviews;
    if (input.images !== undefined || input.imageUrls !== undefined) {
      payload.images = this.mergeImages(input);
    }
    if (actor.userRole === "admin" && input.manufacturerUserId !== undefined) {
      payload.manufacturerUserId = input.manufacturerUserId;
    }

    return payload;
  }

  private async uploadProductImages(files: Express.Multer.File[] = []) {
    return this.fileUploadService.uploadMany(files, { folder: "products" });
  }

  private mergeImages(
    input: Pick<CreateProductInput | UpdateProductInput, "images" | "imageUrls">,
    uploadedImages: UploadedFile[] = []
  ): ProductImageInput[] | null {
    const existingImages = input.images ?? [];
    const urlImages = (input.imageUrls ?? []).map((url) => ({ url }));
    const mergedImages = [...existingImages, ...urlImages, ...uploadedImages];

    return mergedImages.length > 0 ? mergedImages : null;
  }

  private parseImages(images: unknown): ProductImageInput[] | null {
    if (!images) return null;
    if (Array.isArray(images)) return images as ProductImageInput[];
    if (typeof images !== "string") return null;

    try {
      const parsed = JSON.parse(images);
      return Array.isArray(parsed) ? parsed : null;
    } catch {
      return null;
    }
  }
}
