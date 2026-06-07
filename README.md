# Canvass Capture

Internal tool for Shelley Carroll Campaign that turns clipboard walk sheets into structured campaign data.

## Features

- Upload walk sheet photos
- AI-powered OCR extraction (Google Gemini)
- Review and correct extracted data
- Export to CSV
- Supabase database + storage

## Tech Stack

- Vite + React + TypeScript
- TanStack Router + TanStack Query
- Tailwind CSS
- Supabase
- Google Gemini API

## Environment Variables

Create a `.env` file with:

```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_key
VITE_GEMINI_API_KEY=your_gemini_key
```

## Development

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

## Deploy to Vercel

1. Push to GitHub
2. Import in Vercel
3. Set environment variables
4. Deploy
