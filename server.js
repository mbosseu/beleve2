/* ==========================================================================
   BELIEVE ME — serveur (Node.js, aucune dépendance)
   - Sert le site (dossier site/)
   - Enregistre les précommandes et inscriptions dans data/*.json
   - Tableau de bord privé : /admin.html (protégé par ADMIN_TOKEN)

   Lancer :  node server.js         (puis http://localhost:3000)
   Variables : PORT=3000  ADMIN_TOKEN=un-mot-de-passe-long
   ========================================================================== */
const http = require("http");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const PORT = process.env.PORT || 3000;
const ROOT = path.join(__dirname, "site");
const DATA = path.join(__dirname, "data");
const ADMIN_TOKEN = process.env.ADMIN_TOKEN || "believe-admin";
if (!process.env.ADMIN_TOKEN) console.warn("⚠  ADMIN_TOKEN non défini : mot de passe admin par défaut « believe-admin ». Change-le avant la mise en ligne.");

fs.mkdirSync(DATA, { recursive: true });
const FILES = { preorders: path.join(DATA, "preorders.json"), subs: path.join(DATA, "subscribers.json") };
const read = (f) => { try { return JSON.parse(fs.readFileSync(f, "utf8")); } catch { return []; } };
const write = (f, d) => { const tmp = f + ".tmp"; fs.writeFileSync(tmp, JSON.stringify(d, null, 2)); fs.renameSync(tmp, f); };

const MIME = { ".html": "text/html; charset=utf-8", ".css": "text/css", ".js": "application/javascript", ".json": "application/json",
  ".webp": "image/webp", ".avif": "image/avif", ".png": "image/png", ".jpg": "image/jpeg", ".svg": "image/svg+xml", ".mp4": "video/mp4", ".webmanifest": "application/manifest+json",
  ".xml": "application/xml", ".txt": "text/plain", ".ico": "image/x-icon", ".woff2": "font/woff2" };

const hits = new Map(); // anti-spam simple : 10 requêtes / 10 min / IP
function limited(ip) {
  const now = Date.now(), arr = (hits.get(ip) || []).filter((t) => now - t < 600000);
  arr.push(now); hits.set(ip, arr); return arr.length > 10;
}
const json = (res, code, obj) => { res.writeHead(code, { "Content-Type": "application/json", "Cache-Control": "no-store" }); res.end(JSON.stringify(obj)); };
const body = (req) => new Promise((ok, ko) => { let s = ""; req.on("data", (c) => { s += c; if (s.length > 20000) { ko(new Error("too big")); req.destroy(); } }); req.on("end", () => { try { ok(JSON.parse(s || "{}")); } catch (e) { ko(e); } }); });
const clean = (v, n = 120) => String(v ?? "").replace(/[<>]/g, "").trim().slice(0, n);
const isEmail = (e) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(e);
const authed = (req, url) => {
  const tok = (req.headers.authorization || "").replace(/^Bearer\s+/i, "") || url.searchParams.get("token") || "";
  const a = Buffer.from(tok), b = Buffer.from(ADMIN_TOKEN);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
};

