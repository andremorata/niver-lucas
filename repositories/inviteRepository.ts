import { BaseRepository } from './baseRepository';

export interface Guest {
  fullName: string;
  age: string;
}

export interface Invite {
  mainGuest: Guest;
  otherGuests: Guest[];
  createdAt?: Date;
}

export class InviteRepository extends BaseRepository {
  constructor() {
    super();
    this.ensureTableExists();
  }

  async ensureTableExists(): Promise<void> {
    await this.pool.query(`
      CREATE TABLE IF NOT EXISTS invites (
        id SERIAL PRIMARY KEY,
        main_guest_full_name VARCHAR(255) NOT NULL,
        main_guest_age VARCHAR(10) NOT NULL,
        other_guests JSONB,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
  }

  async saveInvite(data: Invite): Promise<Invite> {
    await this.ensureTableExists();
    const query = `
      INSERT INTO invites (
        main_guest_full_name,
        main_guest_age,
        other_guests
      ) VALUES ($1, $2, $3)
      RETURNING main_guest_full_name as "mainGuest_fullName", main_guest_age as "mainGuest_age", other_guests, created_at as "createdAt";
    `;
    const values = [
      data.mainGuest.fullName,
      data.mainGuest.age,
      JSON.stringify(data.otherGuests)
    ];
    const res = await this.query(query, values);
    const row = res.rows[0];
    return {
      mainGuest: { fullName: row.mainGuest_fullName, age: row.mainGuest_age },
      otherGuests: row.other_guests,
      createdAt: row.createdAt,
    };
  }
}

export const inviteRepository = new InviteRepository();
