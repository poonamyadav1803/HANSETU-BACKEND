import { BaseService } from "../../core/BaseService";
import { RfqRepository } from "./rfq.repository";
import { sendRfqAdminNotification, sendSupplierAssignedNotification } from "../../services/email.service";
import type { AssignSupplierDto, SubmitRfqDto } from "./rfq.schema";
import { guardRfqTransition, type RfqStatus } from "../../core/order-state-machine";
import { UserRepository } from "../user/user.repository";
import type { UserProfile } from "../user/user.entity";

export class RfqService extends BaseService {
  private userRepo = new UserRepository();

  constructor(private repo: RfqRepository) {
    super();
  }

  async submit(buyerId: string, dto: SubmitRfqDto, attachments: string[] = []) {
    const rfqNumber = await this.repo.generateRfqNumber();

    const rfq = await this.repo.create({
      rfqNumber,
      buyerId,
      productName: dto.productName,
      category: dto.category,
      quantity: String(dto.quantity),
      unit: dto.unit,
      deliveryLocation: dto.deliveryLocation,
      requiredBy: dto.requiredBy,
      specs: dto.specs,
      orderType: dto.orderType,
      attachments,
    });

    // Story 1.3 — notify admin; fire-and-forget so a mail failure never blocks the response
    sendRfqAdminNotification(rfq.rfqNumber, dto.productName, dto.category, dto.deliveryLocation).catch(
      () => undefined
    );

    return rfq;
  }

  async getMyRfqs(buyerId: string) {
    return this.repo.findByBuyer(buyerId);
  }

  async getById(id: string, buyerId?: string) {
    const row = await this.repo.findById(id);
    if (!row) this.throwNotFound("RFQ not found");
    if (buyerId && row!.rfq.buyerId !== buyerId) {
      this.throwUnauthorized("You do not have access to this RFQ");
    }
    return row!;
  }

  async getAssignedRfqs(supplierUserId: string) {
    return this.repo.findBySupplier(supplierUserId);
  }

  async getAllForAdmin(status?: string) {
    return this.repo.findAll(status);
  }

  async assignSupplier(rfqId: string, adminId: string, dto: AssignSupplierDto) {
    const row = await this.repo.findById(rfqId);
    if (!row) this.throwNotFound("RFQ not found");

    const supplier = await this.userRepo.findById(dto.supplierUserId);
    if (!supplier || !supplier.isActive) {
      this.throwBadRequest("Assigned supplier was not found or is inactive.");
    }
    const activeSupplier = supplier as NonNullable<typeof supplier>;

    if (!["raw_material_supplier", "both"].includes(activeSupplier.businessType)) {
      this.throwBadRequest("Selected user is not eligible to receive supplier RFQs.");
    }

    if (!this.supplierMatchesCategory(activeSupplier.profile, row.rfq.category)) {
      this.throwBadRequest("Selected supplier does not appear to match the RFQ category/capability.");
    }

    const currentStatus = row.rfq.status as RfqStatus;
    if (!["SUBMITTED", "UNDER_REVIEW", "SUPPLIER_ASSIGNED"].includes(currentStatus)) {
      this.throwBadRequest(`RFQ cannot be assigned while in status ${currentStatus}.`);
    }

    if (currentStatus !== "SUPPLIER_ASSIGNED") {
      guardRfqTransition(currentStatus, "SUPPLIER_ASSIGNED");
    }

    const assignment = await this.repo.upsertAssignment({
      rfqId,
      supplierUserId: dto.supplierUserId,
      assignedBy: adminId,
      adminMarginPct: String(dto.adminMarginPct),
      adminOfferedPrice: dto.adminOfferedPrice != null ? String(dto.adminOfferedPrice) : undefined,
      internalNotes: dto.internalNotes,
    });

    if (currentStatus !== "SUPPLIER_ASSIGNED") {
      await this.repo.updateStatus(rfqId, "SUPPLIER_ASSIGNED");
    }

    sendSupplierAssignedNotification(
      activeSupplier.email,
      row.rfq.rfqNumber,
      row.rfq.productName,
      row.rfq.category,
      row.rfq.deliveryLocation
    ).catch(() => undefined);

    const updated = await this.repo.findById(rfqId);
    return {
      ...updated!,
      assignment,
    };
  }

  private supplierMatchesCategory(profile: UserProfile | null | undefined, rfqCategory: string) {
    if (!profile) return false;

    const supplierTokens = new Set(
      [
        ...(profile.rawMaterialCategories ?? []),
        ...(profile.rawMaterialProducts ?? []),
        ...(profile.rawTargetIndustries ?? []),
        ...(profile.industriesServed ?? []),
        ...(profile.manufacturingCapabilities ?? []),
        ...Object.keys(profile.rawMaterialSelections ?? {}),
        ...Object.values(profile.rawMaterialSelections ?? {}).flat(),
      ]
        .flatMap((value) => this.tokenize(value))
        .filter(Boolean)
    );

    const categoryTokens = this.tokenize(rfqCategory);
    if (!categoryTokens.length) return false;

    return categoryTokens.some((token) => supplierTokens.has(token));
  }

  private tokenize(value: string) {
    return value
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, " ")
      .split(" ")
      .map((token) => token.trim())
      .filter((token) => token.length >= 2);
  }
}
