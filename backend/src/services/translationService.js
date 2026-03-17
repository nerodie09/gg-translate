const Anthropic = require("@anthropic-ai/sdk");
const { normaliseSlang } = require("../utils/slangNormaliser");
const { classifyIntent } = require("../utils/intentClassifier");

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const SUPPORTED_LANGUAGES = {
  en: "English",
  jp: "Japanese",
  kr: "Korean",
  es: "Spanish",
  fr: "French",
  de: "German",
  pt: "Portuguese",
  zh: "Chinese",
};

async function translateText(text, sourceLang, targetLang, gamePack = null) {
  // Step 1 — Normalise slang
  const normalisedText = normaliseSlang(text, gamePack);

  // Step 2 — Classify intent
  const intent = classifyIntent(normalisedText);

  // Step 3 — Build context-aware prompt
  const sourceLanguage = SUPPORTED_LANGUAGES[sourceLang] || sourceLang;
  const targetLanguage = SUPPORTED_LANGUAGES[targetLang] || targetLang;

  const systemPrompt = `You are a real-time gaming communication translator. 
Your job is to translate gaming messages accurately and naturally.
The message intent is: ${intent}.
Intent types and how to handle them:
- callout: Keep it short and urgent. Location names should stay recognisable.
- command: Use direct, action-oriented language.
- location: Preserve map-specific terms where possible.
- status: Keep it brief and clear.
- chat: Translate naturally and conversationally.
Always return ONLY the translated text. No explanations, no punctuation changes, no extra words.`;

  const userPrompt = `Translate this ${sourceLanguage} gaming message to ${targetLanguage}: "${normalisedText}"`;

  // Step 4 — Call Claude API
  const response = await client.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 1000,
    system: systemPrompt,
    messages: [{ role: "user", content: userPrompt }],
  });

  const translatedText = response.content[0].text.trim();

  return {
    originalText: text,
    normalisedText,
    translatedText,
    intent,
    sourceLang,
    targetLang,
  };
}

module.exports = { translateText };
