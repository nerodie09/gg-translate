const express = require("express");
const router = express.Router();
const { translateText } = require("../services/translationService");
const pool = require("../config/db");
const redisClient = require("../config/redis");

router.post("/", async (req, res) => {
  const { text, sourceLang, targetLang, userId } = req.body;

  // Basic validation
  if (!text || !sourceLang || !targetLang) {
    return res.status(400).json({
      error: "text, sourceLang and targetLang are required",
    });
  }

  try {
    // Step 1 — Check Redis cache first
    const cacheKey = `${userId || "guest"}:${sourceLang}:${targetLang}:${text.toLowerCase().trim()}`;
    const cached = await redisClient.get(cacheKey);

    if (cached) {
      console.log("Cache hit:", cacheKey);
      return res.json({ ...JSON.parse(cached), fromCache: true });
    }

    // Step 2 — No cache hit, call Claude
    console.log("Cache miss — calling Claude API");
    const result = await translateText(text, sourceLang, targetLang);

    // Step 3 — Store in Redis cache (expires after 24 hours)
    await redisClient.setEx(cacheKey, 86400, JSON.stringify(result));

    // Step 4 — Store in PostgreSQL
    if (userId) {
      await pool.query(
        `INSERT INTO translations 
          (user_id, original_text, translated_text, source_lang, target_lang, intent) 
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [
          userId,
          result.originalText,
          result.translatedText,
          result.sourceLang,
          result.targetLang,
          result.intent,
        ],
      );
    }

    // Step 5 — Return result
    return res.json({ ...result, fromCache: false });
  } catch (err) {
    console.error("Translation error:", err);
    return res.status(500).json({ error: "Translation failed" });
  }
});

module.exports = router;
