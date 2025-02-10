import type { NextApiRequest, NextApiResponse } from 'next';
import { getExpenses, createExpense } from '../../repositories/expenseRepository';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    const expenses = await getExpenses();
    return res.status(200).json(expenses);
  } else if (req.method === 'POST') {
    const { description, value } = req.body as { description: string; value: number };
    const newExpense = await createExpense(description, Number(value));
    return res.status(201).json(newExpense);
  } else {
    return res.status(405).json({ message: 'Method not allowed' });
  }
}