import { Router } from 'express';
import { BusinessAdminController } from './business-admin.controller';
import { adminMiddleware } from '../../middlewares/admin.middleware';

export class BusinessAdminRoutes {
  public router = Router();
  private controller = new BusinessAdminController();

  constructor() {
    this.router.use(adminMiddleware);

    this.router.get('/stats', this.controller.getStats);
    this.router.get('/users', this.controller.getUsers);
    this.router.get('/users/:id', this.controller.getUserById);
    this.router.patch('/users/:id/activate', this.controller.activateUser);
    this.router.patch('/users/:id/deactivate', this.controller.deactivateUser);
  }
}
