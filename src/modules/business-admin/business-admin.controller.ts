import { Response, NextFunction } from 'express';
import { AuthRequest } from '../../middlewares/auth.middleware';
import { businessAdminService } from './business-admin.service';

export class BusinessAdminController {
  getUsers = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const type = typeof req.query.type === 'string' ? req.query.type : undefined;
      res.json(await businessAdminService.getUsers(type));
    } catch (err) {
      next(err);
    }
  };

  getUserById = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      res.json(await businessAdminService.getUserById(req.params.id));
    } catch (err) {
      next(err);
    }
  };

  activateUser = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      res.json(await businessAdminService.activateUser(req.params.id));
    } catch (err) {
      next(err);
    }
  };

  deactivateUser = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      res.json(await businessAdminService.deactivateUser(req.params.id));
    } catch (err) {
      next(err);
    }
  };

  getStats = async (_req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      res.json(await businessAdminService.getStats());
    } catch (err) {
      next(err);
    }
  };
}
