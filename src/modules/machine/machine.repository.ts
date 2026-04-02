import { eq, and } from "drizzle-orm";
import { db } from "../../db";
import { machines } from "../../db/schema";

export class MachineRepository {
  async findAll(filters: { category?: string; isFeatured?: boolean }) {
    const conditions = [eq(machines.isActive, true)];

    if (filters.category) {
      conditions.push(eq(machines.category, filters.category));
    }
    if (filters.isFeatured !== undefined) {
      conditions.push(eq(machines.isFeatured, filters.isFeatured));
    }

    return db
      .select()
      .from(machines)
      .where(and(...conditions));
  }

  async findById(id: string) {
    const [row] = await db
      .select()
      .from(machines)
      .where(eq(machines.id, id));
    return row ?? null;
  }
}
