/* Outils partagés des fonctions Vercel (les fichiers commençant par "_" ne sont pas des routes).
   Stockage : Upstash Redis (gratuit), branché depuis Vercel → Storage.
   Variables injectées automatiquement par l'intégration : KV_REST_API_URL + KV_REST_API_TOKEN
   (ou UPSTASH_REDIS_REST_URL + UPSTASH_REDIS_REST_TOKEN). */
const crypto = require("crypto");

const URL_ = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
const TOKEN = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
const ADMIN_TOKEN = process.env.ADMIN_TOKEN || "";
const K = { preorders: "bm:preorders", subs: "bm:subscribers" };

const hasDb = () => !!(URL_ && TOKEN);

async function redis(...cmd) {
  const r = await fetch(URL_, { method: "POST", headers: { Authorization: `Bearer ${TOKEN}`, "Content-Type": "application/json" }, body: JSON.stringify(cmd) });
  const j = await r.json();
  if (!r.ok || j.error) throw new Error(j.error || `Redis ${r.status}`);
  return j.result;
}
const list = async (key) => (await redis("LRANGE", key, 0, -1)).map((s) => { try { return JSON.parse(s); } catch { return null; } }).filter(Boolean);

const clean = (v, n = 120) => String(v ?? "").replace(/[<>]/g, "").trim().slice(0, n);
const isEmail = (e) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(e);
const ipOf = (req) => String(req.headers["x-forwarded-for"] || "").split(",")[0].trim();

async function limited(req, bucket, max = 10) {
  const ip = crypto.createHash("sha256").update(ipOf(req)).digest("hex").slice(0, 16);
  const key = `bm:rl:${bucket}:${ip}`;
  const n = await redis("INCR", key);
  if (n === 1) await redis("EXPIRE", key, 600);
  return n > max;
}

function authed(req) {
  if (!ADMIN_TOKEN) return false; // pas de mot de passe défini = admin fermé
  const q = new URL(req.url, "http://x").searchParams.get("token") || "";
  const tok = String(req.headers.authorization || "").replace(/^Bearer\s+/i, "") || q;
  const a = Buffer.from(tok), b = Buffer.from(ADMIN_TOKEN);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

function body(req) {
  if (req.body && typeof req.body === "object") return req.body;
  try { return JSON.parse(req.body || "{}"); } catch { return {}; }
}

function stats(items) {
  const s = { total: 0, units: 0, byProduct: {}, byColor: {}, bySize: {}, byCountry: {}, byDay: {}, byCombo: {} };
  for (const p of items) {
    if (p.status === "cancelled") continue;
    const q = p.qty || 1;
    s.total++; s.units += q;
    s.byProduct[p.productId] = (s.byProduct[p.productId] || 0) + 1;
    s.byColor[p.color] = (s.byColor[p.color] || 0) + q;
    s.bySize[p.size] = (s.bySize[p.size] || 0) + q;
    s.byCountry[p.country] = (s.byCountry[p.country] || 0) + 1;
    const d = (p.createdAt || "").slice(0, 10); s.byDay[d] = (s.byDay[d] || 0) + 1;
    const k = `${p.color} / ${p.size}`; s.byCombo[k] = (s.byCombo[k] || 0) + q;
  }
  return s;
}

function send(res, code, obj) {
  res.setHeader("Content-Type", "application/json");
  res.setHeader("Cache-Control", "no-store");
  res.statusCode = code;
  res.end(JSON.stringify(obj));
}
const noDb = (res) => send(res, 503, { error: "Stockage non configuré (Vercel → Storage → Upstash Redis)." });

module.exports = { K, redis, list, clean, isEmail, ipOf, limited, authed, body, stats, send, noDb, hasDb, crypto };
