import { onRequest } from 'firebase-functions/v2/https';

// Lightweight HTTP handlers to satisfy Hosting rewrites
export const authHandler = onRequest({ region: 'us-central1' }, async (req, res) => {
  res.status(200).json({ ok: true, service: 'auth', message: 'Auth API placeholder' });
});

export const usersHandler = onRequest({ region: 'us-central1' }, async (req, res) => {
  res.status(200).json({ ok: true, service: 'users', message: 'Users API placeholder' });
});

export const chatHandler = onRequest({ region: 'us-central1' }, async (req, res) => {
  res.status(200).json({ ok: true, service: 'chat', message: 'Chat API placeholder' });
});

export const paymentsHandler = onRequest({ region: 'us-central1' }, async (req, res) => {
  res.status(200).json({ ok: true, service: 'payments', message: 'Payments API placeholder' });
});

// Export function modules (these should import from './admin' when needing Admin SDK)
export * from './auth';
export * from './users';
export * from './chat';
export * from './payments';