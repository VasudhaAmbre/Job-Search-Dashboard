/* ---------- Data ---------- */
const portals = [
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

const ROLE_BLOCKS = {
  sre: '("Site Reliability Engineer" OR "SRE" OR "Platform Engineer" OR "Infrastructure Engineer" OR "Production Engineer" OR "Observability Engineer" OR "Monitoring Engineer" OR "Telemetry Engineer" OR "Observability")',
  devops: '("DevOps Engineer" OR "DevOps" OR "Platform Engineer" OR "Infrastructure Engineer" OR "Observability Engineer" OR "Monitoring Engineer" OR "Telemetry Engineer" OR "Observability")',
  cloud: '("Cloud Engineer" OR "Cloud Infrastructure" OR "Cloud Platform" OR "Cloud DevOps" OR "Observability Engineer" OR "Monitoring Engineer" OR "Telemetry Engineer" OR "Observability")',
  apigee: '("Apigee Engineer" OR "Apigee Developer" OR "API Platform Engineer" OR "API Gateway")'
};

let state = {
  role: 'sre',
  location: '',
  recency: '',
  chips: [],
  extra: '',
  dark: true,
  search: ''
};

const qs = s => document.querySelector(s);
const qsa = s => Array.from(document.querySelectorAll(s));

function load(){
  try {
    state = Object.assign(state, JSON.parse(localStorage.getItem("jsdashv2")||"{}"));
  } catch(e){}
  // apply UI
  if(!state.dark) document.body.classList.add("light");
  qs("#location").value = state.location || "";
  qs("#recency").value = state.recency || "";
  qs("#search").value = state.search || "";
  qs("#advanced").classList.add("collapse");
  state.chips.forEach(k => {
    const chip = qsa(".chip").find(c => c.dataset.k === k);
    if(chip) chip.classList.add("active");
  });
  qsa(".tab").forEach(t => t.classList.toggle("active", t.dataset.role === state.role));
  updateRoleHeading();
}

function save(){
  localStorage.setItem("jsdashv2", JSON.stringify(state));
}

function showToast(msg){
  const t = qs("#toast");
  t.textContent = msg;
  t.classList.add("show");
  setTimeout(()=> t.classList.remove("show"), 1200);
}

function recencyParam(){
  const v = state.recency || "";
  if(!v) return "";
  if(v.startsWith("h")){
    const hrs = v.substring(1);
    return `&tbs=qdr:h${hrs}`;
  }
  return `&tbs=qdr:${v}`;
}

function composeQuery(roleBlock, siteFilter){
  const filters = [];
  const loc = state.location?.trim();
  if(loc){ filters.push(`(${loc})`); } else { filters.push('("US" OR "United States" OR USA)'); }
  state.chips.forEach(c => filters.push(c));
  if(state.extra?.trim()) filters.push(state.extra.trim());
  const parts = [roleBlock].concat(filters).concat([siteFilter]).filter(Boolean);
  return parts.join(" ");
}
function gUrl(q){ return `https://www.google.com/search?q=${encodeURIComponent(q)}${recencyParam()}`; }

function updateRoleHeading(){
  const map = {sre: "SRE — Search", devops: "DevOps — Search", cloud: "Cloud — Search", apigee: "Apigee — Search"};
  qs("#roleCol").textContent = map[state.role];
}

function portalMatchesFilter(name){
  const s = (state.search || "").toLowerCase().trim();
  if(!s) return true;
  return name.toLowerCase().includes(s);
}

function render(){
  save();
  updateRoleHeading();
  const tbody = qs("#table tbody");
  tbody.innerHTML = "";
  const roleBlock = ROLE_BLOCKS[state.role];

  portals.forEach((p, i) => {
    if(!portalMatchesFilter(p.name)) return;
    const tr = document.createElement("tr");
    const idx = document.createElement("td"); idx.textContent = (i+1);
    const name = document.createElement("td"); name.textContent = p.name;

    const query = composeQuery(roleBlock, p.site);
    const linkCell = document.createElement("td");
    const a = document.createElement("a"); a.href = gUrl(query); a.target="_blank"; a.rel="noopener"; a.textContent = "Search US Jobs";
    const qSpan = document.createElement("div"); qSpan.className = "q"; qSpan.textContent = "q=" + query;
    const tools = document.createElement("div"); tools.className = "row-tools";
    const copyBtn = document.createElement("button"); copyBtn.className="mini"; copyBtn.textContent="Copy";
    copyBtn.addEventListener("click", ()=>{ navigator.clipboard.writeText(query).then(()=>showToast("Query copied")); });
    const toggleBtn = document.createElement("button"); toggleBtn.className="mini"; toggleBtn.textContent="Show query";
    toggleBtn.addEventListener("click", ()=>{ qSpan.classList.toggle("open"); toggleBtn.textContent = qSpan.classList.contains("open")? "Hide query":"Show query"; });
    tools.appendChild(copyBtn); tools.appendChild(toggleBtn);
    linkCell.appendChild(a); linkCell.appendChild(qSpan); linkCell.appendChild(tools);

    const domain = document.createElement("td"); domain.textContent = p.domain;
    const sel = document.createElement("td");
    const cb = document.createElement("input"); cb.type="checkbox"; cb.className="rowSelect"; sel.appendChild(cb);

    tr.appendChild(idx);
    tr.appendChild(name);
    tr.appendChild(linkCell);
    tr.appendChild(domain);
    tr.appendChild(sel);
    tbody.appendChild(tr);
  });
}

/* ---------- Bindings ---------- */
function bind(){
  // Role tabs
  qsa(".tab").forEach(t => t.addEventListener("click", ()=>{
    qsa(".tab").forEach(x => x.classList.remove("active"));
    t.classList.add("active");
    state.role = t.dataset.role; render();
  }));

  // Inputs
  qs("#apply").addEventListener("click", ()=>{
    state.location = qs("#location").value.trim();
    state.recency = qs("#recency").value;
    state.search = qs("#search").value.trim();
    render();
  });

  // Advanced
  const advToggle = qs("#advancedToggle");
  advToggle.addEventListener("click", ()=>{
    const panel = qs("#advanced");
    const isOpen = panel.classList.toggle("collapse");
    advToggle.textContent = isOpen ? "Advanced" : "Hide advanced";
    advToggle.setAttribute("aria-expanded", String(!isOpen));
  });

  // Chips
  qsa(".chip").forEach(ch => ch.addEventListener("click", ()=>{
    ch.classList.toggle("active");
    const k = ch.dataset.k;
    if(ch.classList.contains("active")) state.chips.push(k);
    else state.chips = state.chips.filter(x => x != k);
    render();
  }));
  qs("#extra").addEventListener("change", ()=>{
    state.extra = qs("#extra").value.trim(); render();
  });

  // Select all / Open selected
  qs("#colSelectAll").addEventListener("change", e => {
    qsa(".rowSelect").forEach(cb => cb.checked = e.target.checked);
    qs("#selectAll").checked = e.target.checked;
  });
  qs("#selectAll").addEventListener("change", e => {
    qsa(".rowSelect").forEach(cb => cb.checked = e.target.checked);
    qs("#colSelectAll").checked = e.target.checked;
  });
  qs("#openSelected").addEventListener("click", ()=>{
    const rows = qsa("#table tbody tr");
    rows.forEach((tr, idx) => {
      const cb = tr.querySelector(".rowSelect");
      if(cb && cb.checked){
        // rebuild based on filtered index mapping
        const name = tr.children[1].textContent;
        const p = portals.find(x => x.name === name);
        if(!p) return;
        const query = composeQuery(ROLE_BLOCKS[state.role], p.site);
        window.open(gUrl(query), "_blank");
      }
    });
  });

  // Dark toggle
  qs("#darkToggle").addEventListener("click", ()=>{
    document.body.classList.toggle("light");
    state.dark = !document.body.classList.contains("light");
    save();
  });
}

load();
bind();
render();
