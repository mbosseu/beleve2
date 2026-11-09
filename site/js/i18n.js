/* Traductions. Le français est le texte écrit dans index.html ;
   ici on fournit l'anglais pour les attributs data-i18n, et les textes dynamiques. */
window.BM_I18N = {
  en: {
    "nav.piece": "The piece", "nav.shop": "Shop", "nav.lookbook": "Lookbook", "nav.story": "Story", "nav.faq": "FAQ",
    "cta.preorder": "Pre-order the Puffer", "cta.preorderShort": "Pre-order", "cta.film": "Watch the film", "cta.choose": "Choose my size →",
    "hero.eyebrow": "Chapter I · Pre-orders open", "hero.t1": "Underestimated.", "hero.t2": "Never equalled.",
    "hero.sub": "The Signature Puffer. Embroidered, considered, and made only for those who reserve it.",
    "hero.reserved": "pre-orders", "hero.ship": "Worldwide shipping", "hero.free": "Nothing charged today", "hero.scroll": "Scroll",
    "marquee.1": "Worldwide shipping", "marquee.2": "Made to order", "marquee.3": "Zero waste", "marquee.4": "Limited edition",
    "piece.s1.t": "A silhouette built to last.", "piece.s1.p": "Relaxed, structured fit, horizontal quilting, generous volume. A piece that keeps its shape, winter after winter.",
    "piece.s2.t": "The monogram, embroidered.", "piece.s2.p": "BM initials and a botanical bouquet, stitched in cream thread on the chest. Quiet from afar. Signed up close.",
    "piece.s3.t": "What you leave behind.", "piece.s3.p": "On the back, our emblem: wildflowers and a lotus bud — the ones that grow where no one expected them.",
    "piece.s4.t": "Details don't lie.", "piece.s4.p": "Silver metal zip engraved BM, elastic cuffs, lined hood. Nothing left to chance.",
    "film.eyebrow": "The manifesto", "film.q1": "We are not trying to fit into the circle.", "film.q2": "We are creating a new one.",
    "film.p": "For those who were ignored. For those who stayed true. BELIEVE ME was born from one belief: you don't need others to believe in you to move forward — but when they do, we move together.",
    "film.play": "Play the film",
    "look.eyebrow": "Lookbook — Chapter I", "look.title": "Worn in real life.",
    "how.eyebrow": "Pre-ordering, simply", "how.title": "Made for you. Not for a warehouse.",
    "how.1.t": "Reserve your piece", "how.1.p": "Pick your colour and size. No payment today: your place in the first production run is secured.",
    "how.2.t": "We start production", "how.2.p": "Once the goal is reached, we produce exactly the number of pieces reserved. No surplus, no waste.",
    "how.3.t": "Delivered worldwide", "how.3.p": "You get an email to confirm and pay, then your puffer ships — wherever you are.",
    "story.eyebrow": "From sketch to piece", "story.title": "It all starts with a pencil line.",
    "story.p1": "Wildflowers grow without permission. The lotus rises from the mud to open to the light. That's our emblem — drawn by hand, then embroidered thread by thread.",
    "story.p2": "BELIEVE ME is an independent label. Every pre-order is a vote: it tells us what to make, and how many.",
    "soon.eyebrow": "Coming soon", "soon.title": "The next chapters.",
    "faq.title": "Frequently asked questions.",
    "faq.1.q": "Do I pay now?", "faq.1.a": "No. A pre-order reserves your piece for free. When production starts, you'll receive an email to confirm and pay. You can cancel any time before that.",
    "faq.2.q": "Do you ship to my country?", "faq.2.a": "Yes. We ship worldwide: Europe, Africa, North America, Asia, Oceania. Exact costs and times are shown at payment.",
    "faq.3.q": "When will I get my puffer?", "faq.3.a": "Production starts when pre-orders close. Usually 8–10 weeks, plus shipping time. We'll update you at every step.",
    "faq.4.q": "How do I choose my size?", "faq.4.a": "The fit is relaxed. Take your usual size for an oversized drape, one size down for a closer fit. The size guide is next to the size picker.",
    "faq.5.q": "Why pre-order?", "faq.5.a": "To make exactly what's wanted. No unsold stock, no waste — and better quality for you.",
    "join.title": "Join the circle.", "join.p": "Early access to the next chapters, behind-the-scenes and limited editions.", "join.cta": "Join",
    "footer.shop": "Shop", "footer.puffer": "Signature Puffer", "footer.next": "Next chapters", "footer.help": "Help", "footer.shipping": "Worldwide shipping", "footer.follow": "Follow", "footer.rights": "All rights reserved.",
    "form.title": "Reserve your piece", "form.note": "No payment today. We'll email you as soon as production starts.",
    "form.first": "First name", "form.last": "Last name", "form.country": "Shipping country", "form.city": "City", "form.phone": "Phone / WhatsApp (optional)",
    "form.consent": "I agree to be contacted about my pre-order. No payment commitment.", "form.news": "Also send me future releases.", "form.submit": "Confirm my pre-order",
    "done.title": "It's reserved.", "done.p": "Thank you for believing in us. You're one of the first. We'll write as soon as production begins.", "done.ref": "Reference", "done.share": "Share with a friend", "done.close": "Continue",
    "size.title": "Size guide", "size.note": "Garment measurements laid flat, in cm. Oversized fit.", "size.chest": "Chest", "size.length": "Length", "size.sleeve": "Sleeve"
  },

  /* Textes générés par app.js */
  ui: {
    fr: {
      color: "Couleur", size: "Taille", sizeGuide: "Guide des tailles", qty: "Quantité", preorder: "Précommander",
      chooseSize: "Choisis ta taille", reserved: "précommandes", goal: "Objectif de production",
      goalText: (left) => left > 0 ? `Plus que ${left} réservations pour lancer la production.` : "Objectif atteint — la production est confirmée !",
      today: "aujourd'hui", nothingToday: "0 € débité aujourd'hui",
      r1: ["Monde", "livraison partout"], r2: ["0 €", "aujourd'hui"], r3: ["Limitée", "1re production"],
      details: "Détails", composition: "Composition & entretien", shipping: "Livraison & retours",
      care: "Lavage délicat 30°, ne pas sécher en machine, ne pas repasser la broderie.",
      ship: "Livraison dans le monde entier. Retours gratuits sous 14 jours après réception.",
      badge: "Précommande", worn: "Portée", notify: "Me prévenir", notified: "Tu seras prévenu(e) ✓",
      soonLabel: "Bientôt", errRequired: "Merci de remplir les champs obligatoires.", errEmail: "Adresse e-mail invalide.",
      errNet: "L'enregistrement n'a pas abouti. Réessaie dans un instant, ou écris-nous :", subErr: "Inscription impossible pour le moment, réessaie plus tard.",
      joined: "Bienvenue dans le cercle ✦", joinedErr: "E-mail invalide.",
      sizeFirst: "Choisis d'abord ta taille", shareText: "J'ai précommandé la Doudoune Signature BELIEVE ME. Sous-estimés. Jamais égalés.",
      copied: "Lien copié ✓", product: "Produit", total: "Total estimé", play: "Lire le film", pause: "Pause",
      selectCountry: "Sélectionne ton pays"
    },
    en: {
      color: "Colour", size: "Size", sizeGuide: "Size guide", qty: "Quantity", preorder: "Pre-order",
      chooseSize: "Choose your size", reserved: "pre-orders", goal: "Production goal",
      goalText: (left) => left > 0 ? `Only ${left} reservations left to start production.` : "Goal reached — production is confirmed!",
      today: "today", nothingToday: "Nothing charged today",
      r1: ["World", "shipping everywhere"], r2: ["0", "charged today"], r3: ["Limited", "first run"],
      details: "Details", composition: "Composition & care", shipping: "Shipping & returns",
      care: "Gentle wash 30°, do not tumble dry, do not iron the embroidery.",
      ship: "Worldwide shipping. Free returns within 14 days of delivery.",
      badge: "Pre-order", worn: "Worn", notify: "Notify me", notified: "You'll be notified ✓",
      soonLabel: "Soon", errRequired: "Please fill in the required fields.", errEmail: "Invalid email address.",
      errNet: "Your pre-order could not be saved. Please try again shortly, or email us:", subErr: "Sign-up failed for now, please try again later.",
      joined: "Welcome to the circle ✦", joinedErr: "Invalid email.",
      sizeFirst: "Choose your size first", shareText: "I pre-ordered the BELIEVE ME Signature Puffer. Underestimated. Never equalled.",
      copied: "Link copied ✓", product: "Product", total: "Estimated total", play: "Play the film", pause: "Pause",
      selectCountry: "Select your country"
    }
  }
};
