/* Job Search Dashboard — main.js (minimal, stable) */
import { PORTALS as RAW_PORTALS, ROLE, DEFAULT_US } from "./config.js";

(function () {
  // ---------- tiny helpers ----------
  const qs = (s) => document.querySelector(s);
  const qsa = (s) => Array.from(document.querySelectorAll(s));
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

  // Toggle this ONLY if you really need extra freshness terms on 1–3h searches
  const ENABLE_SOFT_RECENCY = false;

  // Robust portals array (fallbacks if config.js is wrong)
  const portals = Array.isArray(RAW_PORTALS) && RAW_PORTALS.length
    ? RAW_PORTALS
    : [
        { name: "LinkedIn",   site: "site:linkedin.com/jobs", domain: "linkedin.com/jobs" },
        { name: "Indeed",     site: "site:indeed.com",        domain: "indeed.com" },
        { name: "Glassdoor",  site: "site:glassdoor.com",     domain: "glassdoor.com" },
        { name: "Workday",    site: "site:myworkdayjobs.com", domain: "myworkdayjobs.com" },
      ];

  // ---------- render scheduler ----------
  let renderTimer;
  function scheduleRender() {
    clearTimeout(renderTimer);
    renderTimer = setTimeout(renderCards, 120);
  }

  // ---------- state ----------
  let locations = []; // removable chips strings
  let focusResultsNextRender = false;

  // ---------- storage ----------
  const STORAGE_KEY = "jsdash_v1";

  function serializeState() {
    const chipsActive = qsa("#chipsRow .chip.active")
      .filter((c) => !c.classList.contains("removable"))
      .map((c) => c.dataset.k);

    return {
      recency: qs("#recency")?.value || "",
      extra: qs("#extra")?.value || "",
      custom: qs("#locationCustom")?.value || "",
      locations: locations.slice(0, 50),
      chips: chipsActive,
      roles: {
        sre: !!qs("#roleSRE")?.checked,
        devops: !!qs("#roleDevOps")?.checked,
        cloud: !!qs("#roleCloud")?.checked,
        apigee: !!qs("#roleApigee")?.checked,
      },
      dark: !!qs("#darkToggle")?.checked,
      highContrast: !!qs("#highContrastToggle")?.checked,
      reduceMotion: !!qs("#reduceMotionToggle")?.checked,
    };
  }

  function deserializeState(state, { partial = false } = {}) {
    if (!state || typeof state !== "object") return;
    const has = (k) => Object.prototype.hasOwnProperty.call(state, k);

    if (!partial || has("recency")) { if (qs("#recency")) qs("#recency").value = state.recency ?? ""; }
    if (!partial || has("extra"))   { if (qs("#extra")) qs("#extra").value = state.extra ?? ""; }
    if (!partial || has("custom"))  { if (qs("#locationCustom")) qs("#locationCustom").value = state.custom ?? ""; }

    if (!partial || has("locations")) {
      locations = Array.isArray(state.locations) ? state.locations.slice(0, 50) : [];
    }

    if (!partial || has("chips")) {
      const chipSet = new Set(Array.isArray(state.chips) ? state.chips : []);
      qsa("#chipsRow .chip").forEach((c) => {
        if (!c.classList.contains("removable")) c.classList.toggle("active", chipSet.has(c.dataset.k));
      });
    }

    if (!partial || has("roles")) {
      if (state.roles) {
        if (qs("#roleSRE"))    qs("#roleSRE").checked = !!state.roles.sre;
        if (qs("#roleDevOps"))  qs("#roleDevOps").checked = !!state.roles.devops;
        if (qs("#roleCloud"))   qs("#roleCloud").checked = !!state.roles.cloud;
        if (qs("#roleApigee"))  qs("#roleApigee").checked = !!state.roles.apigee;
      }
    }

    if (!partial || has("dark")) {
      const on = !!state.dark;
      if (qs("#darkToggle")) qs("#darkToggle").checked = on;
      document.body.classList.toggle("dark", on);
    }
    if (!partial || has("highContrast")) {
      const on = !!state.highContrast;
      if (qs("#highContrastToggle")) qs("#highContrastToggle").checked = on;
      document.body.classList.toggle("hc", on);
    }
    if (!partial || has("reduceMotion")) {
      const on = !!state.reduceMotion;
      if (qs("#reduceMotionToggle")) qs("#reduceMotionToggle").checked = on;
      document.body.classList.toggle("reduce-motion", on);
    }
  }

  function saveState() {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(serializeState())); } catch {}
  }
  function loadState() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      deserializeState(JSON.parse(raw), { partial: false });
    } catch {}
  }

  // ---------- helpers ----------
  function recencyParam() {
    const v = (qs("#recency")?.value || "").trim();
    if (!v) return "";
    if (v.startsWith("h")) return `&tbs=qdr:h${v.substring(1)}`;
    return `&tbs=qdr:${v}`; // d | w | m
  }
  function gUrl(q) {
    return `https://www.google.com/search?q=${encodeURIComponent(q)}${recencyParam()}`;
  }

  function composeLocationFilter() {
    const custom = (qs("#locationCustom")?.value || "").trim();
    if (custom) return `(${custom})`;

    // Wrap each location group in its own () and join with OR
    if (locations.length) {
      const groups = locations.map(g => `(${g})`);
      return `(${groups.join(" OR ")})`;
    }
    return DEFAULT_US;
  }

  function activeFiltersCount() {
    const chips = qsa(".chip.active").length;
    const extra = (qs("#extra")?.value || "").trim() ? 1 : 0;
    return chips + extra;
  }
  function updateBadges() {
    const r = (qs("#recency")?.value || "");
    const rText = r
      ? (r.startsWith("h")
          ? `Past ${r.substring(1)} hours`
          : r === "d" ? "Past 24 hours" : r === "w" ? "Past week" : "Past month")
      : "Any time";
    ["#recencyBadge", "#recencyBadge2"].forEach((id) => { const b = qs(id); if (b) b.textContent = rText; });

    const count = activeFiltersCount();
    ["#filtersBadge", "#filtersBadge2"].forEach((id) => {
      const b = qs(id);
      if (b) {
        b.textContent = count ? `${count} filter${count > 1 ? "s" : ""}` : "0 filters";
        b.classList.toggle("muted", count === 0);
      }
    });

    const L = locations.length;
    const hasCustom = (qs("#locationCustom")?.value || "").trim();
    const text = hasCustom ? "Custom" : (L ? `${L} location${L > 1 ? "s" : ""}` : "US");
    ["#locationsBadge", "#locationsBadge2"].forEach((id) => {
      const b = qs(id); if (b) { b.textContent = text; b.classList.toggle("muted", !L && !hasCustom); }
    });
  }

  // chips UI (removable)
  function renderLocationChips() {
    const wrap = qs("#locationsChips");
    if (!wrap) return;
    wrap.innerHTML = "";
    locations.forEach((L) => {
      const pill = document.createElement("span");
      pill.className = "chip active removable";
      pill.textContent = L.replaceAll('"', "");
      const x = document.createElement("button");
      x.className = "chip-x"; x.textContent = "×"; x.title = "Remove";
      x.onclick = () => {
        locations = locations.filter((t) => t !== L);
        renderLocationChips();
        scheduleRender();
      };
      pill.appendChild(x);
      wrap.appendChild(pill);
    });
    updateBadges();
  }
  function addLocationChip(text) {
    if (!text || locations.includes(text)) return;
    locations.push(text);
    renderLocationChips();
    scheduleRender();
  }

  // Soft text filter for very tight hour windows (kept, but gated)
  function tightRecencyTextFilter() {
    const v = (qs("#recency")?.value || "").trim();
    if (!v || !v.startsWith("h")) return "";
    const hrs = parseInt(v.slice(1), 10);
    if (!Number.isFinite(hrs) || hrs > 3) return "";
    return '("minute ago" OR "minutes ago" OR "hour ago" OR "hours ago" OR "just posted")';
  }

  // ---------- query composer ----------
  function composeQuery(roleBlock, siteFilter) {
    const filters = [];
    const loc = composeLocationFilter();
    if (loc) filters.push(loc);

    qsa(".chip.active").forEach(c => {
      if (!c.classList.contains("removable")) filters.push(c.dataset.k);
    });

    const extra = (qs("#extra")?.value || "").trim();
    if (extra) filters.push(extra);

    // Add textual recency cues only if explicitly enabled
    if (ENABLE_SOFT_RECENCY) {
      const soft = tightRecencyTextFilter();
      if (soft) filters.push(soft);
    }

    return [roleBlock, ...filters, siteFilter].filter(Boolean).join(" ");
  }

  function firstCheckedRoleBlock() {
    if (qs("#roleSRE")?.checked) return ROLE.SRE;
    if (qs("#roleDevOps")?.checked) return ROLE.DevOps;
    if (qs("#roleCloud")?.checked) return ROLE.Cloud;
    if (qs("#roleApigee")?.checked) return ROLE.Apigee;
    return ROLE.SRE;
  }

  // ---------- batch helpers ----------
  function chunk(arr, size) {
    const out = [];
    for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
    return out;
  }
  function getTargetPortalIndexes() {
    const cards = Array.from(document.querySelectorAll(".portal-card"));
    const idxs = [];
    cards.forEach((card, idx) => {
      const cb = card.querySelector(".rowSelect");
      if (cb && cb.checked) idxs.push(idx);
    });
    return idxs.length ? idxs : cards.map((_, i) => i);
  }
  function buildQueriesForIndexes(idxs) {
    const roleBlock = firstCheckedRoleBlock();
    const list = [];
    idxs.forEach((i) => {
      const p = portals[i];
      if (!p) return;
      const q = composeQuery(roleBlock, p.site);
      list.push({ name: p.name, url: gUrl(q) });
    });
    return list;
  }

  // ---------- renderer ----------
  function renderCards() {
    updateBadges();

    const grid = qs("#resultsGrid");
    if (!grid) return;

    grid.innerHTML = "";
    const frag = document.createDocumentFragment();

    if (!Array.isArray(portals) || !portals.length) {
      const msg = document.createElement("div");
      msg.className = "empty";
      msg.textContent = "No portals configured.";
      grid.appendChild(msg);
      return;
    }

    portals.forEach((p, i) => {
      if (!p || !p.name || !p.site) return;

      const card = document.createElement("div");
      card.className = "portal-card";
      card.setAttribute("role", "listitem");
      card.setAttribute("tabindex", "0");
      card.setAttribute("aria-label", `Portal ${p.name}`);

      const left = document.createElement("div");
      left.className = "left";
      left.textContent = i + 1;

      const head = document.createElement("div");
      head.className = "header";
      const title = document.createElement("h4");
      title.className = "portal";
      title.textContent = p.name;
      const domain = document.createElement("div");
      domain.className = "domain";
      domain.textContent = p.domain || "";
      head.appendChild(title);
      head.appendChild(domain);

      const roleRow = document.createElement("div");
      roleRow.className = "role-row";
      const addRoleButton = (label, block) => {
        const q = composeQuery(block, p.site);
        const a = document.createElement("a");
        a.className = "role-btn";
        a.href = gUrl(q);
        a.target = "_blank";
        a.rel = "noopener";
        const span = document.createElement("span");
        span.className = "label";
        span.textContent = `${label} `;
        const tools = document.createElement("div");
        tools.className = "role-tools";
        const copy = document.createElement("button");
        copy.className = "mini";
        copy.textContent = "Copy";
        copy.onclick = (e) => {
          e.preventDefault();
          navigator.clipboard.writeText(q).then(() => {
            copy.textContent = "Copied!";
            setTimeout(() => (copy.textContent = "Copy"), 900);
          });
        };
        tools.appendChild(copy);
        a.appendChild(span);
        a.appendChild(tools);
        roleRow.appendChild(a);
      };

      if (qs("#roleSRE")?.checked) addRoleButton("SRE", ROLE.SRE);
      if (qs("#roleDevOps")?.checked) addRoleButton("DevOps", ROLE.DevOps);
      if (qs("#roleCloud")?.checked) addRoleButton("Cloud", ROLE.Cloud);
      if (qs("#roleApigee")?.checked) addRoleButton("Apigee", ROLE.Apigee);

      const body = document.createElement("div");
      body.appendChild(head);
      body.appendChild(roleRow);

      const sel = document.createElement("div");
      sel.className = "select-col";
      const cb = document.createElement("input");
      cb.type = "checkbox";
      cb.className = "rowSelect";
      const openOne = document.createElement("button");
      openOne.className = "btn ghost mini";
      openOne.textContent = "Open";
      openOne.setAttribute("aria-label", `Open ${p.name} with current filters`);
      openOne.onclick = () => {
        const roleBlock = firstCheckedRoleBlock();
        const q = composeQuery(roleBlock, p.site);
        window.open(gUrl(q), "_blank");
      };
      sel.appendChild(cb);
      sel.appendChild(openOne);

      card.appendChild(left);
      card.appendChild(body);
      card.appendChild(sel);

      frag.appendChild(card);
    });

    grid.appendChild(frag);

    saveState();

    if (focusResultsNextRender) {
      focusResultsNextRender = false;
      grid.focus();
    }
  }

  // ---------- bindings ----------
  async function bind() {
    // chips (quick)
    qsa("#chipsRow .chip").forEach((c) => {
      c.addEventListener("click", () => {
        c.classList.toggle("active");
        scheduleRender();
      });
    });

    // form submit
    const form = qs("#searchForm");
    if (form) {
      form.addEventListener("submit", (e) => {
        e.preventDefault();
        focusResultsNextRender = true;
        scheduleRender();
      });
    }

    // reset
    qs("#resetBtn")?.addEventListener("click", () => {
      qsa("#chipsRow .chip").forEach((c) => c.classList.remove("active"));
      ["extra", "locationCustom"].forEach((id) => { const el = qs("#" + id); if (el) el.value = ""; });
      if (qs("#recency")) qs("#recency").value = "";
      locations = [];
      renderLocationChips();
      scheduleRender();
    });

    // sidebar location picker
    qs("#addSelectedLocations")?.addEventListener("click", () => {
      const sel = qs("#locationPicker");
      if (!sel) return;
      Array.from(sel.selectedOptions).forEach((opt) => addLocationChip(opt.value));
      sel.selectedIndex = -1;
    });
    qs("#clearLocations")?.addEventListener("click", () => {
      locations = [];
      if (qs("#locationCustom")) qs("#locationCustom").value = "";
      renderLocationChips();
      scheduleRender();
    });

    // input changes
    ["roleSRE","roleDevOps","roleCloud","roleApigee","recency","extra","locationCustom"]
      .forEach((id) => qs("#" + id)?.addEventListener("change", scheduleRender));

    // open selected (throttled, jittered)
    qs("#openSelectedBtn")?.addEventListener("click", async () => {
      const idxs = getTargetPortalIndexes();
      const list = buildQueriesForIndexes(idxs);
      for (let i = 0; i < list.length; i++) {
        window.open(list[i].url, "_blank");
        // 2.2–3.0s delay to avoid rate limiting
        const jitter = 2200 + Math.floor(Math.random() * 800);
        // eslint-disable-next-line no-await-in-loop
        await sleep(jitter);
      }
    });

    // copy all links
    const copyAllBtn = qs("#copyAllBtn");
    if (copyAllBtn) {
      copyAllBtn.addEventListener("click", async () => {
        const idxs = getTargetPortalIndexes();
        const list = buildQueriesForIndexes(idxs);
        if (!list.length) return;
        const text = list.map((x) => `${x.name}: ${x.url}`).join("\n");
        try {
          await navigator.clipboard.writeText(text);
          copyAllBtn.textContent = "Copied!";
          setTimeout(() => (copyAllBtn.textContent = "Copy all links"), 900);
        } catch {
          alert("Copy failed. You can manually copy:\n\n" + text);
        }
      });
    }

    // open in batches (smaller batch + bigger gaps)
    const openInBatchesBtn = qs("#openInBatchesBtn");
    if (openInBatchesBtn) {
      openInBatchesBtn.addEventListener("click", async () => {
        const idxs = getTargetPortalIndexes();
        const list = buildQueriesForIndexes(idxs);
        if (!list.length) return;
        const BATCH = 3; // smaller batch is friendlier to Google
        const groups = chunk(list, BATCH);
        let batch = 0;
        for (const g of groups) {
          for (const item of g) {
            window.open(item.url, "_blank");
            // 1.2–1.8s between links within a batch
            // eslint-disable-next-line no-await-in-loop
            await sleep(1200 + Math.floor(Math.random() * 600));
          }
          batch += 1;
          openInBatchesBtn.textContent = `Opened batch ${batch}/${groups.length}`;
          // 5–7s pause between batches
          // eslint-disable-next-line no-await-in-loop
          await sleep(5000 + Math.floor(Math.random() * 2000));
        }
        setTimeout(() => (openInBatchesBtn.textContent = "Open 3 at a time"), 1200);
      });
    }

    // theme & prefs
    const dark = qs("#darkToggle");
    if (dark) {
      const setDark = (on) => { document.body.classList.toggle("dark", on); saveState(); };
      setDark(!!dark.checked);
      dark.addEventListener("change", () => setDark(dark.checked));
    }
    const hc = qs("#highContrastToggle");
    if (hc) {
      const setHC = (on) => { document.body.classList.toggle("hc", on); saveState(); };
      setHC(!!hc.checked);
      hc.addEventListener("change", () => setHC(hc.checked));
    }
    const rm = qs("#reduceMotionToggle");
    if (rm) {
      const setRM = (on) => { document.body.classList.toggle("reduce-motion", on); saveState(); };
      setRM(!!rm.checked);
      rm.addEventListener("change", () => setRM(rm.checked));
    }

    // shortcuts
    document.addEventListener("keydown", (e) => {
      const tag = (e.target?.tagName || "").toLowerCase();
      const isTyping = tag === "input" || tag === "textarea" || e.target.isContentEditable;
      if (isTyping && e.key !== "Escape") return;

      const focusEl = (sel) => { const el = qs(sel); if (el) { el.focus(); el.select?.(); } };

      switch (e.key) {
        case "/":
        case "s":
        case "S": e.preventDefault(); focusEl("#extra"); break;
        case "l":
        case "L": e.preventDefault(); focusEl("#locationCustom"); break;
        case "r":
        case "R": e.preventDefault(); focusEl("#recency"); break;
        case "o":
        case "O": e.preventDefault(); qs("#openSelectedBtn")?.click(); break;
        case "g":
        case "G": e.preventDefault(); qs("#resultsGrid")?.focus(); break;
        case "d":
        case "D": {
          e.preventDefault();
          const darkEl = qs("#darkToggle");
          if (darkEl) { darkEl.checked = !darkEl.checked; darkEl.dispatchEvent(new Event("change")); }
          break;
        }
        default: break;
      }
    });
  }

  // ---------- init ----------
  document.addEventListener("DOMContentLoaded", () => {
    // First load: system prefs if no storage
    let hadStorage = false;
    try { hadStorage = !!localStorage.getItem(STORAGE_KEY); } catch {}
    if (!hadStorage) {
      const prefersDark = window.matchMedia?.("(prefers-color-scheme: dark)")?.matches;
      if (qs("#darkToggle")) qs("#darkToggle").checked = !!prefersDark;
      document.body.classList.toggle("dark", !!prefersDark);

      const prefersReduce = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;
      if (qs("#reduceMotionToggle")) qs("#reduceMotionToggle").checked = !!prefersReduce;
      document.body.classList.toggle("reduce-motion", !!prefersReduce);
    } else {
      loadState();
    }

    renderLocationChips();
    bind();
    renderCards();

    // Debug hook if needed
    (window).DASH = { portals, ROLE, DEFAULT_US };
    console.log("DASH:init ok — portals:", portals.length);
  });
})();
