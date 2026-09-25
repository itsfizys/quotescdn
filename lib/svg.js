const themes = {
  dark: {
    bg: "111827", border: "334155", quote: "e5e7eb", author: "60a5fa",
    accent: "2563eb", glow: "2563eb", quoteMark: "60a5fa", divider: "334155"
  },
  light: {
    bg: "f5f7fb", border: "cbd5e1", quote: "172033", author: "1d4ed8",
    accent: "2563eb", glow: "60a5fa", quoteMark: "2563eb", divider: "cbd5e1"
  },
  midnight: {
    bg: "0b1020", border: "263454", quote: "dbeafe", author: "38bdf8",
    accent: "3b82f6", glow: "1d4ed8", quoteMark: "60a5fa", divider: "263454"
  },
  nord: {
    bg: "2e3440", border: "4c566a", quote: "eceff4", author: "88c0d0",
    accent: "81a1c1", glow: "5e81ac", quoteMark: "88c0d0", divider: "4c566a"
  },
  mono: {
    bg: "111111", border: "444444", quote: "f5f5f5", author: "bdbdbd",
    accent: "ffffff", glow: "999999", quoteMark: "ffffff", divider: "444444"
  }
};

function escapeXml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

// This follows the original anime-readme-quotes word wrapper, with one
// defensive addition: very long words are split before they can exceed the
// fixed SVG text column.
function wrapLines(text, charsPerLine) {
  const words = String(text ?? "").trim().split(/\s+/);
  const lines = [];
  let current = "";

  for (const originalWord of words) {
    let word = originalWord;
    while (word.length > charsPerLine) {
      if (current) {
        lines.push(current);
        current = "";
      }
      lines.push(word.slice(0, charsPerLine));
      word = word.slice(charsPerLine);
    }
    if (!word) continue;

    const test = current ? `${current} ${word}` : word;
    if (test.length > charsPerLine && current) {
      lines.push(current);
      current = word;
    } else {
      current = test;
    }
  }

  if (current) lines.push(current);
  return lines.length ? lines : [" "];
}

