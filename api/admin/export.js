const { K, list, authed, send, noDb, hasDb } = require("../_lib");

const cell = (v) => `"${String(v ?? "").replace(/"/g, '""')}"`;
const COLS = ["ref", "createdAt", "status", "productName", "color", "size", "qty", "priceEur", "firstName", "lastName", "email", "phone", "country", "city", "lang", "newsletter", "source"];

module.exports = async (req, res) => {
  if (!authed(req)) return send(res, 401, { error: "Non autorisé" });
  if (!hasDb()) return noDb(res);
  try {
    const items = await list(K.preorders);
    const csv = "﻿" + [COLS.join(";"), ...items.map((p) => COLS.map((c) => cell(p[c])).join(";"))].join("\n");
    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader("Content-Disposition", "attachment; filename=precommandes-believe-me.csv");
    res.statusCode = 200;
    res.end(csv);
  } catch (e) { send(res, 500, { error: "Erreur serveur" }); }
};
