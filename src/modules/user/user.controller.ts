import { Request, Response, NextFunction } from "express";
import { UserService } from "./user.service";
import { UserRepository } from "./user.repository";

const userService = new UserService(new UserRepository());

export class UserController {
  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await userService.getUserById(req.params.id);
      const { password, ...safe } = user;
      res.json(safe);
    } catch (err) {
      next(err);
    }
  }

  async getAll(_req: Request, res: Response, next: NextFunction) {
    try {
      const users = await userService.getAllUsers();
      res.json(users.map(({ password, ...safe }) => safe));
    } catch (err) {
      next(err);
    }
  }

  async deactivate(req: Request, res: Response, next: NextFunction) {
    try {
      await userService.deactivateUser(req.params.id);
      res.json({ message: "User deactivated" });
    } catch (err) {
      next(err);
    }
  }
}
