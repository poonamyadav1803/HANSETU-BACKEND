import { Response, NextFunction } from "express";
import { AuthRequest } from "../../middlewares/auth.middleware";
import { RfqService } from "./rfq.service";
import { RfqRepository } from "./rfq.repository";
import { submitRfqSchema } from "./rfq.schema";

const service = new RfqService(new RfqRepository());

export class RfqController {
  // POST /api/rfq — Buyer submits RFQ
  async submit(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const parsed = submitRfqSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ message: "Validation failed", errors: parsed.error.flatten() });
      }

      const attachments: string[] = (req.files as Express.Multer.File[] ?? []).map(
        (f: Express.Multer.File) => (f as any).location ?? f.path
      );

      const rfq = await service.submit(req.userId!, parsed.data, attachments);
      res.status(201).json(rfq);
    } catch (err) {
      next(err);
    }
  }

  // GET /api/rfq/my — Buyer views own RFQs
  async getMy(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const data = await service.getMyRfqs(req.userId!);
      res.json(data);
    } catch (err) {
      next(err);
    }
  }

  // GET /api/rfq/:id — Buyer views a single RFQ
  async getOne(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const data = await service.getById(req.params.id, req.userId!);
      res.json(data);
    } catch (err) {
      next(err);
    }
  }

  // GET /api/admin/rfqs — Admin views all RFQs
  async adminGetAll(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const status = req.query.status as string | undefined;
      const data = await service.getAllForAdmin(status);
      res.json(data);
    } catch (err) {
      next(err);
    }
  }

  // GET /api/admin/rfqs/:id — Admin views a single RFQ
  async adminGetOne(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const data = await service.getById(req.params.id);
      res.json(data);
    } catch (err) {
      next(err);
    }
  }
}
