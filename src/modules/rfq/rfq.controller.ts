import { Request, Response, NextFunction } from "express";
import type { AuthRequest } from "../../middlewares/auth.middleware";
import type { AdminRequest } from "../../middlewares/admin.middleware";
import {
  submitRfqSchema, assignSchema, approveRfqSchema, submitQuoteSchema,
  confirmPoSchema, uploadInvoiceSchema, createShipmentSchema, addCheckpointSchema,
} from "./rfq.schema";
import * as svc from "./rfq.service";

// ─── Buyer ────────────────────────────────────────────────────────────────────

export const submit = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const dto = submitRfqSchema.parse(req.body);
    const files = (req.files as Express.Multer.File[]) ?? [];
    const rfq = await svc.submitRfq(req.userId!, dto, files);
    res.status(201).json(rfq);
  } catch (err) { next(err); }
};

export const getMy = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const data = await svc.getMyRfqs(req.userId!);
    res.json(data);
  } catch (err) { next(err); }
};

export const getOne = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const data = await svc.getMyRfqById(req.params.id, req.userId!);
    res.json(data);
  } catch (err) { next(err); }
};

// ─── Supplier / Assignee ─────────────────────────────────────────────────────

export const getMyAssigned = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const data = await svc.getMyAssignedRfqs(req.userId!);
    res.json(data);
  } catch (err) { next(err); }
};

export const submitQuote = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const dto = submitQuoteSchema.parse(req.body);
    await svc.supplierSubmitQuote(req.params.id, req.userId!, dto);
    res.json({ message: "Quote submitted" });
  } catch (err) { next(err); }
};

export const getMyPos = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const data = await svc.getMyPos(req.userId!);
    res.json(data);
  } catch (err) { next(err); }
};

export const confirmPo = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const dto = confirmPoSchema.parse(req.body);
    await svc.confirmPo(req.params.id, req.userId!, dto);
    res.json({ message: "PO confirmed" });
  } catch (err) { next(err); }
};

export const uploadInvoice = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const dto = uploadInvoiceSchema.parse(req.body);
    await svc.uploadSupplierInvoice(req.params.id, req.userId!, dto);
    res.json({ message: "Invoice uploaded" });
  } catch (err) { next(err); }
};

export const createShipment = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const dto = createShipmentSchema.parse(req.body);
    const shipment = await svc.createShipment(req.params.id, req.userId!, dto);
    res.status(201).json(shipment);
  } catch (err) { next(err); }
};

export const markReceived = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    await svc.buyerMarkReceived(req.params.id, req.userId!);
    res.json({ message: "Order marked as received" });
  } catch (err) { next(err); }
};

// ─── Admin ────────────────────────────────────────────────────────────────────

export const adminGetAll = async (req: AdminRequest, res: Response, next: NextFunction) => {
  try {
    const status = req.query.status as string | undefined;
    const data = await svc.adminListRfqs(status);
    res.json(data);
  } catch (err) { next(err); }
};

export const adminGetOne = async (req: AdminRequest, res: Response, next: NextFunction) => {
  try {
    const data = await svc.adminGetOne(req.params.id);
    res.json(data);
  } catch (err) { next(err); }
};

export const adminGetAssigneesList = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const type = (req.query.type as string) === "manufacturer" ? "manufacturer" : "supplier";
    const filters = {
      state: (req.query.state as string) || undefined,
      category: (req.query.category as string) || undefined,
      verified: req.query.verified === "true" ? true : undefined,
    };
    const data = await svc.getAssigneesList(type, filters);
    res.json(data);
  } catch (err) { next(err); }
};

export const adminGetAssigneeProfile = async (req: AdminRequest, res: Response, next: NextFunction) => {
  try {
    const data = await svc.getAssigneeProfile(req.params.id);
    res.json(data);
  } catch (err) { next(err); }
};

export const adminAssign = async (req: AdminRequest, res: Response, next: NextFunction) => {
  try {
    const dto = assignSchema.parse(req.body);
    const data = await svc.adminAssign(req.params.id, req.adminId!, dto);
    res.json(data);
  } catch (err) { next(err); }
};

export const adminApprove = async (req: AdminRequest, res: Response, next: NextFunction) => {
  try {
    const dto = approveRfqSchema.parse(req.body);
    const data = await svc.adminApprove(req.params.id, dto);
    res.json(data);
  } catch (err) { next(err); }
};

export const adminAddCheckpoint = async (req: AdminRequest, res: Response, next: NextFunction) => {
  try {
    const dto = addCheckpointSchema.parse(req.body);
    await svc.adminAddCheckpoint(req.params.id, dto);
    res.json({ message: "Checkpoint added" });
  } catch (err) { next(err); }
};

export const adminMarkDelivered = async (req: AdminRequest, res: Response, next: NextFunction) => {
  try {
    await svc.adminMarkDelivered(req.params.id);
    res.json({ message: "Shipment marked as delivered" });
  } catch (err) { next(err); }
};

export const adminListShipments = async (req: AdminRequest, res: Response, next: NextFunction) => {
  try {
    const data = await svc.adminListShipments();
    res.json(data);
  } catch (err) { next(err); }
};
