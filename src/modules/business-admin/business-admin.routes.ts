import { Router } from 'express';
import { BusinessAdminController } from './business-admin.controller';
import { authMiddleware } from '../../middlewares/auth.middleware';
import { requireAdmin } from '../../middlewares/rbac.middleware';

export class BusinessAdminRoutes {
  public router = Router();
  private controller = new BusinessAdminController();

  constructor() {
    this.router.use(authMiddleware, requireAdmin);

    this.router.get('/stats', this.controller.getStats);
    this.router.get('/users', this.controller.getUsers);
    this.router.get('/users/:id', this.controller.getUserById);
    this.router.patch('/users/:id/activate', this.controller.activateUser);
    this.router.patch('/users/:id/deactivate', this.controller.deactivateUser);
  }
}