function stats(list) {
  const s = { total: 0, units: 0, byProduct: {}, byColor: {}, bySize: {}, byCountry: {}, byDay: {}, byCombo: {} };
  for (const p of list) {
    if (p.status === "cancelled") continue;
    s.total++; s.units += p.qty || 1;
    s.byProduct[p.productId] = (s.byProduct[p.productId] || 0) + 1;
    s.byColor[p.color] = (s.byColor[p.color] || 0) + (p.qty || 1);
    s.bySize[p.size] = (s.bySize[p.size] || 0) + (p.qty || 1);
    s.byCountry[p.country] = (s.byCountry[p.country] || 0) + 1;
    const d = (p.createdAt || "").slice(0, 10); s.byDay[d] = (s.byDay[d] || 0) + 1;
    const k = `${p.color} / ${p.size}`; s.byCombo[k] = (s.byCombo[k] || 0) + (p.qty || 1);
  }
  return s;
}
const csvCell = (v) => `"${String(v ?? "").replace(/"/g, '""')}"`;

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const ip = (req.headers["x-forwarded-for"] || req.socket.remoteAddress || "").split(",")[0].trim();
  try {
    /* ---------- API publique ---------- */
    if (url.pathname === "/api/stats" && req.method === "GET") {
      const s = stats(read(FILES.preorders));
      return json(res, 200, { total: s.total, byProduct: s.byProduct });
    }
    if (url.pathname === "/api/preorders" && req.method === "POST") {
      if (limited(ip)) return json(res, 429, { error: "Trop de tentatives, réessaie plus tard." });
      const b = await body(req);
      const p = {
        ref: "BM-" + crypto.randomBytes(3).toString("hex").toUpperCase(),
        createdAt: new Date().toISOString(), status: "reserved",
        productId: clean(b.productId, 60), productName: clean(b.productName, 80), color: clean(b.color, 30), size: clean(b.size, 6),
        qty: Math.min(5, Math.max(1, parseInt(b.qty, 10) || 1)), priceEur: Number(b.priceEur) || 0, currency: clean(b.currency, 4),
        firstName: clean(b.firstName, 60), lastName: clean(b.lastName, 60), email: clean(b.email, 120).toLowerCase(),
        country: clean(b.country, 2).toUpperCase(), city: clean(b.city, 80), phone: clean(b.phone, 30),
        newsletter: !!b.newsletter, lang: clean(b.lang, 2), source: clean(b.source, 200), ip: crypto.createHash("sha256").update(ip).digest("hex").slice(0, 12)
      };
      if (!p.productId || !p.size || !p.color || !p.firstName || !isEmail(p.email) || !p.country) return json(res, 400, { error: "Champs manquants ou invalides." });
      const list = read(FILES.preorders); list.push(p); write(FILES.preorders, list);
      if (p.newsletter) { const subs = read(FILES.subs); if (!subs.find((s) => s.email === p.email)) { subs.push({ email: p.email, interest: "newsletter", lang: p.lang, createdAt: p.createdAt }); write(FILES.subs, subs); } }
      console.log(`✦ Précommande ${p.ref} — ${p.color}/${p.size} x${p.qty} — ${p.country}`);
      return json(res, 201, { ok: true, ref: p.ref, total: stats(list).byProduct[p.productId] || 0 });
    }
    if (url.pathname === "/api/subscribe" && req.method === "POST") {
      if (limited(ip)) return json(res, 429, { error: "Trop de tentatives." });
      const b = await body(req); const email = clean(b.email, 120).toLowerCase();
      if (!isEmail(email)) return json(res, 400, { error: "E-mail invalide." });
      const subs = read(FILES.subs); subs.push({ email, interest: clean(b.interest, 60), lang: clean(b.lang, 2), createdAt: new Date().toISOString() }); write(FILES.subs, subs);
      return json(res, 201, { ok: true });
    }

    /* ---------- API admin ---------- */
    if (url.pathname.startsWith("/api/admin/")) {
      if (!authed(req, url)) return json(res, 401, { error: "Non autorisé" });
      const list = read(FILES.preorders);
      if (url.pathname === "/api/admin/preorders" && req.method === "GET") return json(res, 200, { preorders: list, stats: stats(list), subscribers: read(FILES.subs) });
      if (url.pathname === "/api/admin/status" && req.method === "POST") {
        const b = await body(req); const p = list.find((x) => x.ref === b.ref);
        if (!p) return json(res, 404, { error: "Introuvable" });
        p.status = clean(b.status, 20); write(FILES.preorders, list); return json(res, 200, { ok: true });
      }
      if ((url.pathname === "/api/admin/export" || url.pathname === "/api/admin/export.csv")) {
        const cols = ["ref", "createdAt", "status", "productName", "color", "size", "qty", "priceEur", "firstName", "lastName", "email", "phone", "country", "city", "lang", "newsletter", "source"];
        const csv = "﻿" + [cols.join(";"), ...list.map((p) => cols.map((c) => csvCell(p[c])).join(";"))].join("\n");
        res.writeHead(200, { "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": "attachment; filename=precommandes-believe-me.csv" });
        return res.end(csv);
      }
      return json(res, 404, { error: "Not found" });
    }

    /* ---------- Fichiers statiques ---------- */
    let p = decodeURIComponent(url.pathname);
    if (p.endsWith("/")) p += "index.html";
    const file = path.normalize(path.join(ROOT, p));
    if (!file.startsWith(ROOT)) { res.writeHead(403); return res.end(); }
    fs.stat(file, (err, st) => {
      if (err || !st.isFile()) { res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" }); return res.end("Page introuvable"); }
      const ext = path.extname(file).toLowerCase();
      const headers = { "Content-Type": MIME[ext] || "application/octet-stream", "Cache-Control": /\.(webp|avif|png|jpg|mp4|svg|woff2)$/.test(ext) ? "public, max-age=604800" : "no-cache", "Accept-Ranges": "bytes" };
      const range = req.headers.range;
      if (range && ext === ".mp4") { // streaming vidéo
        const [s, e] = range.replace("bytes=", "").split("-"); const start = +s, end = e ? +e : st.size - 1;
        res.writeHead(206, { ...headers, "Content-Range": `bytes ${start}-${end}/${st.size}`, "Content-Length": end - start + 1 });
        return fs.createReadStream(file, { start, end }).pipe(res);
      }
      res.writeHead(200, { ...headers, "Content-Length": st.size });
      fs.createReadStream(file).pipe(res);
    });
  } catch (e) {
    json(res, 400, { error: "Requête invalide" });
  }
});

server.listen(PORT, () => console.log(`\n  BELIEVE ME  →  http://localhost:${PORT}\n  Admin       →  http://localhost:${PORT}/admin.html\n`));
