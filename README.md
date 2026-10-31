# Moose

<p align="center">
  <img src="public/moose.svg" alt="Moose logo" width="128" />
</p>

**Moose** is an AI-powered search and chat app. It searches the web for current information, uses an AI model to compose answers, and displays sources so you can explore the results.

![React](https://img.shields.io/badge/React_19-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-%2338B2AC.svg?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-%23646CFF.svg?style=for-the-badge&logo=vite&logoColor=white)

## Features

- Web search results and AI-generated answers with source links.
- Markdown and syntax-highlighted code rendering.
- Conversation history persisted in local storage.
- Organize conversations into named spaces and confirm before deleting chats.
- Export conversations as printable PDFs or plain-text files.
- Browse official AI model news and research links.
- Switch between Z.AI and OpenRouter, with model discovery and model-aware reasoning.
- Account profile, security, and appearance settings.
- Sign-in and session management with Clerk.
- Server-side provider requests keep API credentials out of browser bundles.
- Responsive interface with light and dark themes.

## Built with

React, TypeScript, Vite, Vercel Functions, Express (local development), Tailwind CSS, Zustand, Clerk, SerpAPI, Z.AI, and OpenRouter.

## Getting started

1. Clone the repository:
   ```bash
   git clone https://github.com/Vishalkirthik-TV/moose.git
   cd moose
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Copy `.env.example` to `.env` and configure Clerk and the provider keys:
   ```env
   VITE_CLERK_PUBLISHABLE_KEY=pk_test_...
   VITE_ZAI_API_KEY=your_zai_api_key
   VITE_SERPAPI_KEY=your_serpapi_key
   VITE_OPENROUTER_API_KEY=your_openrouter_api_key
   ```
   `VITE_ZAI_API_KEY`, `VITE_SERPAPI_KEY`, and `VITE_OPENROUTER_API_KEY` are read only by the server and are not exposed to the browser. The Vite configuration exposes only `VITE_CLERK_PUBLISHABLE_KEY`. Clerk sessions are verified against Clerk's published signing keys. OpenRouter is optional. Configure its key in `.env` and restart the server to enable it.
4. Start the local development servers:
   ```bash
   npm run dev
   ```

The development command starts Vite and a local Express API. Production API routes are Vercel Functions in `api/`; `vercel.json` configures the Vite build and function runtime.

## Deploy to Vercel

1. Import the GitHub repository into Vercel and select the Vite framework preset. The build command and output directory are configured in `vercel.json`.
2. In **Project → Settings → Environment Variables**, add the Clerk publishable key and each provider key you use. Add them for Production and Preview as appropriate:
   - `VITE_CLERK_PUBLISHABLE_KEY` (required; public Clerk publishable key)
   - `VITE_ZAI_API_KEY` (required for Z.AI)
   - `VITE_SERPAPI_KEY` (optional; web search)
   - `VITE_OPENROUTER_API_KEY` (optional; enables OpenRouter)
3. Keep provider keys as server environment variables. `vite.config.ts` deliberately exposes only `VITE_CLERK_PUBLISHABLE_KEY` to browser code.
4. Optionally set `APP_URL` to the canonical deployment origin (for example `https://your-project.vercel.app`) for a custom domain or OpenRouter attribution. Configure it separately for Production and Preview if their origins differ. When unset, Clerk authorization uses the request origin/referer and falls back to Vercel's `VERCEL_URL`.
5. Redeploy after setting or changing environment variables. Verify sign-in, provider status, chat, model discovery, and web search.

Do not delete the Express local API source; `npm run dev` uses it for local development. Vercel production routes run the corresponding serverless functions instead of starting Express.
