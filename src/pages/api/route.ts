
import Stripe from 'stripe';
import { NextApiRequest, NextApiResponse } from 'next';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20',
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { customerId } = req.body;

  if (!customerId) {
    return res.status(400).json({ error: 'Customer ID is required' });
  }

  try {
    const invoices = await stripe.invoices.list({
      customer: customerId,
      limit: 20,
    });

    // Make sure you are returning all relevant invoice fields
    const formattedInvoices = invoices.data.map(invoice => ({
      id: invoice.id,
      number: invoice.number,  // Correctly pull the invoice number
      status: invoice.status,
      amount_due: invoice.amount_due,
      amount_paid: invoice.amount_paid,
      date: invoice.created,
      invoice_pdf: invoice.invoice_pdf, // ✅ This is the Stripe-hosted invoice PDF
    }));

    return res.status(200).json({ invoices: formattedInvoices });
  } catch (error: any) {
    console.error('Error fetching invoices:', error);
    return res.status(500).json({ error: 'Failed to fetch invoices.' });
  }
}