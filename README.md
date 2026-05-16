# Hackaton / Visit Split

Visit Split is a demo MVP one-page AI tourist planner for Split, Croatia. A user chooses time, budget, group type and interests, receives personalized recommendations from a local JSON database, selects the places they like, then generates a final itinerary only from those selected items.

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

The demo still works without `OPENAI_API_KEY` or if OpenAI is unavailable. Recommendation ranking falls back to local scoring based on interests, group type, budget and duration. Itinerary generation falls back to a simple timeline built from only the selected recommendations.

## Demo Flow

1. Hero: `Plan your perfect Split day in seconds.`
2. Form: choose `3h`, `€0–50`, `Couple`, `History` and `Food`.
3. Click `Find recommendations`.
4. Review AI-ranked recommendation cards and Split map pins.
5. Select 3–4 recommendations.
6. Click `Create my plan with selected`.
7. Reveal the visual timeline and final Visit Split brand moment.

## Data And Image Credits

Recommendations are stored locally in `src/data/recommendations.json` for demo use. The hero uses [Split - Riva 002.jpg](https://commons.wikimedia.org/wiki/File:Split_-_Riva_002.jpg) by JoJan, licensed under [CC BY 3.0](https://creativecommons.org/licenses/by/3.0/), via Wikimedia Commons `Special:Redirect`.
