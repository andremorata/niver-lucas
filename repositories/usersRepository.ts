import { BaseRepository } from './baseRepository';
import bcrypt from 'bcrypt';

export interface User {
  username: string;
  passwordHash: string;
  lastLoginDate: Date | null;
  role: 'member' | 'admin';
}

const saltRounds = 10;

export class UsersRepository extends BaseRepository {
  constructor() {
    super();
    this.pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        username TEXT PRIMARY KEY,
        password_hash TEXT NOT NULL,
        last_login_date TIMESTAMP,
        role TEXT NOT NULL CHECK (role IN ('member','admin'))
      );
    `).then(() => {
      this.query(`SELECT username FROM users WHERE username = $1`, ['admin'])
        .then(res => {
          if (res.rowCount === 0) {
            bcrypt.hash('lvm25', saltRounds).then(hash => {
              this.query(
                `INSERT INTO users (username, password_hash, role) VALUES ($1, $2, $3)`,
                ['admin', hash, 'admin']
              );
            });
          }
        });
    });
  }

  async getUserByUsername(username: string): Promise<User | null> {
    const res = await this.query(
      'SELECT username, password_hash, last_login_date, role FROM users WHERE username = $1',
      [username]
    );
    if (res.rowCount === 0) return null;
    const user = res.rows[0];
    return {
      username: user.username,
      passwordHash: user.password_hash,
      lastLoginDate: user.last_login_date,
      role: user.role,
    };
  }

  async createUser(username: string, password: string, role: 'member' | 'admin'): Promise<User> {
    const passwordHash = await bcrypt.hash(password, saltRounds);
    await this.query(
      `INSERT INTO users (username, password_hash, role) VALUES ($1, $2, $3)`,
      [username, passwordHash, role]
    );
    return {
      username,
      passwordHash,
      lastLoginDate: null,
      role,
    };
  }

  async updateLastLogin(username: string): Promise<void> {
    await this.query(
      `UPDATE users SET last_login_date = NOW() WHERE username = $1`,
      [username]
    );
  }
}
