import { UserRepository } from '../user/user.repository';
import { HttpException } from '../../core/HttpException';

const userRepo = new UserRepository();

export const businessAdminService = {
  async getUsers(type?: string) {
    const users = await userRepo.findAll();
    const filtered = type
      ? users.filter((u) => u.businessType === type)
      : users;
    return filtered.map(({ password, ...safe }) => safe);
  },

  async getUserById(id: string) {
    const user = await userRepo.findById(id);
    if (!user) throw new HttpException(404, 'User not found.');
    const { password, ...safe } = user;
    return safe;
  },

  async activateUser(id: string) {
    const user = await userRepo.findById(id);
    if (!user) throw new HttpException(404, 'User not found.');
    if (user.isActive) throw new HttpException(400, 'User is already active.');
    await userRepo.activateUser(id);
    return { message: 'User activated successfully.' };
  },

  async deactivateUser(id: string) {
    const user = await userRepo.findById(id);
    if (!user) throw new HttpException(404, 'User not found.');
    if (!user.isActive) throw new HttpException(400, 'User is already inactive.');
    await userRepo.deactivateUser(id);
    return { message: 'User deactivated successfully.' };
  },

  async getStats() {
    const users = await userRepo.findAll();
    return {
      total: users.length,
      active: users.filter((u) => u.isActive).length,
      inactive: users.filter((u) => !u.isActive).length,
      manufacturers: users.filter((u) => u.businessType === 'manufacturer').length,
      suppliers: users.filter((u) => u.businessType === 'raw_material_supplier').length,
      both: users.filter((u) => u.businessType === 'both').length,
    };
  },
};
