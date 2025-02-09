import { NextApiRequest, NextApiResponse } from 'next';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { password } = req.body;
    if (password === 'lvm25') {
      return res.status(200).json({ success: true });
    }
    return res.status(401).json({ success: false, message: 'Senha incorreta' });
  }
  res.setHeader('Allow', ['POST']);
  return res.status(405).end(`Method ${req.method} Not Allowed`);
}
