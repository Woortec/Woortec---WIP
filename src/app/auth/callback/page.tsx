import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '../../../../utils/supabase/client';
import axios from 'axios';

const supabase = createClient();

const KLAVIYO_API_KEY = process.env.NEXT_PUBLIC_KLAVIYO_API_KEY;
const KLAVIYO_API_URL = 'https://a.klaviyo.com/api/profile-subscription-bulk-create-jobs';
const LIST_ID = 'XSsStF'; // Replace with your actual list ID
const REVISION = '2024-07-15'; // Use the latest date of revision according to Klaviyo's API

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { data: sessionData, error } = await supabase.auth.getSessionFromUrl({ storeSession: true });

    if (error) {
      console.error('Error getting session from URL:', error);
      return res.redirect('/?error=auth_callback_failed');
    }

    if (sessionData?.session) {
      const user = sessionData.session.user;
      const email = user.email;

      console.log('Google sign-in successful, session data:', sessionData.session);

      const options = {
        method: 'POST',
        url: KLAVIYO_API_URL,
        headers: {
          accept: 'application/json',
          revision: REVISION,
          'content-type': 'application/json',
          Authorization: `Klaviyo-API-Key ${KLAVIYO_API_KEY}`,
        },
        data: {
          data: {
            type: 'profile-subscription-bulk-create-job',
            attributes: {
              custom_source: 'Facebook Sync',
              profiles: {
                data: [
                  {
                    type: 'profile',
                    attributes: {
                      email: email,
                    },
                  },
                ],
              },
              historical_import: false,
            },
            relationships: { list: { data: { type: 'list', id: LIST_ID } } },
          },
        },
      };

      try {
        const response = await axios.request(options);
        console.log('Response from Klaviyo:', response.data);
      } catch (error) {
        const err = error as any;
        console.error('Error subscribing profile in Klaviyo:', err.response ? err.response.data : err.message);
      }

      return res.redirect(`/dashboard`);
    } else {
      return res.redirect('/?error=no_session');
    }
  } catch (error) {
    console.error('Error during authentication handling:', error);
    return res.redirect('/?error=auth_callback_error');
  }
}
