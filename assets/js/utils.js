const integerFormatter = new Intl.NumberFormat("es-CO", { maximumFractionDigits: 0 });
const percentFormatter = new Intl.NumberFormat("es-CO", {
  style: "percent",
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
});

export function byId(id) {
  const element = document.getElementById(id);
  if (!element) throw new Error(`No se encontró el elemento requerido: ${id}`);
  return element;
}

export function numberOrZero(value) {
  if (value === null || value === undefined || value === "") return 0;
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
}

export function optionalNumber(value) {
  if (value === null || value === undefined || value === "") return null;
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

export function safeRatio(numerator, denominator) {
  const top = Number(numerator);
  const bottom = Number(denominator);
  if (!Number.isFinite(top) || !Number.isFinite(bottom) || bottom <= 0) return null;
  return top / bottom;
}

export function formatInteger(value) {
  if (value === null || value === undefined || value === "") return "—";
  const number = Number(value);
  return Number.isFinite(number) ? integerFormatter.format(number) : "—";
}

export function formatPercent(rate) {
  return Number.isFinite(rate) ? percentFormatter.format(rate) : "—";
}

export function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

export function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

export function normalizeText(value) {
  return String(value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("es")
    .trim();
}

export function extractDateLabel(value) {
  const text = String(value ?? "");
  const match = text.match(/\b\d{1,2}\s+de\s+[a-záéíóúñ]+\s+de\s+\d{4}(?:,\s*\d{1,2}:\d{2})?/i);
  return match?.[0] ?? null;
}

export function extractPeriod(value) {
  const match = String(value ?? "").match(/\b20\d{2}-[12]\b/);
  return match?.[0] ?? null;
}

export function unique(values) {
  return [...new Set(values)];
}
