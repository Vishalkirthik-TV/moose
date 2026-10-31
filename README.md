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
- Responsive interface with light and dark themes.

## Built with

React, TypeScript, Vite, Tailwind CSS, Zustand, Clerk, SerpAPI, Z.AI, and OpenRouter.

## Local setup

1. Clone the repository:
   ```bash
   git clone https://github.com/Vishalkirthik-TV/moose.git
   cd moose
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Copy `.env.example` to `.env` and add your keys:
   ```env
   VITE_CLERK_PUBLISHABLE_KEY=pk_test_...
   VITE_ZAI_API_KEY=your_zai_api_key
   VITE_SERPAPI_KEY=your_serpapi_key
   VITE_OPENROUTER_API_KEY=your_openrouter_api_key
   ```
   Add only the keys for features you use. Restart Vite after changing `.env`.
4. Start Moose:
   ```bash
   npm run dev
   ```

## Local API key warning

Moose calls Z.AI, OpenRouter, and SerpAPI directly from the browser in this local-only setup. Vite embeds every `VITE_*` value into the frontend bundle, so provider keys are visible to anyone who can access the running app or its build output. Do not deploy this version, expose it on a network, or share its `.env` values. Use a server-side API for any public deployment.
