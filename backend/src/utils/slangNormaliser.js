const valorantPack = require("../data/vocabulary-packs/valorant");
const dota2Pack = require("../data/vocabulary-packs/dota2");

const slangDictionary = {
  // General gaming
  gg: "good game",
  ff: "forfeit",
  "gg wp": "good game well played",
  afk: "away from keyboard",
  brb: "be right back",
  imo: "in my opinion",
  gl: "good luck",
  hf: "have fun",
  ez: "easy",
  noob: "beginner player",
  int: "intentionally feeding",
  inting: "intentionally losing",

  // Combat
  gank: "ambush enemy",
  kite: "attack while moving away",
  peel: "protect your teammate",
  burst: "deal all damage quickly",
  poke: "deal small damage from range",
  "all in": "commit to full attack",
  disengage: "retreat from fight",

  // Economy
  save: "do not spend money this round",
  eco: "economy round with minimal spending",
  "full buy": "purchase full equipment",
  "force buy": "spend all money despite low funds",

  // Map
  rotate: "move to another area of the map",
  push: "advance aggressively",
  hold: "stay and defend position",
  flank: "attack from the side or behind",

  // Status
  tilted: "emotionally frustrated",
  griefing: "deliberately ruining the game",
  carrying: "performing exceptionally well for the team",
  feeding: "repeatedly dying to the enemy",
};

function normaliseSlang(text, gamePack = null) {
  let normalised = text.toLowerCase().trim();

  // Apply base slang dictionary
  for (const [slang, meaning] of Object.entries(slangDictionary)) {
    const regex = new RegExp(`\\b${slang}\\b`, "gi");
    normalised = normalised.replace(regex, meaning);
  }

  // Apply game-specific vocabulary pack if provided
  if (gamePack === "valorant") {
    for (const [term, translation] of Object.entries(valorantPack)) {
      const regex = new RegExp(`\\b${term}\\b`, "gi");
      normalised = normalised.replace(regex, translation);
    }
  } else if (gamePack === "dota2") {
    for (const [term, translation] of Object.entries(dota2Pack)) {
      const regex = new RegExp(`\\b${term}\\b`, "gi");
      normalised = normalised.replace(regex, translation);
    }
  }

  return normalised;
}

module.exports = { normaliseSlang };
