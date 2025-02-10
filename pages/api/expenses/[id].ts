import type { NextApiRequest, NextApiResponse } from 'next';
import { ExpenseRepository } from '../../../repositories/expenseRepository';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;
  const expenseId = Number(id);
  const expensesRepository = new ExpenseRepository();

  if (req.method === 'PUT') {
    const { description, value } = req.body as { description: string; value: number };
    const updated = await expensesRepository.updateExpense(expenseId, description, Number(value));
    if (updated) {
      return res.status(200).json(updated);
    }
    return res.status(404).json({ message: 'Expense not found' });
  } else if (req.method === 'DELETE') {
    const success = await expensesRepository.deleteExpense(expenseId);
    if (success) {
      return res.status(200).json({ message: 'Expense removed successfully' });
    }
    return res.status(404).json({ message: 'Expense not found' });
  } else {
    res.setHeader('Allow', ['PUT', 'DELETE']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
