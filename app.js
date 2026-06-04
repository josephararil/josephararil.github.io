/* =========================================================================
   josepharari.com — landing  ·  app logic
   ─────────────────────────────────────────────────────────────────────────
   HOW TO ADD A NEW APP:
   1. Push a public repo to github.com/josephararil and deploy it under
      josepharari.com/<repo-name>.  It will appear here automatically with
      its GitHub description + an auto-generated artwork tile.
   2. (Optional, recommended) Add a curated entry to APPS below, keyed by the
      exact repo name, to give it a polished tagline, description, highlights,
      category, glyph and gradient.
   3. (Optional) Drop a screenshot at  screens/<repo-name>.png  (or .jpg) and
      set `shot: "screens/<repo-name>.png"`. It fades in over the gradient.
   ========================================================================= */

const USERNAME = "josephararil";          // GitHub username (for the API)
const SITE     = "https://josepharari.com"; // live app base → SITE/<repo>
const API      = `https://api.github.com/users/${USERNAME}/repos?sort=updated&per_page=100`;
const USER_API = `https://api.github.com/users/${USERNAME}`;

/* Category display order (sections render in this order) */
const CATEGORY_ORDER = ["Finance", "Kids & Learning", "Productivity", "Personal", "Design", "More"];

/* ---- Curated metadata, keyed by repo name --------------------------------
   Fields: name, tagline, description, highlights[], category, featured?,
           glyph (key into GLYPHS), gradient [from,via?,to], shot?           */
const APPS = {
  "fire-buckets": {
    name: "Compass",
    tagline: "Chart your path to financial independence.",
    description:
      "A single-user financial-planning PWA for modelling FIRE. Enter dozens of variables — income, spending, allocations and inflation — and Compass projects your trajectory across interactive charts, tables and Monte Carlo simulations, with clear guidance on what to do and when.",
    highlights: [
      "Monte Carlo simulations across thousands of market paths",
      "Portfolio tracking with live inflation adjustment",
      "Interactive charts, tables and year-by-year projections",
      "Actionable guidance on the FIRE journey",
    ],
    category: "Finance",
    featured: true,
    tags: ["Monte Carlo", "Projections", "Portfolio", "PWA"],
    glyph: "compass",
    gradient: ["#16b6a4", "#0a84d8", "#1148b8"],
    shot: "screens/fire-buckets.png",
  },
  "storybook": {
    name: "Storybook",
    tagline: "Bedtime stories, generated and read aloud.",
    description:
      "A mobile-first PWA that conjures bespoke bedtime stories through an LLM orchestration pipeline — composing original text, illustrations and text-to-speech narration, then rendering them as a beautiful, swipeable picture book. It also links existing Gemini storybooks so a child can tap to launch them.",
    highlights: [
      "Orchestrated text, image and TTS generation in one flow",
      "Mobile-first PWA with a swipeable, read-aloud reader",
      "Gemini-powered story and illustration generation",
      "Google Drive integration for media storage",
    ],
    category: "Kids & Learning",
    tags: ["Gemini", "TTS narration", "PWA"],
    glyph: "book",
    gradient: ["#ff9d54", "#ff5fa2", "#a855f7"],
    shot: "screens/storybook.png",
  },
  "sophie-roadmap": {
    name: "Sophie's Roadmap",
    tagline: "A developmental roadmap for a curious four-year-old.",
    description:
      "A React PWA serving as a daily activity guide and developmental roadmap for Sophie — a bright, bilingual four-year-old in Bulgaria. Hundreds of songs, games, milestones and ideas, organised to make every day a small step forward.",
    highlights: [
      "Daily activity guide with hundreds of curated ideas",
      "Songs, games and learning milestones",
      "Bilingual (English) development focus",
      "Installable PWA, built for everyday use",
    ],
    category: "Kids & Learning",
    tags: ["Activities", "Milestones", "Bilingual"],
    glyph: "sparkle",
    gradient: ["#ff7eb6", "#9b7bff", "#ffd16b"],
    shot: "screens/sophie-roadmap.png",
  },
  "tennis": {
    name: "Tennis CRM",
    tagline: "A client manager built for a tennis coach.",
    description:
      "A lightweight CRM for a tennis coach — track students and lessons, manage scheduling with two-way Google Calendar sync, and brainstorm fresh drills and lesson plans with a Gemini assistant.",
    highlights: [
      "Client and lesson management",
      "Two-way Google Calendar sync",
      "Gemini-generated drill and lesson ideas",
    ],
    category: "Productivity",
    tags: ["CRM", "Calendar sync", "Gemini"],
    glyph: "tennis",
    gradient: ["#a7e34d", "#34c759", "#0aa66a"],
    shot: "screens/tennis.png",
  },
  "about": {
    name: "About Joseph",
    tagline: "Consulting, projects, and how to reach me.",
    description:
      "My consulting home base. It lays out the work I take on, the projects I'm building, the areas I'm interested in, and the best ways to get in touch.",
    highlights: [
      "Overview of consulting services and interests",
      "A guided tour of the projects in this index",
      "Direct contact information",
    ],
    category: "Personal",
    tags: ["Consulting", "Contact"],
    glyph: "person",
    gradient: ["#5b6b86", "#3a4458", "#222838"],
    shot: "screens/about.png",
  },
  "aperture": {
    name: "Aperture",
    tagline: "Apple-flavored design system.",
    description:
      "The visual language behind josepharari.com — an Apple-flavored, light-primary system for a growing family of small, personal single-page apps. It exists so any future app (or its landing card) can be built fast and look like it belongs to the same considered, premium family.",
    highlights: [
      "Voice: first person, warm, understated, quietly confident",
      "Casing: sentence case everywhere except tiny eyebrow labels (FEATURED, KIDS & LEARNING), which are uppercase with wide tracking",
      "Punctuation & numbers: em dashes for asides; no exclamation marks; spell out unless a real figure matters",
      "Emoji: none. Ever. Identity comes from custom glyphs + gradients, not emoji.",
      "Length: ruthless. A card is a title + one-line tagline + a meta row. Depth lives in the detail modal, not on the surface. One thousand no's for every yes.",
    ],
    category: "Design",
    featured: false,
    tags: ["Design", "PWA"],
    glyph: "generic",
    gradient: ["#16b6a4", "#0a84d8", "#1148b8"],
    shot: "screens/aperture.png",
  },
};

