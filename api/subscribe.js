const { K, redis, clean, isEmail, limited, body, send, noDb, hasDb } = require("./_lib");

module.exports = async (req, res) => {
  if (req.method !== "POST") return send(res, 405, { error: "Méthode non autorisée" });
  if (!hasDb()) return noDb(res);
  try {
    if (await limited(req, "sub")) return send(res, 429, { error: "Trop de tentatives." });
    const b = body(req);
    const email = clean(b.email, 120).toLowerCase();
    if (!isEmail(email)) return send(res, 400, { error: "E-mail invalide." });
    await redis("RPUSH", K.subs, JSON.stringify({ email, interest: clean(b.interest, 60), lang: clean(b.lang, 2), createdAt: new Date().toISOString() }));
    send(res, 201, { ok: true });
  } catch (e) { send(res, 500, { error: "Erreur serveur" }); }
};
