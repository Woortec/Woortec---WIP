// src/utils/apiBatchRequest.tsx
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
  const batchRequest = [
    {
      method: 'GET',
      relative_url: `${adAccountId}/insights?fields=spend,date_start&time_range=${encodeURIComponent(
        JSON.stringify({ since: startDate, until: endDate })
      )}`,
    },
    {
      method: 'GET',
      relative_url: `${adAccountId}/ads?fields=effective_status&limit=100`,
    },
    {
      method: 'GET',
      relative_url: `${adAccountId}?fields=currency`,
    },
  ];

  const response = await axios.post(
    `https://graph.facebook.com/v21.0/`,
    { batch: batchRequest },
    { params: { access_token: accessToken } }
  );

  return response.data as Array<{
    code: number;
    body: string;
  }>;
};
