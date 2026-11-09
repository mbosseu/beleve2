/* ==========================================================================
   BELIEVE ME — logique du site
   ========================================================================== */
(() => {
  "use strict";
  const CAT = window.BM_CATALOG;
  const CFG = window.BM_CONFIG || {};
  const I18N = window.BM_I18N;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const store = {
    get(k, d) { try { const v = localStorage.getItem(k); return v === null ? d : JSON.parse(v); } catch { return d; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} }
  };
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const hasGsap = typeof window.gsap !== "undefined";

  /* ---------------- Langue ---------------- */
  const urlLang = new URLSearchParams(location.search).get("lang");
  let lang = urlLang || store.get("bm_lang", (navigator.language || "fr").toLowerCase().startsWith("fr") ? "fr" : "en");
  if (!["fr", "en"].includes(lang)) lang = "en";
  const frCache = new Map();
  const t = (k) => I18N.ui[lang][k];
  const L = (obj) => (obj && typeof obj === "object" ? obj[lang] || obj.fr : obj);

  function applyLang() {
    document.documentElement.lang = lang;
    $$("[data-i18n]").forEach((el) => {
      const key = el.dataset.i18n;
      if (!frCache.has(el)) frCache.set(el, el.innerHTML);
      el.innerHTML = lang === "fr" ? frCache.get(el) : (I18N.en[key] ?? frCache.get(el));
    });
    $("#langToggle").textContent = lang === "fr" ? "EN" : "FR";
    store.set("bm_lang", lang);
  }

  /* ---------------- Devise ---------------- */
  const REGION_CUR = { US: "USD", GB: "GBP", CA: "CAD", CH: "CHF", MA: "MAD",
    CM: "XAF", GA: "XAF", CG: "XAF", TD: "XAF", CF: "XAF", GQ: "XAF",
    SN: "XOF", CI: "XOF", ML: "XOF", BF: "XOF", BJ: "XOF", TG: "XOF", NE: "XOF", GW: "XOF" };
  const region = ((navigator.language || "").split("-")[1] || "").toUpperCase();
  let currency = store.get("bm_cur", REGION_CUR[region] || "EUR");
  if (!CAT.currencies[currency]) currency = "EUR";

  function fmt(eur) {
    const c = CAT.currencies[currency];
    let v = eur * c.rate;
    v = c.round ? Math.round(v / c.round) * c.round : Math.round(v);
    const n = v.toLocaleString(lang === "fr" ? "fr-FR" : "en-US");
    return c.after ? `${n} ${c.symbol.trim()}` : `${c.symbol}${n}`;
  }
  function refreshPrices() {
    $$("[data-price]").forEach((el) => (el.textContent = fmt(+el.dataset.price)));
    const p = featured();
    if (p) $(".js-mbar-price").textContent = " " + fmt(p.price);
  }
  function setupCurrency() {
    const sel = $("#currency");
    sel.innerHTML = Object.keys(CAT.currencies).map((c) => `<option value="${c}">${c}</option>`).join("");
    sel.value = currency;
    sel.addEventListener("change", () => { currency = sel.value; store.set("bm_cur", currency); refreshPrices(); renderSummary(); });
  }

  /* ---------------- Produit ---------------- */
  const featured = () => CAT.products.find((p) => p.featured && p.status === "preorder") || CAT.products.find((p) => p.status === "preorder");
  const state = { product: null, color: null, size: null, qty: 1, img: 0, counts: {} };

  function imagesFor() {
    const c = state.color;
    return [...c.images, ...(c.worn || [])];
  }

  function renderProduct() {
    const p = featured();
    const root = $("#productRoot");
    if (!p) { root.innerHTML = ""; return; }
    state.product = p;
    state.color = state.color || p.colors[0];
    root.innerHTML = `
      <div class="gallery reveal">
        <div class="gallery__thumbs" id="thumbs" role="tablist"></div>
        <div class="gallery__main" id="mainImg">
          <span class="gallery__badge">${t("badge")}</span>
          <div class="gallery__nav"><button type="button" id="prevImg" aria-label="Image précédente">←</button><button type="button" id="nextImg" aria-label="Image suivante">→</button></div>
        </div>
      </div>
      <div class="buy reveal">
        <p class="buy__collection">${L(p.collection)}</p>
        <h2 id="shopTitle">${L(p.name)}</h2>
        <div class="buy__price"><span data-price="${p.price}">${fmt(p.price)}</span><small>${t("nothingToday")}</small></div>
        <p class="buy__short">${L(p.short)}</p>

        <div class="progress">
          <div class="progress__top"><span>${t("goal")}</span><strong><span class="js-count">0</span> / ${p.goal}</strong></div>
          <div class="progress__bar"><i id="progressBar"></i></div>
          <p id="progressText"></p>
        </div>

        <div class="opt">
          <div class="opt__label">${t("color")} <span id="colorName">${L(state.color.name)}</span></div>
          <div class="swatches" id="swatches">
            ${p.colors.map((c) => `<button type="button" class="swatch${c === state.color ? " is-active" : ""}" data-color="${c.id}" aria-label="${L(c.name)}" title="${L(c.name)}"><i style="background:${c.hex}"></i></button>`).join("")}
          </div>
        </div>

        <div class="opt">
          <div class="opt__label">${t("size")} <button type="button" id="openSize">${t("sizeGuide")}</button></div>
          <div class="sizes-pick" id="sizesPick">
            ${p.sizes.map((s) => `<button type="button" class="size${s === state.size ? " is-active" : ""}" data-size="${s}">${s}</button>`).join("")}
          </div>
        </div>

        <div class="buy__cta">
          <div class="qty" aria-label="${t("qty")}"><button type="button" id="qtyMinus" aria-label="-">−</button><output id="qtyOut">${state.qty}</output><button type="button" id="qtyPlus" aria-label="+">+</button></div>
          <button class="btn btn--dark" id="preorderBtn" type="button">${state.size ? t("preorder") + " · " + fmt(p.price * state.qty) : t("chooseSize")}</button>
        </div>
        <p class="muted small">${L(p.deliveryEstimate)}</p>

        <div class="buy__reassure">
          <div><b>${t("r1")[0]}</b>${t("r1")[1]}</div>
          <div><b>${t("r2")[0] === "0" ? fmt(0) : t("r2")[0]}</b>${t("r2")[1]}</div>
          <div><b>${t("r3")[0]}</b>${t("r3")[1]}</div>
        </div>

        <div class="acc">
          <details open><summary>${t("details")}</summary><ul>${L(p.features).map((f) => `<li>${f}</li>`).join("")}</ul></details>
          <details><summary>${t("composition")}</summary><p>${L(p.composition)}</p><p>${t("care")}</p></details>
          <details><summary>${t("shipping")}</summary><p>${t("ship")}</p></details>
        </div>
      </div>`;
    renderGallery();
    bindProduct();
    updateProgress();
    if (hasGsap && !reduced) $$(".reveal", root).forEach(revealOne); else $$(".reveal", root).forEach((e) => (e.style.opacity = 1, e.style.transform = "none"));
  }

  function renderGallery() {
    const imgs = imagesFor();
    state.img = Math.min(state.img, imgs.length - 1);
    const main = $("#mainImg");
    $$("img", main).forEach((i) => i.remove());
    const img = new Image();
    img.src = imgs[state.img];
    img.alt = `${L(state.product.name)} — ${L(state.color.name)}`;
    if (state.color.worn && state.img >= state.color.images.length) img.classList.add("is-worn");
    main.prepend(img);
    $("#thumbs").innerHTML = imgs.map((src, i) =>
      `<button type="button" class="gallery__thumb${i === state.img ? " is-active" : ""}" data-i="${i}" aria-label="Image ${i + 1}"><img src="${src}" alt="" loading="lazy" ${i >= state.color.images.length ? 'style="mix-blend-mode:normal"' : ""}></button>`).join("");
    // précharge les autres couleurs
    state.product.colors.forEach((c) => { const p = new Image(); p.src = c.images[0]; });
  }

  function bindProduct() {
    const p = state.product;
    $("#thumbs").addEventListener("click", (e) => { const b = e.target.closest("[data-i]"); if (b) { state.img = +b.dataset.i; renderGallery(); } });
    $("#prevImg").addEventListener("click", (e) => { e.stopPropagation(); const n = imagesFor().length; state.img = (state.img - 1 + n) % n; renderGallery(); });
    $("#nextImg").addEventListener("click", (e) => { e.stopPropagation(); state.img = (state.img + 1) % imagesFor().length; renderGallery(); });
    $("#mainImg").addEventListener("click", (e) => {
      const m = e.currentTarget; const img = $("img", m); if (!img || e.target.closest("button")) return;
      const r = m.getBoundingClientRect();
      img.style.transformOrigin = `${((e.clientX - r.left) / r.width) * 100}% ${((e.clientY - r.top) / r.height) * 100}%`;
      m.classList.toggle("is-zoom");
    });
    $("#swatches").addEventListener("click", (e) => {
      const b = e.target.closest("[data-color]"); if (!b) return;
      state.color = p.colors.find((c) => c.id === b.dataset.color); state.img = 0;
      $$(".swatch").forEach((s) => s.classList.toggle("is-active", s === b));
      $("#colorName").textContent = L(state.color.name);
      renderGallery();
      swapPieceColor();
    });
    $("#sizesPick").addEventListener("click", (e) => {
      const b = e.target.closest("[data-size]"); if (!b) return;
      state.size = b.dataset.size;
      $$(".size").forEach((s) => s.classList.toggle("is-active", s === b));
      updateCta();
    });
    $("#qtyMinus").addEventListener("click", () => { state.qty = Math.max(1, state.qty - 1); $("#qtyOut").textContent = state.qty; updateCta(); });
    $("#qtyPlus").addEventListener("click", () => { state.qty = Math.min(5, state.qty + 1); $("#qtyOut").textContent = state.qty; updateCta(); });
    $("#openSize").addEventListener("click", () => openModal("#sizeModal"));
    $("#preorderBtn").addEventListener("click", () => {
      if (!state.size) {
        toast(t("sizeFirst"));
        const sp = $("#sizesPick"); sp.animate([{ transform: "translateX(0)" }, { transform: "translateX(-6px)" }, { transform: "translateX(6px)" }, { transform: "translateX(0)" }], { duration: 300 });
        return;
      }
      openPreorder();
    });
  }

  function updateCta() {
    const btn = $("#preorderBtn"); if (!btn) return;
    btn.textContent = state.size ? `${t("preorder")} · ${fmt(state.product.price * state.qty)}` : t("chooseSize");
  }

  // Change la couleur de la section "La pièce" quand on choisit une couleur
  function swapPieceColor() {
    const f = $(".piece__img--front"), b = $(".piece__img--back");
    if (!f || !state.color.images[1]) return;
    f.src = state.color.images[0]; b.src = state.color.images[1];
  }

  /* ---------------- Compteur de précommandes ---------------- */
  async function loadStats() {
    let total = 0;
    try {
      const r = await fetch(`${CFG.apiBase || ""}/api/stats`, { cache: "no-store" });
      if (!r.ok) throw 0;
      const j = await r.json();
      state.counts = j.byProduct || {};
      total = state.counts[featured()?.id] || 0;
    } catch {
      total = store.get("bm_local_preorders", []).length;
    }
    setCount(total);
  }
  function setCount(n) {
    state.total = n;
    $$(".js-count").forEach((el) => {
      if (!hasGsap || reduced) { el.textContent = n; return; }
      const o = { v: 0 }; gsap.to(o, { v: n, duration: 1.6, ease: "power2.out", onUpdate: () => (el.textContent = Math.round(o.v)) });
    });
    updateProgress();
  }
  function updateProgress() {
    const p = featured(); if (!p || !$("#progressBar")) return;
    const n = state.total || 0;
    requestAnimationFrame(() => ($("#progressBar").style.width = Math.min(100, Math.max(3, (n / p.goal) * 100)) + "%"));
    $("#progressText").textContent = t("goalText")(Math.max(0, p.goal - n));
  }

  /* ---------------- Modales ---------------- */
  let lastFocus = null;
  function openModal(sel) {
    const m = $(sel); lastFocus = document.activeElement;
    m.hidden = false; document.body.style.overflow = "hidden";
    const f = $("input, select, button:not(.modal__close)", m); f && setTimeout(() => f.focus(), 50);
  }
  function closeModal(m) {
    m.hidden = true; document.body.style.overflow = "";
    lastFocus && lastFocus.focus && lastFocus.focus();
  }
  document.addEventListener("click", (e) => { if (e.target.closest("[data-close]")) closeModal(e.target.closest(".modal")); });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") $$(".modal:not([hidden])").forEach(closeModal); });

  const COUNTRIES = "FR BE CH LU MC CA US GB DE ES IT PT NL IE AT SE NO DK FI PL CZ GR RO HU BG HR SK SI EE LV LT IS MT CY CM CI SN GA CG CD BJ TG BF ML NE TD CF GQ GN MG MA DZ TN EG NG GH KE ZA RW ET UG TZ AO MZ ZM ZW BW NA MU SC DJ KM MR GM SL LR CV ST BI ER SO SS SD LY HT MQ GP GF RE YT PF NC BR MX AR CO CL PE VE EC BO PY UY CU DO JM TT PA CR GT HN SV NI PR BS BB AE SA QA KW BH OM JO LB IL TR IR IQ IN PK BD LK NP CN JP KR TW HK SG MY TH VN PH ID KH AU NZ RU UA BY GE AM AZ KZ UZ".split(" ");
  function fillCountries() {
    let names; try { names = new Intl.DisplayNames([lang], { type: "region" }); } catch { names = { of: (c) => c }; }
    const list = COUNTRIES.map((c) => [c, names.of(c)]).sort((a, b) => a[1].localeCompare(b[1], lang));
    const sel = $("#countrySelect"); const cur = sel.value || region;
    sel.innerHTML = `<option value="">${t("selectCountry")}</option>` + list.map(([c, n]) => `<option value="${c}">${n}</option>`).join("");
    if (COUNTRIES.includes(cur)) sel.value = cur;
  }

  function renderSummary() {
    const p = state.product; if (!p || !state.color) return;
    $("#modalSummary").innerHTML = `
      <img src="${state.color.images[0]}" alt="">
      <div class="js-sum-text">
        <h4>${L(p.name)}</h4>
        <dl>
          <dt>${t("color")}</dt><dd>${L(state.color.name)}</dd>
          <dt>${t("size")}</dt><dd>${state.size || "—"}</dd>
          <dt>${t("qty")}</dt><dd>${state.qty}</dd>
          <dt>${t("total")}</dt><dd>${fmt(p.price * state.qty)}</dd>
          <dt>${lang === "fr" ? "Aujourd'hui" : "Today"}</dt><dd>${fmt(0)}</dd>
        </dl>
      </div>`;
  }
  function openPreorder() {
    renderSummary(); fillCountries();
    $("#preorderForm").hidden = false; $("#modalDone").hidden = true; $("#formError").textContent = "";
    openModal("#preorderModal");
  }

  $("#preorderForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const f = e.currentTarget; const fd = Object.fromEntries(new FormData(f).entries());
    const err = $("#formError");
    if (fd.website) return; // anti-spam
    if (!fd.firstName || !fd.email || !fd.country || !fd.consent) { err.textContent = t("errRequired"); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(fd.email)) { err.textContent = t("errEmail"); return; }
    const payload = {
      productId: state.product.id, productName: state.product.name.fr, color: state.color.id, size: state.size, qty: state.qty,
      priceEur: state.product.price, currency, firstName: fd.firstName.trim(), lastName: (fd.lastName || "").trim(),
      email: fd.email.trim().toLowerCase(), country: fd.country, city: (fd.city || "").trim(), phone: (fd.phone || "").trim(),
      newsletter: !!fd.newsletter, lang, source: new URLSearchParams(location.search).get("utm_source") || document.referrer || "direct"
    };
    const btn = $("button[type=submit]", f); btn.disabled = true; err.textContent = "";
    let ref = null;
    try {
      const r = await fetch(`${CFG.apiBase || ""}/api/preorders`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      const j = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(j.error || "server");
      ref = j.ref; setCount(j.total ?? (state.total || 0) + 1);
    } catch (ex) {
      if (ex.message && ex.message !== "server" && !/fetch|network|Failed/i.test(ex.message)) { err.textContent = ex.message; btn.disabled = false; return; }
      // pas de serveur : on garde la précommande localement
      ref = "BM-" + Math.random().toString(36).slice(2, 8).toUpperCase();
      const loc = store.get("bm_local_preorders", []); loc.push({ ...payload, ref, createdAt: new Date().toISOString() }); store.set("bm_local_preorders", loc);
      setCount((state.total || 0) + 1);
    }
    if (CFG.externalEndpoint) fetch(CFG.externalEndpoint, { method: "POST", headers: { "Content-Type": "application/json", Accept: "application/json" }, body: JSON.stringify({ ...payload, ref }) }).catch(() => {});
    btn.disabled = false; f.reset();
    $("#doneRef").textContent = ref;
    f.hidden = true; $("#modalDone").hidden = false;
    if (hasGsap && !reduced) gsap.fromTo("#modalDone > *", { opacity: 0, y: 16 }, { opacity: 1, y: 0, stagger: 0.08, duration: 0.6, ease: "power3.out" });
  });

  $("#shareBtn").addEventListener("click", async () => {
    const data = { title: "BELIEVE ME", text: t("shareText"), url: CFG.siteUrl || location.href };
    if (navigator.share) { try { await navigator.share(data); } catch {} return; }
    try { await navigator.clipboard.writeText(`${data.text} ${data.url}`); toast(t("copied")); } catch {}
  });

  /* ---------------- Newsletter / bientôt ---------------- */
  async function subscribe(email, interest) {
    try {
      const r = await fetch(`${CFG.apiBase || ""}/api/subscribe`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, interest, lang }) });
      return r.ok;
    } catch { const l = store.get("bm_local_subs", []); l.push({ email, interest }); store.set("bm_local_subs", l); return true; }
  }
  $("#joinForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = $("#joinEmail").value.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) { $("#joinMsg").textContent = t("joinedErr"); return; }
    await subscribe(email, "newsletter"); $("#joinMsg").textContent = t("joined"); e.currentTarget.reset();
  });

  function renderSoon() {
    const list = CAT.products.filter((p) => p.status === "soon");
    const notified = store.get("bm_notify", []);
    $("#soonGrid").innerHTML = list.map((p) => `
      <article class="soon__card reveal">
        <img src="${p.teaser}" alt="${L(p.name)}" loading="lazy">
        <div class="soon__info">
          <small>${L(p.collection)} · ${t("soonLabel")}</small>
          <h3>${L(p.name)}</h3>
          <button type="button" data-notify="${p.id}" class="${notified.includes(p.id) ? "is-on" : ""}">${notified.includes(p.id) ? t("notified") : t("notify")}</button>
        </div>
      </article>`).join("");
    $("#soonGrid").onclick = async (e) => {
      const b = e.target.closest("[data-notify]"); if (!b) return;
      const email = prompt(lang === "fr" ? "Ton e-mail pour être prévenu(e) :" : "Your email to be notified:");
      if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) return;
      await subscribe(email.trim(), b.dataset.notify);
      const n = store.get("bm_notify", []); n.push(b.dataset.notify); store.set("bm_notify", n);
      b.classList.add("is-on"); b.textContent = t("notified");
    };
  }

  /* ---------------- Toast ---------------- */
  let toastT;
  function toast(msg) { const el = $("#toast"); el.textContent = msg; el.classList.add("is-on"); clearTimeout(toastT); toastT = setTimeout(() => el.classList.remove("is-on"), 2600); }

  /* ---------------- Animations ---------------- */
  function revealOne(el) {
    gsap.fromTo(el, { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 1.1, ease: "power3.out", scrollTrigger: { trigger: el, start: "top 88%", once: true } });
  }

  function loaderIntro(done) {
    const loader = $("#loader");
    if (!hasGsap || reduced) { loader.remove(); document.body.classList.remove("is-loading"); done(); return; }
    const tl = gsap.timeline({ onComplete: () => { loader.remove(); document.body.classList.remove("is-loading"); } });
    tl.to(".loader__word span", { opacity: 1, y: 0, duration: 0.7, stagger: 0.04, ease: "power3.out" })
      .to(".loader__rule", { opacity: 1, duration: 0.5 }, "-=0.3")
      .to(loader, { yPercent: -100, duration: 0.9, ease: "power4.inOut" }, "+=0.2")
      .add(done, "-=0.5");
    // Sécurité : jamais plus de 2,6 s d'attente, même sur un appareil lent ou un onglet en arrière-plan
    setTimeout(() => { if (tl.progress() < 1) tl.progress(1); }, 2600);
  }

  function heroIn() {
    if (!hasGsap || reduced) return;
    gsap.fromTo(".hero__title .line > *", { yPercent: 110 }, { yPercent: 0, duration: 1.2, stagger: 0.12, ease: "power4.out" });
    gsap.fromTo([".hero__eyebrow", ".hero__sub", ".hero__ctas"], { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 1, stagger: 0.1, delay: 0.35, ease: "power3.out" });
    gsap.fromTo(".hero__media", { scale: 1.12 }, { scale: 1, duration: 2.2, ease: "power3.out" });
  }

  function scrollFx() {
    if (!hasGsap || typeof ScrollTrigger === "undefined") return;
    gsap.registerPlugin(ScrollTrigger);

    // Parallax du hero
    if (!reduced) gsap.to(".hero__media", { yPercent: 18, ease: "none", scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true } });

    // La pièce : étapes
    const piece = $(".piece"), steps = $$(".piece__step");
    const front = $(".piece__img--front"), back = $(".piece__img--back");
    const poses = [
      { f: 1, b: 0, s: 1, x: 0, y: 0 },          // silhouette
      { f: 1, b: 0, s: 2.1, x: -16, y: 22 },     // monogramme (zoom poitrine)
      { f: 0, b: 1, s: 1.15, x: 0, y: 8 },       // dos
      { f: 1, b: 0, s: 2.4, x: 0, y: 30 }        // zip / détails
    ];
    let current = -1;
    function go(i) {
      if (i === current) return; current = i;
      piece.dataset.active = i;
      steps.forEach((s, k) => s.classList.toggle("is-active", k === i));
      const p = poses[i];
      if (reduced) { front.style.opacity = p.f; back.style.opacity = p.b; return; }
      gsap.to(front, { opacity: p.f, scale: p.s, xPercent: p.x, yPercent: p.y, duration: 1.1, ease: "power3.inOut" });
      gsap.to(back, { opacity: p.b, scale: p.b ? p.s : 1, xPercent: p.b ? p.x : 0, yPercent: p.b ? p.y : 0, rotationY: p.b ? 0 : 25, duration: 1.1, ease: "power3.inOut" });
    }
    steps.forEach((s, i) => ScrollTrigger.create({ trigger: s, start: "top 55%", end: "bottom 55%", onToggle: (st) => st.isActive && go(i) }));
    go(0);

    // Révélations
    if (!reduced) $$(".section-head, .how__steps li, .story__text > *, .manifesto__text > *, .faq details, .join > *, .look, .soon__card").forEach(revealOne);
    else $$(".reveal").forEach((e) => (e.style.opacity = 1, e.style.transform = "none"));

    // Story : image parallax
    if (!reduced) gsap.fromTo(".story__media img", { scale: 1.15, yPercent: -6 }, { scale: 1, yPercent: 6, ease: "none", scrollTrigger: { trigger: ".story", start: "top bottom", end: "bottom top", scrub: true } });
  }

  function navFx() {
    const nav = $("#nav"), mbar = $("#mbar"); let lastY = 0;
    const onScroll = () => {
      const y = scrollY;
      nav.classList.toggle("is-solid", y > 40);
      nav.classList.toggle("is-hidden", y > lastY && y > 600 && !document.querySelector(".modal:not([hidden])"));
      const shop = $("#shop").getBoundingClientRect();
      mbar.classList.toggle("is-on", y > innerHeight * 0.8 && !(shop.top < innerHeight && shop.bottom > 0));
      lastY = y;
    };
    addEventListener("scroll", onScroll, { passive: true }); onScroll();
  }

  function mediaFx() {
    // Vidéos du lookbook chargées à l'approche
    const io = new IntersectionObserver((entries) => entries.forEach((en) => {
      const v = en.target;
      if (en.isIntersecting) {
        if (!v.dataset.loaded) { $$("source[data-src]", v).forEach((s) => (s.src = s.dataset.src)); v.load(); v.dataset.loaded = 1; }
        v.play().catch(() => {});
      } else v.pause();
    }), { rootMargin: "200px" });
    $$("video[data-lazy-video]").forEach((v) => io.observe(v));

    // Hero : si la vidéo n'existe pas, on garde l'image
    const hv = $("#heroVideo");
    hv.addEventListener("error", () => (hv.style.display = "none"), true);
    $$("source", hv).forEach((s) => s.addEventListener("error", () => (hv.style.display = "none")));

    // Film manifeste : lecture auto à l'écran, bouton pause/lecture
    const mv = $("#manifestoVideo"), mb = $("#manifestoPlay");
    new IntersectionObserver(([en]) => { if (en.isIntersecting) mv.play().then(() => (mb.firstElementChild.textContent = t("pause"))).catch(() => {}); else mv.pause(); }, { threshold: 0.4 }).observe(mv);
    mb.addEventListener("click", () => { if (mv.paused) { mv.play(); mb.firstElementChild.textContent = t("pause"); } else { mv.pause(); mb.firstElementChild.textContent = t("play"); } });

    // Lookbook : glisser à la souris
    const rail = $("#lookRail"); let down = false, sx = 0, sl = 0;
    rail.addEventListener("pointerdown", (e) => { if (e.pointerType !== "mouse") return; down = true; sx = e.clientX; sl = rail.scrollLeft; rail.classList.add("is-drag"); });
    addEventListener("pointerup", () => { down = false; rail.classList.remove("is-drag"); });
    rail.addEventListener("pointermove", (e) => { if (down) rail.scrollLeft = sl - (e.clientX - sx); });
  }

  // Boutons magnétiques (desktop)
  function magnetic() {
    if (reduced || !hasGsap || matchMedia("(pointer: coarse)").matches) return;
    $$("[data-magnetic]").forEach((b) => {
      b.addEventListener("mousemove", (e) => { const r = b.getBoundingClientRect(); gsap.to(b, { x: (e.clientX - r.left - r.width / 2) * 0.18, y: (e.clientY - r.top - r.height / 2) * 0.3, duration: 0.4 }); });
      b.addEventListener("mouseleave", () => gsap.to(b, { x: 0, y: 0, duration: 0.6, ease: "elastic.out(1,0.4)" }));
    });
  }

  /* ---------------- Init ---------------- */
  function rerenderAll() { applyLang(); renderProduct(); renderSoon(); refreshPrices(); updateProgress(); if (hasGsap && typeof ScrollTrigger !== "undefined") ScrollTrigger.refresh(); }

  $("#langToggle").addEventListener("click", () => {
    lang = lang === "fr" ? "en" : "fr";
    const keep = { color: state.color?.id, size: state.size };
    rerenderAll();
    if (keep.size) $(`[data-size="${keep.size}"]`)?.click();
    $$(".js-count").forEach((el) => (el.textContent = state.total || 0));
  });
  $("#year").textContent = new Date().getFullYear();
  $(".js-mail").href = "mailto:" + CAT.brand.email;
  $(".js-ig").href = CAT.brand.instagram; $(".js-tt").href = CAT.brand.tiktok;

  setupCurrency();
  applyLang();
  renderProduct();
  renderSoon();
  refreshPrices();
  navFx();
  mediaFx();
  magnetic();
  loadStats();
  loaderIntro(() => { heroIn(); scrollFx(); });
})();
