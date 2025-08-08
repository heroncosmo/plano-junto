export interface MPayer {
  email: string;
  first_name?: string;
  last_name?: string;
  identification?: { type: 'CPF' | 'CNPJ'; number: string };
}

export interface MPCreatePaymentResponse {
  success: boolean;
  payment?: any;
  error?: string;
}

const API_BASE = '/api/mercadopago';

export async function createPixPayment(params: {
  amountCents: number;
  description: string;
  payer: MPayer;
  externalReference?: string;
}): Promise<MPCreatePaymentResponse> {
  const res = await fetch(API_BASE, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ type: 'pix', ...params }),
  });
  return res.json();
}

export async function createCardPayment(params: {
  amountCents: number;
  description: string;
  payer: MPayer;
  token: string;
  installments?: number;
  externalReference?: string;
}): Promise<MPCreatePaymentResponse> {
  const res = await fetch(API_BASE, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ type: 'card', ...params }),
  });
  return res.json();
}

export async function getPayment(id: string) {
  const res = await fetch(`${API_BASE}?id=${encodeURIComponent(id)}`);
  return res.json();
}

