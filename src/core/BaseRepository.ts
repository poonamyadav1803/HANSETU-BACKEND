import { db } from "../db";

export abstract class BaseRepository {
  protected readonly db = db;
}
