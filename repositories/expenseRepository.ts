import { Pool } from 'pg';

export interface Expense {
  id: number;
  description: string;
  value: number;
}

const pool = new Pool({
  host: process.env.PGHOST || 'localhost',
  user: process.env.PGUSER || 'postgres',
  password: process.env.PGPASSWORD || 'example',
  database: process.env.PGDATABASE || 'niver_db',
  port: Number(process.env.PGPORT) || 5432,
});

// Create table if it doesn't exist
pool.query(`
  CREATE TABLE IF NOT EXISTS expenses (
    id SERIAL PRIMARY KEY,
    description TEXT NOT NULL,
    value NUMERIC NOT NULL
  );
`);

export const getExpenses = async (): Promise<Expense[]> => {
  const res = await pool.query('SELECT id, description, value FROM expenses');
  return res.rows;
};

export const getExpenseById = async (id: number): Promise<Expense | null> => {
  const res = await pool.query('SELECT id, description, value FROM expenses WHERE id = $1', [id]);
  return res.rows[0] || null;
};

export const createExpense = async (description: string, value: number): Promise<Expense> => {
  const res = await pool.query(
    'INSERT INTO expenses (description, value) VALUES ($1, $2) RETURNING *',
    [description, value]
  );
  return res.rows[0];
};

export const updateExpense = async (id: number, description: string, value: number): Promise<Expense | null> => {
  const res = await pool.query(
    'UPDATE expenses SET description = $1, value = $2 WHERE id = $3 RETURNING *',
    [description, value, id]
  );
  return res.rows[0] || null;
};

export const deleteExpense = async (id: number): Promise<boolean> => {
  const res = await pool.query('DELETE FROM expenses WHERE id = $1', [id]);
  return res.rowCount > 0;
};
