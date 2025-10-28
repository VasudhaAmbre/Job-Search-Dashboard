/* Job Search Dashboard — main.js (matches your current HTML) */

(function () {
  const qs = (s) => document.querySelector(s);
  const qsa = (s) => Array.from(document.querySelectorAll(s));

  // ---------- Data (ranked) ----------
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

  // ---------- Role blocks (Observability merged) ----------
  const ROLE = {
    sre: '("Site Reliability Engineer" OR "SRE" OR "Platform Engineer" OR "Infrastructure Engineer" OR "Production Engineer" OR "Observability Engineer" OR "Monitoring Engineer" OR "Telemetry Engineer" OR "Observability")',
    devops: '("DevOps Engineer" OR "DevOps" OR "Platform Engineer" OR "Infrastructure Engineer" OR "Observability Engineer" OR "Monitoring Engineer" OR "Telemetry Engineer" OR "Observability")',
    cloud: '("Cloud Engineer" OR "Cloud Infrastructure" OR "Cloud Platform" OR "Cloud DevOps" OR "Observability Engineer" OR "Monitoring Engineer" OR "Telemetry Engineer" OR "Observability")',
    apigee: '("Apigee Engineer" OR "Apigee Developer" OR "API Platform Engineer" OR "API Gateway")'
  };

  function recencyParam() {
    const v = (qs("#recency")?.value || "").trim();
    if (!v) return "";
    if (v.startsWith("h")) return `&tbs=qdr:h${v.substring(1)}`;
    return `&tbs=qdr:${v}`;
  }

  function gUrl(q) {
    return `https://www.google.com/search?q=${encodeURIComponent(q)}${recencyParam()}`;
  }

  function composeQuery(roleBlock, siteFilter) {
    const filters = [];
    const loc = (qs("#location")?.value || "").trim();
    if (loc) filters.push(`(${loc})`); else filters.push('("US" OR "United States" OR USA)');
    qsa(".chip.active").forEach(c => filters.push(c.dataset.k));
    const extra = (qs("#extra")?.value || "").trim();
    if (extra) filters.push(extra);
    return [roleBlock, ...filters, siteFilter].filter(Boolean).join(" ");
  }

  function firstCheckedRole() {
    if (qs("#roleSRE")?.checked)   return ROLE.sre;
    if (qs("#roleDevOps")?.checked) return ROLE.devops;
    if (qs("#roleCloud")?.checked)  return ROLE.cloud;
    if (qs("#roleApigee")?.checked) return ROLE.apigee;
    return ROLE.sre; // fallback
  }

  function render() {
    const tbody = qs("#portal-table tbody");
    tbody.innerHTML = "";

    const useSRE = qs("#roleSRE")?.checked;
    const useDev = qs("#roleDevOps")?.checked;
    const useCld = qs("#roleCloud")?.checked;
    const useApi = qs("#roleApigee")?.checked;

    portals.forEach((p, i) => {
      const tr = document.createElement("tr");

      const tdIdx = document.createElement("td"); tdIdx.textContent = i + 1;
      const tdName = document.createElement("td"); tdName.textContent = p.name;

      function roleCell(roleBlock) {
        const q = composeQuery(roleBlock, p.site);
        const cell = document.createElement("td");
        const a = document.createElement("a"); a.href = gUrl(q); a.target = "_blank"; a.rel = "noopener"; a.textContent = "Search US Jobs";
        const qEl = document.createElement("div"); qEl.className = "q"; qEl.textContent = "q=" + q;
        const tools = document.createElement("div"); tools.className = "tools";
        const copy = document.createElement("button"); copy.className = "mini"; copy.textContent = "Copy query";
        copy.addEventListener("click", () => {
          navigator.clipboard.writeText(q).then(() => {
            copy.textContent = "Copied!";
            setTimeout(() => (copy.textContent = "Copy query"), 900);
          });
        });
        tools.appendChild(copy);
        cell.appendChild(a); cell.appendChild(qEl); cell.appendChild(tools);
        return cell;
      }

      tr.appendChild(tdIdx);
      tr.appendChild(tdName);
      tr.appendChild(useSRE ? roleCell(ROLE.sre)   : document.createElement("td"));
      tr.appendChild(useDev ? roleCell(ROLE.devops): document.createElement("td"));
      tr.appendChild(useCld ? roleCell(ROLE.cloud) : document.createElement("td"));
      tr.appendChild(useApi ? roleCell(ROLE.apigee): document.createElement("td"));

      const tdDomain = document.createElement("td"); tdDomain.textContent = p.domain;
      const tdSel = document.createElement("td"); const cb = document.createElement("input"); cb.type = "checkbox"; cb.className = "rowSelect"; tdSel.appendChild(cb);

      tr.appendChild(tdDomain);
      tr.appendChild(tdSel);
      tbody.appendChild(tr);
    });
  }

  function bind() {
    // Apply + Reset
    qs("#applyBtn")?.addEventListener("click", render);
    qs("#resetBtn")?.addEventListener("click", () => {
      qsa(".chip").forEach(c => c.classList.remove("active"));
      ["location", "extra"].forEach(id => { const el = qs("#" + id); if (el) el.value = ""; });
      const rec = qs("#recency"); if (rec) rec.value = "";
      render();
    });

    // Chips
    qsa(".chip").forEach(c => c.addEventListener("click", () => {
      c.classList.toggle("active"); render();
    }));

    // Role toggles + inputs (live update too)
    ["roleSRE","roleDevOps","roleCloud","roleApigee","location","recency","extra"].forEach(id=>{
      qs("#"+id)?.addEventListener("change", render);
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

    // Open selected (uses FIRST checked role)
    qs("#openSelectedBtn")?.addEventListener("click", () => {
      const roleBlock = firstCheckedRole();
      qsa("#portal-table tbody tr").forEach(tr => {
        const checked = tr.querySelector(".rowSelect")?.checked;
        if (!checked) return;
        const name = tr.children[1].textContent.trim();
        const p = portals.find(x => x.name === name);
        if (!p) return;
        const q = composeQuery(roleBlock, p.site);
        window.open(gUrl(q), "_blank");
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

  // Init
  document.addEventListener("DOMContentLoaded", () => { bind(); render(); });
})();