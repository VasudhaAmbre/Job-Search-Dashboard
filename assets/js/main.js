// ---- DATA ----
const portalsRanked = [
  {name:"LinkedIn", site:'site:linkedin.com/jobs', domain:'linkedin.com/jobs'},
  {name:"Indeed", site:'site:indeed.com', domain:'indeed.com'},
  {name:"Glassdoor", site:'site:glassdoor.com', domain:'glassdoor.com'},
  {name:"ZipRecruiter", site:'site:ziprecruiter.com', domain:'ziprecruiter.com'},
  {name:"Dice", site:'site:dice.com', domain:'dice.com'},
  {name:"Workday", site:'site:myworkdayjobs.com', domain:'myworkdayjobs.com'},
  {name:"Greenhouse", site:'site:greenhouse.io', domain:'greenhouse.io'},
  {name:"Lever", site:'(site:jobs.lever.co OR site:lever.co)', domain:'jobs.lever.co / lever.co'},
  {name:"iCIMS", site:'site:*.icims.com/jobs', domain:'*.icims.com/jobs'},
  {name:"SmartRecruiters", site:'site:jobs.smartrecruiters.com', domain:'jobs.smartrecruiters.com'},
  {name:"SAP SuccessFactors", site:'site:*.successfactors.com', domain:'*.successfactors.com'},
  {name:"Oracle Cloud HCM", site:'site:oraclecloud.com (inurl:CandidateExperience OR inurl:hcmUI)', domain:'oraclecloud.com'},
  {name:"UKG / UltiPro", site:'site:recruiting.ultipro.com', domain:'recruiting.ultipro.com'},
  {name:"ADP Recruiting", site:'site:recruiting.adp.com', domain:'recruiting.adp.com'},
  {name:"Jobvite", site:'site:jobs.jobvite.com', domain:'jobs.jobvite.com'},
  {name:"Workable", site:'(site:apply.workable.com OR site:jobs.workable.com)', domain:'apply.workable.com / jobs.workable.com'},
  {name:"Ashby", site:'(site:jobs.ashbyhq.com OR site:ashbyhq.com)', domain:'jobs.ashbyhq.com / ashbyhq.com'},
  {name:"BambooHR", site:'site:*.bamboohr.com/careers', domain:'*.bamboohr.com/careers'},
  {name:"Recruitee", site:'site:*.recruitee.com/o', domain:'*.recruitee.com/o'},
  {name:"Rippling ATS", site:'site:ats.rippling.com', domain:'ats.rippling.com'},
  {name:"Pinpoint", site:'(site:*.pinpointhq.com OR site:pinpointhq.com)', domain:'*.pinpointhq.com / pinpointhq.com'},
  {name:"BreezyHR", site:'site:breezy.hr', domain:'breezy.hr'},
  {name:"Paylocity", site:'site:recruiting.paylocity.com', domain:'recruiting.paylocity.com'},
  {name:"Oracle Taleo", site:'site:taleo.net (inurl:careersection OR inurl:jobdetail)', domain:'taleo.net'},
  {name:"Wellfound (AngelList Talent)", site:'site:wellfound.com inurl:/jobs', domain:'wellfound.com/jobs'},
  {name:"Remote Rocketship", site:'site:remoterocketship.com', domain:'remoterocketship.com'},
  {name:"Generic Jobs/Careers Subdomains", site:'(site:jobs.* OR site:careers.* OR inurl:/careers/ OR inurl:/career/)', domain:'jobs.* / careers.* / */careers/*'},
  {name:"People/Talent Subdomains", site:'(site:people.* OR site:talent.*)', domain:'people.* / talent.*'}
];

