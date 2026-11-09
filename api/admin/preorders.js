const { K, list, authed, stats, send, noDb, hasDb } = require("../_lib");

module.exports = async (req, res) => {
  if (!authed(req)) return send(res, 401, { error: "Non autorisé" });
  if (!hasDb()) return noDb(res);
  try {
    const preorders = await list(K.preorders);
    send(res, 200, { preorders, stats: stats(preorders), subscribers: await list(K.subs) });
  } catch (e) { send(res, 500, { error: "Erreur serveur" }); }
};
