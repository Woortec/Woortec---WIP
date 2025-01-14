// utils/apiBatchRequest.tsx

import axios from 'axios';

export interface BatchRequestParams {
  accessToken: string;
  adAccountId: string;
  startDate: string;
  endDate: string;
}

export const makeBatchRequest = async ({
  accessToken,
  adAccountId,
  startDate,
  endDate,
}: BatchRequestParams) => {
  try {
    // Prepare batch request
    const batchRequest = [
      {
        method: 'GET',
        relative_url: `${adAccountId}/insights?fields=spend,budget,impressions,actions&time_range=${JSON.stringify({
          since: startDate,
          until: endDate,
        })}`,
      },
      {
        method: 'GET',
        relative_url: `${adAccountId}/ads?fields=effective_status`,
      },
      {
        method: 'GET',
        relative_url: `${adAccountId}?fields=currency`,
      },
    ];

    const response = await axios.post(
      `https://graph.facebook.com/v20.0/`,
      { batch: batchRequest },
      { params: { access_token: accessToken } }
    );

    return response.data;
  } catch (error) {
    console.error('Error making batch request:', error);
    throw error;
  }
};