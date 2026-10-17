/* ECJ Luxe — redesign prototype: routing, views and interactions. No dependencies. */
(function () {
  'use strict';

  const D = window.ECJ, P = D.products;
  // The full ECJ Luxe catalogue (available and sold) joins the curated pieces, which keep their own photography and notes.
  const CATALOGUE = window.ECJ_CATALOGUE;
  if (CATALOGUE && CATALOGUE.items) {
    const curated = new Map(P.map(p => [p.id, p]));
    const url = (path, thumb) => CATALOGUE.base + (thumb ? path.replace(/(\.\w+)$/, '-500x500$1') : path);
    CATALOGUE.items.forEach(x => {
      const known = curated.get(x.i);
      if (known) { // keep the curated record, but file it the way the catalogue does
        known.sold = !!x.s; known.isNew = !!x.a;
        if (x.c === 'home-office' || x.c === 'apparel') { known.type = x.t; known.brand = x.b; }
        return;
      }
      P.push({
        id: x.i, cat: x.c, brand: x.b, model: x.n, line: x.t || x.f || '', ref: x.r, price: x.p || 0, cond: x.k,
        type: x.t, family: x.f, metal: x.m, size: x.z, sold: !!x.s, isNew: !!x.a, remote: true,
        exotic: /alligator|crocodile|ostrich|lizard|niloticus|porosus/i.test(x.n),
        imgs: x.g.map(g => url(g)), thumbs: x.g.slice(0, 2).map((g, i) => url(g, (x.q || 0) >> i & 1)),
        specs: x.d || [], note: x.x, badges: x.s ? ['Sold'] : []
      });
    });
    P.sort((a, b) => (a.sold - b.sold) || b.id - a.id);
  }
  P.forEach(p => { p.sold = !!p.sold; });
  // without the catalogue (the hosted preview) there is no apparel to show, so its links come out
  if (!(CATALOGUE && CATALOGUE.items)) document.querySelectorAll('a[href="#/apparel"]').forEach(a => (a.closest('li') || a).remove());
  const byId = Object.fromEntries(P.map(p => [p.id, p]));
  const available = () => P.filter(p => !p.sold);
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => Array.from(el.querySelectorAll(s));
  const money = n => '$' + Math.round(n).toLocaleString('en-US');
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const slug = s => String(s || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/&/g, ' ').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
  const ico = n => `<svg class="i" aria-hidden="true"><use href="#i-${n}"/></svg>`;
  const ARROW = '<svg class="arrow" viewBox="0 0 16 10" aria-hidden="true"><path d="M0 5h15M11 1l4 4-4 4" fill="none" stroke="currentColor" stroke-width="1.2"/></svg>';
  const PHONE = '561.353.5216';
  const SRC = window.ECJ_SRC;
  const REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const FINE = window.matchMedia('(pointer: fine)').matches;

  const store = {
    get(k, d) { try { const v = localStorage.getItem('ecj:' + k); return v ? JSON.parse(v) : d; } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem('ecj:' + k, JSON.stringify(v)); } catch (e) { /* private mode */ } }
  };

  const freshSell = () => ({ step: 0, goal: 'Sell', category: 'Watch', brand: '', model: '', ref: '', year: '', cond: '', incl: [], photos: [], name: '', email: '', phone: '', prefer: 'Phone', notes: '', toward: null, done: false });
  const state = {
    bag: store.get('bag', []).filter(id => byId[id]),
    saved: new Set(store.get('saved', []).filter(id => byId[id])),
    booking: { interest: 'Watches', day: null, time: null, piece: null, name: '', phone: '', done: false },
    sell: freshSell(),
    notes: false,
    view: 'home',
    scrollTo: null
  };

  /* ───────── Category & facet config ───────── */
  const CAT_NAME = { watches: 'Watches', jewelry: 'Jewelry', hermes: 'Hermès', 'home-office': 'Home & Office', apparel: 'Apparel' };
  const PRICE_ORDER = ['Under $20,000', '$20,000 – $50,000', '$50,000 – $100,000', '$100,000 and above', 'Price on request'];
  const SIZE_ORDER = ['34mm and under', '35–39mm', '40mm and over'];
  const FACETS = {
    avail: { label: 'Availability', order: ['Available', 'Sold'], get: p => p.sold ? 'Sold' : 'Available' },
    brand: { label: 'Maison', get: p => p.brand },
    family: { label: 'Model', get: p => p.family },
    type: { label: 'Type', get: p => p.type },
    cond: { label: 'Condition', get: p => p.cond },
    setGroup: { label: 'Box & papers', get: p => !p.set ? null : /^(Box|Full)/.test(p.set) ? 'With original box' : 'Card or papers only' },
    metal: { label: 'Metal', get: p => p.metal },
    hardware: { label: 'Hardware', get: p => p.metal },
    leather: { label: 'Leather', get: p => (p.badges || []).includes('Exotic') || p.exotic ? 'Exotic' : 'Calfskin' },
    sizeBucket: { label: 'Case size', order: SIZE_ORDER, get: p => { const n = parseFloat(p.size); if (!n) return null; return n < 35 ? SIZE_ORDER[0] : n < 40 ? SIZE_ORDER[1] : SIZE_ORDER[2]; } },
    catLabel: { label: 'Category', get: p => CAT_NAME[p.cat] },
    price: { label: 'Price', order: PRICE_ORDER, get: p => !p.price ? PRICE_ORDER[4] : p.price < 20000 ? PRICE_ORDER[0] : p.price < 50000 ? PRICE_ORDER[1] : p.price < 100000 ? PRICE_ORDER[2] : PRICE_ORDER[3] }
  };
  const CATS = {
    watches: { title: 'Watches', intro: 'Rolex, Patek Philippe, Audemars Piguet, Hublot and more, new and pre-owned. Available pieces come first; sold pieces show what we have placed with collectors.', facets: ['avail', 'brand', 'family', 'cond', 'setGroup', 'metal', 'sizeBucket', 'price'], chips: 'brand' },
    jewelry: { title: 'Jewelry', intro: 'Signed pieces from Van Cleef & Arpels, Cartier and Chopard, and natural diamonds set in 18k gold. Available pieces come first.', facets: ['avail', 'type', 'brand', 'metal', 'cond', 'price'], chips: 'type' },
    hermes: { title: 'Hermès', intro: 'Birkin, Kelly and Constance, unworn and pre-owned, alongside Judith Leiber and other designer bags. Available bags come first.', facets: ['avail', 'family', 'brand', 'cond', 'hardware', 'leather', 'price'], chips: 'family' },
    'home-office': { title: 'Home & Office', intro: 'Buben & Zörweg safes and watch winders, Romero Britto, Lalique and Berd Vay’e crystal, fine pens, wall art and custom tables. Available pieces come first.', facets: ['avail', 'type', 'brand', 'price'], chips: 'type' },
    apparel: { title: 'Apparel', intro: 'Chrome Hearts sunglasses, Bugatti eyewear and ECJ Luxe hats. Available pieces come first.', facets: ['avail', 'type', 'brand', 'price'], chips: 'type' },
    new: { title: 'New arrivals', intro: 'The newest arrivals to ECJ Luxe, with inventory being updated regularly.', facets: ['catLabel', 'brand', 'cond', 'price'], chips: 'catLabel' },
    saved: { title: 'Saved pieces', intro: 'Pieces you have saved on this device. Mention them when you book a viewing and they will be ready when you arrive.', facets: [], chips: null },
    maison: { title: '', intro: '', facets: ['avail', 'catLabel', 'price'], chips: null }
  };
  const SPECIAL = { unworn: ['cond', 'Unworn'], 'full-set': ['setGroup', 'With original box'], 'under-20k': ['price', PRICE_ORDER[0]], exotic: ['leather', 'Exotic'] };
  const SPECIAL_TITLE = { unworn: 'Unworn', 'full-set': 'Box & papers', 'under-20k': 'Under $20,000', exotic: 'Exotic leathers' };
  const PROMOS = {
    watches: { label: 'Sell · Trade', h: 'Have a watch to sell or trade?', p: 'Send a few photos. A specialist will reply within the next business day.', cta: 'Start an offer', href: '#/sell', cat: 'Watch' },
    hermes: { label: 'Sell · Trade', h: 'Selling a Birkin or Kelly?', p: 'Unworn bags from the last three years command the highest premiums. Find out what yours is worth.', cta: 'Value my bag', href: '#/sell', cat: 'Hermès bag' },
    jewelry: { label: 'Sourcing', h: 'Looking for one piece in particular?', p: 'Tell us the maison, the size or the stone. We find hard-to-get pieces through relationships built over forty years.', cta: 'Ask us to source it', href: '#/salon', interest: 'Sourcing a piece' }
  };

  /* ───────── Shared bits ───────── */
  function metaLine(p) {
    const bits = [];
    if (p.ref) bits.push('Ref. ' + p.ref);
    if (p.stamp) bits.push('Stamp ' + p.stamp);
    if (p.year && !p.stamp) bits.push(String(p.year));
    if (p.cat === 'watches' && p.set) bits.push(p.set);
    if (p.cat === 'hermes' && p.size) bits.push(p.size);
    if ((p.cat === 'jewelry' || p.cat === 'home-office') && p.type) bits.push(p.type);
    if (p.cat === 'jewelry' && p.set && p.set !== '—') bits.push(p.set);
    return bits.map(b => `<span>${esc(b)}</span>`).join('');
  }
  const PLURAL = { Ring: 'Rings', Bracelet: 'Bracelets', Necklace: 'Necklaces' };
  const show = v => PLURAL[v] || v;
  const badgeClass = b => (b === 'Rare' || b === 'Limited edition') ? ' badge--rare' : b === 'Reduced' ? ' badge--reduced' : b === 'Sold' ? ' badge--sold' : '';
  const fullName = p => `${p.brand} ${p.model}${p.nick ? ' “' + p.nick + '”' : ''}`;
  const priceText = p => p.sold ? 'Sold' : p.price ? money(p.price) : 'Price on request';

  function card(p, opts = {}) {
    const saved = state.saved.has(p.id);
    const pics = p.thumbs || p.imgs, alt = pics[1]; // a second product angle; on-wrist snapshots stay in the product gallery only
    return `<article class="card${p.sold ? ' card--sold' : ''}" data-id="${p.id}"${opts.note ? ` data-note="${opts.note}"` : ''}>
      <a class="card__media" href="#/piece/${p.id}" tabindex="-1" aria-hidden="true">
        <div class="plate-img${opts.square ? ' plate-img--square' : ''}"><img src="${pics[0]}" alt="" loading="lazy">${alt ? `<img class="card__alt" src="${alt}" alt="" loading="lazy">` : ''}</div>
        <div class="card__badges">${(p.sold ? ['Sold'] : p.badges || []).slice(0, 1).map(b => `<span class="badge${badgeClass(b)}">${esc(b)}</span>`).join('')}</div>
      </a>
      <button class="heart" data-act="save" data-id="${p.id}" aria-pressed="${saved}" aria-label="Save ${esc(fullName(p))}">${ico('heart')}</button>
      <div class="card__body">
        <span class="card__brand">${esc(p.brand)}</span>
        <h3 class="card__model"><a href="#/piece/${p.id}">${esc(p.model)}${p.nick ? ` <span class="card__nick">“${esc(p.nick)}”</span>` : ''}</a></h3>
        <span class="card__meta mono">${metaLine(p)}</span>
        <span class="card__price price">${priceText(p)}${p.was && !p.sold ? `<span class="was">${money(p.was)}</span>` : ''}</span>
      </div>
    </article>`;
  }

  function sectionHead(label, title, tools = '', note = '') {
    return `<div class="section-head"${note ? ` data-note="${note}"` : ''}><div class="section-head__text"><span class="label">${label}</span><h2 class="d-l">${title}</h2></div>${tools ? `<div class="section-head__tools">${tools}</div>` : ''}</div>`;
  }
  const crumbs = items => `<nav class="crumbs" aria-label="Breadcrumb">${items.map((it, i) => (i ? '<span aria-hidden="true">/</span>' : '') + (it[1] ? `<a href="${it[1]}">${esc(it[0])}</a>` : `<span>${esc(it[0])}</span>`)).join('')}</nav>`;

  /* ───────── Booking widget (home band, salon page) ───────── */
  const INTERESTS = ['Watches', 'Jewelry', 'Hermès', 'Sell or trade', 'Sourcing a piece'];
  const TIMES = ['11 am', '12 pm', '1 pm', '2 pm', '3 pm', '4 pm'];
  function weekdays(n) {
    const out = [], d = new Date(); d.setHours(12, 0, 0, 0);
    while (out.length < n) { d.setDate(d.getDate() + 1); const w = d.getDay(); if (w !== 0 && w !== 6) out.push(new Date(d)); }
    return out;
  }
  const dayKey = d => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  const dayLong = key => { const [y, m, dd] = key.split('-').map(Number); return new Date(y, m - 1, dd, 12).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' }); };

  function bookerHTML(mode) { // mode: 'band' (home, dark, starter) | 'full' (salon page, light, with details)
    const b = state.booking, light = mode === 'full';
    if (b.done && light) {
      const piece = b.piece && byId[b.piece];
      return `<div class="booker booker--light" data-note="booker"><div class="booker__done">
        <span class="label label--accent">Request received</span>
        <b>${esc(dayLong(b.day))} at ${esc(b.time)}</b>
        <p style="margin:0">${esc(b.interest)}${piece ? ' · ' + esc(fullName(piece)) : ''}. ${b.name ? esc(b.name.split(' ')[0]) + ', a' : 'A'} specialist will call ${b.phone ? esc(b.phone) : 'you'} to confirm and prepare the pieces before you arrive.</p>
        <button class="text-btn" data-act="bk-reset" style="justify-self:start">Change this request</button>
      </div></div>`;
    }
    const piece = b.piece && byId[b.piece];
    const days = weekdays(6);
    return `<form class="booker${light ? ' booker--light' : ''}" data-form="booking" data-mode="${mode}" data-note="booker">
      <h3>${light ? 'Choose a time' : 'Request a private viewing'}</h3>
      ${piece ? `<div class="booker__piece"><div class="plate-img"><img src="${piece.imgs[0]}" alt=""></div><div><b>${esc(fullName(piece))}</b><span class="mono">${piece.ref ? 'Ref. ' + esc(piece.ref) : esc(piece.line)}</span></div><button type="button" data-act="bk-unpiece">Remove</button></div>` : ''}
      <div class="booker__group"><span class="label">I would like to see</span><div class="booker__chips">${INTERESTS.map(x => `<button type="button" class="chip" data-act="bk-interest" data-v="${esc(x)}" aria-pressed="${b.interest === x}">${esc(x)}</button>`).join('')}</div></div>
      <div class="booker__group"><span class="label">Day</span><div class="days">${days.map(d => { const k = dayKey(d); return `<button type="button" class="day" data-act="bk-day" data-v="${k}" aria-pressed="${b.day === k}"><small>${d.toLocaleDateString('en-US', { weekday: 'short' })}</small><b>${d.getDate()}</b><small>${d.toLocaleDateString('en-US', { month: 'short' })}</small></button>`; }).join('')}</div></div>
      <div class="booker__group"><span class="label">Time</span><div class="times">${TIMES.map(t => `<button type="button" class="time" data-act="bk-time" data-v="${t}" aria-pressed="${b.time === t}">${t}</button>`).join('')}</div></div>
      ${light ? `<div class="field-row">
        <div class="field"><label for="bkName">Name</label><input class="input" id="bkName" data-bk="name" value="${esc(b.name)}" autocomplete="name" placeholder="Your name"></div>
        <div class="field"><label for="bkPhone">Phone</label><input class="input" id="bkPhone" data-bk="phone" value="${esc(b.phone)}" autocomplete="tel" placeholder="(561) 000-0000"></div>
      </div>` : ''}
      <button type="submit" class="btn ${light ? 'btn--salon' : 'btn--light'} btn--block"${b.day && b.time ? '' : ' disabled'}>${light ? 'Request this time' : 'Continue'}</button>
      <p class="booker__fine">${b.day && b.time ? `${esc(dayLong(b.day))} at ${esc(b.time)}. ` : 'Monday to Friday, 11am to 5pm. '}A specialist confirms every request by phone. Prefer to call? ${PHONE}</p>
    </form>`;
  }
  function refreshBookers() { $$('[data-booker]').forEach(slot => { slot.innerHTML = bookerHTML(slot.dataset.booker); }); placePinsSoon(); }

  /* ───────── HOME (image-led) ───────── */
  // Catalogue shots re-staged as still lifes: the white studio ground multiplies into a coloured backdrop.
  const STILL = [
    { href: '#/watches', id: 75624, label: 'Watches', tone: 'sage' },
    { href: '#/jewelry', id: 75450, label: 'Jewelry', tone: 'blush' },
    { href: '#/hermes', id: 75683, label: 'Hermès', tone: 'sand' },
    { href: '#/home-office', id: 72983, label: 'Home & Office', tone: 'mist' }
  ];
  // "Curated pieces" slideshow: one photograph per category, ECJ's own
  const SHOW = [
    { img: 'b-yellow-diamond', href: '#/jewelry/natural-diamonds', pos: '50% 50%', alt: 'A radiant-cut fancy yellow diamond ring with trapezoid side stones' },
    { img: 'b-we-buy-watches', href: '#/watches/daytona', pos: '50% 45%', alt: 'A steel Rolex Cosmograph Daytona presented on a black glove' },
    { img: 'hermes-birkin', href: '#/hermes', pos: '55% 50%', alt: 'A two-tone cream and tan Hermès Birkin with gold hardware, carried in the street' }
  ];
  const JUSTIN = [75624, 75651, 75638, 70101].map(id => byId[id]);
  const FEATURED = byId[75638]; // platinum Daytona, ice-blue dial: its photo fills a double-size frame
  const WORN = [69022, 75142, 70101, 75434, 75441, 75268, 71981, 74573, 75638, 75651].map(id => byId[id]);
  const wornAlt = p => `${fullName(p)} ${p.cat === 'watches' ? 'on the wrist' : 'worn'}`;

  function justinMedia(p) {
    return `<div class="justin__plate"><img class="justin__product" src="${p.imgs[0]}" alt="${esc(fullName(p) + ', ' + p.line)}"></div>`;
  }
  function justinDetail(p) {
    return `<div class="justin__price"><span>${esc(p.brand)} ${esc(p.model)}</span><span class="price">${money(p.price)}</span></div>
      <p>${esc(p.line)}. Reference ${esc(p.ref)}${p.year ? ', ' + p.year : ''}, ${esc(p.set.toLowerCase())}. ${esc(p.note || 'Authenticated by our specialists and covered by the two-year ECJ Luxe warranty.')}</p>
      <a class="btn btn--black" href="#/piece/${p.id}">View piece</a>`;
  }

  // left-aligned section head with a rule: label, title, optional link
  const headL = (label, title, link) => `<div class="head-l"><div><span class="label">${label}</span><h2 class="h2l">${title}</h2></div>${link ? `<a class="link" href="${link[1]}">${link[0]} ${ARROW}</a>` : ''}</div>`;

  function homeHTML() {
    return `
    <section class="hero5" data-note="hero">
      <img class="hero5__img" src="${SRC('hero-daytona-rolesor')}" width="1870" height="2337" alt="A two-tone Rolex Cosmograph Daytona with a white dial, worn with a navy knit sleeve">
      <div class="hero5__veil" aria-hidden="true"></div>
      <div class="hero5__inner">
        <div class="hero5__copy">
          <span class="label hero5__eyebrow">Family owned since 1986 · Boca Raton</span>
          <h1 class="hero5__title">Rare Watches, Jewelry &amp; Hermès, Shown in Private</h1>
          <p class="hero5__sub">Pre-owned and unworn pieces, authenticated in&#8209;house and shown by appointment.</p>
          <div class="hero5__ctas"><a class="btn btn--hero btn--ghost" href="#/new">Shop now</a><a class="btn btn--hero btn--salon" href="#/salon">Book a private viewing</a></div>
        </div>
      </div>
    </section>

    <section class="section2"><div class="wrap" data-note="cats">
      ${headL('The collection', 'ECJ Luxe Inventory', ['View pieces', '#/new'])}
      <div class="cats4">
        ${STILL.map(t => `<a class="cat4 tile--${t.tone}" href="${t.href}">
          <div class="tile__img cat4__img"><img src="${byId[t.id].imgs[0]}" alt="${esc(fullName(byId[t.id]))}" loading="lazy"></div>
          <span class="cat4__name">${esc(t.label)}</span>
          <span class="cat4__go">View pieces ${ARROW}</span>
        </a>`).join('')}
      </div>
    </div></section>

    <section class="founder" data-note="manifesto">
      <div class="founder__media"><img src="${SRC('leather-croc')}" alt="Glossy black alligator leather, close up" loading="lazy"></div>
      <div class="founder__panel">
        <img class="founder__logo" src="${SRC('logo-mono.png')}" alt="ECJ Luxe" width="1269" height="719">
        <p class="founder__text">Forty years of relationships in fine watches and jewelry, now in a private salon in Boca Raton.</p>
        <p class="founder__sub">Rare references, signed jewels and Hermès icons, each authenticated in&#8209;house and shown by appointment at 201-299 Via De Palmas.</p>
        <span class="founder__rule" aria-hidden="true"></span>
        <blockquote class="founder__quote">“Our brand has always been about offering a luxury experience that exceeds expectations.”<cite>Bobby Yampolsky, Founder</cite></blockquote>
        <a class="btn founder__btn" href="#/watches">Explore the collection</a>
      </div>
    </section>

    <section class="section2"><div class="wrap editorial2" data-note="editorial">
      <div class="show" id="show" role="region" aria-roledescription="carousel" aria-label="Curated pieces">
        <div class="show__stage">
          ${SHOW.map((x, i) => `<a class="show__slide${i ? '' : ' is-on'}" href="${x.href}" aria-hidden="${i ? 'true' : 'false'}" tabindex="${i ? -1 : 0}"><img src="${SRC(x.img)}" alt="${esc(x.alt)}" style="object-position:${x.pos}" loading="lazy"></a>`).join('')}
          <button class="show__arrow show__arrow--prev" data-act="show-step" data-dir="-1" aria-label="Previous photograph">${ARROW}</button>
          <button class="show__arrow show__arrow--next" data-act="show-step" data-dir="1" aria-label="Next photograph">${ARROW}</button>
        </div>
        <div class="show__bar">
          <div class="show__dots">${SHOW.map((x, i) => `<button class="show__dot${i ? '' : ' is-on'}" data-act="show" data-i="${i}" aria-label="Photograph ${i + 1} of ${SHOW.length}"${i ? '' : ' aria-current="true"'}><i></i></button>`).join('')}</div>
        </div>
      </div>
      <div class="editorial__side">
        <h2 class="h2c">Curated Pieces</h2>
        <p class="sub">Chosen carefully by the ECJ Luxe team</p>
        <a class="btn btn--outline" href="#/new">Shop now</a>
      </div>
    </div></section>

    <section class="section2 section2--ruled justin" data-note="justin"><div class="wrap justin__grid">
      <div class="justin__copy">
        <svg class="justin__badge" viewBox="0 0 120 120" aria-hidden="true"><text font-size="10.5" letter-spacing="3" fill="currentColor"><textPath href="#seal-ring" textLength="268" lengthAdjust="spacing">JUST IN · JUST IN · JUST IN ·</textPath></text></svg>
        <ol class="justin__list">${JUSTIN.map((p, i) => `<li><button data-act="justin" data-i="${i}" aria-pressed="${i === 0}">The ${esc(p.brand)} ${esc(p.model)}</button></li>`).join('')}</ol>
        <div class="justin__detail" id="justinDetail">${justinDetail(JUSTIN[0])}</div>
      </div>
      <a class="justin__media" id="justinMedia" href="#/piece/${JUSTIN[0].id}">${justinMedia(JUSTIN[0])}</a>
    </div></section>

    <section class="section2 section2--ruled"><div class="wrap">
      ${headL('Just arrived', 'Latest', ['View all new arrivals', '#/new'])}
      <div class="grid grid--4 grid--home">${[FEATURED].concat(available().filter(p => p !== FEATURED).slice(0, 8)).map((p, i) => card(p, { note: i === 0 ? 'card' : '' })).join('')}</div>
    </div></section>

    <section class="section2 worn" data-note="worn"><div class="wrap">
      ${headL('In the salon', 'Shop Handbags', null)}
      <div class="diptych">
        <a class="diptych__item" href="#/hermes/kelly"><img src="${SRC('b-we-buy-handbags')}" alt="A green Hermès Kelly carried with a yellow gold Rolex Day-Date and a fancy yellow diamond ring" loading="lazy"><span class="diptych__cap"><b>Hermès Kelly, Rolex Day-Date</b><span>Shop Kelly</span></span></a>
        <a class="diptych__item" href="#/hermes/birkin"><img src="${SRC('homepage-accessories')}" alt="An orange Hermès Birkin with gold hardware, carried by hand" loading="lazy"><span class="diptych__cap"><b>Hermès Birkin</b><span>Shop Birkin</span></span></a>
      </div>
    </div></section>

    <section class="quote2" data-note="quotes"><div class="wrap quote2__inner">
      <span class="quote2__rule" aria-hidden="true"></span>
      <div><blockquote>“Beautiful inventory and endless selections. If you want it, they can get it!”</blockquote><cite>Philip Mimmo, client</cite></div>
    </div></section>

    <section class="section2"><div class="wrap">
      ${headL('By appointment', 'Visit, Sell, or Have Us Find It', null)}
      <div class="svc" data-note="services">
        <article class="svc__item svc__item--lead">
          <a class="svc__img" href="#/salon" tabindex="-1" aria-hidden="true"><img src="${SRC('b-rolex-display')}" alt="" loading="lazy"></a>
          <div class="svc__text">
            <span class="label">By appointment</span>
            <h3><a href="#/salon">The Salon</a></h3>
            <p>A private showroom at 201-299 Via De Palmas, Boca Raton. Tell us what you would like to see, and it will be ready when you arrive.</p>
            <a class="link" href="#/salon">Book a private viewing ${ARROW}</a>
          </div>
        </article>
        <article class="svc__item">
          <a class="svc__img" href="#/sell" tabindex="-1" aria-hidden="true"><img src="${SRC('b-we-buy-watches')}" alt="" loading="lazy"></a>
          <div class="svc__text">
            <span class="label">Watches · Hermès · Diamonds</span>
            <h3><a href="#/sell">Sell or Trade</a></h3>
            <p>Send a few photos and a specialist will reply within the next business day.</p>
            <a class="link" href="#/sell">Start an offer ${ARROW}</a>
          </div>
        </article>
        <article class="svc__item">
          <a class="svc__img" href="#/salon" data-act="source" tabindex="-1" aria-hidden="true"><img src="${SRC('jewelry-banner')}" alt="" loading="lazy"></a>
          <div class="svc__text">
            <span class="label">The hard-to-find</span>
            <h3><a href="#/salon" data-act="source">Sourcing</a></h3>
            <p>Tell us the reference, the size or the stone, and we will look for it.</p>
            <a class="link" href="#/salon" data-act="source">Ask us to find it ${ARROW}</a>
          </div>
        </article>
      </div>
    </div></section>`;
  }

  function brandOptions(category, current) {
    const lists = {
      'Watch': ['Rolex', 'Patek Philippe', 'Audemars Piguet', 'Cartier', 'Richard Mille', 'Omega', 'Panerai', 'Other'],
      'Hermès bag': ['Birkin', 'Kelly', 'Kelly Pochette', 'Constance', 'Picotin', 'Evelyne', 'Other'],
      'Jewelry': ['Van Cleef & Arpels', 'Cartier', 'Tiffany & Co.', 'Bulgari', 'Hermès', 'Natural diamonds (unsigned)', 'Other']
    };
    return `<option value="">Choose…</option>` + (lists[category] || []).map(b => `<option${b === current ? ' selected' : ''}>${esc(b)}</option>`).join('');
  }

  /* ───────── COLLECTION ───────── */
  const BANNERS = {
    watches: ['b-timepieces', 'A Rolex on dark textured leather'],
    jewelry: ['b-jewelry', 'A diamond bracelet worn among tropical leaves'],
    hermes: ['b-handbags', 'An Hermès bag on a wooden surface'],
    'home-office': ['b-vault', 'A Buben & Zorweg safe and watch-winder cabinet'],
    new: ['b-rolex-display', 'Rolex watches on a glass display']
  };
  const PAGE = 48;
  const coll = { cat: null, base: [], f: {}, sort: 'new', limit: PAGE, sig: '' };

  function collectionHTML(cat, sl) {
    const cfg = CATS[cat];
    let base, title = cfg.title, intro = cfg.intro, trail = [['Home', '#/'], [cfg.title]];
    if (cat === 'maison') {
      base = P.filter(p => slug(p.brand) === sl);
      title = base[0] ? base[0].brand : 'Maison';
      intro = `Every ${title} piece we have offered, across watches, jewelry and accessories. Available pieces come first.`;
      trail = [['Home', '#/'], ['Maisons', '#/'], [title]];
    } else if (cat === 'saved') base = P.filter(p => state.saved.has(p.id));
    else if (cat === 'new') base = available().filter(p => p.isNew || !p.remote);
    else base = P.filter(p => p.cat === cat);

    coll.cat = cat; coll.base = base; coll.sort = 'new'; coll.f = {};
    cfg.facets.forEach(k => { coll.f[k] = new Set(); });
    const subtitle = sl && cat !== 'maison' ? applySlug(sl, base) : '';
    if (subtitle) trail = [['Home', '#/'], [cfg.title, '#/' + cat], [subtitle]];

    const chipKey = cfg.chips;
    const chipVals = chipKey ? optionsFor(chipKey, base).map(o => o.v).slice(0, 9) : [];
    const banner = BANNERS[cat];
    return `
    ${banner ? `<section class="cbanner" data-note="banner"><img src="${SRC(banner[0])}" alt="${esc(banner[1])}"><span class="cbanner__shade" aria-hidden="true"></span>
      <div class="wrap cbanner__text">${crumbs(trail)}<h1 class="cbanner__title">${esc(subtitle || title)}</h1><p>${esc(intro)}</p></div></section>`
    : `<div class="wrap"><div class="page-head">
      <div class="page-head__text">${crumbs(trail)}<h1 class="d-xl">${esc(subtitle || title)}</h1><p class="lede">${esc(intro)}</p></div>
      <div class="page-head__aside"><span class="label">Need help choosing?</span><a class="link" href="#/salon">Book a private viewing ${ARROW}</a></div>
    </div></div>`}
    <div class="toolbar" data-note="toolbar"><div class="wrap">
      <div class="toolbar__left">
        ${cfg.facets.length ? '<button class="chip filter-btn" data-act="filters">Filters</button>' : ''}
        ${chipKey ? `<button class="chip" data-act="chip-all" aria-pressed="true">All</button>` + chipVals.map(v => `<button class="chip" data-act="chip" data-k="${chipKey}" data-v="${esc(v)}" aria-pressed="false">${esc(show(v))}</button>`).join('') : ''}
      </div>
      <div class="toolbar__right">
        <label class="sr" for="sortSel">Sort</label>
        <select class="sort" id="sortSel"><option value="new">Newest first</option><option value="low">Price, low to high</option><option value="high">Price, high to low</option></select>
      </div>
    </div></div>
    <div class="wrap collection${cfg.facets.length ? '' : ' collection--full'}">
      <aside class="filters" id="filters" aria-label="Filters" data-note="filters"></aside>
      <div style="min-width:0">
        <div class="active-filters" id="activeFilters" hidden></div>
        <div class="grid" id="grid"></div>
        <div class="grid-more" id="gridMore"></div>
        ${cat !== 'saved' && cat !== 'home-office' ? `
        <div class="source-band" data-note="source">
          <div><blockquote>“I got two of my favorite AP watches from Bobby. They are hard to get and Bobby was able to get them!”<cite>Nicole Cha, client</cite></blockquote></div>
          <div class="source-band__cta"><span class="label">Sourcing</span><p style="margin:0;color:var(--ink-2)">Looking for a reference, a size or a colour we don’t have today? Tell us and we will look for it.</p><button class="btn btn--salon" data-act="source">Ask us to find it</button></div>
        </div>` : ''}
      </div>
    </div>`;
  }

  function applySlug(sl, base) {
    if (SPECIAL[sl]) { const [k, v] = SPECIAL[sl]; (coll.f[k] = coll.f[k] || new Set()).add(v); return SPECIAL_TITLE[sl]; }
    for (const k of ['brand', 'family', 'type', 'metal', 'cond']) {
      const v = [...new Set(base.map(p => FACETS[k].get(p)))].find(x => x && slug(x) === sl);
      if (v) {
        const key = k === 'metal' && coll.f.hardware ? 'hardware' : k;
        (coll.f[key] = coll.f[key] || new Set()).add(v);
        return key === 'hardware' ? v + ' hardware' : k === 'type' ? ({ Ring: 'Rings', Bracelet: 'Bracelets', Necklace: 'Necklaces' }[v] || v) : v;
      }
    }
    return '';
  }
  function passes(p, except) {
    return Object.entries(coll.f).every(([k, set]) => k === except || !set.size || set.has(FACETS[k].get(p)));
  }
  function optionsFor(k, items) {
    const counts = new Map();
    items.forEach(p => { const v = FACETS[k].get(p); if (v) counts.set(v, (counts.get(v) || 0) + 1); });
    let opts = [...counts].map(([v, n]) => ({ v, n }));
    if (FACETS[k].order) opts.sort((a, b) => FACETS[k].order.indexOf(a.v) - FACETS[k].order.indexOf(b.v));
    else opts.sort((a, b) => b.n - a.n || a.v.localeCompare(b.v));
    return opts;
  }
  function filtersHTML() {
    const cfg = CATS[coll.cat];
    if (!cfg.facets.length) return '';
    return cfg.facets.map(k => {
      const pool = coll.base.filter(p => passes(p, k));
      const all = optionsFor(k, coll.base);
      if (all.length < 2 && !coll.f[k].size) return '';
      const live = new Map(optionsFor(k, pool).map(o => [o.v, o.n]));
      return `<div class="fgroup"><h4 class="label">${FACETS[k].label}</h4><ul>${all.map(o => {
        const n = live.get(o.v) || 0, on = coll.f[k].has(o.v);
        return `<li><label class="fopt${n || on ? '' : ' is-empty'}"><input type="checkbox" data-facet="${k}" value="${esc(o.v)}"${on ? ' checked' : ''}>${esc(show(o.v))}</label></li>`;
      }).join('')}</ul></div>`;
    }).join('');
  }
  function sorted(items) { // available pieces always lead; prices on request sort last
    const s = coll.sort, pr = (p, hi) => p.price || (hi ? -1 : Infinity);
    return items.slice().sort((a, b) => (a.sold - b.sold) || (s === 'low' ? pr(a) - pr(b) : s === 'high' ? pr(b, 1) - pr(a, 1) : b.id - a.id));
  }
  function renderResults() {
    const grid = $('#grid'); if (!grid) return;
    const items = sorted(coll.base.filter(p => passes(p)));
    const sig = JSON.stringify([coll.cat, coll.sort, Object.entries(coll.f).map(([k, set]) => [k, [...set]])]);
    if (sig !== coll.sig) { coll.sig = sig; coll.limit = PAGE; }
    const promo = PROMOS[coll.cat];
    let cards = items.slice(0, coll.limit).map((p, i) => card(p, { note: i === 0 ? 'card' : '' }));
    if (promo && items.length >= 4) {
      const at = Math.min(4, cards.length);
      cards.splice(at, 0, `<a class="promo-tile" href="${promo.href}" data-act="promo" data-cat="${esc(promo.cat || '')}" data-interest="${esc(promo.interest || '')}" data-note="promo"><span class="label">${promo.label}</span><div style="display:grid;gap:14px"><h3>${promo.h}</h3><p>${promo.p}</p></div><span class="link" style="align-self:flex-start">${promo.cta} ${ARROW}</span></a>`);
    }
    const more = $('#gridMore');
    if (more) more.innerHTML = items.length > coll.limit ? `<button class="btn btn--ghost" data-act="more">Show more pieces</button>` : '';
    grid.innerHTML = items.length ? cards.join('') : coll.cat === 'saved'
      ? `<div class="empty"><h3 class="d-s">Nothing saved yet</h3><p>Tap the heart on any piece to keep it here. Saved pieces can be prepared for your private viewing.</p><a class="btn" href="#/new">Browse new arrivals</a></div>`
      : `<div class="empty"><h3 class="d-s">No pieces match these filters</h3><p>Clear a filter, or ask us to source the piece. We find hard-to-get references for clients every week.</p><div style="display:flex;gap:10px;flex-wrap:wrap;justify-content:center"><button class="btn btn--ghost" data-act="clear">Clear filters</button><button class="btn btn--salon" data-act="source">Ask us to find it</button></div></div>`;
    const html = filtersHTML();
    $('#filters').innerHTML = html;
    const fd = $('#filterDrawerBody'); if (fd) fd.innerHTML = html || '<p>No filters for this page.</p>';
    const fa = $('#filterApply'); if (fa) fa.textContent = 'Show pieces';
    const act = $('#activeFilters');
    const chips = [];
    Object.entries(coll.f).forEach(([k, set]) => set.forEach(v => chips.push(`<button class="chip is-on" data-act="unfilter" data-k="${k}" data-v="${esc(v)}">${esc(v)} <span aria-hidden="true">×</span><span class="sr">Remove filter</span></button>`)));
    act.hidden = !chips.length;
    act.innerHTML = chips.join('') + (chips.length > 1 ? `<button class="text-btn" data-act="clear">Clear all</button>` : '');
    const ck = CATS[coll.cat].chips;
    if (ck) {
      $$('[data-act="chip"]').forEach(b => b.setAttribute('aria-pressed', String(coll.f[ck].has(b.dataset.v))));
      const allBtn = $('[data-act="chip-all"]'); if (allBtn) allBtn.setAttribute('aria-pressed', String(!coll.f[ck].size));
    }
    placePinsSoon();
  }

  /* ───────── PRODUCT ───────── */
  function pieceHTML(p) {
    const gal = p.imgs.concat(p.life ? [p.life] : []);
    const saved = state.saved.has(p.id), high = p.price >= 50000 || !p.price;
    const catHref = '#/' + p.cat;
    const trail = [['Home', '#/'], [CAT_NAME[p.cat], catHref]];
    if (p.cat === 'watches' || p.cat === 'jewelry') trail.push([p.brand, '#/' + p.cat + '/' + slug(p.brand)]);
    trail.push([p.model]);
    const tags = [p.cond, p.set && p.set !== '—' ? p.set : null, p.size, p.cat === 'hermes' ? (p.metal ? p.metal + ' hardware' : null) : p.metal, p.type].filter(Boolean);
    const related = available().filter(q => q.id !== p.id && q.cat === p.cat).sort((a, b) => (b.brand === p.brand) - (a.brand === p.brand) || Math.abs(a.price - p.price) - Math.abs(b.price - p.price)).slice(0, 4);
    const refLine = p.ref ? `<span>Ref. <b>${esc(p.ref)}</b></span>${p.year ? `<span>Year <b>${p.year}</b></span>` : `<span>Year <b>on request</b></span>`}`
      : p.stamp ? `<span>Stamp <b>${esc(p.stamp)}</b></span><span>Size <b>${esc(p.size)}</b></span>` : `<span>${esc(p.type || '')}</span>`;
    const viewing = `<button class="btn btn--salon btn--block" data-act="book-piece" data-id="${p.id}">Book a private viewing</button>`;
    const bagRow = `<div class="buy__ctas-row"><button class="btn${high ? ' btn--ghost' : ''}" data-act="add" data-id="${p.id}">Add to bag</button><button class="btn btn--ghost" data-act="save" data-id="${p.id}" aria-pressed="${saved}" aria-label="Save this piece">${ico('heart')}</button></div>`;
    const assure = [
      ['shield', 'Authenticated by ECJ Luxe', 'Inspected by our specialists before it was offered.'],
      p.cat === 'watches' ? ['watch', 'Two-year ECJ Luxe warranty', 'Covers the movement against defects. Normal wear is not included.'] : ['chat', 'A specialist on call', 'Ask about sizing, condition or wear by text or phone.'],
      ['exchange', 'Seven-day exchange', 'Unworn, in original packaging, with your receipt. International sales are final.']
    ];
    return `
    <div class="wrap" style="padding-top:24px">${crumbs(trail)}</div>
    <div class="wrap pdp">
      <div class="gallery" data-note="gallery" style="${gal.length > 1 ? '' : 'grid-template-columns:minmax(0,1fr)'}">
        ${gal.length > 1 ? `<div class="gallery__thumbs">${gal.map((src, i) => { const life = src === p.life; return `<button class="gallery__thumb${life ? ' no-blend' : ''}" data-act="thumb" data-src="${src}" data-life="${life ? 1 : 0}" aria-current="${i === 0}" aria-label="${life ? 'Worn' : 'Image ' + (i + 1)}"><img src="${src}" alt=""></button>`; }).join('')}</div>` : ''}
        <div class="gallery__main" id="galleryMain"><img src="${p.imgs[0]}" alt="${esc(fullName(p) + (p.line ? ', ' + p.line : ''))}"><svg class="seal seal--gallery" role="img" aria-label="Authenticated by ECJ Luxe"><use href="#ecj-seal"/></svg><span class="gallery__hint">${FINE ? 'Hover to zoom' : ''}</span></div>
      </div>
      <div class="buy">
        <div style="display:grid;gap:16px" data-note="ref">
          <div style="display:flex;gap:10px;align-items:center;flex-wrap:wrap"><span class="card__brand">${esc(p.brand)}</span>${(p.badges || []).filter(b => b !== 'Sold').map(b => `<span class="badge${badgeClass(b)}" style="background:var(--plate)">${esc(b)}</span>`).join('')}</div>
          <h1 class="buy__title">${esc(p.model)}${p.nick ? ` <em>“${esc(p.nick)}”</em>` : ''}</h1>
          <p class="buy__line">${esc(p.line)}</p>
          <div class="buy__ref mono">${refLine}</div>
        </div>
        <div class="buy__price"><span class="price">${priceText(p)}</span>${p.was && !p.sold ? `<span class="was">${money(p.was)}</span>` : ''}<small>${p.sold ? 'This piece has found a home. We can look for another like it.' : p.cat === 'watches' || p.cat === 'hermes' ? 'Trade-in credit accepted' : 'Prices in US dollars'}</small></div>
        <div class="tags">${tags.map(t => `<span class="tag">${esc(t)}</span>`).join('')}</div>
        <div class="buy__ctas" data-note="ctas">${p.sold ? `<button class="btn btn--salon btn--block" data-act="source">Ask us to find one like it</button>` : high ? viewing + bagRow : bagRow + viewing}</div>
        <div class="buy__ask"><span>Questions about this piece?</span><span><a href="sms:+15613535216">Text a specialist</a> · <a href="tel:+15613535216">${PHONE}</a></span></div>
        ${p.sold || !p.price ? '' : `<div class="trade-card" data-note="trade"><div><b>Trade in toward this piece</b><p>Your watch, bag or jewelry can count toward the ${money(p.price)}.</p></div><a class="link" href="#/sell" data-act="trade-for" data-id="${p.id}">Start ${ARROW}</a></div>`}
        <ul class="assure" style="list-style:none;margin:0;padding:0" data-note="assure">${assure.map(([i, b, t]) => `<li>${ico(i).replace('class="i"', 'class="i" viewBox="0 0 32 32"')}<div><b>${b}</b>${t}</div></li>`).join('')}</ul>
        <div class="acc" data-note="specs">
          ${p.specs.length ? `<details open><summary>The details<i></i></summary><div class="acc__body"><table class="specs"><tbody>${p.specs.map(([k, v]) => `<tr><th scope="row">${esc(k)}</th><td>${esc(v)}</td></tr>`).join('')}</tbody></table></div></details>` : ''}
          ${p.note ? `<details${p.remote ? ' open' : ''}><summary>${p.remote ? 'About this piece' : 'Condition report'}<i></i></summary><div class="acc__body"><p class="note">${esc(p.note)}</p></div></details>` : ''}
          <details><summary>Shipping, payment &amp; exchange<i></i></summary><div class="acc__body"><table class="specs"><tbody>
            <tr><th scope="row">Domestic</th><td>Ships overnight. Or collect it at the salon by appointment.</td></tr>
            <tr><th scope="row">International</th><td>Paid by wire transfer in US dollars. Import duties are paid by the recipient. International sales are final.</td></tr>
            <tr><th scope="row">Exchange</th><td>Within 7 days with your receipt, unworn and in original packaging. Special orders and custom pieces are final sale.</td></tr>
          </tbody></table></div></details>
        </div>
      </div>
    </div>
    ${related.length ? `<section class="section section--plate"><div class="wrap">${sectionHead('From the same case', 'You may also consider', `<a class="link" href="${catHref}">All ${esc(CAT_NAME[p.cat].toLowerCase())} ${ARROW}</a>`)}<div class="grid grid--4">${related.map(q => card(q)).join('')}</div></div></section>` : ''}
    <div class="mobile-buy"><div><span class="card__brand">${esc(p.brand)}</span><div class="price">${priceText(p)}</div></div>${p.sold ? `<button class="btn btn--salon" data-act="source">Find one like it</button>` : `<button class="btn btn--salon" data-act="book-piece" data-id="${p.id}">Book a viewing</button>`}</div>`;
  }

  /* ───────── SELL ───────── */
  const SELL_STEPS = ['Goal', 'The piece', 'Condition', 'Photos', 'Your details', 'Review'];
  const INCLUDED = {
    'Watch': ['Original box', 'Papers or warranty card', 'Original receipt', 'Service records'],
    'Hermès bag': ['Box', 'Dust bag', 'Clochette, lock and keys', 'Receipt'],
    'Jewelry': ['Box or pouch', 'Certificate or papers', 'Original receipt', 'Appraisal']
  };
  const SHOTS = { 'Watch': ['Dial', 'Caseback', 'Box & papers'], 'Hermès bag': ['Front', 'Date stamp', 'Hardware'], 'Jewelry': ['Front', 'Signature or hallmark', 'Papers'] };

  function sellHTML() {
    return `
    <div class="wrap"><div class="sell-hero">
      <div class="page-head__text">${crumbs([['Home', '#/'], ['Sell & Trade']])}
        <span class="label label--accent">Sell · Trade · Consign</span>
        <h1 class="d-xl">Sell, Trade or Consign with a Dealer You Can Visit</h1>
        <p class="lede">We buy Swiss watches, natural diamonds and Hermès handbags outright, credit them toward something new, or sell them for you to clients around the world.</p>
      </div>
      <div class="aside-card" style="position:static">
        <span class="label">Market note</span>
        <p class="market-note">Watch prices can move week to week, so every offer is based on today’s market. Unworn Hermès from the last three years commands the highest premiums.</p>
      </div>
    </div></div>
    <div class="wrap"><div class="ways" data-note="ways">
      <div class="way"><span class="mono" style="color:var(--accent)">Sell</span><h3>Paid outright</h3><p>A specialist makes an offer from your photos and confirms it when we see the piece in person.</p></div>
      <div class="way"><span class="mono" style="color:var(--accent)">Trade</span><h3>Credit toward something new</h3><p>Use the value of your piece toward any watch, bag or jewel in the collection, online or in the salon.</p></div>
      <div class="way"><span class="mono" style="color:var(--accent)">Consign</span><h3>We sell it for you</h3><p>Your piece is offered to our clients worldwide. You are paid when it sells.</p></div>
    </div></div>
    <section class="section" id="sellFlow"><div class="wrap flow">
      <div id="flowMain"></div>
      <aside class="aside-card" data-note="aside">
        <h4 class="label">What helps us offer more</h4>
        <ul><li>Original box and papers or warranty card</li><li>Receipts and appraisals</li><li>Service records for watches</li><li>Dust bag, clochette, lock and keys for Hermès</li></ul>
        <hr>
        <p>Bring your piece to the salon or ship it to our Boca Raton office. We verify authenticity before any payment.</p>
        <hr>
        <p><b style="color:var(--ink);font-weight:500">Prefer to talk?</b><br>${PHONE} · info@ecjluxe.com<br>Monday–Friday, 11am–5pm</p>
      </aside>
    </div></section>`;
  }

  function flowHTML() {
    const s = state.sell;
    if (s.done) {
      return `<div class="success" data-note="stepper">
        <div class="success__mark">${ico('check')}</div>
        <h3 class="d-m">Thank you${s.name ? ', ' + esc(s.name.split(' ')[0]) : ''}.</h3>
        <p class="lede">Your ${esc(s.goal.toLowerCase())} request for ${esc([s.brand, s.model].filter(Boolean).join(' ') || 'your piece')} is with our specialists.</p>
        <div class="timeline" style="border-top-color:var(--rule)">
          <div><span class="mono">Today</span><h3>We review it</h3><p>Your photos are checked against current market prices.</p></div>
          <div><span class="mono">Next</span><h3>We call you</h3><p>A specialist contacts you by ${esc(s.prefer.toLowerCase())} with a preliminary offer.</p></div>
          <div><span class="mono">Then</span><h3>We meet the piece</h3><p>Bring it to the salon or ship it to our office. We confirm authenticity in person.</p></div>
        </div>
        <div><button class="btn btn--ghost" data-act="sell-new">Start another</button></div>
      </div>`;
    }
    const toward = s.toward && byId[s.toward];
    const stepper = `<div class="stepper" data-note="stepper">${SELL_STEPS.map((n, i) => `<button data-act="sell-step" data-i="${i}" class="${i < s.step ? 'is-done' : ''}" ${i === s.step ? 'aria-current="step"' : ''}${i > s.step ? ' disabled' : ''}><span class="mono">${String(i + 1).padStart(2, '0')}</span>${n}</button>`).join('')}</div>`;
    let body = '';
    const isW = s.category === 'Watch', isH = s.category === 'Hermès bag';
    if (s.step === 0) {
      body = `<h3>What would you like to do?</h3>
        <div class="seg" role="group" aria-label="Goal">${['Sell', 'Trade', 'Consign'].map(g => `<button type="button" data-act="sell-goal" data-v="${g}" aria-pressed="${s.goal === g}">${g}</button>`).join('')}</div>
        ${toward ? `<div class="booker__piece" style="background:var(--plate)"><div class="plate-img"><img src="${toward.imgs[0]}" alt=""></div><div><b>Toward ${esc(fullName(toward))}</b><span class="mono">${money(toward.price)}</span></div><button type="button" data-act="sell-untoward">Remove</button></div>` : ''}
        <div class="choice-grid">${[['Watch', 'Rolex, Patek Philippe, Audemars Piguet, Cartier and other Swiss maisons.'], ['Hermès bag', 'Birkin, Kelly, Constance and other Hermès leather goods.'], ['Jewelry', 'Signed pieces and natural diamonds, loose or set.']].map(([c, t]) => `<button type="button" class="choice" data-act="sell-cat" data-v="${c}" aria-pressed="${s.category === c}"><b>${c}</b><span>${t}</span></button>`).join('')}</div>`;
    } else if (s.step === 1) {
      body = `<h3>Tell us about the piece</h3>
        <div class="field-row">
          <div class="field"><label for="sfBrand">${isH ? 'Model' : 'Maison'}</label><select class="select" id="sfBrand" data-sell="brand">${brandOptions(s.category, s.brand)}</select></div>
          <div class="field"><label for="sfModel">${isW ? 'Model' : isH ? 'Size, leather and colour' : 'Description'}</label><input class="input" id="sfModel" data-sell="model" value="${esc(s.model)}" placeholder="${isW ? 'e.g. Submariner Date' : isH ? 'e.g. 25, Togo, Noir' : 'e.g. Alhambra bracelet, 5 motifs'}"></div>
        </div>
        <div class="field-row">
          <div class="field"><label for="sfRef">${isW ? 'Reference number' : isH ? 'Date stamp' : 'Metal and stones'}</label><input class="input mono" id="sfRef" data-sell="ref" value="${esc(s.ref)}" placeholder="${isW ? 'e.g. 126610LV' : isH ? 'e.g. U, 2022' : 'e.g. 18k yellow gold, malachite'}"></div>
          <div class="field"><label for="sfYear">${isW ? 'Year on papers' : 'Year purchased'}</label><input class="input" id="sfYear" data-sell="year" value="${esc(s.year)}" inputmode="numeric" placeholder="e.g. 2021"></div>
        </div>`;
    } else if (s.step === 2) {
      body = `<h3>Condition and what’s included</h3>
        <div class="choice-grid choice-grid--4">${[['Unworn', 'Stickers or protective film still on.'], ['Excellent', 'Worn lightly, no visible marks.'], ['Light wear', 'Fine hairlines from normal use.'], ['Visible wear', 'Scratches, dents or scuffs.']].map(([c, t]) => `<button type="button" class="choice" data-act="sell-cond" data-v="${c}" aria-pressed="${s.cond === c}"><b style="font-size:19px">${c}</b><span>${t}</span></button>`).join('')}</div>
        <div class="field"><span>Included with the piece</span><div class="checks">${INCLUDED[s.category].map((x, i) => `<label class="check"><input type="checkbox" data-incl="${esc(x)}" id="inc${i}"${s.incl.includes(x) ? ' checked' : ''}>${esc(x)}</label>`).join('')}</div></div>`;
    } else if (s.step === 3) {
      const shots = SHOTS[s.category];
      body = `<h3>Add a few photos</h3>
        <label class="drop" id="drop" for="sfPhotos">${ico('camera').replace('class="i"', 'class="i" viewBox="0 0 32 32"')}<b style="font-weight:500">Drop photos here or choose files</b><p>Natural light works best. Include the ${shots.map(x => x.toLowerCase()).join(', ')}.</p></label>
        <input type="file" id="sfPhotos" accept="image/*" multiple class="sr">
        <div class="shots">${shots.map((label, i) => `<div class="shot">${s.photos[i] ? `<img src="${s.photos[i]}" alt="${esc(label)}">` : esc(label)}</div>`).join('')}</div>`;
    } else if (s.step === 4) {
      body = `<h3>How can we reach you?</h3>
        <div class="field-row">
          <div class="field"><label for="sfName">Name</label><input class="input" id="sfName" data-sell="name" value="${esc(s.name)}" autocomplete="name"></div>
          <div class="field"><label for="sfPhone">Phone</label><input class="input" id="sfPhone" data-sell="phone" value="${esc(s.phone)}" autocomplete="tel"></div>
        </div>
        <div class="field"><label for="sfEmail">Email</label><input class="input" id="sfEmail" type="email" data-sell="email" value="${esc(s.email)}" autocomplete="email"></div>
        <div class="field"><span>Best way to reach you</span><div class="booker__chips">${['Phone', 'Text', 'Email'].map(x => `<button type="button" class="chip" data-act="sell-prefer" data-v="${x}" aria-pressed="${s.prefer === x}">${x}</button>`).join('')}</div></div>
        <div class="field"><label for="sfNotes">Anything else we should know?</label><textarea class="textarea" id="sfNotes" data-sell="notes" placeholder="Service history, the price you have in mind, the piece you would like to trade toward…">${esc(s.notes)}</textarea></div>`;
    } else {
      const rows = [['Request', s.goal + (toward ? ' toward ' + fullName(toward) : '')], ['Category', s.category], [isH ? 'Model' : 'Maison', s.brand || '—'], [isW ? 'Model' : 'Description', s.model || '—'], [isW ? 'Reference' : isH ? 'Date stamp' : 'Metal & stones', s.ref || '—'], ['Year', s.year || '—'], ['Condition', s.cond || '—'], ['Included', s.incl.join(', ') || '—'], ['Photos', s.photos.length ? s.photos.length + ' added' : 'None yet, you can send them later'], ['Contact', [s.name, s.phone, s.email].filter(Boolean).join(' · ') || '—']];
      body = `<h3>Review your request</h3><dl class="review" style="margin:0">${rows.map(([k, v]) => `<div><dt>${esc(k)}</dt><dd>${esc(v)}</dd></div>`).join('')}</dl>`;
    }
    const last = s.step === SELL_STEPS.length - 1;
    return `<div class="flow__top"><span class="label">Step ${s.step + 1} of ${SELL_STEPS.length}</span><button class="text-btn" data-act="sell-example">Try it with an example</button></div>
      ${stepper}
      <form class="flow__panel" data-form="sell-flow">${body}
        <div class="flow__nav">${s.step ? `<button type="button" class="btn btn--ghost" data-act="sell-prev">Back</button>` : '<span></span>'}<button type="submit" class="btn${last ? ' btn--salon' : ''}">${last ? 'Send to a specialist' : 'Continue'} ${last ? '' : ARROW}</button></div>
      </form>`;
  }
  function renderFlow() { const m = $('#flowMain'); if (m) { m.innerHTML = flowHTML(); bindDrop(); placePinsSoon(); } }
  function bindDrop() {
    const input = $('#sfPhotos'), drop = $('#drop'); if (!input) return;
    const take = files => {
      Array.from(files).filter(f => f.type.startsWith('image/')).slice(0, 3 - state.sell.photos.length).forEach(f => {
        const r = new FileReader(); r.onload = () => { state.sell.photos.push(r.result); renderFlow(); }; r.readAsDataURL(f);
      });
    };
    input.addEventListener('change', () => take(input.files));
    ['dragenter', 'dragover'].forEach(ev => drop.addEventListener(ev, e => { e.preventDefault(); drop.classList.add('is-over'); }));
    ['dragleave', 'drop'].forEach(ev => drop.addEventListener(ev, e => { e.preventDefault(); drop.classList.remove('is-over'); }));
    drop.addEventListener('drop', e => take(e.dataTransfer.files));
  }

  /* ───────── SALON ───────── */
  function salonHTML() {
    return `
    <section class="salon-hero" data-note="salon-hero">
      <div class="salon-hero__copy">
        <nav class="crumbs" aria-label="Breadcrumb"><a href="#/">Home</a><span aria-hidden="true">/</span><span>The salon</span></nav>
        <span class="label">By appointment · Royal Palm Plaza</span>
        <h1 class="d-l">A private showroom for watches, diamonds and Hermès.</h1>
        <p class="lede">After more than eleven years in Mizner Park, ECJ Luxe now receives clients in an appointment-only showroom while plans for a new flagship are finalized. Every visit is prepared around what you want to see.</p>
        <div class="salon-facts">
          <div><span class="label">Address</span>201-299 Via De Palmas<br>Boca Raton, FL 33432</div>
          <div><span class="label">Hours</span>Monday–Friday<br>11am–5pm</div>
          <div><span class="label">Contact</span>${PHONE}<br>info@ecjluxe.com</div>
        </div>
        <div class="hero__ctas"><button class="btn btn--black" data-act="scroll" data-target="#book">Choose a time</button><a class="btn btn--outline" href="https://www.google.com/maps/search/?api=1&amp;query=201-299+Via+De+Palmas+Boca+Raton+FL+33432" target="_blank" rel="noopener">Get directions</a></div>
      </div>
      <div class="salon-hero__media"><img src="${SRC('jewelry-banner')}" alt="Diamond necklace, tennis bracelet and a fancy yellow diamond ring on white leather"></div>
    </section>

    <section class="section" id="book"><div class="wrap visit">
      <div class="visit__copy">
        <span class="label">Plan your visit</span>
        <h2 class="d-l">What to expect</h2>
        <ol class="steps" data-note="timeline">
          <li><div><b>Before you arrive</b><span>Tell us what you would like to see. We prepare pieces in advance, including anything you have saved online.</span></div></li>
          <li><div><b>During your visit</b><span>A private, unhurried viewing with a specialist. Try pieces on, compare references, ask anything.</span></div></li>
          <li><div><b>Bring your own pieces</b><span>We can value a watch, bag or jewel you are thinking of selling or trading at the same visit.</span></div></li>
        </ol>
        ${state.saved.size ? `<div class="trade-card"><div><b>${state.saved.size} saved ${state.saved.size === 1 ? 'piece' : 'pieces'}</b><p>We will have them ready for you.</p></div><a class="link" href="#/saved">View ${ARROW}</a></div>` : ''}
      </div>
      <div data-booker="full">${bookerHTML('full')}</div>
    </div></section>

    <section class="section section--plate" data-note="move"><div class="wrap move">
      <blockquote>“We felt the current environment no longer matched the standard we strive to deliver to our clients.”<cite>Bobby Yampolsky, Founder, on leaving Mizner Park</cite></blockquote>
      <div class="move__text">
        <span class="label">Why we moved</span>
        <p>For eleven years ECJ Luxe was a fixture of Mizner Park. As parking, valet and upkeep there declined, we chose a quieter setting that suits the way our clients like to buy: privately, with time and attention.</p>
        <p>The new showroom continues to show rare timepieces, exceptional diamonds, fine jewelry, handbags, art and curated lifestyle pieces. Plans for a new ECJ Luxe flagship are underway and will be announced soon.</p>
      </div>
    </div></section>

    <section class="section"><div class="wrap care">
      <div style="display:grid;gap:16px;align-content:start"><span class="label">Client care</span><h2 class="d-m">Policies, plainly.</h2></div>
      <div class="acc">
        <details open><summary>Exchange policy<i></i></summary><div class="acc__body"><p>We stand behind everything we sell. With your receipt, pieces can be exchanged within 7 days of purchase if unworn, undamaged and in original packaging. All sales are final after 7 days. Special orders and custom pieces are final sale.</p></div></details>
        <details><summary>International orders<i></i></summary><div class="acc__body"><p>We welcome international clients. Orders are paid by wire transfer in US dollars. Import taxes and duties are paid by the recipient, and international sales are final because of re-import rules.</p></div></details>
        <details><summary>Why buy authorized<i></i></summary><div class="acc__body"><p>New watches bought from an authorized dealer carry the manufacturer’s warranty, come with box and papers, and can be serviced without question. ECJ Luxe is an authorized dealer for Casio G-Shock and a retailer for Buben &amp; Zorweg and Lalique.</p></div></details>
        <details><summary>Accessibility<i></i></summary><div class="acc__body"><p>We want everyone to be able to use this site. If anything is hard to use, call ${PHONE} and a specialist will help you directly.</p></div></details>
      </div>
    </div></section>`;
  }

  /* ───────── ABOUT ───────── */
  function aboutHTML() {
    return `<div class="wrap about">
      ${crumbs([['Home', '#/'], ['About us']])}
      <section class="about__hero">
        <div class="about__hero-text">
          <span class="label">About us</span>
          <h1 class="d-l">Family owned since 1986</h1>
          <p class="lede">ECJ Luxe Collection is South Florida’s destination for luxury timepieces, fine jewelry, Hermès and rare collectibles. Founded by Bobby Yampolsky, the house has spent forty years building relationships with clients, collectors and friends.</p>
        </div>
        <img src="${SRC('b-rolex-display')}" alt="Rolex Submariner and GMT-Master watches on a glass display" loading="lazy">
      </section>

      <section class="about__pillars" aria-label="What we do">
        <div class="about__pillar"><h2>Buy, sell and trade</h2><p>Pre-owned and unworn watches, diamonds, fine jewelry and Hermès. We buy, sell, trade and consign, and a specialist will reply within the next business day.</p></div>
        <div class="about__pillar"><h2>Authenticated in-house</h2><p>Every piece is examined by our specialists before it is offered, and each one comes with the two-year ECJ Luxe warranty.</p></div>
        <div class="about__pillar"><h2>Shown in private</h2><p>Clients are received by appointment at 201-299 Via De Palmas, Boca Raton, and every visit is prepared around what you would like to see.</p></div>
      </section>

      <section class="about__quote">
        <blockquote>“Our brand has always been about offering a luxury experience that exceeds expectations.”<cite>Bobby Yampolsky, Founder</cite></blockquote>
      </section>

      <section class="about__story">
        <div><span class="label">Our story</span><h2 class="d-m">From Mizner Park to a private salon</h2></div>
        <div>
          <p>For more than eleven years ECJ Luxe was a fixture of Mizner Park. The house now receives clients in an appointment-only private showroom, a quieter and more discreet setting that suits the way our clients like to buy: privately, with time and attention.</p>
          <p>The showroom continues to present rare timepieces, exceptional diamonds, fine jewelry, Hermès handbags and curated pieces for the home and office. ECJ Luxe is an authorized dealer for Casio G-Shock and a retailer of Buben &amp; Zörweg and Lalique. Plans for a new ECJ Luxe flagship are underway and will be announced soon.</p>
          <div class="about__cta"><a class="btn" href="#/salon">Book a private viewing</a><span>${PHONE} · info@ecjluxe.com · Monday–Friday, 11am–5pm</span></div>
        </div>
      </section>
    </div>`;
  }

  /* ───────── ACCESSIBILITY ───────── */
  function accessibilityHTML() {
    return `<div class="wrap access">
      ${crumbs([['Home', '#/'], ['Accessibility']])}
      <h1 class="d-l">Accessibility statement</h1>
      <p class="lede">At ECJ Luxe, we are committed to accessibility. It is our policy that everyone, including people with disabilities, has full and equal access to our website and services.</p>
      <div class="acc">
        <details open><summary>Web standards<i></i></summary><div class="acc__body"><p>ECJ Luxe strives to conform to the Web Content Accessibility Guidelines (WCAG) 2.1 at level AA, and to PDF/Universal Accessibility for documents. We work toward compliance with the Americans with Disabilities Act (ADA) through testing, audits and remediation.</p></div></details>
        <details open><summary>Built into this site<i></i></summary><div class="acc__body"><ul>
          <li>Every page can be used with a keyboard alone, with a visible focus outline and a “Skip to content” link.</li>
          <li>Photographs carry text descriptions for screen readers.</li>
          <li>Text colours are chosen to meet WCAG AA contrast against their backgrounds.</li>
          <li>Buttons, menus and forms are labelled for assistive technology.</li>
          <li>Motion is reduced automatically when your device asks for it.</li>
          <li>Pages reflow to a single column at 400% zoom and on phones.</li>
        </ul></div></details>
        <details open><summary>Help and feedback<i></i></summary><div class="acc__body"><p>If anything on this site is hard to use, call 1.833.ECJ.LUXE or ${PHONE}, or email info@ecjluxe.com. A specialist will help you directly and we will fix the problem.</p></div></details>
        <details><summary>Compatibility<i></i></summary><div class="acc__body"><p>This site is built for current versions of Chrome, Safari, Firefox and Edge, and for screen readers such as VoiceOver, NVDA and JAWS.</p></div></details>
        <details><summary>Resources<i></i></summary><div class="acc__body"><p>ADA.gov · Section508.gov · W3.org/WAI</p></div></details>
      </div>
    </div>`;
  }

  /* ───────── Bag, saved, toast ───────── */
  function syncCounts() {
    const bc = $('#bagCount'), sc = $('#savedCount');
    bc.hidden = !state.bag.length; bc.textContent = state.bag.length;
    sc.hidden = !state.saved.size; sc.textContent = state.saved.size;
    store.set('bag', state.bag); store.set('saved', [...state.saved]);
  }
  function renderBag(msg) {
    const items = state.bag.map(id => byId[id]);
    $('#bagBody').innerHTML = items.length ? items.map(p => `<div class="bag-line"><a href="#/piece/${p.id}" class="plate-img"><img src="${p.imgs[0]}" alt=""></a><div><span class="card__brand">${esc(p.brand)}</span><h4>${esc(p.model)}</h4><span class="mono" style="color:var(--ink-3)">${p.ref ? 'Ref. ' + esc(p.ref) : esc(p.line)}</span><div class="price" style="margin-top:6px;font-weight:500">${money(p.price)}</div><button data-act="unbag" data-id="${p.id}">Remove</button></div></div>`).join('')
      : `<div class="empty" style="padding:40px 20px"><p>Your bag is empty.</p><a class="btn" href="#/new">Shop new arrivals</a></div>`;
    const total = items.reduce((a, p) => a + p.price, 0);
    $('#bagFoot').innerHTML = items.length ? `<div class="subtotal"><span>Subtotal</span><b class="price">${money(total)}</b></div>
      ${msg ? `<p style="margin:0;font-size:13.5px;color:var(--ink-2)">${msg}</p>` : `<p style="margin:0;font-size:13px;color:var(--ink-3)">Taxes and overnight shipping are calculated at checkout.</p>`}
      <button class="btn btn--block" data-act="checkout">Checkout</button>
      <button class="btn btn--ghost btn--block" data-act="bag-viewing">See them in the salon first</button>` : '';
  }
  let toastTimer;
  function toast(text) {
    const t = $('#toast'); $('span', t).textContent = text; t.classList.add('is-on');
    clearTimeout(toastTimer); toastTimer = setTimeout(() => t.classList.remove('is-on'), 2600);
  }
  function toggleSave(id) {
    const p = byId[id];
    if (state.saved.has(id)) { state.saved.delete(id); toast('Removed from saved pieces'); }
    else { state.saved.add(id); toast(`Saved: ${p.brand} ${p.model}`); }
    $$(`[data-act="save"][data-id="${id}"]`).forEach(b => b.setAttribute('aria-pressed', String(state.saved.has(id))));
    syncCounts();
    if (state.view === 'collection' && coll.cat === 'saved') { coll.base = P.filter(p => state.saved.has(p.id)); renderResults(); }
  }

  /* ───────── Overlays ───────── */
  const scrim = $('#scrim');
  // The notes drawer sits beside the page without a scrim so pins stay visible.
  function openDrawer(id) {
    closeAll(id === '#notesDrawer');
    if (id !== '#notesDrawer') $('#notesDrawer').classList.remove('is-open');
    $(id).classList.add('is-open');
    if (id !== '#notesDrawer') scrim.classList.add('is-on');
  }
  function closeAll(keepNotes = true) {
    ['#bagDrawer', '#menuDrawer', '#filterDrawer'].forEach(id => $(id).classList.remove('is-open'));
    if (!keepNotes) $('#notesDrawer').classList.remove('is-open');
    $('#search').classList.remove('is-open');
    scrim.classList.remove('is-on');
  }

  /* ───────── Search ───────── */
  const HINTS = ['Daytona', 'Royal Oak', 'Aquanaut', 'Birkin 25', 'Alhambra', '126610LV', 'Kelly'];
  function openSearch() {
    closeAll();
    $('#search').classList.add('is-open');
    $('#searchHints').innerHTML = `<span class="label" style="margin-right:6px">Try</span>` + HINTS.map(h => `<button class="chip" data-act="hint" data-v="${h}">${h}</button>`).join('');
    runSearch($('#searchInput').value);
    setTimeout(() => $('#searchInput').focus(), 60);
  }
  function runSearch(q) {
    const out = $('#searchResults');
    const terms = q.toLowerCase().trim().split(/\s+/).filter(Boolean);
    if (!terms.length) { out.innerHTML = `<div class="search__results">${available().slice(0, 6).map(p => card(p, { line: false, square: true })).join('')}</div>`; return; }
    const hay = p => [p.brand, p.model, p.nick, p.line, p.ref, p.family, p.type, p.metal, CAT_NAME[p.cat], p.stamp].join(' ').toLowerCase();
    const hits = P.filter(p => terms.every(t => hay(p).includes(t)));
    out.innerHTML = hits.length ? `<div class="search__results" style="margin-top:14px">${hits.slice(0, 12).map(p => card(p, { line: false, square: true })).join('')}</div>`
      : `<p class="search__empty">Nothing in the salon matches “${esc(q)}” today. <button class="text-btn" data-act="source">Ask us to source it</button></p>`;
  }

  /* ───────── Design notes ───────── */
  const NOTES = {
    home: [
      { k: 'header', h: 'The official logo, given room', was: 'A small logo wedged between menu items.', now: 'The official ECJ Luxe lockup supplied by the brand anchors a clean white header. When the header condenses on scroll it switches to the official monogram.', ref: 'Cartier and Rolex headers', at: 'tr' },
      { k: 'hero', h: 'A full-width banner', was: 'A slider that took about 8 seconds to load and still showed the Mizner Park store.', now: 'A Rolex Cosmograph Daytona on the wrist, shown large on the right. The dark knit sleeve dissolves into a matching charcoal ground that carries the headline and the two primary actions. On tablets and phones the copy sits just below the photograph.', ref: 'Jewels Aficionado homepage banner' },
      { k: 'cats', h: 'Four categories, given equal weight', was: 'Four identical tiles with small captions.', now: 'Watches, jewelry, Hermès and home & office as four equal still lifes, each catalogue photograph restaged on its own soft backdrop, with the name and a quiet “View pieces” link centred beneath.', ref: 'Jewels Aficionado category row' },
      { k: 'manifesto', h: 'The founder’s word, beside the leather', was: 'A centred heading and a button.', now: 'A full-strength photograph of glossy black alligator beside a quiet ivory panel: the material speaks on one side, the founder on the other, with the black monogram exactly as supplied.', ref: 'Hermès and Cartier editorial splits' },
      { k: 'editorial', h: 'Curated pieces, as a slideshow', now: 'Three of ECJ’s own photographs, one for jewelry, watches and Hermès, crossfade on their own. Arrows step through by hand, and the show pauses while the pointer or keyboard focus is on it.', ref: 'Jewels Aficionado “The Ones Worth Collecting”' },
      { k: 'justin', h: 'Just in', now: 'Pick a piece from the list and the photograph changes, full-bleed in a clean frame, with the reference, year and set beside it.', ref: 'Jewels Aficionado “Just In” feature' },
      { k: 'card', h: 'Image-first product cards', was: 'Long product titles under small thumbnails.', now: 'Cards are mostly image, with a second angle on hover where one exists. Reference and year stay for collectors.' },
      { k: 'worn', h: 'Shop handbags', was: 'ECJ’s lifestyle photography appeared once, as small banners.', now: 'Two of ECJ’s professional lifestyle photographs as a full spread on black. Phone snapshots stay inside product galleries.', ref: 'Jewels Aficionado “Styled by The It Crowd”' },
      { k: 'quotes', h: 'A client’s words, set like a press quote', now: 'One real review, large and centred, instead of a small rotating slider.', ref: 'Jewels Aficionado press quote' },
      { k: 'services', h: 'Salon, selling and sourcing as an editorial spread', was: 'Three photo cards with text laid over a dark gradient.', now: 'The Salon leads at full height; selling and sourcing stack beside it. Captions sit beneath clean photographs, each with a rule, a label, a title and one sentence.', ref: 'Magazine spreads; Jewels Aficionado boutique cards' },
      { k: 'legal', h: 'Legal notices, BBB and ADA', now: 'ECJ’s existing disclaimers carried over word for word, the official BBB Accredited Business seal served live by BBB so the A+ rating stays current, and an accessibility icon linking to the ADA statement.' }
    ],
    collection: [
      { k: 'banner', h: 'Every category opens on a photograph', now: 'ECJ’s own banner photography heads each collection, with the title set over it.', ref: 'Jewels Aficionado collection pages' },
      { k: 'toolbar', h: 'Quick chips and sorting', now: 'The most-used filter sits in one tap. Sort by newest or by price. The bar stays in view while browsing.', ref: 'Chrono24, Bob’s Watches' },
      { k: 'filters', h: 'Filters collectors expect', was: 'Category pages listed products with no way to narrow them.', now: 'Maison, model, condition, box & papers, metal, case size and price.', ref: 'The 1916 Company, Watchfinder' },
      { k: 'card', h: 'Box & papers at a glance', now: 'Badges for Unworn, Full set, Rare and Reduced. Reference and year on every card. Prices always shown.' },
      { k: 'promo', h: 'Selling prompts inside the grid', now: 'A sell, trade or sourcing tile sits in the grid where a buyer is already thinking about value.', ref: 'WatchBox, Rebag' },
      { k: 'source', h: 'Sourcing, offered as a service', now: 'Clients already say “If you want it, they can get it.” That reputation becomes a sourcing request on every collection page.' }
    ],
    piece: [
      { k: 'gallery', h: 'One neutral plate, one ECJ seal', now: 'A limestone backdrop unifies mixed photography, and the ECJ authentication seal marks every piece as theirs. Hover to zoom into dials and stones.', ref: 'Cartier and Tiffany product galleries' },
      { k: 'ref', h: 'Reference first', now: 'Reference, year and set are the first details a collector checks, so they sit directly under the name.' },
      { k: 'ctas', h: 'Pieces over $50,000 lead with a viewing', now: 'High-value pieces put “Book a private viewing” first; others lead with Add to bag. Both are always there, and the piece is carried into the booking.', ref: 'Audemars Piguet and Patek Philippe boutique flows' },
      { k: 'trade', h: 'Trade-in on every product page', now: 'Starts the sell flow with this piece already attached as the trade target.', ref: 'WatchBox, The 1916 Company' },
      { k: 'assure', h: 'Their promises, at the point of decision', now: 'Warranty, exchange and authentication drawn from ECJ’s own policies, next to the price.' },
      { k: 'specs', h: 'A consistent spec sheet', was: 'Specs were tables pasted into each description, in different formats.', now: 'One spec format per category, a condition report and plain shipping and exchange terms.' }
    ],
    sell: [
      { k: 'ways', h: 'Three ways, explained plainly', was: 'One long page of text above a form.', now: 'Sell, trade and consign side by side, each with what happens next.' },
      { k: 'stepper', h: 'Six short steps instead of one long form', was: 'One form with three required image uploads before anything else.', now: 'Goal, piece, condition, photos, details, review. Labels change by category: reference for watches, date stamp for Hermès.', ref: 'WatchBox, Rebag Clair' },
      { k: 'aside', h: 'What earns a better offer', now: 'ECJ’s own advice about box, papers and receipts, placed next to the form where it changes what people send.' }
    ],
    salon: [
      { k: 'salon-hero', h: 'The private showroom as a privilege', now: 'The move is presented as the point of the brand: address, hours and directions in the first view.' },
      { k: 'booker', h: 'Booking that matches real hours', now: 'Weekdays only, 11am to 4pm start times. Interest and any piece from a product page carry through.', ref: 'Cartier and Van Cleef & Arpels appointment booking' },
      { k: 'timeline', h: 'What to expect', now: 'Sets expectations for first-time visitors to an appointment-only showroom, and invites them to bring pieces to sell.' },
      { k: 'move', h: 'The founder’s voice', now: 'Bobby Yampolsky’s statement from the moving announcement, condensed into the story of the salon.' }
    ]
  };
  function notesHTML() {
    const list = NOTES[state.view] || [];
    const isHome = state.view === 'home';
    return `<p class="notes-intro">Redesign concept for ECJ Luxe Collection. Each number marks a change on this page and the leading sites that informed it. Press <b>N</b> to show or hide.</p>
      ${isHome ? `<figure class="notes-before"><img src="${SRC('before-home')}" alt="The current ecjluxe.com homepage"><figcaption>Before: ecjluxe.com today, at 1440px after the slider loads.</figcaption></figure>
      <div class="n-item" style="grid-template-columns:minmax(0,1fr)"><div><h4>Direction after the client review</h4><p>The first concept felt generic. This version is led by photography, taking cues from Jewels Aficionado: full-bleed images, styled still lifes, centred serif headings and a quiet black-and-white frame.</p><p>Product and banner photography is ECJ’s own. The homepage banner, the alligator leather and the Birkin in the slideshow are free-licence Unsplash and Pexels photographs, to be replaced with ECJ shots if they prefer.</p></div></div>` : ''}
      ${list.map((n, i) => `<div class="n-item" id="note-${n.k}"><span class="n-item__num">${i + 1}</span><div><h4>${esc(n.h)}</h4>${n.was ? `<p class="n-was"><b>Before:</b> ${esc(n.was)}</p>` : ''}<p>${esc(n.now)}</p>${n.ref ? `<p class="n-ref">Reference: ${esc(n.ref)}</p>` : ''}<button data-act="note-go" data-k="${n.k}">Show on page</button></div></div>`).join('')}
      <p class="notes-intro" style="margin-top:20px;font-size:12.5px">Built with ECJ’s full catalogue of 2,405 pieces, available and sold, taken from ecjluxe.com on 17 October 2026. Thirty featured pieces carry restaged photography and condition notes.</p>`;
  }
  function placePins() {
    const box = $('#pins'); box.innerHTML = '';
    if (!state.notes) return;
    (NOTES[state.view] || []).forEach((n, i) => {
      const el = document.querySelector(`[data-note="${n.k}"]`);
      if (!el || !el.offsetParent && el !== document.body) return;
      const r = el.getBoundingClientRect();
      const pin = document.createElement('button');
      pin.className = 'note-pin'; pin.textContent = i + 1; pin.dataset.act = 'pin'; pin.dataset.k = n.k;
      pin.setAttribute('aria-label', 'Design note ' + (i + 1) + ': ' + n.h);
      const x = n.at === 'tr' ? r.right - 44 : r.left + 10;
      pin.style.left = Math.max(6, Math.min(x + window.scrollX, document.documentElement.clientWidth - 40)) + 'px';
      pin.style.top = (r.top + window.scrollY + 10) + 'px';
      box.appendChild(pin);
    });
  }
  let pinT; function placePinsSoon() { clearTimeout(pinT); pinT = setTimeout(placePins, 80); }
  function setNotes(on) {
    state.notes = on;
    document.documentElement.classList.toggle('notes-on', on);
    $('.notes-toggle').setAttribute('aria-pressed', String(on));
    $('#notesBody').innerHTML = notesHTML();
    if (on) openDrawer('#notesDrawer'); else { $('#notesDrawer').classList.remove('is-open'); scrim.classList.remove('is-on'); }
    placePins();
  }
  function flash(el) { el.classList.remove('is-flash'); void el.offsetWidth; el.classList.add('is-flash'); }

  /* ───────── Router ───────── */
  const main = $('#main');
  let heroCleanup = null;
  // Hash routing with an in-memory fallback: some embedded viewers ignore hash changes.
  let current = '/';
  function go(path) {
    current = path;
    let moved = false;
    try { if (location.hash !== '#' + path) { location.hash = path; moved = location.hash === '#' + path; } } catch (e) { /* sandboxed */ }
    if (!moved) route();
  }
  function route() {
    const h = location.hash.replace(/^#/, '');
    const raw = h.startsWith('/') && h === current ? h : current;
    const parts = decodeURIComponent(raw).split('/').filter(Boolean);
    let html, view = 'home';
    if (heroCleanup) { heroCleanup(); heroCleanup = null; }
    if (!parts.length) html = homeHTML();
    else if (parts[0] === 'piece' && byId[parts[1]]) { html = pieceHTML(byId[parts[1]]); view = 'piece'; }
    else if (parts[0] === 'sell') { html = sellHTML(); view = 'sell'; }
    else if (parts[0] === 'salon') { html = salonHTML(); view = 'salon'; }
    else if (parts[0] === 'accessibility') { html = accessibilityHTML(); view = 'access'; }
    else if (parts[0] === 'about') { html = aboutHTML(); view = 'about'; }
    else if (CATS[parts[0]]) { html = collectionHTML(parts[0], parts[1]); view = 'collection'; }
    else html = homeHTML();
    state.view = view;
    main.innerHTML = `<div class="view">${html}</div>`;
    document.body.classList.toggle('has-mobile-buy', view === 'piece');
    $$('.nav__link').forEach(a => { if (parts[0] && a.getAttribute('href') === '#/' + parts[0]) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current'); });
    closeAll();
    if (state.notes) { $('#notesBody').innerHTML = notesHTML(); }
    mount(view);
    const target = state.scrollTo; state.scrollTo = null;
    if (target && $(target)) setTimeout(() => $(target).scrollIntoView({ behavior: REDUCED ? 'auto' : 'smooth', block: 'start' }), 30);
    else window.scrollTo({ top: 0, behavior: 'instant' });
    try { document.title = ({ home: 'ECJ Luxe Redesign', piece: parts[1] && byId[parts[1]] ? fullName(byId[parts[1]]) + ' · ECJ Luxe Redesign' : '', sell: 'Sell & Trade · ECJ Luxe Redesign', salon: 'The Salon · ECJ Luxe Redesign', access: 'Accessibility · ECJ Luxe Redesign', about: 'About Us · ECJ Luxe Redesign', collection: (CATS[parts[0]] && CATS[parts[0]].title || 'Maison') + ' · ECJ Luxe Redesign' })[view]; } catch (e) { /* viewer may lock the title */ }
    placePinsSoon();
  }

  function mount(view) {
    if (view === 'home') { mountHero(); mountRail(); mountPeek(); mountShow(); }
    if (view === 'collection') renderResults();
    if (view === 'piece') mountGallery();
    if (view === 'sell') renderFlow();
  }

  function mountHero() {
    const stage = $('#stage'); if (!stage) return;
    const slides = $$('.stage__slide', stage), dots = $$('.stage__dot', stage);
    let i = 0;
    const go = n => {
      i = (n + HERO.length) % HERO.length;
      slides.forEach((s, k) => s.classList.toggle('is-active', k === i));
      dots.forEach((d, k) => { d.classList.remove('is-active'); d.classList.toggle('is-done', k < i); });
      void stage.offsetWidth; dots[i].classList.add('is-active');
      const f = $('#heroFeature'); f.href = '#/piece/' + HERO[i].id; f.innerHTML = featureInner(HERO[i]);
      $('#stageCount').textContent = `0${i + 1} / 0${HERO.length}`;
    };
    stage._go = go;
    const onEnd = e => { if (e.animationName === 'fill' && !REDUCED) go(i + 1); };
    stage.addEventListener('animationend', onEnd);
    stage.addEventListener('mouseenter', () => stage.classList.add('is-paused'));
    stage.addEventListener('mouseleave', () => stage.classList.remove('is-paused'));
    const vis = () => stage.classList.toggle('is-paused', document.hidden);
    document.addEventListener('visibilitychange', vis);
    heroCleanup = () => document.removeEventListener('visibilitychange', vis);
  }
  // slideshow: the active indicator's fill animation sets the pace, so pausing the animation pauses the show
  function mountShow() {
    const show = $('#show'); if (!show) return;
    const slides = $$('.show__slide', show), dots = $$('.show__dot', show);
    let i = 0;
    const go = n => {
      i = (n + slides.length) % slides.length;
      slides.forEach((s, k) => { const on = k === i; s.classList.toggle('is-on', on); s.setAttribute('aria-hidden', String(!on)); s.tabIndex = on ? 0 : -1; });
      dots.forEach((d, k) => { d.classList.remove('is-on'); if (k === i) d.setAttribute('aria-current', 'true'); else d.removeAttribute('aria-current'); });
      void show.offsetWidth; dots[i].classList.add('is-on');
    };
    show._go = go;
    show._step = d => go(i + d);
    show.addEventListener('animationend', e => { if (e.animationName === 'show-fill') go(i + 1); });
    if (FINE) {
      show.addEventListener('mouseenter', () => show.classList.add('is-hover'));
      show.addEventListener('mouseleave', () => show.classList.remove('is-hover'));
    }
  }
  function mountRail() {
    const rail = $('#rail'), bar = $('#railBar'); if (!rail) return;
    const upd = () => { const w = rail.clientWidth / rail.scrollWidth; const r = rail.scrollLeft / Math.max(1, rail.scrollWidth - rail.clientWidth); bar.style.width = (w * 100) + '%'; bar.style.left = (r * (1 - w) * 100) + '%'; };
    rail.addEventListener('scroll', upd, { passive: true }); upd();
  }
  function mountPeek() {
    const list = $('#maisons'), peek = $('#peek'); if (!list || !FINE) return;
    const img = $('img', peek);
    list.addEventListener('mousemove', e => {
      const a = e.target.closest('a[data-peek]');
      if (!a) { peek.classList.remove('is-on'); return; }
      if (img.getAttribute('src') !== a.dataset.peek) img.src = a.dataset.peek;
      peek.style.left = (e.clientX + 150) + 'px'; peek.style.top = e.clientY + 'px';
      peek.classList.add('is-on');
    });
    list.addEventListener('mouseleave', () => peek.classList.remove('is-on'));
  }
  function mountGallery() {
    const m = $('#galleryMain'); if (!m || !FINE) return;
    const img = $('img', m);
    m.addEventListener('mouseenter', () => m.classList.add('is-zoom'));
    m.addEventListener('mouseleave', () => m.classList.remove('is-zoom'));
    m.addEventListener('mousemove', e => { const r = m.getBoundingClientRect(); img.style.transformOrigin = `${((e.clientX - r.left) / r.width) * 100}% ${((e.clientY - r.top) / r.height) * 100}%`; });
  }

  /* ───────── Events ───────── */
  document.addEventListener('click', e => {
    const t = e.target.closest('[data-act]');
    const link = e.target.closest('a[href^="#/"]');
    const selfNav = t && ['source', 'book-piece', 'bag-viewing'].includes(t.dataset.act);
    if (link && !selfNav && !e.metaKey && !e.ctrlKey && !e.shiftKey) setTimeout(() => go(link.getAttribute('href').slice(1)), 0);
    if (link) e.preventDefault();
    if (!t) { if (e.target === scrim) closeAll(); return; }
    const a = t.dataset.act, id = Number(t.dataset.id);
    const s = state.sell, b = state.booking;
    switch (a) {
      case 'menu': openDrawer('#menuDrawer'); break;
      case 'search': openSearch(); break;
      case 'search-close': closeAll(); break;
      case 'hint': $('#searchInput').value = t.dataset.v; runSearch(t.dataset.v); break;
      case 'bag': renderBag(); openDrawer('#bagDrawer'); break;
      case 'close': closeAll(); break;
      case 'save': e.preventDefault(); toggleSave(id); break;
      case 'add':
        if (!state.bag.includes(id)) state.bag.push(id);
        syncCounts(); renderBag(); openDrawer('#bagDrawer'); toast('Added to your bag'); break;
      case 'unbag': state.bag = state.bag.filter(x => x !== id); syncCounts(); renderBag(); break;
      case 'checkout': renderBag('Checkout hands off to the secure store checkout. It is not connected in this prototype.'); break;
      case 'bag-viewing': b.piece = state.bag[0] || null; if (b.piece) b.interest = { watches: 'Watches', jewelry: 'Jewelry', hermes: 'Hermès' }[byId[b.piece].cat] || 'Watches'; state.scrollTo = '#book'; go('/salon'); break;
      case 'skip': e.preventDefault(); $('#main').focus(); $('#main').scrollIntoView(); break;
      case 'justin': {
        const p = JUSTIN[Number(t.dataset.i)];
        $$('[data-act="justin"]').forEach(x => x.setAttribute('aria-pressed', String(x === t)));
        const m = $('#justinMedia'); m.href = '#/piece/' + p.id; m.innerHTML = justinMedia(p);
        $('#justinDetail').innerHTML = justinDetail(p);
        break;
      }
      case 'worn': { const r = $('#worn'); r.scrollBy({ left: Number(t.dataset.dir) * (r.firstElementChild.offsetWidth + 16) * 2, behavior: 'smooth' }); break; }
      case 'show': { const sh = $('#show'); if (sh && sh._go) sh._go(Number(t.dataset.i)); break; }
      case 'show-step': { const sh = $('#show'); if (sh && sh._step) sh._step(Number(t.dataset.dir)); break; }
      case 'slide': { const st = $('#stage'); if (st && st._go) st._go(Number(t.dataset.i)); break; }
      case 'rail': { const r = $('#rail'); const c = r.firstElementChild; r.scrollBy({ left: Number(t.dataset.dir) * (c.offsetWidth + 24) * 2, behavior: 'smooth' }); break; }
      case 'quotes': { const q = $('#quotes'); q.scrollBy({ left: Number(t.dataset.dir) * q.firstElementChild.offsetWidth, behavior: 'smooth' }); break; }
      case 'scroll': { const el = $(t.dataset.target); if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' }); break; }

      /* booking */
      case 'bk-interest': b.interest = t.dataset.v; refreshBookers(); break;
      case 'bk-day': b.day = t.dataset.v; refreshBookers(); break;
      case 'bk-time': b.time = t.dataset.v; refreshBookers(); break;
      case 'bk-unpiece': b.piece = null; refreshBookers(); break;
      case 'bk-reset': b.done = false; refreshBookers(); break;
      case 'book-piece': {
        const p = byId[id]; b.piece = id; b.done = false;
        b.interest = { watches: 'Watches', jewelry: 'Jewelry', hermes: 'Hermès' }[p.cat] || 'Watches';
        state.scrollTo = '#book'; go('/salon'); break;
      }
      case 'source': e.preventDefault(); b.interest = 'Sourcing a piece'; b.piece = null; state.scrollTo = '#book'; closeAll(); go('/salon'); break;
      case 'promo':
        if (t.dataset.cat) { s.category = t.dataset.cat; s.brand = ''; s.step = 0; }
        if (t.dataset.interest) { b.interest = t.dataset.interest; state.scrollTo = '#book'; }
        break;

      /* sell */
      case 'sell-goal': s.goal = t.dataset.v; $$('[data-act="sell-goal"]').forEach(x => x.setAttribute('aria-pressed', String(x.dataset.v === s.goal))); break;
      case 'sell-cat': if (s.category !== t.dataset.v) { s.category = t.dataset.v; s.brand = ''; s.incl = []; } if (state.view === 'sell') renderFlow(); else rerenderSellStart(); break;
      case 'sell-cond': s.cond = t.dataset.v; renderFlow(); break;
      case 'sell-prefer': s.prefer = t.dataset.v; $$('[data-act="sell-prefer"]').forEach(x => x.setAttribute('aria-pressed', String(x.dataset.v === s.prefer))); break;
      case 'sell-prev': s.step = Math.max(0, s.step - 1); renderFlow(); break;
      case 'sell-step': if (Number(t.dataset.i) <= s.step) { s.step = Number(t.dataset.i); renderFlow(); } break;
      case 'sell-untoward': s.toward = null; renderFlow(); break;
      case 'sell-new': state.sell = freshSell(); renderFlow(); break;
      case 'sell-example':
        Object.assign(s, { goal: s.toward ? 'Trade' : 'Sell', category: 'Watch', brand: 'Rolex', model: 'Submariner Date', ref: '126610LV', year: '2021', cond: 'Excellent', incl: ['Original box', 'Papers or warranty card'], name: 'Alex Morgan', phone: '(561) 555-0142', email: 'alex@example.com', prefer: 'Text', step: Math.max(s.step, 1) });
        renderFlow(); toast('Example details filled in'); break;
      case 'trade-for': s.toward = id; s.goal = 'Trade'; s.step = 0; s.done = false; state.scrollTo = '#sellFlow'; break;

      /* collection */
      case 'filters': $('#filterDrawerBody').innerHTML = filtersHTML(); openDrawer('#filterDrawer'); break;
      case 'chip': { const k = t.dataset.k, v = t.dataset.v; if (coll.f[k].has(v)) coll.f[k].delete(v); else { coll.f[k].clear(); coll.f[k].add(v); } renderResults(); break; }
      case 'chip-all': { const k = CATS[coll.cat].chips; coll.f[k].clear(); renderResults(); break; }
      case 'unfilter': coll.f[t.dataset.k].delete(t.dataset.v); renderResults(); break;
      case 'clear': Object.values(coll.f).forEach(x => x.clear()); renderResults(); break;
      case 'more': coll.limit += PAGE; renderResults(); break;

      /* product */
      case 'thumb': { const m = $('#galleryMain img'); m.src = t.dataset.src; $('#galleryMain').classList.toggle('no-blend', t.dataset.life === '1'); $$('.gallery__thumb').forEach(x => x.setAttribute('aria-current', String(x === t))); break; }

      /* notes */
      case 'notes':
        if (!state.notes) setNotes(true);
        else if (!$('#notesDrawer').classList.contains('is-open')) openDrawer('#notesDrawer');
        else setNotes(false);
        break;
      case 'notes-hide': $('#notesDrawer').classList.remove('is-open'); break;
      case 'pin': {
        if (!$('#notesDrawer').classList.contains('is-open')) openDrawer('#notesDrawer');
        const item = $('#note-' + t.dataset.k); if (item) { $$('.n-item').forEach(x => x.classList.remove('is-target')); item.classList.add('is-target'); item.scrollIntoView({ block: 'center', behavior: 'smooth' }); }
        break;
      }
      case 'note-go': {
        const el = document.querySelector(`[data-note="${t.dataset.k}"]`);
        if (el) {
          if (window.innerWidth < 900) { $('#notesDrawer').classList.remove('is-open'); scrim.classList.remove('is-on'); }
          el.scrollIntoView({ behavior: 'smooth', block: 'center' }); setTimeout(() => { flash(el); placePins(); }, 500);
        }
        break;
      }
    }
  });

  function rerenderSellStart() {
    const s = state.sell, form = $('[data-form="sell-start"]'); if (!form) return;
    $$('[data-act="sell-cat"]', form).forEach(x => x.setAttribute('aria-pressed', String(x.dataset.v === s.category)));
    const sel = $('#qsBrand'); sel.innerHTML = brandOptions(s.category, s.brand);
    $('label[for="qsBrand"]').textContent = s.category === 'Hermès bag' ? 'Model' : 'Maison';
    $('label[for="qsModel"]').textContent = s.category === 'Watch' ? 'Model or reference' : 'Description';
    $('#qsModel').placeholder = s.category === 'Watch' ? 'e.g. Submariner 126610LV' : s.category === 'Hermès bag' ? 'e.g. 25, Togo, Gold hardware' : 'e.g. Love bracelet, size 17';
  }

  document.addEventListener('input', e => {
    const el = e.target;
    if (el.dataset.sell) state.sell[el.dataset.sell] = el.value;
    if (el.dataset.bk) state.booking[el.dataset.bk] = el.value;
    if (el.id === 'searchInput') runSearch(el.value);
  });
  document.addEventListener('change', e => {
    const el = e.target;
    if (el.dataset.sell) state.sell[el.dataset.sell] = el.value;
    if (el.dataset.facet) { const set = coll.f[el.dataset.facet]; el.checked ? set.add(el.value) : set.delete(el.value); renderResults(); }
    if (el.dataset.incl) { const s = state.sell; s.incl = el.checked ? [...new Set([...s.incl, el.dataset.incl])] : s.incl.filter(x => x !== el.dataset.incl); }
    if (el.id === 'sortSel') { coll.sort = el.value; renderResults(); }
  });
  document.addEventListener('submit', e => {
    const f = e.target; e.preventDefault();
    const kind = f.dataset.form;
    if (kind === 'subscribe') { f.reset(); toast('Thank you. You will hear about new arrivals as they are listed.'); }
    if (kind === 'booking') {
      if (f.dataset.mode === 'band') { state.scrollTo = '#book'; go('/salon'); }
      else { state.booking.done = true; refreshBookers(); toast('Viewing requested'); }
    }
    if (kind === 'sell-start') { state.sell.step = 1; state.sell.done = false; state.scrollTo = '#sellFlow'; go('/sell'); }
    if (kind === 'sell-flow') {
      const s = state.sell;
      if (s.step < SELL_STEPS.length - 1) { s.step++; renderFlow(); const top = $('#sellFlow'); if (top && top.getBoundingClientRect().top < 0) top.scrollIntoView({ behavior: 'smooth' }); }
      else { s.done = true; renderFlow(); toast('Request sent to a specialist'); }
    }
  });

  document.addEventListener('keydown', e => {
    const typing = /INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName);
    if (e.key === 'Escape') closeAll(false);
    if (typing || e.metaKey || e.ctrlKey || e.altKey) return;
    if (e.key === '/') { e.preventDefault(); openSearch(); }
    if (e.key === 'n' || e.key === 'N') { document.documentElement.classList.add('show-notes-btn'); setNotes(!state.notes); }
  });

  /* header state */
  const hdr = $('#hdr');
  const onScroll = () => {
    document.documentElement.classList.toggle('is-scrolled', window.scrollY > 60);
    document.documentElement.style.setProperty('--hdr', hdr.offsetHeight + 'px');
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', () => { onScroll(); placePinsSoon(); });
  window.addEventListener('load', placePinsSoon);
  window.addEventListener('hashchange', () => { const h = location.hash.replace(/^#/, ''); if (h.startsWith('/')) { current = h; route(); } });
  if (location.hash.startsWith('#/')) current = location.hash.slice(1);

  // touch: first tap on a mega-menu parent opens the panel
  $$('.nav__item').forEach(li => { if (!$('.mega', li)) return; li.addEventListener('mouseleave', () => li.classList.remove('is-open')); });

  // official logo files and other static images resolve through the same lookup (embedded in single-file builds)
  $$('img[data-key]').forEach(i => { i.src = SRC(i.dataset.key); });
  $$('image[data-key]').forEach(i => i.setAttribute('href', SRC(i.dataset.key)));
  const icon = $('link[rel="icon"]'); if (icon) icon.href = SRC('favicon.png');
  // BBB seal loads live from BBB so the rating stays current; offline or sandboxed, use the downloaded official copy
  $$('img[data-fallback]').forEach(i => {
    const copy = i.dataset.fallback;
    const useCopy = () => { i.removeAttribute('data-fallback'); i.src = SRC(copy); };
    if (i.complete && !i.naturalWidth) useCopy(); else i.addEventListener('error', useCopy, { once: true });
  });
  if (/[?&]notes\b/.test(location.search)) document.documentElement.classList.add('show-notes-btn');
  syncCounts(); onScroll(); route();
})();