/* ---- Glyphs (inline SVG, white currentColor) ---------------------------- */
const GLYPHS = {
  compass: '<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><circle cx="24" cy="24" r="19"/><polygon points="32 16 26 26 16 32 22 22" fill="currentColor" stroke="none"/><circle cx="24" cy="24" r="2.4" fill="currentColor" stroke="none"/></svg>',
  book: '<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M24 12c-3-2.4-7-3.4-12-3.4v26c5 0 9 1 12 3.4 3-2.4 7-3.4 12-3.4v-26c-5 0-9 1-12 3.4z"/><path d="M24 12v26"/><path d="M31 6.5l1.4 3 3 1.4-3 1.4-1.4 3-1.4-3-3-1.4 3-1.4z" fill="currentColor" stroke="none"/></svg>',
  sparkle: '<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M24 5l4.6 11.4L40 21l-11.4 4.6L24 37l-4.6-11.4L8 21l11.4-4.6z" fill="currentColor" stroke="none"/><circle cx="38" cy="36" r="2.4" fill="currentColor" stroke="none"/><circle cx="11" cy="35" r="1.8" fill="currentColor" stroke="none"/></svg>',
  tennis: '<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><circle cx="24" cy="24" r="18"/><path d="M9 13c7 4 11 11 11 19 0 4-1 8-3 11"/><path d="M39 13c-7 4-11 11-11 19 0 4 1 8 3 11"/></svg>',
  person: '<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><circle cx="24" cy="17" r="8"/><path d="M9 41c1.5-8.5 7.5-13 15-13s13.5 4.5 15 13"/></svg>',
  generic: '<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><rect x="8" y="8" width="14" height="14" rx="4"/><rect x="26" y="8" width="14" height="14" rx="4"/><rect x="8" y="26" width="14" height="14" rx="4"/><rect x="26" y="26" width="14" height="14" rx="4"/></svg>',
};

