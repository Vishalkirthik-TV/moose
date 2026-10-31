import type { VercelRequest, VercelResponse } from '@vercel/node';
import { searchHandler } from '../server/api-handlers.js';

export default function handler(request: VercelRequest, response: VercelResponse) {
  return searchHandler(request, response);
}