// Observability merged into SRE/DevOps/Cloud
const baseSRE = '("Site Reliability Engineer" OR "SRE" OR "Platform Engineer" OR "Infrastructure Engineer" OR "Production Engineer" OR "Observability Engineer" OR "Monitoring Engineer" OR "Telemetry Engineer" OR "Observability")';
const devOps = '("DevOps Engineer" OR "DevOps" OR "Platform Engineer" OR "Infrastructure Engineer" OR "Observability Engineer" OR "Monitoring Engineer" OR "Telemetry Engineer" OR "Observability")';
const cloud = '("Cloud Engineer" OR "Cloud Infrastructure" OR "Cloud Platform" OR "Cloud DevOps" OR "Observability Engineer" OR "Monitoring Engineer" OR "Telemetry Engineer" OR "Observability")';
const apigee = '("Apigee Engineer" OR "Apigee Developer" OR "API Platform Engineer" OR "API Gateway")';

// ---- UTIL ----
const qs = sel => document.querySelector(sel);
const qsa = sel => Array.from(document.querySelectorAll(sel));

function loadState(){
  try{
    const s = JSON.parse(localStorage.getItem("jsdash")||"{}");
    ["roleSRE","roleDevOps","roleCloud","roleApigee"].forEach(id => {
      if(s[id] !== undefined) qs("#"+id).checked = s[id];
    });
    if(s.location) qs("#location").value = s.location;
    if(s.recency) qs("#recency").value = s.recency;
    if(s.extra) qs("#extra").value = s.extra;
    if(s.dark) document.documentElement.classList.toggle("dark", s.dark), qs("#darkToggle").checked = s.dark;
    if(s.chips){ s.chips.forEach(k => {
      const chip = qsa(".chip").find(c => c.dataset.k === k);
      if(chip) chip.classList.add("active");
    }); }
  }catch(e){}
}
function saveState(){
  const chips = qsa(".chip.active").map(c => c.dataset.k);
  const s = {
    roleSRE: qs("#roleSRE").checked,
    roleDevOps: qs("#roleDevOps").checked,
    roleCloud: qs("#roleCloud").checked,
    roleApigee: qs("#roleApigee").checked,
    location: qs("#location").value.trim(),
    recency: qs("#recency").value,
    extra: qs("#extra").value.trim(),
    chips,
    dark: qs("#darkToggle").checked
  };
  localStorage.setItem("jsdash", JSON.stringify(s));
}

function composeQuery(roleBlock, siteFilter){
  const filters = [];
  const loc = qs("#location").value.trim();
  if(loc){ filters.push(`(${loc})`); } else { filters.push('("US" OR "United States" OR USA)'); }
  qsa(".chip.active").forEach(c => filters.push(c.dataset.k));
  const extra = qs("#extra").value.trim();
  if(extra) filters.push(extra);
  const parts = [roleBlock].concat(filters).concat([siteFilter]).filter(Boolean);
  return parts.join(" ");
}
function recencyParam(){
  const v = qs("#recency").value;
  if(!v) return "";
  return `&tbs=qdr:${v}`;
}
function gUrl(q){ return `https://www.google.com/search?q=${encodeURIComponent(q)}${recencyParam()}`; }

function copyToClipboard(txt, el){
  navigator.clipboard.writeText(txt).then(()=>{
    el.textContent="Copied!";
    setTimeout(()=> el.textContent="Copy query", 1000);
  });
}

