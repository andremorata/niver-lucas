import fs from 'fs';
import path from 'path';
import type { NextApiRequest, NextApiResponse } from 'next';

const dataFilePath = path.join(process.cwd(), 'data', 'expenses.json');

interface Expense {
  id: number;
  description: string;
  value: number;
}

const ensureDataFileExists = () => {
  if (!fs.existsSync(dataFilePath)) {
    fs.writeFileSync(dataFilePath, JSON.stringify([], null, 2));
  }
};

const readExpenses = (): Expense[] => {
  ensureDataFileExists();
  const fileData = fs.readFileSync(dataFilePath, 'utf8');
  return fileData ? JSON.parse(fileData) : [];
};

const writeExpenses = (expenses: Expense[]) => {
  fs.writeFileSync(dataFilePath, JSON.stringify(expenses, null, 2));
};

const handlePut = (expenseId: number, req: NextApiRequest, res: NextApiResponse, expenses: Expense[]) => {
  const updatedExpense = req.body as Expense;
  const index = expenses.findIndex(exp => exp.id === expenseId);
  if (index >= 0) {
    expenses[index] = updatedExpense;
    writeExpenses(expenses);
    return res.status(200).json(updatedExpense);
  }
  return res.status(404).json({ message: 'Expense not found' });
};

const handleDelete = (expenseId: number, req: NextApiRequest, res: NextApiResponse, expenses: Expense[]) => {
  const index = expenses.findIndex(exp => exp.id === expenseId);
  if (index >= 0) {
    const updatedExpenses = expenses.filter(exp => exp.id !== expenseId);
    writeExpenses(updatedExpenses);
    return res.status(200).json({ message: 'Expense removed successfully' });
  }
  return res.status(404).json({ message: 'Expense not found' });
};

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const expenses = readExpenses();
  const { id } = req.query;
  const expenseId = Number(id);

  if (req.method === 'PUT') {
    return handlePut(expenseId, req, res, expenses);
  } else if (req.method === 'DELETE') {
    return handleDelete(expenseId, req, res, expenses);
  } else {
    res.setHeader('Allow', ['PUT', 'DELETE']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
