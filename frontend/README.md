# TechNova AI Frontend

A lightweight React + Vite frontend for the existing FastAPI RAG chatbot.

## Setup

1. Install dependencies:
   npm install
2. Copy the environment template:
   copy .env.example .env
3. Update the backend URL if needed.

## Deploying to Vercel

Because the Vite dev proxy only works in local development, production deployments must use an absolute backend URL.

Set this environment variable in your Vercel project settings:

- `VITE_API_BASE_URL=https://your-fastapi-backend-url`

Example:

- `https://technova-api.onrender.com`
- `https://your-app.up.railway.app`
- `https://your-domain.com`

Do not leave `VITE_API_BASE_URL` empty. If it is empty, the frontend will show a clear configuration error instead of silently sending requests to `/api` on the frontend domain.

## Environment variables

- `VITE_API_BASE_URL`: backend base URL for the FastAPI app.
- `VITE_API_TIMEOUT_MS`: request timeout in milliseconds. Default is `30000`.

## Run locally

- Standard development server:
  npm run dev
- Windows path workaround for project folders containing special characters such as `&`:
  node .\node_modules\vite\bin\vite.js --host 0.0.0.0 --port 5173
- Production build:
  npm run build
- Preview production build:
  npm run preview

## Backend contract

This frontend expects the existing backend to expose:

- `POST /ask`
- Request body: `{ "question": "..." }`
- Response body: `{ "answer": "..." }`

The frontend intentionally does not change any backend behavior.

## Troubleshooting

- If the frontend cannot connect, ensure the FastAPI server is running on port `8000`.
- If the app proxies requests through Vite, confirm that `/api` is configured correctly in `vite.config.js`.
- If the API returns an empty or invalid response, the UI will show a user-friendly error instead of crashing.
