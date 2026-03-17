const intentPatterns = {
  callout: [
    /enemy spotted/i,
    /they('re| are) (at|in|on)/i,
    /\b(one|two|three|four|five)\b.*(left|right|front|back|site)/i,
    /\b(b|a|mid|top|bot|jungle|dragon|baron|spike|bomb)\b/i,
    /\bsniper\b/i,
    /\brushing\b/i,
  ],
  command: [
    /\b(go|push|rush|rotate|fall back|retreat|attack|defend|hold|save|buy|drop)\b/i,
    /\b(follow me|with me|come here|need help|help me|assist)\b/i,
    /\b(peel|kite|gank|flank|bait)\b/i,
    /\b(ult|ultimate|ability|skill)\b/i,
  ],
  location: [
    /\b(spawn|base|mid|top|bot|jungle|river|pit|tower|nexus|fountain)\b/i,
    /\b(a site|b site|c site|long|short|catwalk|heaven|hell)\b/i,
    /\b(left|right|behind|ahead|above|below|corner|window|door)\b/i,
    /\b(north|south|east|west)\b/i,
  ],
  status: [
    /\b(dead|dying|low|full hp|full health|respawning|coming|on my way)\b/i,
    /\b(ult ready|cooldown|no ult|no abilities|out of ammo|reloading)\b/i,
    /\b(tilted|afk|brb|back|here|ready|not ready)\b/i,
    /\b(disconnected|lagging|ping)\b/i,
  ],
};

function classifyIntent(text) {
  for (const [intent, patterns] of Object.entries(intentPatterns)) {
    for (const pattern of patterns) {
      if (pattern.test(text)) {
        return intent;
      }
    }
  }
  return "chat";
}

module.exports = { classifyIntent };
