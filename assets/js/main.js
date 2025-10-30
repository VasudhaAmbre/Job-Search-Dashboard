/* Job Search Dashboard — Card Layout (Indeed-style) */
import { PORTALS as portals, ROLE, DEFAULT_US } from "./config.js";

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
  let locations = []; // added chips (strings)

  // ---------- Persistence ----------
  const STORAGE_KEY = "jsdash_v1";

  function saveState() {
    const chipsActive = Array.from(document.querySelectorAll("#chipsRow .chip.active"))
      .filter(c => !c.classList.contains("removable"))
      .map(c => c.dataset.k);

    const state = {
      recency: qs("#recency")?.value || "",
      extra: qs("#extra")?.value || "",
      custom: qs("#locationCustom")?.value || "",
      locations,
      chips: chipsActive,
      roles: {
        sre: !!qs("#roleSRE")?.checked,
        devops: !!qs("#roleDevOps")?.checked,
        cloud: !!qs("#roleCloud")?.checked,
        apigee: !!qs("#roleApigee")?.checked
      },
      dark: !!qs("#darkToggle")?.checked
    };
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch {}
  }

  function loadState() {
    let raw;
    try { raw = localStorage.getItem(STORAGE_KEY); } catch {}
    if (!raw) return;

    const s = JSON.parse(raw);

    if (qs("#recency")) qs("#recency").value = s.recency ?? "";
    if (qs("#extra")) qs("#extra").value = s.extra ?? "";
    if (qs("#locationCustom")) qs("#locationCustom").value = s.custom ?? "";

    locations = Array.isArray(s.locations) ? s.locations.slice(0, 50) : [];

    if (Array.isArray(s.chips)) {
      qsa("#chipsRow .chip").forEach(c => {
        if (!c.classList.contains("removable")) {
          c.classList.toggle("active", s.chips.includes(c.dataset.k));
        }
      });
    }

    if (s.roles) {
      if (qs("#roleSRE")) qs("#roleSRE").checked = !!s.roles.sre;
      if (qs("#roleDevOps")) qs("#roleDevOps").checked = !!s.roles.devops;
      if (qs("#roleCloud")) qs("#roleCloud").checked = !!s.roles.cloud;
      if (qs("#roleApigee")) qs("#roleApigee").checked = !!s.roles.apigee;
    }

    if (qs("#darkToggle")) {
      qs("#darkToggle").checked = !!s.dark;
      document.body.classList.toggle("dark", !!s.dark);
    }
  }
  // ---------- Permalinks (URL <-> State) ----------
  function encodeList(arr) { return (arr || []).join("||"); }
  function decodeList(str) { return str ? str.split("||").filter(Boolean) : []; }

  function stateToParams() {
    const p = new URLSearchParams();
    p.set("r", qs("#recency")?.value || "");
    p.set("e", qs("#extra")?.value || "");
    p.set("c", qs("#locationCustom")?.value || "");
    p.set("loc", encodeList(locations));

    const chips = Array.from(document.querySelectorAll("#chipsRow .chip.active"))
      .filter(c => !c.classList.contains("removable"))
      .map(c => c.dataset.k);
    p.set("chips", encodeList(chips));

    const roles = ["SRE","DevOps","Cloud","Apigee"].filter(x => qs("#role"+x)?.checked);
    p.set("roles", roles.join(","));

    p.set("dark", qs("#darkToggle")?.checked ? "1" : "0");
    return p.toString();
  }

  function applyParams() {
    const p = new URLSearchParams(location.search);
    if ([...p.keys()].length === 0) return false; // no params to apply

    // Basic fields
    if (qs("#recency")) qs("#recency").value = p.get("r") || "";
    if (qs("#extra")) qs("#extra").value = p.get("e") || "";
    if (qs("#locationCustom")) qs("#locationCustom").value = p.get("c") || "";

    // Locations (removable chips)
    locations = decodeList(p.get("loc"));

    // Quick chips (non-removable)
    const chipsSet = new Set(decodeList(p.get("chips")));
    qsa("#chipsRow .chip").forEach(c => {
      if (!c.classList.contains("removable")) {
        c.classList.toggle("active", chipsSet.has(c.dataset.k));
      }
    });

    // Roles (only if provided)
    const rolesStr = p.get("roles") || "";
    const roleSet = new Set(rolesStr.split(",").filter(Boolean));
    if (roleSet.size) {
      if (qs("#roleSRE")) qs("#roleSRE").checked = roleSet.has("SRE");
      if (qs("#roleDevOps")) qs("#roleDevOps").checked = roleSet.has("DevOps");
      if (qs("#roleCloud")) qs("#roleCloud").checked = roleSet.has("Cloud");
      if (qs("#roleApigee")) qs("#roleApigee").checked = roleSet.has("Apigee");
    }

    // Dark mode (only if provided)
    if (qs("#darkToggle") && p.has("dark")) {
      const on = p.get("dark") === "1";
      qs("#darkToggle").checked = on;
      document.body.classList.toggle("dark", on);
    }

    return true;
  }

  function updatePermalink() {
    const query = stateToParams();
    const url = `${location.pathname}?${query}`;
    history.replaceState(null, "", url);
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

  // ---------- UI: locations (chips) ----------
  function addLocationChip(text) {
    if (!text || locations.includes(text)) return;
    locations.push(text);
    renderLocationChips();
    scheduleRender();
  }
  function removeLocationChip(text) {
    locations = locations.filter(l => l !== text);
    renderLocationChips();
    scheduleRender();
  }
  function renderLocationChips() {
    const wrap = qs("#locationsChips");
    if (!wrap) return;
    wrap.innerHTML = "";
    locations.forEach(L => {
      const pill = document.createElement("span");
      pill.className = "chip active removable";
      pill.textContent = L.replaceAll('"','');
      const x = document.createElement("button");
      x.className = "chip-x"; x.textContent = "×"; x.title = "Remove";
      x.onclick = () => removeLocationChip(L);
      pill.appendChild(x);
      wrap.appendChild(pill);
    });
    updateBadges();
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

    // persist latest UI state
    saveState();
  }

  // ---------- Bind events ----------
  function bind() {
    qsa("#chipsRow .chip").forEach(c =>
      c.addEventListener("click", () => {
        c.classList.toggle("active");
        scheduleRender();
      })
    );

    // Apply / reset (form submit friendly)
    const form = qs("#searchForm");
    if (form) {
      form.addEventListener("submit", (e) => {
        e.preventDefault();
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

    // Sidebar locations
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

    const dark = qs("#darkToggle");
    if (dark) {
      const setDark = (on) => {
        document.body.classList.toggle("dark", on);
        saveState();
        updatePermalink();
      };
      setDark(true);
      dark.addEventListener("change", () => setDark(dark.checked));
    }
  }

  // ---------- Init ----------
  document.addEventListener("DOMContentLoaded", () => {
    // 1) Try to hydrate from URL first
    const usedUrl = applyParams();

    // 2) If no URL state, fall back to localStorage
    if (!usedUrl) {
      loadState();
    }

    renderLocationChips();
    bind();
    renderCards(); // triggers save + updatePermalink
  });

})();
