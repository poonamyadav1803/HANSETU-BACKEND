import { UserRepository } from "../user/user.repository";
import { HttpException } from "../../core/HttpException";
import { UserRole } from "../user/user.entity";

export class AdminService {
  constructor(private userRepo: UserRepository) {}

  async getAllUsers() {
    const users = await this.userRepo.findAll();
    return users.map(({ password, ...safe }) => safe);
  }

  async getUserById(id: string) {
    const user = await this.userRepo.findById(id);
    if (!user) throw new HttpException(404, "User not found.");
    const { password, ...safe } = user;
    return safe;
  }

  async activateUser(id: string) {
    const user = await this.userRepo.findById(id);
    if (!user) throw new HttpException(404, "User not found.");
    if (user.isActive) throw new HttpException(400, "User is already active.");
    await this.userRepo.activateUser(id);
    return { message: "User activated successfully." };
  }

  async deactivateUser(id: string) {
    const user = await this.userRepo.findById(id);
    if (!user) throw new HttpException(404, "User not found.");
    if (!user.isActive) throw new HttpException(400, "User is already inactive.");
    await this.userRepo.deactivateUser(id);
    return { message: "User deactivated successfully." };
  }

  async updateUserRole(id: string, role: UserRole) {
    const user = await this.userRepo.findById(id);
    if (!user) throw new HttpException(404, "User not found.");
    await this.userRepo.updateRole(id, role);
    const updated = await this.userRepo.findById(id);
    const { password, ...safe } = updated!;
    return safe;
  }

  async getStats() {
    const users = await this.userRepo.findAll();
    return {
      total: users.length,
      active: users.filter((u) => u.isActive).length,
      inactive: users.filter((u) => !u.isActive).length,
      manufacturers: users.filter((u) => u.businessType === "manufacturer").length,
      suppliers: users.filter((u) => u.businessType === "raw_material_supplier").length,
      both: users.filter((u) => u.businessType === "both").length,
    };
  }
}
