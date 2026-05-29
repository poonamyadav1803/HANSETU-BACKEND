import { Response, NextFunction } from "express";
import { AuthRequest } from "../../middlewares/auth.middleware";
import { UserAddressService } from "./user-address.service";
import { UserAddressRepository } from "./user-address.repository";

const service = new UserAddressService(new UserAddressRepository());

export class UserAddressController {
  async getAll(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      res.json(await service.getByUser(req.userId!));
    } catch (err) {
      next(err);
    }
  }

  async create(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const address = await service.create(req.userId!, req.body);
      res.status(201).json(address);
    } catch (err) {
      next(err);
    }
  }

  async setDefault(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      res.json(await service.setDefault(req.params.id, req.userId!));
    } catch (err) {
      next(err);
    }
  }

  async remove(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      await service.delete(req.params.id, req.userId!);
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  }
}
