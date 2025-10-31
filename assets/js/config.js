/* Job Search Dashboard — config.js
   Centralizes role blocks, country settings, portals, and geo exclusions.
*/

export const ROLE = {
  SRE:    '("Site Reliability Engineer" OR SRE) (engineer OR engineering)',
  DevOps: '("DevOps" OR "Platform Engineer" OR "Infrastructure Engineer")',
  Cloud:  '("Cloud Engineer" OR "Cloud Platform" OR "Cloud Infrastructure")',
  Apigee: '("Apigee" OR "API Gateway" OR "API Platform")',
};

/* Default US location bias if user hasn’t added chips/custom */
export const DEFAULT_US = '("United States" OR USA)';

/* Strong negative geo to keep India/offshore spam out of results (works best for US) */
export const NEGATIVE_GEO = [
  '-site:*.in', '-site:in.*',
  '-"India"', '-"Bengaluru"', '-"Bangalore"', '-"Hyderabad"', '-"Pune"',
  '-"Gurgaon"', '-"Gurugram"', '-"Noida"', '-"Mumbai"', '-"Chennai"', '-"New Delhi"'
].join(' ');

/* Country → Google geo parameters.
   uule is optional; adding for US gives “United States” hard bias.
*/
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
    hl: "en", gl: "us", cr: "",          // keep neutral gl but no hard country restriction
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

/* Job portals and their site: filters (order = render order). */
export const PORTALS = [
  { name: "LinkedIn",            site: "site:linkedin.com/jobs",               domain: "linkedin.com/jobs" },
  { name: "Indeed",              site: "site:indeed.com",                      domain: "indeed.com" },
  { name: "Glassdoor",           site: "site:glassdoor.com",                   domain: "glassdoor.com" },
  { name: "ZipRecruiter",        site: "site:ziprecruiter.com",                domain: "ziprecruiter.com" },
  { name: "Greenhouse",          site: "site:greenhouse.io",                   domain: "greenhouse.io" },
  { name: "Greenhouse Boards",   site: "site:boards.greenhouse.io",            domain: "boards.greenhouse.io" },
  { name: "Lever",               site: "site:jobs.lever.co",                   domain: "jobs.lever.co" },
  { name: "Ashby",               site: "(site:jobs.ashbyhq.com OR site:ashbyhq.com)", domain: "jobs.ashbyhq.com" },
  { name: "Workday",             site: "site:myworkdayjobs.com",               domain: "myworkdayjobs.com" },
  { name: "iCIMS",               site: "site:careers.icims.com",               domain: "careers.icims.com" },
  { name: "Oracle Cloud HCM",    site: "site:careers.oraclecloud.com",         domain: "careers.oraclecloud.com" },
  { name: "Oracle Taleo",        site: "site:taleo.net",                       domain: "taleo.net" },
  { name: "SmartRecruiters",     site: "site:jobs.smartrecruiters.com",        domain: "jobs.smartrecruiters.com" },
  { name: "BambooHR",            site: "site:.bamboohr.com/jobs",              domain: "bamboohr.com" },
  { name: "ADP (Recruiting)",    site: "site:recruiting.adp.com",              domain: "recruiting.adp.com" },
  { name: "Workable",            site: "site:apply.workable.com",              domain: "apply.workable.com" },
];
