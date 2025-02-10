import type { NextApiRequest, NextApiResponse } from 'next';
import { ExpenseRepository } from '../../repositories/expenseRepository';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const expensesRepository = new ExpenseRepository();
  if (req.method === 'GET') {
    const expenses = await expensesRepository.getExpenses();
    return res.status(200).json(expenses);
  } else if (req.method === 'POST') {
    const { description, value } = req.body as { description: string; value: number };
    const newExpense = await expensesRepository.createExpense(description, Number(value));
    return res.status(201).json(newExpense);
  } else {
    return res.status(405).json({ message: 'Method not allowed' });
  }
}