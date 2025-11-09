/* ============================================================
   Job Search Dashboard — config.js
   Centralized configuration for roles, countries, portals, and filters.
   ============================================================ */

/* ---------- Role Queries ---------- */
export const ROLE = {
  SRE:    '("Site Reliability Engineer" OR SRE) (engineer OR engineering)',
  DevOps: '("DevOps" OR "Platform Engineer" OR "Infrastructure Engineer")',
  Cloud:  '("Cloud Engineer" OR "Cloud Platform" OR "Cloud Infrastructure")',
  Apigee: '("Apigee" OR "API Gateway" OR "API Platform")',
};

/* ---------- Default Location & Geo Filtering ---------- */
export const DEFAULT_US = '("United States" OR USA)';

/* Strong negative geo filters to remove offshore/India results (for US searches) */
export const NEGATIVE_GEO = [
  '-site:*.in', '-site:in.*',
  '-"India"', '-"Bengaluru"', '-"Bangalore"', '-"Hyderabad"',
  '-"Pune"', '-"Gurgaon"', '-"Gurugram"', '-"Noida"',
  '-"Mumbai"', '-"Chennai"', '-"New Delhi"'
].join(' ');

/* ---------- Country Configurations ---------- */
export const COUNTRY = {
  US: {
    label: "United States",
    hl: "en", gl: "us", cr: "countryUS",
    uule: "w+CAIQICINVW5pdGVkIFN0YXRlcw",
    defaultQuery: '("United States" OR USA)',
  },
  CA: {
    label: "Canada",
    hl: "en", gl: "ca", cr: "countryCA",
    uule: "",
    defaultQuery: '("Canada")',
  },
  UK: {
    label: "United Kingdom",
    hl: "en", gl: "uk", cr: "countryUK",
    uule: "",
    defaultQuery: '("United Kingdom" OR UK OR "Great Britain")',
  },
  EU: {
    label: "European Union",
    hl: "en", gl: "us", cr: "",
    uule: "",
    defaultQuery: '("Germany" OR "France" OR "Netherlands" OR "Spain" OR "Italy" OR "Sweden" OR "Ireland")',
  },
  Remote: {
    label: "Remote (Global)",
    hl: "en", gl: "us", cr: "",
    uule: "",
    defaultQuery: '("remote" OR "work from anywhere")',
  },
};

/* ---------- Job Portals ---------- */
/* Each entry: name, site: filter, display domain.
   The order controls how they appear in card/table view.
*/
export const PORTALS = [
  { name: "LinkedIn",          site: "site:linkedin.com/jobs",            domain: "linkedin.com/jobs" },
  { name: "Indeed",            site: "site:indeed.com",                   domain: "indeed.com" },
  { name: "Glassdoor",         site: "site:glassdoor.com",                domain: "glassdoor.com" },
  { name: "ZipRecruiter",      site: "site:ziprecruiter.com",             domain: "ziprecruiter.com" },
  { name: "Dice",              site: "site:dice.com",                     domain: "dice.com" },
  { name: "Workday",           site: "site:myworkdayjobs.com",            domain: "myworkdayjobs.com" },
  { name: "Greenhouse",        site: "site:greenhouse.io",                domain: "greenhouse.io" },
  { name: "Greenhouse Boards", site: "site:boards.greenhouse.io",         domain: "boards.greenhouse.io" },
  { name: "Lever",             site: "site:jobs.lever.co",                domain: "jobs.lever.co" },
  { name: "Ashby",             site: "(site:jobs.ashbyhq.com OR site:ashbyhq.com)", domain: "jobs.ashbyhq.com" },
  { name: "iCIMS",             site: "site:careers.icims.com",            domain: "careers.icims.com" },
  { name: "Oracle Cloud HCM",  site: "site:careers.oraclecloud.com",      domain: "careers.oraclecloud.com" },
  { name: "Oracle Taleo",      site: "site:taleo.net",                    domain: "taleo.net" },
  { name: "SmartRecruiters",   site: "site:jobs.smartrecruiters.com",     domain: "jobs.smartrecruiters.com" },
  { name: "BambooHR",          site: "site:*.bamboohr.com/jobs",          domain: "bamboohr.com" },
  { name: "ADP Recruiting",    site: "site:recruiting.adp.com",           domain: "recruiting.adp.com" },
  { name: "Workable",          site: "site:apply.workable.com",           domain: "apply.workable.com" },
  { name: "CareerBuilder",     site: "site:careerbuilder.com",            domain: "careerbuilder.com" },
  { name: "Monster",           site: "site:monster.com",                  domain: "monster.com" },
];
