import { NextApiRequest, NextApiResponse } from 'next';
import { promises as fs } from 'fs';
import path from 'path';

// Function to load disposable domains
async function loadDisposableDomains(): Promise<string[]> {
  const filePath = path.join(process.cwd(), 'auth', 'disposable-email-domains.conf');
  const data = await fs.readFile(filePath, 'utf-8');
  return data.split('\n').map(domain => domain.trim()).filter(Boolean);
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    const emailDomain = email.split('@')[1];
    const disposableDomains = await loadDisposableDomains();

    if (disposableDomains.includes(emailDomain)) {
      return res.status(400).json({ message: 'Temporary email addresses are not allowed' });
    }

    return res.status(200).json({ message: 'Email is valid' });
  } else {
    return res.status(405).json({ message: 'Method not allowed' });
  }
}