/* Fallback gradients for repos without curated metadata (chosen by hash) */
const AUTO_GRADIENTS = [
  ["#667eea", "#764ba2"], ["#f093fb", "#f5576c"], ["#4facfe", "#00f2fe"],
  ["#43e97b", "#38f9d7"], ["#fa709a", "#fee140"], ["#30cfd0", "#330867"],
  ["#a8edea", "#5b86e5"], ["#ff9a9e", "#fad0c4"], ["#5ee7df", "#b490ca"],
];

/* GitHub language colors (common subset) */
const LANG_COLOR = {
  JavaScript: "#f1e05a", TypeScript: "#3178c6", Python: "#3572A5", HTML: "#e34c26",
  CSS: "#563d7c", SCSS: "#c6538c", Vue: "#41b883", Svelte: "#ff3e00", Go: "#00ADD8",
  Rust: "#dea584", Java: "#b07219", Swift: "#F05138", Ruby: "#701516", Shell: "#89e051",
};

/* ───────────────────────── Helpers ──────────────────────────── */
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const titleCase = (s) => s.replace(/[-_]+/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

const hashIndex = (str, n) => {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) | 0;
  return Math.abs(h) % n;
};

const relTime = (iso) => {
  const diff = (Date.now() - new Date(iso).getTime()) / 1000;
  const units = [["year", 31536000], ["month", 2592000], ["week", 604800], ["day", 86400], ["hour", 3600], ["minute", 60]];
  for (const [u, s] of units) {
    const n = Math.floor(diff / s);
    if (n >= 1) return `${n} ${u}${n > 1 ? "s" : ""} ago`;
  }
  return "just now";
};

const gradientCss = (stops) =>
  `background:linear-gradient(140deg, ${stops.join(", ")});`;

/* Build a unified model from a GitHub repo + curated metadata */
const buildModel = (repo) => {
  const meta = APPS[repo.name] || {};
  const stops = meta.gradient || AUTO_GRADIENTS[hashIndex(repo.name, AUTO_GRADIENTS.length)];
  return {
    repo: repo.name,
    name: meta.name || titleCase(repo.name),
    tagline: meta.tagline || repo.description || "",
    description: meta.description || repo.description || "No description provided yet.",
    highlights: meta.highlights || [],
    tags: meta.tags || [],
    category: meta.category || "More",
    featured: !!meta.featured,
    glyph: GLYPHS[meta.glyph] || GLYPHS.generic,
    gradient: stops,
    shot: meta.shot || null,
    language: repo.language,
    updated: repo.updated_at,
    launchUrl: `${SITE}/${repo.name}`,
    repoUrl: repo.html_url || `https://github.com/${USERNAME}/${repo.name}`,
    curated: !!APPS[repo.name],
  };
};

/* ───────────────────────── State ───────────────────────────── */
let MODELS = [];
let filter = "all";
let query = "";

const grid = $("#sections");
const countMeta = $("#hero-count");

/* ───────────────────────── Artwork ─────────────────────────── */
const artHTML = (m, cls = "") =>
  `<div class="tile-grad" style="${gradientCss(m.gradient)}"></div>
   <div class="glyph">${m.glyph}</div>
   ${m.shot ? `<img class="shot ${cls}" alt="" loading="lazy" src="${esc(m.shot)}"
        onload="this.classList.add('ready')" onerror="this.remove()">` : ""}`;

