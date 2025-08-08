import type { VercelRequest, VercelResponse } from '@vercel/node';
import mercadopago from 'mercadopago';

// Configure Mercado Pago SDK via env var
const ACCESS_TOKEN = process.env.MP_ACCESS_TOKEN || process.env.MERCADOPAGO_ACCESS_TOKEN;
if (!ACCESS_TOKEN) {
  console.warn('MP_ACCESS_TOKEN not set. Set env var MP_ACCESS_TOKEN with your Mercado Pago Access Token.');
}
mercadopago.configure({ access_token: ACCESS_TOKEN || '' });

// Basic CORS headers
const allowCors = (res: VercelResponse) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  allowCors(res);

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    if (req.method === 'POST') {
      // Create payment (PIX or CARD)
      const {
        type, // 'pix' | 'card'
        amountCents, // integer (centavos)
        description,
        payer, // { email, first_name, last_name, identification: { type: 'CPF', number: string } }
        token, // card token (only for card)
        installments = 1, // only for card
        externalReference,
      } = req.body || {};

      if (!amountCents || !description || !payer || !type) {
        return res.status(400).json({ error: 'Missing required fields: type, amountCents, description, payer' });
      }

      const transaction_amount = Math.round(Number(amountCents)) / 100; // convert to BRL

      const basePayment: any = {
        transaction_amount,
        description,
        payment_method_id: type === 'pix' ? 'pix' : undefined,
        payer: {
          email: payer.email,
          first_name: payer.first_name,
          last_name: payer.last_name,
          identification: payer.identification, // { type: 'CPF', number }
        },
        external_reference: externalReference,
      };

      // Adicionar prazo de vencimento para PIX (24 horas)
      if (type === 'pix') {
        const expirationDate = new Date();
        expirationDate.setHours(expirationDate.getHours() + 24);
        basePayment.date_of_expiration = expirationDate.toISOString();
      }

      let paymentPayload: any = basePayment;

      if (type === 'card') {
        if (!token) {
          return res.status(400).json({ error: 'Missing card token for card payment' });
        }
        paymentPayload = {
          ...basePayment,
          token,
          installments,
          payment_method_id: undefined, // determined by token
        };
      }

      const notification_url = process.env.MP_WEBHOOK_URL;
      if (notification_url) {
        paymentPayload.notification_url = notification_url;
      }

      const result = await mercadopago.payment.create(paymentPayload);
      return res.status(200).json({ success: true, payment: result.body });
    }

    if (req.method === 'GET') {
      // Get payment status by id: /api/mercadopago?id=123
      const { id } = req.query;
      if (!id || Array.isArray(id)) {
        return res.status(400).json({ error: 'Missing payment id' });
      }
      const result = await mercadopago.payment.findById(id);
      return res.status(200).json({ success: true, payment: result.body });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error: any) {
    console.error('Mercado Pago API error:', error?.response?.data || error);
    const message = error?.response?.data || error?.message || 'Unknown error';
    return res.status(500).json({ success: false, error: message });
  }
}

