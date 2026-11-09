/* ==========================================================================
   BELIEVE ME — CATALOGUE
   --------------------------------------------------------------------------
   C'est le SEUL fichier à modifier pour ajouter / changer un produit.
   - status: "preorder" (précommande ouverte), "soon" (bientôt), "sold" (terminé)
   - price: prix en EUR (les autres devises sont calculées automatiquement)
   - goal: nombre de précommandes visé pour lancer la production
   - featured: true => produit mis en avant sur la page d'accueil
   ========================================================================== */
window.BM_CATALOG = {
  brand: {
    name: "BELIEVE ME",
    monogram: "BM",
    tagline: { fr: "Sous-estimés. Jamais égalés.", en: "Underestimated. Never equalled." },
    instagram: "https://instagram.com/",
    tiktok: "https://tiktok.com/",
    email: "contact@believeme.store"
  },

  // Taux indicatifs (1 EUR = x). Mets-les à jour de temps en temps.
  currencies: {
    EUR: { symbol: "€", rate: 1, after: true },
    USD: { symbol: "$", rate: 1.08 },
    GBP: { symbol: "£", rate: 0.85 },
    CAD: { symbol: "CA$", rate: 1.48 },
    CHF: { symbol: "CHF ", rate: 0.95 },
    XAF: { symbol: "FCFA", rate: 655.957, after: true, round: 500 },
    XOF: { symbol: "FCFA", rate: 655.957, after: true, round: 500 },
    MAD: { symbol: "MAD", rate: 10.8, after: true }
  },

  products: [
    {
      id: "doudoune-signature",
      featured: true,
      status: "preorder",
      collection: { fr: "Chapitre I — L'Hiver des Sous-estimés", en: "Chapter I — The Underestimated Winter" },
      name: { fr: "Doudoune Signature", en: "Signature Puffer" },
      price: 220,
      goal: 150,
      deliveryEstimate: { fr: "Expédition estimée : 8 à 10 semaines après la clôture des précommandes", en: "Estimated shipping: 8–10 weeks after pre-orders close" },
      short: {
        fr: "Doudoune à capuche oversize, broderie botanique « Believe Me » au dos et monogramme BM brodé main sur la poitrine.",
        en: "Oversized hooded puffer with the botanical “Believe Me” back embroidery and a hand-embroidered BM monogram on the chest."
      },
      features: {
        fr: ["Coupe ample et structurée", "Capuche doublée, isolation haute densité", "Broderie signature BELIEVE ME au dos", "Zip métal argenté gravé BM", "Poignets et ourlet élastiqués"],
        en: ["Relaxed, structured fit", "Lined hood, high-density insulation", "Signature BELIEVE ME back embroidery", "Silver metal zip engraved BM", "Elastic cuffs and hem"]
      },
      composition: {
        fr: "Extérieur : nylon mat déperlant. Garnissage : ouate synthétique haute densité (vegan). Doublure : polyester recyclé.",
        en: "Shell: water-repellent matte nylon. Fill: high-density synthetic wadding (vegan). Lining: recycled polyester."
      },
      sizes: ["XS", "S", "M", "L", "XL", "XXL"],
      colors: [
        {
          id: "noir", hex: "#111111", name: { fr: "Noir Minuit", en: "Midnight Black" },
          images: ["assets/img/black-front.webp", "assets/img/black-back.webp", "assets/img/detail-monogram.webp", "assets/img/detail-back.webp", "assets/img/detail-zip.webp", "assets/img/detail-cuff.webp"],
          worn: ["assets/img/campaign-studio.webp", "assets/img/campaign-night.webp", "assets/img/street-front.webp", "assets/img/street-back.webp"]
        },
        {
          id: "chocolat", hex: "#3b2418", name: { fr: "Chocolat", en: "Chocolate" },
          images: ["assets/img/brown-front.webp", "assets/img/brown-back.webp"]
        },
        {
          id: "pierre", hex: "#bdb8b0", name: { fr: "Pierre", en: "Stone" },
          images: ["assets/img/grey-front.webp", "assets/img/grey-back.webp"]
        }
      ]
    },

    /* ----- Produits à venir : passe status à "preorder" et ajoute couleurs/images pour les ouvrir ----- */
    {
      id: "hoodie-botanique", status: "soon",
      collection: { fr: "Chapitre II", en: "Chapter II" },
      name: { fr: "Hoodie Botanique", en: "Botanical Hoodie" },
      teaser: "assets/img/sketches.webp"
    },
    {
      id: "veste-laine-bm", status: "soon",
      collection: { fr: "Chapitre II", en: "Chapter II" },
      name: { fr: "Veste Laine BM", en: "BM Wool Jacket" },
      teaser: "assets/img/brown-sheet.webp"
    },
    {
      id: "accessoires", status: "soon",
      collection: { fr: "Capsule", en: "Capsule" },
      name: { fr: "Accessoires Signature", en: "Signature Accessories" },
      teaser: "assets/img/logo-sheet.webp"
    }
  ]
};
