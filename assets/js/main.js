/* Job Search Dashboard — Card Layout (Indeed-style) */

(function () {
  const qs = (s) => document.querySelector(s);
  const qsa = (s) => Array.from(document.querySelectorAll(s));

  // ---------- Render Performance Helpers ----------
  let renderTimer;

  // Debounce rendering so rapid updates (typing, checkbox changes) don’t re-render repeatedly
  function scheduleRender() {
    clearTimeout(renderTimer);
    renderTimer = setTimeout(renderCards, 180); // 180ms delay
  }

  // ---------- Portals (ranked) ----------
  const portals = [
    { name: "LinkedIn", site: "site:linkedin.com/jobs", domain: "linkedin.com/jobs" },
    { name: "Indeed", site: "site:indeed.com", domain: "indeed.com" },
    { name: "Glassdoor", site: "site:glassdoor.com", domain: "glassdoor.com" },
    { name: "ZipRecruiter", site: "site:ziprecruiter.com", domain: "ziprecruiter.com" },
    { name: "Dice", site: "site:dice.com", domain: "dice.com" },

    { name: "Workday", site: "site:myworkdayjobs.com", domain: "myworkdayjobs.com" },
    { name: "Greenhouse", site: "site:greenhouse.io", domain: "greenhouse.io" },
    { name: "Lever", site: "(site:jobs.lever.co OR site:lever.co)", domain: "jobs.lever.co / lever.co" },
    { name: "iCIMS", site: "site:*.icims.com/jobs", domain: "*.icims.com/jobs" },
    { name: "SmartRecruiters", site: "site:jobs.smartrecruiters.com", domain: "jobs.smartrecruiters.com" },
    { name: "Workable", site: "(site:apply.workable.com OR site:jobs.workable.com)", domain: "apply.workable.com / jobs.workable.com" },
    { name: "Ashby", site: "(site:jobs.ashbyhq.com OR site:ashbyhq.com)", domain: "jobs.ashbyhq.com / ashbyhq.com" },
    { name: "SAP SuccessFactors", site: "site:*.successfactors.com", domain: "*.successfactors.com" },
    { name: "Oracle Cloud HCM", site: "site:oraclecloud.com (inurl:CandidateExperience OR inurl:hcmUI)", domain: "oraclecloud.com" },
    { name: "UKG / UltiPro", site: "site:recruiting.ultipro.com", domain: "recruiting.ultipro.com" },
    { name: "ADP Recruiting", site: "site:recruiting.adp.com", domain: "recruiting.adp.com" },
    { name: "Jobvite", site: "site:jobs.jobvite.com", domain: "jobs.jobvite.com" },

    { name: "BambooHR", site: "site:*.bamboohr.com/careers", domain: "*.bamboohr.com/careers" },
    { name: "Recruitee", site: "site:*.recruitee.com/o", domain: "*.recruitee.com/o" },
    { name: "Rippling ATS", site: "site:ats.rippling.com", domain: "ats.rippling.com" },
    { name: "Pinpoint", site: "(site:*.pinpointhq.com OR site:pinpointhq.com)", domain: "*.pinpointhq.com / pinpointhq.com" },
    { name: "BreezyHR", site: "site:breezy.hr", domain: "breezy.hr" },
    { name: "Paylocity", site: "site:recruiting.paylocity.com", domain: "recruiting.paylocity.com" },
    { name: "Oracle Taleo", site: "site:taleo.net (inurl:careersection OR inurl:jobdetail)", domain: "taleo.net" },
    { name: "Wellfound (AngelList Talent)", site: "site:wellfound.com inurl:/jobs", domain: "wellfound.com/jobs" },
    { name: "Remote Rocketship", site: "site:remoterocketship.com", domain: "remoterocketship.com" },
    { name: "Generic Jobs/Careers Subdomains", site: "(site:jobs.* OR site:careers.* OR inurl:/careers/ OR inurl:/career/)", domain: "jobs.* / careers.* / */careers/*" },
    { name: "People/Talent Subdomains", site: "(site:people.* OR site:talent.*)", domain: "people.* / talent.*" }
  ];

  // ---------- Roles (observability merged) ----------
  const ROLE = {
    SRE: '("Site Reliability Engineer" OR "SRE" OR "Platform Engineer" OR "Infrastructure Engineer" OR "Production Engineer" OR "Observability Engineer" OR "Monitoring Engineer" OR "Telemetry Engineer" OR "Observability")',
    DevOps: '("DevOps Engineer" OR "DevOps" OR "Platform Engineer" OR "Infrastructure Engineer" OR "Observability Engineer" OR "Monitoring Engineer" OR "Telemetry Engineer" OR "Observability")',
    Cloud: '("Cloud Engineer" OR "Cloud Infrastructure" OR "Cloud Platform" OR "Cloud DevOps" OR "Observability Engineer" OR "Monitoring Engineer" OR "Telemetry Engineer" OR "Observability")',
    Apigee: '("Apigee Engineer" OR "Apigee Developer" OR "API Platform Engineer" OR "API Gateway")'
  };

  // ---------- State ----------
  let locations = []; // added chips (strings)
  const DEFAULT_US = '("US" OR "United States" OR USA)';

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
    return DEFAULT_US; // fallback
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
  // Simplified label — removes "Search US Jobs" text
  function linkLabelForLocation() {
    const custom = (qs("#locationCustom")?.value || "").trim();
    if (custom) return custom;
    if (locations.length === 1) return locations[0].replaceAll('"', '');
    if (locations.length > 1) return "Selected Locations";
    return ""; // no label text
  }

  // ---------- UI: locations (chips) ----------
  function addLocationChip(text) {
    if (!text || locations.includes(text)) return;
    locations.push(text);
    renderLocationChips(); scheduleRender();
  }
  function removeLocationChip(text) {
    locations = locations.filter(l => l !== text);
    renderLocationChips(); scheduleRender();
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

    // Clear previous cards
    grid.innerHTML = "";

    // Use a DocumentFragment to minimize reflow/repaint
    const frag = document.createDocumentFragment();

    // Defensive: ensure portals exist
    if (!Array.isArray(portals) || portals.length === 0) {
      grid.appendChild(document.createTextNode("No portals configured."));
      return;
    }

    portals.forEach((p, i) => {
      if (!p || !p.name || !p.site) return;

      const card = document.createElement("div");
      card.className = "portal-card";

      // Left index
      const left = document.createElement("div");
      left.className = "left";
      left.textContent = i + 1;

      // Header
      const head = document.createElement("div");
      head.className = "header";
      const title = document.createElement("h4");
      title.className = "portal"; title.textContent = p.name;
      const domain = document.createElement("div");
      domain.className = "domain"; domain.textContent = p.domain || "";
      head.appendChild(title); head.appendChild(domain);

      // Role buttons row
      const roleRow = document.createElement("div"); roleRow.className = "role-row";
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

      // Select + Open
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

      // Append to fragment (fast)
      frag.appendChild(card);
    });

    // Attach all at once
    grid.appendChild(frag);
  }

  // ---------- Bind events ----------
  function bind() {
    // Chips
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
        e.preventDefault();  // prevent page reload
        scheduleRender();    // trigger search
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

    // Role toggles & inputs
    ["roleSRE","roleDevOps","roleCloud","roleApigee","recency","extra","locationCustom"].forEach(id=>{
      qs("#"+id)?.addEventListener("change", scheduleRender);
    });

    // Open selected (uses first checked role)
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
      const setDark = (on) => document.body.classList.toggle("dark", on);
      setDark(true);
      dark.addEventListener("change", () => setDark(dark.checked));
    }
  }

  // ---------- Init ----------
  document.addEventListener("DOMContentLoaded", () => { bind(); renderCards(); });
})();