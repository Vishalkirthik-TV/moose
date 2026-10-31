import type { VercelRequest, VercelResponse } from '@vercel/node';
import { providerStatusHandler } from '../../server/api-handlers.js';

export default function handler(request: VercelRequest, response: VercelResponse) {
  return providerStatusHandler(request, response);
}
