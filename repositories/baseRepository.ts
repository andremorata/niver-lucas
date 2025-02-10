import { Pool } from 'pg';

export class BaseRepository {
  protected pool: Pool;

  constructor() {
    this.pool = new Pool({
      host: process.env.PGHOST || 'localhost',
      user: process.env.PGUSER || 'postgres',
      password: process.env.PGPASSWORD || '1234',
      database: process.env.PGDATABASE || 'niver_db',
      port: Number(process.env.PGPORT) || 5432,
    });
  }

  protected async query(text: string, params?: any[]) {
    return await this.pool.query(text, params);
  }
}
