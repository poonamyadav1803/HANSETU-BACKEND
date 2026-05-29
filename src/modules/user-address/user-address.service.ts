import { BaseService } from "../../core/BaseService";
import { UserAddressRepository } from "./user-address.repository";
import { InsertUserAddress } from "../../db/schema";

export class UserAddressService extends BaseService {
  constructor(private repo: UserAddressRepository) {
    super();
  }

  getByUser(userId: string) {
    return this.repo.findByUser(userId);
  }

  async create(userId: string, body: Omit<InsertUserAddress, "userId">) {
    return this.repo.create({ ...body, userId });
  }

  async setDefault(id: string, userId: string) {
    const row = await this.repo.setDefault(id, userId);
    if (!row) this.throwNotFound("Address not found");
    return row!;
  }

  async delete(id: string, userId: string) {
    const row = await this.repo.findById(id, userId);
    if (!row) this.throwNotFound("Address not found");
    await this.repo.delete(id, userId);
  }
}
