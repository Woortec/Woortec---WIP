// pages/api/sign-in.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '../../../utils/supabase/client';
import { subscribeProfile } from '@/lib/klaviyo/subscribeProfile';

const supabase = createClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { email, password } = req.body;

    console.log(`Attempting to sign in user with email: ${email}`);

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error('Supabase sign-in error:', error.message);
      return res.status(400).json({ error: error.message });
    }

    if (data.user) {
      try {
        console.log(`User signed in successfully: ${data.user.email}`);
        await subscribeProfile(data.user.email);
        console.log(`Profile subscribed in Klaviyo for email: ${data.user.email}`);
        return res.status(200).json({ message: 'Signed in and profile subscribed' });
      } catch (err: any) {
        console.error('Failed to subscribe profile in Klaviyo:', err);
        if (err.response) {
          console.error('Error response data from Klaviyo:', err.response.data);
          return res.status(500).json({ error: err.response.data });
        } else if (err.request) {
          console.error('No response received from Klaviyo:', err.request);
          return res.status(500).json({ error: 'No response received from external API' });
        } else {
          console.error('Error message:', err.message);
          return res.status(500).json({ error: err.message });
        }
      }
    }

    return res.status(400).json({ error: 'Unknown error occurred' });
  }

  res.setHeader('Allow', ['POST']);
  res.status(405).end(`Method ${req.method} Not Allowed`);
}
