const COUNTRY_ALIASES: Record<string, string> = {
  ar: "AR",
  argentina: "AR",
  us: "US",
  usa: "US",
  "united states": "US",
  "united states of america": "US",
  mx: "MX",
  mexico: "MX",
  br: "BR",
  brazil: "BR",
  cl: "CL",
  chile: "CL",
  co: "CO",
  colombia: "CO",
  pe: "PE",
  peru: "PE",
  uy: "UY",
  uruguay: "UY",
  py: "PY",
  paraguay: "PY",
  bo: "BO",
  bolivia: "BO",
  ec: "EC",
  ecuador: "EC",
  ve: "VE",
  venezuela: "VE",
  es: "ES",
  spain: "ES",
  it: "IT",
  italy: "IT",
  fr: "FR",
  france: "FR",
  de: "DE",
  germany: "DE",
  uk: "GB",
  gb: "GB",
  "united kingdom": "GB",
  england: "GB",
  ie: "IE",
  ireland: "IE",
  nl: "NL",
  netherlands: "NL",
  pt: "PT",
  portugal: "PT",
  ch: "CH",
  switzerland: "CH",
  be: "BE",
  belgium: "BE",
  se: "SE",
  sweden: "SE",
  no: "NO",
  norway: "NO",
  dk: "DK",
  denmark: "DK",
  fi: "FI",
  finland: "FI",
  pl: "PL",
  poland: "PL",
  at: "AT",
  austria: "AT",
  ca: "CA",
  canada: "CA",
  au: "AU",
  australia: "AU",
  nz: "NZ",
  "new zealand": "NZ",
  in: "IN",
  india: "IN",
  cn: "CN",
  china: "CN",
  jp: "JP",
  japan: "JP",
  kr: "KR",
  "south korea": "KR",
  sg: "SG",
  singapore: "SG",
  ae: "AE",
  "united arab emirates": "AE",
  sa: "SA",
  "saudi arabia": "SA",
  za: "ZA",
  "south africa": "ZA",
};

function codeToFlagEmoji(code: string): string {
  const upper = code.toUpperCase();
  if (!/^[A-Z]{2}$/.test(upper)) return "";
  const base = 0x1f1e6;
  const first = upper.charCodeAt(0) - 65 + base;
  const second = upper.charCodeAt(1) - 65 + base;
  return String.fromCodePoint(first, second);
}

function normalizeCountryInput(value?: string): string {
  return (value || "").trim().toLowerCase();
}

export function getCountryCode(value?: string): string | undefined {
  const normalized = normalizeCountryInput(value);
  if (!normalized) return undefined;
  if (COUNTRY_ALIASES[normalized]) return COUNTRY_ALIASES[normalized];
  if (/^[a-z]{2}$/i.test(normalized)) return normalized.toUpperCase();
  return undefined;
}

export function getCountryFlag(value?: string): string {
  const code = getCountryCode(value);
  return code ? codeToFlagEmoji(code) : "";
}

export function getCountryFlagUrl(value?: string, size: 20 | 24 = 20): string | undefined {
  const code = getCountryCode(value);
  if (!code) return undefined;
  const lower = code.toLowerCase();
  return `https://flagcdn.com/w${size}/${lower}.png`;
}
