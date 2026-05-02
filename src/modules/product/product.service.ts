import { BaseService } from '../../core/BaseService';
import { ProductRepository } from './product.repository';

export class ProductService extends BaseService {
  constructor(private repo: ProductRepository) {
    super();
  }

  async getAll(filters: {
    categoryId?: string;
    subcategoryId?: string;
    inStock?: boolean;
  }) {
    return this.repo.findAll(filters);
  }

  async getById(id: string) {
    const product = await this.repo.findById(id);
    if (!product) this.throwNotFound('Product not found');
    return product!;
  }

  async getByCategoryId(categoryId: string) {
    return this.repo.findByCategoryId(categoryId);
  }
}
