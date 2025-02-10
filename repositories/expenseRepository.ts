import { BaseRepository } from './baseRepository';

export interface Expense {
  id: number;
  description: string;
  value: number;
}

export class ExpenseRepository extends BaseRepository {
  constructor() {
    super();
    this.pool.query(`
      CREATE TABLE IF NOT EXISTS expenses (
        id SERIAL PRIMARY KEY,
        description TEXT NOT NULL,
        value NUMERIC NOT NULL
      );
    `);
  }

  async getExpenses(): Promise<Expense[]> {
    const res = await this.query('SELECT id, description, value FROM expenses');
    return res.rows.map(exp => ({ ...exp, value: Number(exp.value) }));
  }

  async getExpenseById(id: number): Promise<Expense | null> {
    const res = await this.query('SELECT id, description, value FROM expenses WHERE id = $1', [id]);
    return res.rows[0] ? { ...res.rows[0], value: Number(res.rows[0].value) } : null;
  }

  async createExpense(description: string, value: number): Promise<Expense> {
    const res = await this.query(
      'INSERT INTO expenses (description, value) VALUES ($1, $2) RETURNING *',
      [description, value]
    );
    return { ...res.rows[0], value: Number(res.rows[0].value) };
  }

  async updateExpense(id: number, description: string, value: number): Promise<Expense | null> {
    const res = await this.query(
      'UPDATE expenses SET description = $1, value = $2 WHERE id = $3 RETURNING *',
      [description, value, id]
    );
    return res.rows[0] ? { ...res.rows[0], value: Number(res.rows[0].value) } : null;
  }

  async deleteExpense(id: number): Promise<boolean> {
    const res = await this.query('DELETE FROM expenses WHERE id = $1', [id]);
    return (res.rowCount ?? 0) > 0;
  }
}
