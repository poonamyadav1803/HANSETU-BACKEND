export { IStorage } from "./IStorage";
export { MemStorage } from "./MemStorage";
export { DrizzleStorage } from "./DrizzleStorage";

import { DrizzleStorage } from "./DrizzleStorage";

// Active storage implementation — swap to MemStorage for testing
export const storage = new DrizzleStorage();
