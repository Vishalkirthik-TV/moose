import type { VercelRequest, VercelResponse } from '@vercel/node';
import { providerModelsHandler } from '../../server/api-handlers.js';

export default function handler(request: VercelRequest, response: VercelResponse) {
  return providerModelsHandler(request, response);
}
