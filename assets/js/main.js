import { PORTALS as portals, ROLE, DEFAULT_US } 
  from "./config.js";

(function () {
  const qs = (s) => document.querySelector(s);
  const qsa = (s) => Array.from(document.querySelectorAll(s));

  // ---------- Render Performance Helpers ----------
  let renderTimer;
  function scheduleRender() {
    clearTimeout(renderTimer);
    renderTimer = setTimeout(renderCards, 180);
  }

  // ---------- State ----------
  let locations = [];               // removable chips content (strings)
  let focusResultsNextRender = false; // after submit, move focus to #resultsGrid

  // ---------- Persistence ----------
  const STORAGE_KEY = "jsdash_v1";
  const SAVED_KEY   = "jsdash_saved_v1";

  // ---- Unified state <-> UI
  function serializeState() {
    const chipsActive = Array.from(document.querySelectorAll("#chipsRow .chip.active"))
      .filter(c => !c.classList.contains("removable"))
      .map(c => c.dataset.k);

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
        apigee: !!qs("#roleApigee")?.checked
      },
      dark: !!qs("#darkToggle")?.checked,
      // ✅ New in 3.3:
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
      qsa("#chipsRow .chip").forEach(c => {
        if (!c.classList.contains("removable")) {
          c.classList.toggle("active", chipSet.has(c.dataset.k));
        }
      });
    }

    if (!partial || has("roles")) {
      if (state.roles) {
        if (qs("#roleSRE")) qs("#roleSRE").checked = !!state.roles.sre;
        if (qs("#roleDevOps")) qs("#roleDevOps").checked = !!state.roles.devops;
        if (qs("#roleCloud")) qs("#roleCloud").checked = !!state.roles.cloud;
        if (qs("#roleApigee")) qs("#roleApigee").checked = !!state.roles.apigee;
      }
    }

    // Dark mode
    if (!partial || has("dark")) {
      if (qs("#darkToggle")) {
        const on = !!state.dark;
        qs("#darkToggle").checked = on;
        document.body.classList.toggle("dark", on);
      }
    }

    // ✅ High contrast
    if (!partial || has("highContrast")) {
      const onHC = !!state.highContrast;
      if (qs("#highContrastToggle")) qs("#highContrastToggle").checked = onHC;
      document.body.classList.toggle("hc", onHC);
    }

    // ✅ Reduced motion
    if (!partial || has("reduceMotion")) {
      const onRM = !!state.reduceMotion;
      if (qs("#reduceMotionToggle")) qs("#reduceMotionToggle").checked = onRM;
      document.body.classList.toggle("reduce-motion", onRM);
    }
  }

  function saveState() {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(serializeState())); } catch {}
  }

  function loadState() {
    let raw;
    try { raw = localStorage.getItem(STORAGE_KEY); } catch {}
    if (!raw) return;
    try {
      const s = JSON.parse(raw);
      deserializeState(s, { partial: false });
    } catch {}
  }

  // ---------- Helpers ----------
  function recencyParam() {
    const v = (qs("#recency")?.value || "").trim();
    if (!v) return "";
    if (v.startsWith("h")) return `&tbs=qdr:h${v.substring(1)}`;
    return `&tbs=qdr:${v}`;
  }
  function gUrl(q) {
    return `https://www.google.com/search?q=${encodeURIComponent(q)}${recencyParam()}`;
  }
  function composeLocationFilter() {
    const custom = (qs("#locationCustom")?.value || "").trim();
    if (custom) return `(${custom})`;
    if (locations.length) return "(" + locations.join(" AND ") + ")";
    return DEFAULT_US;
  }
  function activeFiltersCount() {
    const chips = qsa(".chip.active").length;
    const extra = (qs("#extra")?.value || "").trim() ? 1 : 0;
    return chips + extra;
  }
  function updateBadges() {
    const r = (qs("#recency")?.value || "");
    const rText = r ? (r.startsWith("h") ? `Past ${r.substring(1)} hours` :
             r === "d" ? "Past 24 hours" : r === "w" ? "Past week" : "Past month") : "Any time";
    ["#recencyBadge", "#recencyBadge2"].forEach(id => { const b = qs(id); if (b) b.textContent = rText; });

    const count = activeFiltersCount();
    ["#filtersBadge", "#filtersBadge2"].forEach(id => {
      const b = qs(id); if (b) { b.textContent = count ? `${count} filter${count>1?"s":""}` : "0 filters";
        b.classList.toggle("muted", count === 0); }
    });

    const L = locations.length;
    const hasCustom = (qs("#locationCustom")?.value || "").trim();
    const text = hasCustom ? "Custom" : (L ? `${L} location${L>1?"s":""}` : "US");
    ["#locationsBadge", "#locationsBadge2"].forEach(id => {
      const b = qs(id); if (b) { b.textContent = text; b.classList.toggle("muted", !L && !hasCustom); }
    });
  }

  // ---------- Batch helpers ----------
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
    if (idxs.length) return idxs;
    return cards.map((_, i) => i);
  }
  function buildQueriesForIndexes(idxs) {
    const roleBlock = firstCheckedRoleBlock();
    const qsList = [];
    idxs.forEach(i => {
      const p = portals[i];
      if (!p) return;
      const q = composeQuery(roleBlock, p.site);
      qsList.push({ name: p.name, url: gUrl(q) });
    });
    return qsList;
  }

  // ---------- Query composer ----------
  function composeQuery(roleBlock, siteFilter) {
    const filters = [];
    const loc = composeLocationFilter();
    if (loc) filters.push(loc);
    qsa(".chip.active").forEach(c => { if (!c.classList.contains("removable")) filters.push(c.dataset.k); });
    const extra = (qs("#extra")?.value || "").trim();
    if (extra) filters.push(extra);
    return [roleBlock, ...filters, siteFilter].filter(Boolean).join(" ");
  }
  function firstCheckedRoleBlock() {
    if (qs("#roleSRE")?.checked)   return ROLE.SRE;
    if (qs("#roleDevOps")?.checked) return ROLE.DevOps;
    if (qs("#roleCloud")?.checked)  return ROLE.Cloud;
    if (qs("#roleApigee")?.checked) return ROLE.Apigee;
    return ROLE.SRE;
  }

  // ---------- Permalinks (URL <-> State) ----------
  function encodeList(arr) { return (arr || []).join("||"); }
  function decodeList(str) { return str ? str.split("||").filter(Boolean) : []; }

  function stateToParams() {
    const s = serializeState();
    const p = new URLSearchParams();
    p.set("r", s.recency || "");
    p.set("e", s.extra || "");
    p.set("c", s.custom || "");
    p.set("loc", encodeList(s.locations || []));
    p.set("chips", encodeList(s.chips || []));
    const roles = [];
    if (s.roles?.sre) roles.push("SRE");
    if (s.roles?.devops) roles.push("DevOps");
    if (s.roles?.cloud) roles.push("Cloud");
    if (s.roles?.apigee) roles.push("Apigee");
    p.set("roles", roles.join(","));
    p.set("dark", s.dark ? "1" : "0");
    // ✅ New in 3.3:
    p.set("hc", s.highContrast ? "1" : "0");
    p.set("rm", s.reduceMotion ? "1" : "0");
    return p.toString();
  }

  function applyParams() {
    const p = new URLSearchParams(location.search);
    if ([...p.keys()].length === 0) return false; // no params

    const s = {};
    if (p.has("r"))     s.recency = p.get("r") || "";
    if (p.has("e"))     s.extra = p.get("e") || "";
    if (p.has("c"))     s.custom = p.get("c") || "";
    if (p.has("loc"))   s.locations = decodeList(p.get("loc"));
    if (p.has("chips")) s.chips = decodeList(p.get("chips"));
    if (p.has("roles")) {
      const set = new Set((p.get("roles") || "").split(",").filter(Boolean));
      s.roles = {
        sre: set.has("SRE"),
        devops: set.has("DevOps"),
        cloud: set.has("Cloud"),
        apigee: set.has("Apigee"),
      };
    }
    if (p.has("dark")) s.dark = p.get("dark") === "1";
    if (p.has("hc")) s.highContrast = p.get("hc") === "1";
    if (p.has("rm")) s.reduceMotion = p.get("rm") === "1";

    deserializeState(s, { partial: true });
    return true;
  }

  function updatePermalink() {
    const query = stateToParams();
    const url = `${location.pathname}?${query}`;
    history.replaceState(null, "", url);
  }
  // ===== Saved Searches (presets) =====
  function getSavedList() {
    try {
      const raw = localStorage.getItem(SAVED_KEY);
      const arr = raw ? JSON.parse(raw) : [];
      return Array.isArray(arr) ? arr : [];
    } catch { return []; }
  }

  function setSavedList(list) {
    try { localStorage.setItem(SAVED_KEY, JSON.stringify(list)); } catch {}
  }

  function renderSavedDropdown() {
    const sel = document.querySelector("#savedList");
    if (!sel) return;
    const list = getSavedList();
    sel.innerHTML = "";
    const placeholder = document.createElement("option");
    placeholder.value = "";
    placeholder.textContent = list.length ? "Select a preset…" : "No presets saved";
    sel.appendChild(placeholder);
    list.forEach(({ name }) => {
      const opt = document.createElement("option");
      opt.value = name;
      opt.textContent = name;
      sel.appendChild(opt);
    });

    // Enable/disable action buttons
    const hasAny = list.length > 0;
    document.querySelector("#loadPresetBtn")?.toggleAttribute("disabled", !hasAny);
    document.querySelector("#deletePresetBtn")?.toggleAttribute("disabled", !hasAny);
  }

  function saveCurrentSearch(name) {
    if (!name || !name.trim()) {
      alert("Please enter a preset name.");
      return;
    }
    const trimmed = name.trim();
    const list = getSavedList();
    const existingIdx = list.findIndex(x => x.name.toLowerCase() === trimmed.toLowerCase());
    const payload = { name: trimmed, state: serializeState() };

    if (existingIdx >= 0) {
      const ok = confirm(`Preset "${trimmed}" already exists. Overwrite?`);
      if (!ok) return;
      list[existingIdx] = payload;
    } else {
      list.push(payload);
    }
    setSavedList(list);
    renderSavedDropdown();
  }

  function loadSavedSearch(name) {
    const list = getSavedList();
    const found = list.find(x => x.name === name);
    if (!found) return;
    deserializeState(found.state, { partial: false });
    renderLocationChips();
    // Persist + sync URL + re-render
    saveState();
    (function rerenderAfterLoad() {
      // ensure UI listeners pick up new values
      const evt = new Event("change");
      ["#recency","#extra","#locationCustom","#roleSRE","#roleDevOps","#roleCloud","#roleApigee"].forEach(id=>{
        const el = document.querySelector(id); if (el) el.dispatchEvent(evt);
      });
      renderCards();
    })();
  }

  function deleteSavedSearch(name) {
    const list = getSavedList();
    const next = list.filter(x => x.name !== name);
    setSavedList(next);
    renderSavedDropdown();
  }

  // ---------- Renderer (cards) ----------
  function renderCards() {
    updateBadges();

    const grid = qs("#resultsGrid");
    if (!grid) return;

    grid.innerHTML = "";
    const frag = document.createDocumentFragment();

    if (!Array.isArray(portals) || portals.length === 0) {
      grid.appendChild(document.createTextNode("No portals configured."));
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
      title.className = "portal"; title.textContent = p.name;
      const domain = document.createElement("div");
      domain.className = "domain"; domain.textContent = p.domain || "";
      head.appendChild(title); head.appendChild(domain);

      const roleRow = document.createElement("div");
      roleRow.className = "role-row";
      const addRoleButton = (label, block) => {
        const q = composeQuery(block, p.site);
        const a = document.createElement("a");
        a.className = "role-btn"; a.href = gUrl(q); a.target = "_blank"; a.rel = "noopener";
        const span = document.createElement("span"); span.className = "label"; span.textContent = `${label} `;
        const tools = document.createElement("div"); tools.className = "role-tools";
        const copy = document.createElement("button"); copy.className = "mini"; copy.textContent = "Copy";
        copy.onclick = (e) => {
          e.preventDefault();
          navigator.clipboard.writeText(q).then(() => {
            copy.textContent = "Copied!";
            setTimeout(() => (copy.textContent = "Copy"), 900);
          });
        };
        tools.appendChild(copy);
        a.appendChild(span); a.appendChild(tools);
        roleRow.appendChild(a);
      };

      if (qs("#roleSRE")?.checked)   addRoleButton("SRE",   ROLE.SRE);
      if (qs("#roleDevOps")?.checked) addRoleButton("DevOps", ROLE.DevOps);
      if (qs("#roleCloud")?.checked)  addRoleButton("Cloud",  ROLE.Cloud);
      if (qs("#roleApigee")?.checked) addRoleButton("Apigee", ROLE.Apigee);

      const body = document.createElement("div");
      body.appendChild(head);
      body.appendChild(roleRow);

      const sel = document.createElement("div");
      sel.className = "select-col";
      const cb = document.createElement("input"); cb.type="checkbox"; cb.className="rowSelect";
      const openOne = document.createElement("button"); openOne.className="btn ghost mini"; openOne.textContent = "Open";
      openOne.setAttribute("aria-label", `Open ${p.name} with current filters`);
      openOne.onclick = () => {
        const roleBlock = firstCheckedRoleBlock();
        const q = composeQuery(roleBlock, p.site);
        window.open(gUrl(q), "_blank");
      };
      sel.appendChild(cb); sel.appendChild(openOne);

      card.appendChild(left);
      card.appendChild(body);
      card.appendChild(sel);

      frag.appendChild(card);
    });

    grid.appendChild(frag);

    saveState();
    updatePermalink();

    if (focusResultsNextRender) {
      focusResultsNextRender = false;
      if (grid) grid.focus();
    }
  }

  // ---------- Bind events ----------
  function bind() {
    qsa("#chipsRow .chip").forEach(c =>
      c.addEventListener("click", () => {
        c.classList.toggle("active");
        scheduleRender();
      })
    );

    const form = qs("#searchForm");
    if (form) {
      form.addEventListener("submit", (e) => {
        e.preventDefault();
        focusResultsNextRender = true;
        scheduleRender();
      });
    }

    qs("#resetBtn")?.addEventListener("click", () => {
      qsa("#chipsRow .chip").forEach(c => c.classList.remove("active"));
      ["extra", "locationCustom"].forEach(id => {
        const el = qs("#" + id);
        if (el) el.value = "";
      });
      if (qs("#recency")) qs("#recency").value = "";
      locations = [];
      renderLocationChips();
      scheduleRender();
    });

    qs("#addSelectedLocations")?.addEventListener("click", () => {
      const sel = qs("#locationPicker");
      if (!sel) return;
      Array.from(sel.selectedOptions).forEach(opt => addLocationChip(opt.value));
      sel.selectedIndex = -1;
    });
    qs("#clearLocations")?.addEventListener("click", () => {
      locations = [];
      if (qs("#locationCustom")) qs("#locationCustom").value = "";
      renderLocationChips();
      scheduleRender();
    });

    ["roleSRE","roleDevOps","roleCloud","roleApigee","recency","extra","locationCustom"].forEach(id=>{
      qs("#"+id)?.addEventListener("change", scheduleRender);
    });

    qs("#openSelectedBtn")?.addEventListener("click", () => {
      const roleBlock = firstCheckedRoleBlock();
      const cards = qsa(".portal-card");
      cards.forEach((card, idx) => {
        const cb = card.querySelector(".rowSelect");
        if (cb && cb.checked) {
          const p = portals[idx];
          if (!p) return;
          const q = composeQuery(roleBlock, p.site);
          window.open(gUrl(q), "_blank");
        }
      });
    });

    // Dark mode
    const dark = qs("#darkToggle");
    if (dark) {
      const setDark = (on) => {
        document.body.classList.toggle("dark", on);
        saveState(); updatePermalink();
      };
      setDark(!!dark.checked);
      dark.addEventListener("change", () => setDark(dark.checked));
    }

    // ===== Saved Searches UI wiring =====
    const saveBtn = qs("#savePresetBtn");
    const loadBtn = qs("#loadPresetBtn");
    const delBtn  = qs("#deletePresetBtn");
    const saveName = qs("#saveName");
    const savedList = qs("#savedList");

    if (saveBtn) {
      saveBtn.addEventListener("click", () => {
        saveCurrentSearch(saveName?.value || "");
      });
    }
    if (loadBtn) {
      loadBtn.addEventListener("click", () => {
        const name = savedList?.value || "";
        if (!name) return;
        loadSavedSearch(name);
      });
    }
    if (delBtn) {
      delBtn.addEventListener("click", () => {
        const name = savedList?.value || "";
        if (!name) return;
        const ok = confirm(`Delete preset "${name}"?`);
        if (!ok) return;
        deleteSavedSearch(name);
      });
    }


    // ✅ High Contrast
    const hcToggle = qs("#highContrastToggle");
    if (hcToggle) {
      const setHC = (on) => {
        document.body.classList.toggle("hc", on);
        saveState(); updatePermalink();
      };
      setHC(!!hcToggle.checked);
      hcToggle.addEventListener("change", () => setHC(hcToggle.checked));
    }

    // ✅ Reduced Motion
    const rmToggle = qs("#reduceMotionToggle");
    if (rmToggle) {
      const setRM = (on) => {
        document.body.classList.toggle("reduce-motion", on);
        saveState(); updatePermalink();
      };
      setRM(!!rmToggle.checked);
      rmToggle.addEventListener("change", () => setRM(rmToggle.checked));
    }

    // Optional: Share link button (if present in HTML)
    qs("#shareLinkBtn")?.addEventListener("click", async () => {
      updatePermalink();
      try {
        await navigator.clipboard.writeText(location.href);
        const btn = qs("#shareLinkBtn");
        if (btn) { btn.textContent = "Copied!"; setTimeout(() => btn.textContent = "Share search", 1000); }
      } catch {
        alert("Copy failed. You can manually copy the address bar URL.");
      }
    });

    // Keyboard Shortcuts
    document.addEventListener("keydown", (e) => {
      const tag = (e.target && e.target.tagName) ? e.target.tagName.toLowerCase() : "";
      const isTyping = tag === "input" || tag === "textarea" || e.target.isContentEditable;
      if (isTyping && e.key !== "Escape") return;

      const focusEl = (sel) => { const el = qs(sel); if (el) { el.focus(); el.select?.(); } };

      switch (e.key) {
        case "/":
        case "s":
        case "S":
          e.preventDefault(); focusEl("#extra"); break;
        case "l":
        case "L":
          e.preventDefault(); focusEl("#locationCustom"); break;
        case "r":
        case "R":
          e.preventDefault(); focusEl("#recency"); break;
        case "o":
        case "O":
          e.preventDefault(); qs("#openSelectedBtn")?.click(); break;
        case "g":
        case "G":
          e.preventDefault(); qs("#resultsGrid")?.focus(); break;
        case "d":
        case "D": {
          e.preventDefault();
          const darkEl = qs("#darkToggle");
          if (darkEl) { darkEl.checked = !darkEl.checked; darkEl.dispatchEvent(new Event("change")); }
          break;
        }
        case "Escape":
          if (isTyping) e.target.blur();
          break;
        default:
          break;
      }
    });
  }

  // ---------- Init ----------
  document.addEventListener("DOMContentLoaded", () => {
    // 1) Prefer URL params
    const usedUrl = applyParams();

    // ✅ Respect system prefs only on first load when no URL and no storage
    let hadStorage = false;
    try { hadStorage = !!localStorage.getItem(STORAGE_KEY); } catch {}
    if (!usedUrl && !hadStorage) {
      const prefersDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
      const darkEl = qs("#darkToggle");
      if (darkEl) { darkEl.checked = prefersDark; document.body.classList.toggle("dark", prefersDark); }

      const prefersReduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const rmEl = qs("#reduceMotionToggle");
      if (rmEl) { rmEl.checked = prefersReduce; document.body.classList.toggle("reduce-motion", prefersReduce); }
    }

    // 2) Fallback to localStorage
    if (!usedUrl) loadState();

    renderLocationChips();
    renderSavedDropdown();
    bind();
    renderCards();
  });
})();
