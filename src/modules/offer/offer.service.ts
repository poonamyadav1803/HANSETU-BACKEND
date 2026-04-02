import { BaseService } from "../../core/BaseService";
import { OfferRepository } from "./offer.repository";

export class OfferService extends BaseService {
  constructor(private repo: OfferRepository) {
    super();
  }

  async getAll(filters: { isFeatured?: boolean; category?: string }) {
    return this.repo.findAll(filters);
  }

  async getById(id: string) {
    const offer = await this.repo.findById(id);
    if (!offer) this.throwNotFound("Offer not found");
    return offer!;
  }
}
