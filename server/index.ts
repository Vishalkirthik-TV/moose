import 'dotenv/config';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import express from 'express';
import {
  chatHandler,
  createLocalAuthenticationMiddleware,
  providerModelsHandler,
  providerStatusHandler,
  searchHandler,
} from './api-handlers.js';

const app = express();
const port = Number(process.env.PORT ?? 3001);

app.disable('x-powered-by');
app.use(express.json({ limit: '1mb' }));
app.use('/api', createLocalAuthenticationMiddleware());
app.get('/api/providers/status', providerStatusHandler);
app.get('/api/providers/models', providerModelsHandler);
app.post('/api/chat', chatHandler);
app.post('/api/search', searchHandler);

const serverDirectory = path.dirname(fileURLToPath(import.meta.url));
const projectDirectory = path.basename(path.dirname(serverDirectory)) === '.server-dist'
  ? path.resolve(serverDirectory, '../..')
  : path.resolve(serverDirectory, '..');
const distPath = path.join(projectDirectory, 'dist');
app.use(express.static(distPath));
app.get(/.*/, (_request, response) => {
  response.sendFile(path.join(distPath, 'index.html'));
});

app.listen(port, () => {
  console.log(`Moose local API listening on http://localhost:${port}`);
});
