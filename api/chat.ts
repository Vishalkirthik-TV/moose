import type { VercelRequest, VercelResponse } from '@vercel/node';
import { chatHandler } from '../server/api-handlers.js';

export default function handler(request: VercelRequest, response: VercelResponse) {
  return chatHandler(request, response);
}
