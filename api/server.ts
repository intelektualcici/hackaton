import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createItineraryPlan } from "./create-plan";
import { createRecommendationRankings } from "./recommendations";
import { criteriaSchema, selectedRecommendationSchema } from "./shared";

dotenv.config();

const app = express();
const port = Number(process.env.PORT ?? 8787);
const isProduction = process.env.NODE_ENV === "production";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(cors());
app.use(express.json({ limit: "1mb" }));

app.get("/api/health", (_request, response) => {
  response.json({ ok: true, service: "visit-split-api" });
});

app.post("/api/recommendations", async (request, response) => {
  const parsed = criteriaSchema.safeParse(request.body);

  if (!parsed.success) {
    response.status(400).json({ error: "Invalid planner criteria." });
    return;
  }

  const result = await createRecommendationRankings(parsed.data);
  response.json(result);
});

app.post("/api/create-plan", async (request, response) => {
  const criteria = criteriaSchema.safeParse(request.body.criteria);
  const selectedRecommendations = selectedRecommendationSchema
    .array()
    .safeParse(request.body.selectedRecommendations);

  if (!criteria.success || !selectedRecommendations.success) {
    response.status(400).json({ error: "Invalid itinerary request." });
    return;
  }

  const result = await createItineraryPlan(criteria.data, selectedRecommendations.data);
  response.json(result);
});

if (isProduction) {
  const distPath = path.resolve(__dirname, "../dist");
  app.use(express.static(distPath));
  app.get("*", (_request, response) => {
    response.sendFile(path.join(distPath, "index.html"));
  });
}

app.listen(port, "127.0.0.1", () => {
  console.log(`Visit Split API running at http://127.0.0.1:${port}`);
});
