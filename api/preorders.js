const { K, redis, list, clean, isEmail, ipOf, limited, body, stats, send, noDb, hasDb, crypto } = require("./_lib");

module.exports = async (req, res) => {
  if (req.method !== "POST") return send(res, 405, { error: "Méthode non autorisée" });
  if (!hasDb()) return noDb(res);
  try {
    if (await limited(req, "po")) return send(res, 429, { error: "Trop de tentatives, réessaie plus tard." });
    const b = body(req);
    if (b.website) return send(res, 201, { ok: true, ref: "BM-000000", total: 0 }); // piège anti-robot
    const p = {
      ref: "BM-" + crypto.randomBytes(3).toString("hex").toUpperCase(),
      createdAt: new Date().toISOString(), status: "reserved",
      productId: clean(b.productId, 60), productName: clean(b.productName, 80), color: clean(b.color, 30), size: clean(b.size, 6),
      qty: Math.min(5, Math.max(1, parseInt(b.qty, 10) || 1)), priceEur: Number(b.priceEur) || 0, currency: clean(b.currency, 4),
      firstName: clean(b.firstName, 60), lastName: clean(b.lastName, 60), email: clean(b.email, 120).toLowerCase(),
      country: clean(b.country, 2).toUpperCase(), city: clean(b.city, 80), phone: clean(b.phone, 30),
      newsletter: !!b.newsletter, lang: clean(b.lang, 2), source: clean(b.source, 200),
      ip: crypto.createHash("sha256").update(ipOf(req)).digest("hex").slice(0, 12)
    };
    if (!p.productId || !p.size || !p.color || !p.firstName || !isEmail(p.email) || !p.country) return send(res, 400, { error: "Champs manquants ou invalides." });
    await redis("RPUSH", K.preorders, JSON.stringify(p));
    if (p.newsletter) await redis("RPUSH", K.subs, JSON.stringify({ email: p.email, interest: "newsletter", lang: p.lang, createdAt: p.createdAt }));
    const total = stats(await list(K.preorders)).byProduct[p.productId] || 0;
    send(res, 201, { ok: true, ref: p.ref, total });
  } catch (e) { send(res, 500, { error: "Erreur serveur, réessaie dans un instant." }); }
};
