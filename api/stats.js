const { K, list, stats, send, noDb, hasDb } = require("./_lib");

module.exports = async (req, res) => {
  if (req.method !== "GET") return send(res, 405, { error: "Méthode non autorisée" });
  if (!hasDb()) return noDb(res);
  try {
    const s = stats(await list(K.preorders));
    send(res, 200, { total: s.total, byProduct: s.byProduct });
  } catch (e) { send(res, 500, { error: "Erreur serveur" }); }
};
