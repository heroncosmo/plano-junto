import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

// CORS básico
function allowCors(res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
}

function makeError(res: VercelResponse, status: number, message: string) {
  return res.status(status).json({ success: false, error: message });
}

function encryptToken(plain: string, passphrase: string) {
  // Deriva uma chave forte de 32 bytes a partir do passphrase
  const key = crypto.scryptSync(passphrase, 'mp-cred-salt', 32);
  const iv = crypto.randomBytes(12); // GCM IV
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
  const enc = Buffer.concat([cipher.update(plain, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  // Formato armazenado: base64(iv.tag.data)
  return Buffer.concat([iv, tag, enc]).toString('base64');
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  allowCors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return makeError(res, 405, 'Method not allowed');

  const SUPABASE_URL = process.env.SUPABASE_URL;
  const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const MASTER_KEY = process.env.CREDENTIALS_MASTER_KEY;
  const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || '').split(',').map(s => s.trim().toLowerCase()).filter(Boolean);

  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY || !MASTER_KEY) {
    return makeError(res, 500, 'Missing server env: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY or CREDENTIALS_MASTER_KEY');
  }

  try {
    const authHeader = req.headers.authorization || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : '';
    if (!token) return makeError(res, 401, 'Missing Bearer token');

    const adminSupabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      global: { headers: { Authorization: `Bearer ${token}` } },
    });

    const { data: userData, error: userErr } = await adminSupabase.auth.getUser();
    if (userErr || !userData?.user) return makeError(res, 401, 'Invalid session');

    const email = (userData.user.email || '').toLowerCase();
    if (!ADMIN_EMAILS.includes(email)) return makeError(res, 403, 'Not allowed');

    const { provider = 'mercadopago', token: accessToken } = (req.body || {}) as { provider?: string; token?: string };
    if (!accessToken) return makeError(res, 400, 'Missing token');

    const tokenEncrypted = encryptToken(accessToken, MASTER_KEY);

    const { error: insertErr } = await adminSupabase
      .from('payment_credentials')
      .insert({ provider, token_encrypted: tokenEncrypted, created_by: userData.user.id });

    if (insertErr) return makeError(res, 500, `DB error: ${insertErr.message}`);

    return res.status(200).json({ success: true, message: 'Token salvo com sucesso (write-only).' });
  } catch (e: any) {
    return makeError(res, 500, e?.message || 'Unknown error');
  }
}

