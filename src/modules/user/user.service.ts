import { BaseService } from "../../core/BaseService";
import { UserRepository } from "./user.repository";
import { IUser } from "./user.entity";

export class UserService extends BaseService {
  constructor(private userRepo: UserRepository) {
    super();
  }

  async getUserById(id: string): Promise<IUser> {
    const user = await this.userRepo.findById(id);
    if (!user) this.throwNotFound("User not found");
    return user!;
  }

  async getAllUsers(): Promise<IUser[]> {
    return this.userRepo.findAll();
  }

  async deactivateUser(id: string): Promise<void> {
    const user = await this.userRepo.findById(id);
    if (!user) this.throwNotFound("User not found");
    await this.userRepo.deactivateUser(id);
  }
}
