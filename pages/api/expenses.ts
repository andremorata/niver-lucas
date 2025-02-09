import fs from 'fs';
import path from 'path';
import type { NextApiRequest, NextApiResponse } from 'next';

const dataFilePath = path.join(process.cwd(), 'data', 'expenses.json');

interface Expense {
  id: number;
  description: string;
  value: number;
}

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  let expenses: Expense[] = [];
  if (fs.existsSync(dataFilePath)) {
    const fileData = fs.readFileSync(dataFilePath, 'utf8');
    expenses = fileData ? JSON.parse(fileData) : [];
  }

  if (req.method === 'GET') {
    return res.status(200).json(expenses);
  } else if (req.method === 'POST') {
    const { description, value } = req.body as { description: string; value: number };
    const newExpense: Expense = {
      id: expenses.length ? expenses[expenses.length - 1].id + 1 : 1,
      description,
      value: Number(value)
    };
    expenses.push(newExpense);
    fs.writeFileSync(dataFilePath, JSON.stringify(expenses, null, 2));
    return res.status(201).json(newExpense);
  } else {
    return res.status(405).json({ message: 'Method not allowed' });
  }
}