/* ───────────────────────── Card ────────────────────────────── */
const cardHTML = (m) => `
  <article class="card" data-repo="${esc(m.repo)}" tabindex="0" role="button" aria-label="View ${esc(m.name)}">
    <div class="tile">
      <span class="cat-tag">${esc(m.category)}</span>
      ${artHTML(m)}
    </div>
    <div class="card-body">
      <div class="card-title-row"><span class="card-title">${esc(m.name)}</span></div>
      <p class="card-tagline">${esc(m.tagline || "")}</p>
      <div class="card-foot">
        <span class="meta">
          ${m.language ? `<span class="lang-dot" style="background:${LANG_COLOR[m.language] || "#9aa"}"></span>${esc(m.language)} · ` : ""}Updated ${relTime(m.updated)}
        </span>
        <span class="card-open">Details
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M9 6l6 6-6 6"/></svg>
        </span>
      </div>
    </div>
  </article>`;

/* ───────────────────────── Featured ────────────────────────── */
const featuredHTML = (m) => `
  <article class="featured" data-repo="${esc(m.repo)}" tabindex="0" role="button" aria-label="View ${esc(m.name)}">
    <div class="feat-art">${artHTML(m)}</div>
    <div class="feat-body">
      <p class="feat-eyebrow">Featured</p>
      <h2>${esc(m.name)}</h2>
      <p class="feat-desc">${esc(m.tagline || m.description)}</p>
      ${m.tags.length ? `<div class="feat-tags">${m.tags.slice(0, 4).map((t) => `<span>${esc(t)}</span>`).join("")}</div>` : ""}
    </div>
  </article>`;

/* ───────────────────────── Render ──────────────────────────── */
const matches = (m) => {
  const q = query.trim().toLowerCase();
  if (filter !== "all" && m.category !== filter) return false;
  if (!q) return true;
  return (m.name + " " + m.tagline + " " + m.description + " " + m.category).toLowerCase().includes(q);
};

const render = () => {
  const list = MODELS.filter(matches);
  countMeta.textContent = `${MODELS.length} app${MODELS.length === 1 ? "" : "s"} and counting`;

  if (!list.length) {
    grid.innerHTML = `<div class="state"><div class="ico"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/></svg></div><h3>Nothing here yet</h3><p>No apps match your search${filter !== "all" ? ` in ${filter}` : ""}.</p></div>`;
    return;
  }

  const filtering = filter !== "all" || query.trim();

  if (filtering) {
    // Flat grid of results
    grid.innerHTML = `<div class="grid">${list.map(cardHTML).join("")}</div>`;
  } else {
    // Featured spotlight + category sections
    const feat = list.find((m) => m.featured);
    let html = feat ? featuredHTML(feat) : "";
    const rest = list.filter((m) => m !== feat);
    const byCat = {};
    rest.forEach((m) => { (byCat[m.category] ||= []).push(m); });
    const cats = Object.keys(byCat).sort((a, b) => {
      const ia = CATEGORY_ORDER.indexOf(a), ib = CATEGORY_ORDER.indexOf(b);
      return (ia === -1 ? 99 : ia) - (ib === -1 ? 99 : ib);
    });
    html += cats.map((cat) => `
      <section class="section">
        <div class="section-head"><h2>${esc(cat)}</h2><span class="n">${byCat[cat].length}</span></div>
        <div class="grid">${byCat[cat].map(cardHTML).join("")}</div>
      </section>`).join("");
    grid.innerHTML = html;
  }

  observeIn();
};

/* Entrance stagger — synchronous, reflow-flushed (reliable everywhere) */
const observeIn = () => {
  const els = $$(".card, .featured", grid);
  void grid.offsetWidth; // flush the initial opacity:0 state so the transition plays
  els.forEach((el, i) => {
    el.style.transitionDelay = `${Math.min(i, 10) * 40}ms`;
    el.classList.add("in");
  });
};

/* ───────────────────────── Modal ───────────────────────────── */
const scrim = $("#modal-scrim");
let lastFocus = null;

const openModal = (repo) => {
  const m = MODELS.find((x) => x.repo === repo);
  if (!m) return;
  lastFocus = document.activeElement;
  $("#m-art").innerHTML = artHTML(m);
  $("#m-cat").textContent = m.category;
  $("#m-title").textContent = m.name;
  $("#m-desc").textContent = m.description;

  const hl = $("#m-highlights");
  hl.innerHTML = m.highlights.map((h) => `
    <li><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="m8.5 12 2.5 2.5 4.5-5"/></svg><span>${esc(h)}</span></li>`).join("");
  hl.style.display = m.highlights.length ? "grid" : "none";

  $("#m-meta").innerHTML = `
    ${m.language ? `<span class="item"><span class="lang-dot" style="background:${LANG_COLOR[m.language] || "#9aa"}"></span>${esc(m.language)}</span>` : ""}
    <span class="item">Updated ${relTime(m.updated)}</span>
    <span class="item">${esc(SITE.replace("https://", ""))}/${esc(m.repo)}</span>`;

  $("#m-launch").href = m.launchUrl;
  $("#m-repo").href = m.repoUrl;

  scrim.classList.add("open");
  document.body.style.overflow = "hidden";
  $("#modal-close").focus();
};

const closeModal = () => {
  scrim.classList.remove("open");
  document.body.style.overflow = "";
  lastFocus?.focus?.();
};

scrim.addEventListener("click", (e) => { if (e.target === scrim) closeModal(); });
$("#modal-close").addEventListener("click", closeModal);
document.addEventListener("keydown", (e) => { if (e.key === "Escape" && scrim.classList.contains("open")) closeModal(); });

/* Card → modal (event delegation) */
grid.addEventListener("click", (e) => {
  const el = e.target.closest("[data-repo]");
  if (el) openModal(el.dataset.repo);
});
grid.addEventListener("keydown", (e) => {
  if ((e.key === "Enter" || e.key === " ") && e.target.dataset.repo) {
    e.preventDefault();
    openModal(e.target.dataset.repo);
  }
});

/* ───────────────────────── Filters & search ────────────────── */
const renderChips = () => {
  const cats = [...new Set(MODELS.map((m) => m.category))].sort((a, b) => {
    const ia = CATEGORY_ORDER.indexOf(a), ib = CATEGORY_ORDER.indexOf(b);
    return (ia === -1 ? 99 : ia) - (ib === -1 ? 99 : ib);
  });
  const items = ["all", ...cats];
  $("#chips").innerHTML = items.map((c) =>
    `<button class="chip" data-cat="${esc(c)}" aria-pressed="${c === filter}">${c === "all" ? "All" : esc(c)}</button>`
  ).join("");
  $$("#chips .chip").forEach((b) =>
    b.addEventListener("click", () => {
      filter = b.dataset.cat;
      $$("#chips .chip").forEach((x) => x.setAttribute("aria-pressed", x.dataset.cat === filter));
      render();
    })
  );
};

let searchT;
$("#search").addEventListener("input", (e) => {
  clearTimeout(searchT);
  query = e.target.value;
  searchT = setTimeout(render, 70);
});

/* ───────────────────────── Settings popover ────────────────── */
const PREF = {
  get(k, d) { try { return localStorage.getItem("jh." + k) ?? d; } catch { return d; } },
  set(k, v) { try { localStorage.setItem("jh." + k, v); } catch {} },
};

const ACCENTS = { blue: "#0071e3", indigo: "#5e5ce6", green: "#1d9d57", orange: "#f5731f", pink: "#e0489a", graphite: "#3a3a3c" };

const applyTheme = (mode) => {
  const sysDark = matchMedia("(prefers-color-scheme: dark)").matches;
  const eff = mode === "auto" ? (sysDark ? "dark" : "light") : mode;
  document.documentElement.setAttribute("data-theme", eff);
};
const applyAccent = (key) => {
  const c = ACCENTS[key] || ACCENTS.blue;
  document.documentElement.style.setProperty("--accent", c);
};
const applyDensity = (d) => document.documentElement.setAttribute("data-density", d);

const initSettings = () => {
  const theme = PREF.get("theme", "light");
  const accent = PREF.get("accent", "blue");
  const density = PREF.get("density", "comfortable");
  applyTheme(theme); applyAccent(accent); applyDensity(density);

  const pop = $("#settings-pop");
  const btn = $("#settings-btn");
  btn.addEventListener("click", (e) => { e.stopPropagation(); pop.classList.toggle("open"); });
  document.addEventListener("click", (e) => { if (!pop.contains(e.target) && e.target !== btn) pop.classList.remove("open"); });

  const sync = (sel, val) => $$(sel + " [data-val]").forEach((b) => b.setAttribute("aria-pressed", b.dataset.val === val));
  sync("#seg-theme", theme); sync("#seg-density", density);
  $$("#sw-accent .swatch").forEach((s) => s.setAttribute("aria-pressed", s.dataset.val === accent));

  $$("#seg-theme [data-val]").forEach((b) => b.addEventListener("click", () => { applyTheme(b.dataset.val); PREF.set("theme", b.dataset.val); sync("#seg-theme", b.dataset.val); }));
  $$("#seg-density [data-val]").forEach((b) => b.addEventListener("click", () => { applyDensity(b.dataset.val); PREF.set("density", b.dataset.val); sync("#seg-density", b.dataset.val); }));
  $$("#sw-accent .swatch").forEach((s) => s.addEventListener("click", () => { applyAccent(s.dataset.val); PREF.set("accent", s.dataset.val); $$("#sw-accent .swatch").forEach((x) => x.setAttribute("aria-pressed", x === s)); }));

  matchMedia("(prefers-color-scheme: dark)").addEventListener("change", () => { if (PREF.get("theme", "light") === "auto") applyTheme("auto"); });
};

/* ───────────────────────── Top bar shadow on scroll ────────── */
const topbar = $("#topbar");
addEventListener("scroll", () => topbar.classList.toggle("scrolled", scrollY > 8), { passive: true });

/* ───────────────────────── Skeleton ────────────────────────── */
const skeleton = (n = 6) => {
  grid.innerHTML = `<div class="grid">${Array.from({ length: n }, () => `
    <article class="card skel-card">
      <div class="tile skel"></div>
      <div class="card-body">
        <div class="skel skel-line" style="width:55%;height:16px;margin-bottom:12px"></div>
        <div class="skel skel-line" style="width:92%;margin-bottom:7px"></div>
        <div class="skel skel-line" style="width:70%"></div>
        <div class="card-foot" style="border:none;margin-top:16px;padding:0"><div class="skel skel-line" style="width:40%;height:11px"></div></div>
      </div>
    </article>`).join("")}</div>`;
};

/* ───────────────────────── Avatar ──────────────────────────── */
const loadUser = async () => {
  try {
    const r = await fetch(USER_API);
    if (!r.ok) return;
    const u = await r.json();
    if (u.avatar_url) $("#mark").innerHTML = `<img src="${esc(u.avatar_url)}" alt="">`;
  } catch {}
};

/* ───────────────────────── Fetch ───────────────────────────── */
const errorState = (rate) => {
  grid.innerHTML = `<div class="state">
    <div class="ico"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 9v4M12 17h.01"/><path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z"/></svg></div>
    <h3>${rate ? "GitHub rate limit reached" : "Couldn't load apps"}</h3>
    <p>${rate ? "GitHub limits anonymous requests to 60/hour per IP. Please try again shortly." : "Something went wrong reaching GitHub. Check your connection and retry."}</p>
    <button class="btn btn-secondary" id="retry">Retry</button>
  </div>`;
  $("#retry").addEventListener("click", boot);
};

const fetchRepos = async () => {
  skeleton();
  try {
    const r = await fetch(API);
    if (!r.ok) throw new Error(r.status === 403 ? "rate" : "fail");
    const repos = await r.json();
    MODELS = repos
      .filter((repo) => (!repo.fork || ["Trading-Platform"].includes(repo.name)) && repo.name !== `${USERNAME}.github.io` && repo.name !== "josepharari.com")
      .map(buildModel)
      // curated apps first, then by recency
      .sort((a, b) => (b.curated - a.curated) || (new Date(b.updated) - new Date(a.updated)));
    renderChips();
    render();
  } catch (err) {
    errorState(err.message === "rate");
  }
};

/* ───────────────────────── Boot ────────────────────────────── */
function boot() { fetchRepos(); }
initSettings();
loadUser();
boot();
