export const pad = (n: number): string => String(n).padStart(2, "0");

export const todayStr = (): string => {
  const d = new Date();
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};

export const nowTime = (): string => {
  const d = new Date();
  return `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
};

export const dateTimeLabel = (): string => {
  const d = new Date();
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${nowTime()}`;
};

export const diffDays = (from: string, to: string): number => {
  const a = new Date(`${from}T00:00:00`);
  const b = new Date(`${to}T00:00:00`);
  if (Number.isNaN(a.getTime()) || Number.isNaN(b.getTime())) return NaN;
  return Math.round((b.getTime() - a.getTime()) / (24 * 3600 * 1000));
};

export const escapeHtml = (s: string = ""): string => {
  const htmlMap: Record<string, string> = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }
  return String(s).replace(/[&<>"']/g, m => htmlMap[m] || m)
};

export const uid = (prefix: string = "id"): string =>
  `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;