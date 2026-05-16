# Hackaton / Visit Split

Visit Split is a demo MVP one-page AI tourist planner for Split, Croatia. A user chooses a date, time window, budget, group type, interests and optional extra planning details, then receives a generated itinerary from a local JSON recommendation database.

## Install

```bash
cd hackaton
pnpm install
```

If you prefer npm and have it installed, the scripts are standard Node package scripts and can also be run with `npm run`.

## Run Locally

```bash
pnpm dev
```

The Vite app runs at `http://127.0.0.1:5173` and proxies `/api` calls to the local Express server at `http://127.0.0.1:8787`.

## OpenAI API Key

Create a local `.env` file:

```bash
cp .env.example .env
```

Then add:

```bash
OPENAI_API_KEY=your_real_key_here
OPENAI_MODEL=gpt-5.4-mini
```

The key and model are read only by the backend API routes. The default OpenAI model is `gpt-5.4-mini`, and the API key is never exposed in frontend code.

## Build

```bash
pnpm build
```

To run the production-style demo server after building:

```bash
pnpm preview
```

## Fallback Mode

The demo still works without `OPENAI_API_KEY` or if OpenAI is unavailable. Recommendation ranking falls back to local scoring based on interests, group type, budget, date/time window, additional details and duration. Itinerary generation falls back to a simple timeline built from ranked local recommendations.

## Demo Flow

1. Hero: `Plan your perfect Split day in seconds.`
2. Form: choose a date, `09:00–12:00`, `€0–50`, `Couple`, `History`, `Food`, and optionally add extra planning details.
3. Click `Create plan`.
4. Reveal the generated plan with a map on the left and chronological recommendations on the right.
5. Hover timeline items to focus the matching map marker.

## Data And Image Credits

Recommendations are stored locally in `src/data/recommendations.json` for demo use. The hero uses a local Split panorama video asset in `public/videos/`.
