// assets/js/config.js

// 🔹 Role blocks used by main.js to compose Google queries
export const ROLE = {
  SRE:    '("Site Reliability Engineer" OR SRE)',
  DevOps: '("DevOps Engineer" OR "Platform Engineer" OR "Infrastructure Engineer")',
  Cloud:  '("Cloud Engineer" OR "Cloud Platform" OR "Cloud Infrastructure")',
  Apigee: '("Apigee" OR "API Gateway" OR "API Management")',
};

// 🔹 Default location fallback when no custom/selected chips
export const DEFAULT_US = '(("United States") OR US)';

// 🔹 Job portals (top to bottom = card order & keyboard index)
export const PORTALS = [
  { name: "LinkedIn",      site: 'site:linkedin.com/jobs',       domain: 'linkedin.com/jobs' },
  { name: "Indeed",        site: 'site:indeed.com',              domain: 'indeed.com' },
  { name: "Glassdoor",     site: 'site:glassdoor.com',           domain: 'glassdoor.com' },
  { name: "ZipRecruiter",  site: 'site:ziprecruiter.com',        domain: 'ziprecruiter.com' },
  { name: "Dice",          site: 'site:dice.com',                domain: 'dice.com' },

  { name: "Workday",       site: 'site:myworkdayjobs.com',       domain: 'myworkdayjobs.com' },
  { name: "Greenhouse",    site: 'site:greenhouse.io',           domain: 'greenhouse.io' },
  { name: "Lever",         site: 'site:jobs.lever.co',           domain: 'jobs.lever.co' },

  { name: "Ashby",         site: 'site:ashbyhq.com',             domain: 'ashbyhq.com' },
  { name: "SmartRecruiters", site: 'site:smartrecruiters.com',   domain: 'smartrecruiters.com' },
  { name: "BambooHR",      site: 'site:bamboohr.com/careers',    domain: 'bamboohr.com' },
  { name: "Greenhouse Boards", site: 'site:boards.greenhouse.io', domain: 'boards.greenhouse.io' },

  // 🔹 Add more as you like:
  // { name: "Company Careers", site: 'site:careers.company.com', domain: 'careers.company.com' },
];
