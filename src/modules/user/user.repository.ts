import { Pool } from "pg";
import { Database } from "../../config/database";
import { IUser, BusinessType } from "./user.entity";

export class UserRepository {

    private get pool(): Pool {
        return Database.getPool();
    }

    //Create User
    async create(data: Partial<IUser>) {
        const result = await this.pool.query(
            `
      INSERT INTO users
      (gst_number, email, mobile, username, password, business_type, email_verified, mobile_verified, is_active)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
      RETURNING *;
      `,
            [
                data.gstNumber,
                data.email,
                data.mobile,
                data.username,
                data.password,
                data.businessType as BusinessType,
                data.emailVerified ?? false,
                data.mobileVerified ?? false,
                data.isActive ?? true
            ]
        );

        return this.mapRow(result.rows[0]);
    }

    //Find by Email
    async findByEmail(email: string) {
        const result = await this.pool.query(
            `SELECT * FROM users WHERE email = $1`,
            [email]
        );

        if (!result.rows.length) return null;
        return this.mapRow(result.rows[0]);
    }

    //Find by ID
    async findById(id: string) {
        const result = await this.pool.query(
            `SELECT * FROM users WHERE id = $1`,
            [id]
        );

        if (!result.rows.length) return null;
        return this.mapRow(result.rows[0]);
    }

    //Find by Username
    async findByUsername(username: string) {
        const result = await this.pool.query(
            `SELECT * FROM users WHERE username = $1`,
            [username]
        );

        if (!result.rows.length) return null;
        return this.mapRow(result.rows[0]);
    }

    //Admin: Get All Users
    async findAll() {
        const result = await this.pool.query(
            `SELECT * FROM users ORDER BY created_at DESC`
        );

        return result.rows.map(this.mapRow);
    }

    //Admin: Deactivate User
    async deactivateUser(id: string) {
        await this.pool.query(
            `UPDATE users SET is_active = false WHERE id = $1`,
            [id]
        );
    }

    //Internal Mapper (DB → Entity)
    private mapRow(row: any): IUser {
        return {
            id: row.id,
            gstNumber: row.gst_number,
            email: row.email,
            mobile: row.mobile,
            username: row.username,
            password: row.password,
            businessType: row.business_type,
            emailVerified: row.email_verified,
            mobileVerified: row.mobile_verified,
            isActive: row.is_active,
            createdAt: row.created_at,
            updatedAt: row.updated_at
        };
    }
}