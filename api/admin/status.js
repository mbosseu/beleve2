const { K, redis, list, clean, authed, body, send, noDb, hasDb } = require("../_lib");

module.exports = async (req, res) => {
  if (req.method !== "POST") return send(res, 405, { error: "Méthode non autorisée" });
  if (!authed(req)) return send(res, 401, { error: "Non autorisé" });
  if (!hasDb()) return noDb(res);
  try {
    const b = body(req);
    const items = await list(K.preorders);
    const i = items.findIndex((p) => p.ref === b.ref);
    if (i < 0) return send(res, 404, { error: "Introuvable" });
    items[i].status = clean(b.status, 20);
    await redis("LSET", K.preorders, i, JSON.stringify(items[i]));
    send(res, 200, { ok: true });
  } catch (e) { send(res, 500, { error: "Erreur serveur" }); }
};
