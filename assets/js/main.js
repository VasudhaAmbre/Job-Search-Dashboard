/* Job Search Dashboard — Enhanced main.js
   Features:
   - Multi-select locations + chips; US fallback intelligently omitted
   - Global recency (tbs) with prominent badge
   - Dynamic link label ("Search CA Jobs", "Search Boston Jobs", else "Search US Jobs")
   - Active filters count + highlighting
   - Show Simplified Query toggle
   - Custom role adder (label + query block)
*/

(function () {
  const qs = (s) => document.querySelector(s);
  const qsa = (s) => Array.from(document.querySelectorAll(s));

  // ----- Portals (ranked) -----
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

  // ----- Roles (observability merged) -----
  const ROLE = {
    SRE: '("Site Reliability Engineer" OR "SRE" OR "Platform Engineer" OR "Infrastructure Engineer" OR "Production Engineer" OR "Observability Engineer" OR "Monitoring Engineer" OR "Telemetry Engineer" OR "Observability")',
    DevOps: '("DevOps Engineer" OR "DevOps" OR "Platform Engineer" OR "Infrastructure Engineer" OR "Observability Engineer" OR "Monitoring Engineer" OR "Telemetry Engineer" OR "Observability")',
    Cloud: '("Cloud Engineer" OR "Cloud Infrastructure" OR "Cloud Platform" OR "Cloud DevOps" OR "Observability Engineer" OR "Monitoring Engineer" OR "Telemetry Engineer" OR "Observability")',
    Apigee: '("Apigee Engineer" OR "Apigee Developer" OR "API Platform Engineer" OR "API Gateway")'
  };
  // Custom roles live here (label -> query)
  let customRoles = [];

  // ----- State -----
  let locations = []; // array of strings already wrapped for query
  function usFallbackEnabled() {
    return locations.length === 0 && !qs("#locationCustom")?.value.trim();
  }

  function recencyParam() {
    const v = (qs("#recency")?.value || "").trim();
    if (!v) return "";
    if (v.startsWith("h")) return `&tbs=qdr:h${v.substring(1)}`;
    return `&tbs=qdr:${v}`;
  }

  function gUrl(q) {
    return `https://www.google.com/search?q=${encodeURIComponent(q)}${recencyParam()}`;
  }

  function activeFiltersCount() {
    const chips = qsa(".chip.active").length;
    const extra = (qs("#extra")?.value || "").trim() ? 1 : 0;
    return chips + extra;
  }

  function updateBadges() {
    // Recency badge
    const r = (qs("#recency")?.value || "");
    const rBadge = qs("#recencyBadge");
    rBadge.textContent = r ? `Recency: ${r.replace("h","h ")}`.replace(": ","") : "Any time";

    // Filters badge
    const count = activeFiltersCount();
    const fBadge = qs("#filtersBadge");
    fBadge.textContent = count ? `${count} filter${count>1?"s":""}` : "0 filters";
    fBadge.classList.toggle("muted", count === 0);

    // Locations badge
    const lBadge = qs("#locationsBadge");
    if (locations.length) {
      lBadge.textContent = `${locations.length} location${locations.length>1?"s":""}`;
      lBadge.classList.remove("muted");
    } else if ((qs("#locationCustom")?.value || "").trim()) {
      lBadge.textContent = "Custom";
      lBadge.classList.remove("muted");
    } else {
      lBadge.textContent = "US";
      lBadge.classList.add("muted");
    }
  }

  function addLocationChip(text) {
    if (!text) return;
    if (locations.includes(text)) return;
    locations.push(text);
    renderLocationChips();
    render(); // update table links and labels
  }

  function removeLocationChip(text) {
    locations = locations.filter(l => l !== text);
    renderLocationChips();
    render();
  }

  function renderLocationChips() {
    const wrap = qs("#locationsChips");
    wrap.innerHTML = "";
    locations.forEach(L => {
      const pill = document.createElement("span");
      pill.className = "chip active removable";
      pill.textContent = L.replaceAll('"',''); // readable
      const x = document.createElement("button");
      x.className = "chip-x";
      x.textContent = "×";
      x.title = "Remove";
      x.onclick = () => removeLocationChip(L);
      pill.appendChild(x);
      wrap.appendChild(pill);
    });
    updateBadges();
  }

  function composeLocationFilter() {
    const custom = (qs("#locationCustom")?.value || "").trim();
    if (custom) return `(${custom})`;
    if (locations.length) {
      return "(" + locations.join(" AND ") + ")"; // Multiple states => AND
    }
    if (usFallbackEnabled()) return '("US" OR "United States" OR USA)';
    return ""; // no fallback if user typed custom earlier
  }

  function roleBlocksActive() {
    const blocks = [];
    if (qs("#roleSRE")?.checked) blocks.push(["SRE", ROLE.SRE]);
    if (qs("#roleDevOps")?.checked) blocks.push(["DevOps", ROLE.DevOps]);
    if (qs("#roleCloud")?.checked) blocks.push(["Cloud", ROLE.Cloud]);
    if (qs("#roleApigee")?.checked) blocks.push(["Apigee", ROLE.Apigee]);
    customRoles.forEach(r => blocks.push([r.label, r.query]));
    return blocks;
  }

  function composeQuery(roleBlock, siteFilter) {
    const filters = [];
    const loc = composeLocationFilter();
    if (loc) filters.push(loc);
    // chips & extra
    qsa(".chip.active").forEach(c => {
      if (!c.classList.contains("removable")) filters.push(c.dataset.k);
    });
    const extra = (qs("#extra")?.value || "").trim();
    if (extra) filters.push(extra);
    return [roleBlock, ...filters, siteFilter].filter(Boolean).join(" ");
  }

  function linkLabelForLocation() {
    const custom = (qs("#locationCustom")?.value || "").trim();
    if (custom) return `Search ${custom} Jobs`;
    if (locations.length === 1) {
      // Try to extract readable state name/abbrev
      const pretty = locations[0].replaceAll('"','');
      return `Search ${pretty} Jobs`;
    }
    if (locations.length > 1) return "Search Selected Locations";
    return "Search US Jobs";
  }

  function render() {
    updateBadges();

    const tbody = qs("#portal-table tbody");
    tbody.innerHTML = "";

    const blocks = roleBlocksActive(); // [ [label, query], ... ]

    portals.forEach((p, i) => {
      const tr = document.createElement("tr");
      const tdIdx = document.createElement("td"); tdIdx.textContent = i + 1;
      const tdName = document.createElement("td"); tdName.textContent = p.name;

      function roleCell(roleLabel, roleBlock) {
        const q = composeQuery(roleBlock, p.site);
        const cell = document.createElement("td");

        const a = document.createElement("a");
        a.href = gUrl(q);
        a.target = "_blank"; a.rel = "noopener";
        a.textContent = linkLabelForLocation();

        const qEl = document.createElement("div"); qEl.className = "q"; qEl.textContent = "q=" + q;

        const tools = document.createElement("div"); tools.className = "tools";
        const copy = document.createElement("button"); copy.className = "mini"; copy.textContent = "Copy query";
        copy.addEventListener("click", () => {
          navigator.clipboard.writeText(q).then(() => {
            copy.textContent = "Copied!";
            setTimeout(() => (copy.textContent = "Copy query"), 900);
          });
        });

        const toggle = document.createElement("button"); toggle.className = "mini"; toggle.textContent = "Show simplified";
        let simplifiedOn = false;
        toggle.addEventListener("click", () => {
          simplifiedOn = !simplifiedOn;
          toggle.textContent = simplifiedOn ? "Show full query" : "Show simplified";
          qEl.textContent = simplifiedOn ? simplifyQueryHuman(q) : "q=" + q;
        });

        tools.appendChild(copy); tools.appendChild(toggle);
        cell.appendChild(a); cell.appendChild(qEl); cell.appendChild(tools);
        return cell;
      }

      tr.appendChild(tdIdx);
      tr.appendChild(tdName);

      // built-in role checkboxes in UI control visibility for these 4:
      if (qs("#roleSRE")?.checked)   tr.appendChild(roleCell("SRE", ROLE.SRE)); else tr.appendChild(document.createElement("td"));
      if (qs("#roleDevOps")?.checked) tr.appendChild(roleCell("DevOps", ROLE.DevOps)); else tr.appendChild(document.createElement("td"));
      if (qs("#roleCloud")?.checked)  tr.appendChild(roleCell("Cloud", ROLE.Cloud)); else tr.appendChild(document.createElement("td"));
      if (qs("#roleApigee")?.checked) tr.appendChild(roleCell("Apigee", ROLE.Apigee)); else tr.appendChild(document.createElement("td"));

      // we do not render extra columns for custom roles; they’re appended below as extra rows for clarity
      const tdDomain = document.createElement("td"); tdDomain.textContent = p.domain;
      const tdSel = document.createElement("td"); const cb = document.createElement("input"); cb.type = "checkbox"; cb.className = "rowSelect"; tdSel.appendChild(cb);

      tr.appendChild(tdDomain);
      tr.appendChild(tdSel);
      tbody.appendChild(tr);

      // render a follow-up row per portal if custom roles exist
      if (customRoles.length) {
        const sub = document.createElement("tr");
        const subTd = document.createElement("td"); subTd.colSpan = 8;
        const list = document.createElement("div"); list.className = "custom-role-list";
        customRoles.forEach(r => {
          const q = composeQuery(r.query, p.site);
          const item = document.createElement("div"); item.className = "custom-role-item";
          const link = document.createElement("a"); link.href = gUrl(q); link.target="_blank"; link.rel="noopener"; link.textContent = `${r.label} — ${linkLabelForLocation()}`;
          const copy = document.createElement("button"); copy.className = "mini"; copy.textContent = "Copy";
          copy.addEventListener("click", () => navigator.clipboard.writeText(q));
          item.appendChild(link); item.appendChild(copy);
          list.appendChild(item);
        });
        subTd.appendChild(list);
        sub.appendChild(subTd);
        tbody.appendChild(sub);
      }
    });
  }

  function simplifyQueryHuman(q) {
    // Make a friendlier summary: remove site filter, show role and key filters only
    try {
      const siteIdx = q.lastIndexOf("site:");
      const core = siteIdx > 0 ? q.slice(0, siteIdx).trim() : q;
      return core
        .replaceAll('("US" OR "United States" OR USA)', "US")
        .replaceAll(/\\+/g, "")
        .replaceAll(/\s+/g, " ");
    } catch { return q; }
  }

  function firstCheckedRoleBlock() {
    if (qs("#roleSRE")?.checked)   return ROLE.SRE;
    if (qs("#roleDevOps")?.checked) return ROLE.DevOps;
    if (qs("#roleCloud")?.checked)  return ROLE.Cloud;
    if (qs("#roleApigee")?.checked) return ROLE.Apigee;
    return ROLE.SRE;
  }

  function bind() {
    // Apply / Reset
    qs("#applyBtn")?.addEventListener("click", render);
    qs("#resetBtn")?.addEventListener("click", () => {
      qsa(".chip").forEach(c => c.classList.remove("active"));
      ["extra","locationCustom"].forEach(id => { const el = qs("#"+id); if (el) el.value = ""; });
      qs("#recency").value = "";
      locations = [];
      renderLocationChips();
      render();
    });

    // Chips
    qsa(".chip").forEach(c => c.addEventListener("click", () => {
      c.classList.toggle("active"); render();
    }));

    // Multi-select location picker
    qs("#addSelectedLocations")?.addEventListener("click", () => {
      const sel = qs("#locationPicker");
      Array.from(sel.selectedOptions).forEach(opt => addLocationChip(opt.value));
      sel.selectedIndex = -1;
    });

    // Custom location add/clear
    qs("#addCustomLocation")?.addEventListener("click", () => {
      const v = (qs("#locationCustom")?.value || "").trim();
      if (v) { addLocationChip(v); }
    });
    qs("#clearLocations")?.addEventListener("click", () => {
      locations = []; qs("#locationCustom").value = ""; renderLocationChips(); render();
    });

    // Roles & inputs live update
    ["roleSRE","roleDevOps","roleCloud","roleApigee","recency","extra"].forEach(id=>{
      qs("#"+id)?.addEventListener("change", render);
    });

    // Custom role adder
    qs("#addRoleBtn")?.addEventListener("click", () => {
      const label = (qs("#customRoleName")?.value || "").trim();
      const query = (qs("#customRoleQuery")?.value || "").trim();
      if (!label || !query) return;
      customRoles.push({ label, query });
      const pill = document.createElement("span");
      pill.className = "chip active removable";
      pill.textContent = label;
      const x = document.createElement("button"); x.className = "chip-x"; x.textContent = "×"; x.title = "Remove";
      x.onclick = () => {
        customRoles = customRoles.filter(r => r.label !== label);
        pill.remove(); render();
      };
      pill.appendChild(x);
      qs("#customRoles").appendChild(pill);
      qs("#customRoleName").value = ""; qs("#customRoleQuery").value = "";
      render();
    });

    // Select all
    qs("#colSelectAll")?.addEventListener("change", (e) => {
      qsa(".rowSelect").forEach(cb => cb.checked = e.target.checked);
      const sa = qs("#selectAll"); if (sa) sa.checked = e.target.checked;
    });
    qs("#selectAll")?.addEventListener("change", (e) => {
      qsa(".rowSelect").forEach(cb => cb.checked = e.target.checked);
      const ca = qs("#colSelectAll"); if (ca) ca.checked = e.target.checked;
    });

    // Open selected (uses FIRST checked built-in role)
    qs("#openSelectedBtn")?.addEventListener("click", () => {
      const roleBlock = firstCheckedRoleBlock();
      qsa("#portal-table tbody tr").forEach(tr => {
        const checkbox = tr.querySelector(".rowSelect");
        if (checkbox && checkbox.checked) {
          const name = tr.children[1].textContent.trim();
          const p = portals.find(x => x.name === name);
          if (!p) return;
          const q = composeQuery(roleBlock, p.site);
          window.open(gUrl(q), "_blank");
        }
      });
    });

    // Hide/Show filters
    qs("#toggleFilters")?.addEventListener("click", () => {
      const panel = qs("#filters");
      panel.classList.toggle("open");
      const isOpen = panel.classList.contains("open");
      qs("#toggleFilters").textContent = isOpen ? "Hide filters" : "Show filters";
      qs("#toggleFilters").setAttribute("aria-expanded", String(isOpen));
    });

    // Dark mode
    const dark = qs("#darkToggle");
    if (dark) {
      const setDark = (on) => document.body.classList.toggle("dark", on);
      setDark(true);
      dark.addEventListener("change", () => setDark(dark.checked));
    }
  }

  document.addEventListener("DOMContentLoaded", () => { bind(); render(); });
})();
