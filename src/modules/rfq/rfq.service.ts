import { BaseService } from "../../core/BaseService";
import { RfqRepository } from "./rfq.repository";
import { sendRfqAdminNotification } from "../../services/email.service";
import type { SubmitRfqDto } from "./rfq.schema";

export class RfqService extends BaseService {
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

  async getAllForAdmin(status?: string) {
    return this.repo.findAll(status);
  }
}
