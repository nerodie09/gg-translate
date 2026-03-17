const express = require("express");
const router = express.Router();
const pool = require("../config/db");
const redisClient = require("../config/redis");

router.post("/", async (req, res) => {
  const { originalText, sourceLang, targetLang, correctedText } = req.body;

  if (!originalText || !sourceLang || !targetLang || !correctedText) {
    return res.status(400).json({ error: "All fields are required" });
  }

  try {
    // Step 1 — Update Redis cache with corrected translation
    const cacheKey = `guest:${sourceLang}:${targetLang}:${originalText.toLowerCase().trim()}`;
    const cached = await redisClient.get(cacheKey);

    if (cached) {
      const cachedData = JSON.parse(cached);
      cachedData.translatedText = correctedText;
      cachedData.wasCorrected = true;
      await redisClient.setEx(cacheKey, 86400, JSON.stringify(cachedData));
    }

    // Step 2 — Store correction in PostgreSQL
    await pool.query(
      `INSERT INTO corrections (translation_id, corrected_text)
       SELECT t.id, $1
       FROM translations t
       WHERE t.original_text = $2
         AND t.source_lang = $3
         AND t.target_lang = $4
       ORDER BY t.created_at DESC
       LIMIT 1`,
      [correctedText, originalText, sourceLang, targetLang],
    );

    return res.json({ success: true, message: "Correction saved" });
  } catch (err) {
    console.error("Correction error:", err);
    return res.status(500).json({ error: "Failed to save correction" });
  }
});

module.exports = router;
