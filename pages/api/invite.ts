import type { NextApiRequest, NextApiResponse } from 'next';
import { inviteRepository, Invite } from '../../repositories/inviteRepository';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'POST') {
    try {
      const { mainGuest, otherGuests } = req.body;
      const newInvite: Invite = { mainGuest, otherGuests };
      const saved = await inviteRepository.saveInvite(newInvite);
      res.status(200).json({ success: true, data: saved });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, error: 'Server error' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