// ---- RENDER ----
function render(){
  saveState();
  const tbody = qs("#portal-table tbody");
  tbody.innerHTML = "";
  const useSRE = qs("#roleSRE").checked;
  const useDevOps = qs("#roleDevOps").checked;
  const useCloud = qs("#roleCloud").checked;
  const useApigee = qs("#roleApigee").checked;

  portalsRanked.forEach((p, i) => {
    const tr = document.createElement("tr");

    const idx = document.createElement("td"); idx.textContent = i+1;
    const name = document.createElement("td"); name.textContent = p.name;

    function makeCell(roleBlock){
      const q = composeQuery(roleBlock, p.site);
      const cell = document.createElement("td");
      const link = document.createElement("a"); link.href = gUrl(q); link.target="_blank"; link.rel="noopener"; link.textContent="Search US Jobs";
      const qEl = document.createElement("span"); qEl.className="q"; qEl.textContent = "q=" + q;
      const tools = document.createElement("div"); tools.className="tools";
      const copyBtn = document.createElement("button"); copyBtn.className="mini"; copyBtn.textContent="Copy query";
      copyBtn.addEventListener("click", ()=>copyToClipboard(q, copyBtn));
      tools.appendChild(copyBtn);
      cell.appendChild(link); cell.appendChild(qEl); cell.appendChild(tools);
      return cell;
    }

    tr.appendChild(idx);
    tr.appendChild(name);
    tr.appendChild(useSRE ? makeCell(baseSRE) : document.createElement("td"));
    tr.appendChild(useDevOps ? makeCell(devOps) : document.createElement("td"));
    tr.appendChild(useCloud ? makeCell(cloud) : document.createElement("td"));
    tr.appendChild(useApigee ? makeCell(apigee) : document.createElement("td"));

    const domain = document.createElement("td"); domain.textContent = p.domain;
    const sel = document.createElement("td");
    const cb = document.createElement("input"); cb.type="checkbox"; cb.className="rowSelect";
    sel.appendChild(cb);

    tr.appendChild(domain);
    tr.appendChild(sel);
    tbody.appendChild(tr);
  });
}

// ---- EVENTS ----
function bind(){
  // Chips
  qsa(".chip").forEach(ch => ch.addEventListener("click", ()=>{ ch.classList.toggle("active"); render(); }));
  // Inputs
  ["roleSRE","roleDevOps","roleCloud","roleApigee","location","recency","extra"].forEach(id => {
    qs("#"+id).addEventListener("change", render);
    qs("#"+id).addEventListener("input", (e)=>{ if(id==="location"||id==="extra") return; render(); });
  });
  // Apply / Reset
  qs("#applyBtn").addEventListener("click", render);
  qs("#resetBtn").addEventListener("click", ()=>{
    qsa(".chip.active").forEach(c => c.classList.remove("active"));
    ["location","recency","extra"].forEach(id => qs("#"+id).value="");
    ["roleSRE","roleDevOps","roleCloud","roleApigee"].forEach(id => qs("#"+id).checked = true);
    render();
  });
  // Dark toggle
  qs("#darkToggle").addEventListener("change", e => {
    document.documentElement.classList.toggle("dark", e.target.checked);
    saveState();
  });
  // Select all
  qs("#colSelectAll").addEventListener("change", e => {
    const on = e.target.checked;
    qsa(".rowSelect").forEach(cb => cb.checked = on);
    qs("#selectAll").checked = on;
  });
  qs("#selectAll").addEventListener("change", e => {
    const on = e.target.checked;
    qsa(".rowSelect").forEach(cb => cb.checked = on);
    qs("#colSelectAll").checked = on;
  });
  // Open selected (for first checked role)
  qs("#openSelectedBtn").addEventListener("click", ()=>{
    const firstCheckedRole = ["roleSRE","roleDevOps","roleCloud","roleApigee"].find(id => qs("#"+id).checked);
    if(!firstCheckedRole){ alert("Select at least one role column to open."); return; }
    const roleMap = { roleSRE: baseSRE, roleDevOps: devOps, roleCloud: cloud, roleApigee: apigee };
    const roleBlock = roleMap[firstCheckedRole];
    const rows = qsa("#portal-table tbody tr");
    rows.forEach((tr, idx) => {
      const cb = tr.querySelector(".rowSelect");
      if(cb && cb.checked){
        const portal = portalsRanked[idx];
        const q = composeQuery(roleBlock, portal.site);
        window.open(gUrl(q), "_blank");
      }
    });
  });
  // Collapsible filters
  qs("#toggleFilters").addEventListener("click", ()=>{
    const panel = qs("#filters");
    const open = panel.classList.toggle("open");
    qs("#toggleFilters").textContent = open ? "Hide filters" : "Show filters";
    qs("#toggleFilters").setAttribute("aria-expanded", open ? "true":"false");
  });
}

// ---- INIT ----
loadState();
bind();
render();
