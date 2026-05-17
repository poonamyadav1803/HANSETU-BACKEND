import { SupplierTransactionRepository } from "./supplier-transaction.repository";

export class SupplierTransactionService {
  constructor(private repo: SupplierTransactionRepository) {}

  async getTransactions(supplierUserId: string) {
    return this.repo.findBySupplier(supplierUserId);
  }

  async createTransaction(
    supplierUserId: string,
    data: { buyerName: string; materialName: string; amount: string; status?: string; transactionDate?: string }
  ) {
    return this.repo.create({
      supplierUserId,
      buyerName: data.buyerName,
      materialName: data.materialName,
      amount: data.amount,
      status: (data.status as "paid" | "pending" | "overdue") ?? "pending",
      transactionDate: data.transactionDate ?? new Date().toISOString().split("T")[0],
    });
  }
}