function validHex(value) {
  if (typeof value !== "string") return undefined;
  const clean = value.replace(/^#/, "");
  return /^[\da-f]{6,8}$/i.test(clean) ? clean : undefined;
}

function hex(value, fallback) {
  const clean = validHex(value) || fallback;
  return clean === "ffffff00" ? "transparent" : `#${clean}`;
}

function getTheme(name = "dark", overrides = {}) {
  return { ...(themes[name] || themes.dark), ...overrides };
}

function int(value, fallback, min, max) {
  const parsed = Number.parseInt(value, 10);
  if (!Number.isInteger(parsed)) return fallback;
  return Math.min(Math.max(parsed, min), max);
}

function truncateLabel(value, maxLength = 60) {
  const label = String(value || "Unknown author").trim();
  return label.length > maxLength ? `${label.slice(0, maxLength - 1).trim()}…` : label;
}

function generateSVG({ quote, author, authorName, theme, borderRadius = 8, borderWidth = 1 }) {
  const ff = "Arial, Helvetica, sans-serif";
  const W = 800;
  const PAD_X = 56;
  const TEXT_X = PAD_X + 34;
  const CHARS = 62;
  const Q_FS = 17;
  const Q_LH = 30;
  const PAD_TOP = 52;
  const PAD_BOT = 40;
  const GAP_META = 24;
  const GAP_DIV = 16;
  const META_FS = 13;
  const META_GAP = 8;
  const AU_NAME = truncateLabel(authorName || author);
  const lines = wrapLines(quote, CHARS);
  const qH = lines.length * Q_LH;
  const totalH = PAD_TOP + qH + GAP_META + 1 + GAP_DIV + META_FS + META_GAP + PAD_BOT;

  const qY = PAD_TOP;
  const divY = qY + qH + GAP_META;
  const authorY = divY + 1 + GAP_DIV;
  const id = Math.random().toString(36).slice(2, 9);
  const bg = hex(theme.bg, themes.dark.bg);
  const glow = hex(theme.glow, themes.dark.glow);
  const accent = hex(theme.accent, themes.dark.accent);
  const quoteMark = hex(theme.quoteMark, themes.dark.quoteMark);
  const divider = hex(theme.divider, themes.dark.divider);
  const quoteColor = hex(theme.quote, themes.dark.quote);
  const authorColor = hex(theme.author, themes.dark.author);

  const textLines = lines.map((line, index) =>
    `<text x="${TEXT_X}" y="${qY + index * Q_LH}" font-family="${ff}" font-size="${Q_FS}" fill="${quoteColor}" dominant-baseline="hanging" letter-spacing="0.015em">${escapeXml(line)}</text>`
  ).join("\n    ");

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${totalH}" viewBox="0 0 ${W} ${totalH}" role="img" aria-label="${escapeXml(quote)} — ${escapeXml(AU_NAME)}">
  <title>${escapeXml(quote)} — ${escapeXml(AU_NAME)}</title>
  <defs>
    <clipPath id="clip${id}">
      <rect width="${W}" height="${totalH}" rx="${borderRadius}" ry="${borderRadius}"/>
    </clipPath>
    <linearGradient id="grad-h${id}" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="${glow}" stop-opacity="0.22"/>
      <stop offset="45%" stop-color="${glow}" stop-opacity="0.05"/>
      <stop offset="100%" stop-color="${glow}" stop-opacity="0"/>
    </linearGradient>
    <linearGradient id="grad-v${id}" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="${glow}" stop-opacity="0.10"/>
      <stop offset="60%" stop-color="${glow}" stop-opacity="0.02"/>
      <stop offset="100%" stop-color="${glow}" stop-opacity="0"/>
    </linearGradient>
    <linearGradient id="grad-div${id}" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="${divider}" stop-opacity="0"/>
      <stop offset="15%" stop-color="${divider}" stop-opacity="1"/>
      <stop offset="85%" stop-color="${divider}" stop-opacity="1"/>
      <stop offset="100%" stop-color="${divider}" stop-opacity="0"/>
    </linearGradient>
    <linearGradient id="grad-bar${id}" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="${accent}" stop-opacity="0"/>
      <stop offset="30%" stop-color="${accent}" stop-opacity="0.9"/>
      <stop offset="70%" stop-color="${accent}" stop-opacity="0.9"/>
      <stop offset="100%" stop-color="${accent}" stop-opacity="0"/>
    </linearGradient>
    <radialGradient id="grad-orb${id}" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(0,0) scale(220,180)">
      <stop offset="0%" stop-color="${glow}" stop-opacity="0.12"/>
      <stop offset="100%" stop-color="${glow}" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="grad-orb2${id}" cx="1" cy="1" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(${W},${totalH}) scale(260,200)">
      <stop offset="0%" stop-color="${accent}" stop-opacity="0.07"/>
      <stop offset="100%" stop-color="${accent}" stop-opacity="0"/>
    </radialGradient>
  </defs>

  <rect width="${W}" height="${totalH}" rx="${borderRadius}" ry="${borderRadius}" fill="${bg}" stroke="${hex(theme.border, themes.dark.border)}" stroke-width="${borderWidth}"/>
  <rect width="${W}" height="${totalH}" fill="url(#grad-orb${id})" clip-path="url(#clip${id})"/>
  <rect width="${W}" height="${totalH}" fill="url(#grad-orb2${id})" clip-path="url(#clip${id})"/>
  <rect width="${W}" height="${totalH}" fill="url(#grad-h${id})" clip-path="url(#clip${id})"/>
  <rect width="${W}" height="${totalH}" fill="url(#grad-v${id})" clip-path="url(#clip${id})"/>

  <text x="${PAD_X - 10}" y="${qY - 18}" font-family="Georgia, 'Times New Roman', serif" font-size="68" fill="${quoteMark}" dominant-baseline="hanging" opacity="0.5">“</text>
  <rect x="${PAD_X}" y="${qY + 6}" width="2.5" height="${Math.max(20, qH - 12)}" fill="url(#grad-bar${id})" rx="1.5"/>
  ${textLines}
  <line x1="${TEXT_X}" y1="${divY}" x2="${W - PAD_X}" y2="${divY}" stroke="url(#grad-div${id})" stroke-width="1"/>
  <text x="${TEXT_X}" y="${authorY}" font-family="${ff}" font-size="${META_FS}" fill="${authorColor}" font-weight="700" dominant-baseline="hanging" letter-spacing="0.05em">— ${escapeXml(AU_NAME)}</text>
</svg>`;
}

function cardOptions(params = {}) {
  const themeName = String(params.theme || "dark").toLowerCase();
  const overrides = {
    ...(validHex(params.bg_color) && { bg: validHex(params.bg_color) }),
    ...(validHex(params.quote_color) && { quote: validHex(params.quote_color) }),
    ...(validHex(params.author_color) && { author: validHex(params.author_color) }),
    ...(validHex(params.accent_color) && { accent: validHex(params.accent_color) }),
    ...(validHex(params.border_color) && { border: validHex(params.border_color) })
  };
  return {
    theme: getTheme(themeName, overrides),
    borderRadius: int(params.border_radius, 8, 0, 40),
    borderWidth: int(params.border_width, 1, 0, 5)
  };
}

module.exports = { themes, getTheme, generateSVG, cardOptions, validHex };