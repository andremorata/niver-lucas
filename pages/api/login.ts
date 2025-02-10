import type { NextApiRequest, NextApiResponse } from 'next';
import bcrypt from 'bcrypt';
import { UsersRepository } from '../../repositories/usersRepository';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const usersRepo = new UsersRepository();
  if (req.method === 'POST') {
    const { username, password } = req.body as { username: string; password: string };
    const user = await usersRepo.getUserByUsername(username);
    if (user && await bcrypt.compare(password, user.passwordHash)) {
      await usersRepo.updateLastLogin(username);
      return res.status(200).json({ success: true, username: user.username, role: user.role });
    }
    return res.status(401).json({ success: false, message: 'Invalid credentials' });
  }
  res.setHeader('Allow', ['POST']);
  return res.status(405).end(`Method ${req.method} Not Allowed`);
}
