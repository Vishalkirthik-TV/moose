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
- Sign-in and session management with Clerk.
- Responsive interface with light and dark themes.

## Built with

React, TypeScript, Vite, Tailwind CSS, Zustand, Clerk, SerpAPI, and the Z.AI API.

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
3. Copy `.env.example` to `.env` and add your API keys:
   ```env
   VITE_CLERK_PUBLISHABLE_KEY=pk_test_...
   VITE_ZAI_API_KEY=your_glm_api_key
   VITE_SERPAPI_KEY=your_serpapi_key
   ```
4. Start the development server:
   ```bash
   npm run dev
   ```

Build the production app with `npm run build`.
