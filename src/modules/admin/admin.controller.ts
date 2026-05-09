import { Response, NextFunction } from "express";
import { AdminRequest } from "../../middlewares/admin.middleware";
import { AdminService } from "./admin.service";
import { UserRepository } from "../user/user.repository";
import { z } from "zod";

const adminService = new AdminService(new UserRepository());

const updateRoleSchema = z.object({
  role: z.enum(["user", "admin"]),
});

export class AdminController {
  async getStats(req: AdminRequest, res: Response, next: NextFunction) {
    try {
      const stats = await adminService.getStats();
      res.json(stats);
    } catch (err) {
      next(err);
    }
  }

  async getAllUsers(req: AdminRequest, res: Response, next: NextFunction) {
    try {
      const users = await adminService.getAllUsers();
      res.json(users);
    } catch (err) {
      next(err);
    }
  }

  async getUserById(req: AdminRequest, res: Response, next: NextFunction) {
    try {
      const user = await adminService.getUserById(req.params.id);
      res.json(user);
    } catch (err) {
      next(err);
    }
  }

  async activateUser(req: AdminRequest, res: Response, next: NextFunction) {
    try {
      const result = await adminService.activateUser(req.params.id);
      res.json(result);
    } catch (err) {
      next(err);
    }
  }

  async deactivateUser(req: AdminRequest, res: Response, next: NextFunction) {
    try {
      const result = await adminService.deactivateUser(req.params.id);
      res.json(result);
    } catch (err) {
      next(err);
    }
  }

  async updateUserRole(req: AdminRequest, res: Response, next: NextFunction) {
    try {
      const { role } = updateRoleSchema.parse(req.body);
      const user = await adminService.updateUserRole(req.params.id, role);
      res.json(user);
    } catch (err) {
      next(err);
    }
  }
}
