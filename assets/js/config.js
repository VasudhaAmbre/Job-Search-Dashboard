// assets/js/config.js

// 🔹 Role blocks used by main.js to compose Google queries
export const ROLE = {
  SRE:           '("Site Reliability Engineer" OR SRE)',
  DevOps:        '("DevOps Engineer" OR "Platform Engineer" OR "Infrastructure Engineer")',
  Cloud:         '("Cloud Engineer" OR "Cloud Platform" OR "Cloud Infrastructure")',
  Apigee:        '("Apigee" OR "API Gateway" OR "API Management")',
  Observability: '("Observability Engineer" OR "Monitoring Engineer" OR "Telemetry Engineer" OR "SRE Observability" OR "Platform Observability" OR "Monitoring")',
};

// 🔹 Default fallback when no custom/selected chips
export const DEFAULT_US =
  '(("United States" OR "U.S." OR "USA" OR "U.S.A." OR "United States of America") OR ("Remote" AND ("US" OR "USA")))';

// 🔹 Hard exclude common India signals (domains + city names)
export const NEGATIVE_GEO =
  ' -site:*.in -site:in.* -"India" -"Bengaluru" -"Bangalore" -"Hyderabad" -"Pune" -"Gurugram" -"Gurgaon" -"Noida" -"Mumbai" -"Chennai" -"New Delhi"';


// 🔹 Master list of job portals / ATS (ordered for optimal coverage)
export const PORTALS = [
  // ───────────────────────────────
  // 1️⃣ Must-Haves — Primary Job Boards
  // ───────────────────────────────
  { name: "LinkedIn",      site: 'site:linkedin.com/jobs',        domain: 'linkedin.com/jobs' },
  { name: "Indeed",        site: 'site:indeed.com',               domain: 'indeed.com' },
  { name: "Glassdoor",     site: 'site:glassdoor.com',            domain: 'glassdoor.com' },
  { name: "ZipRecruiter",  site: 'site:ziprecruiter.com',         domain: 'ziprecruiter.com' },

  // ───────────────────────────────
  // 2️⃣ Core Tech ATS — Modern Back Doors
  // ───────────────────────────────
  { name: "Greenhouse",         site: 'site:greenhouse.io',               domain: 'greenhouse.io' },
  { name: "Greenhouse Boards",  site: 'site:boards.greenhouse.io',        domain: 'boards.greenhouse.io' },
  { name: "Lever",              site: '(site:jobs.lever.co OR site:lever.co)', domain: 'jobs.lever.co / lever.co' },
  { name: "Ashby",              site: '(site:jobs.ashbyhq.com OR site:ashbyhq.com)', domain: 'jobs.ashbyhq.com / ashbyhq.com' },

  // ───────────────────────────────
  // 3️⃣ Enterprise Giants — Corporate Back Doors
  // ───────────────────────────────
  { name: "Workday",       site: 'site:myworkdayjobs.com',        domain: 'myworkdayjobs.com' },
  { name: "iCIMS",         site: 'site:*.icims.com/jobs',         domain: '*.icims.com/jobs' },
  { name: "Oracle Cloud HCM", site: 'site:oraclecloud.com (inurl:CandidateExperience OR inurl:hcmUI)', domain: 'oraclecloud.com' },
  { name: "Oracle Taleo",  site: 'site:taleo.net (inurl:careersection OR inurl:jobdetail)', domain: 'taleo.net' },
  { name: "SuccessFactors (SAP)", site: 'site:*.successfactors.com', domain: '*.successfactors.com' },
  { name: "SmartRecruiters", site: 'site:jobs.smartrecruiters.com', domain: 'jobs.smartrecruiters.com' },
  { name: "ADP Recruiting", site: 'site:recruiting.adp.com',       domain: 'recruiting.adp.com' },
  { name: "UKG / UltiPro",  site: 'site:recruiting.ultipro.com',   domain: 'recruiting.ultipro.com' },
  { name: "Phenom",        site: '(site:*.phenom.com OR site:*.phenompeople.com)', domain: 'phenom.com / phenompeople.com' },
  { name: "Eightfold",     site: 'site:*.eightfold.ai',            domain: '*.eightfold.ai' },

  // ───────────────────────────────
  // 4️⃣ Niche & Specialist Boards
  // ───────────────────────────────
  { name: "Dice",          site: 'site:dice.com',                 domain: 'dice.com' },
  { name: "Wellfound (AngelList)", site: 'site:wellfound.com inurl:/jobs', domain: 'wellfound.com/jobs' },
  { name: "GovernmentJobs (NEOGOV)", site: 'site:governmentjobs.com/careers', domain: 'governmentjobs.com/careers' },
  { name: "Remote Rocketship", site: 'site:remoterocketship.com', domain: 'remoterocketship.com' },

  // ───────────────────────────────
  // 5️⃣ Long-Tail ATS — The Rest
  // ───────────────────────────────
  { name: "Workable",      site: '(site:apply.workable.com OR site:jobs.workable.com)', domain: 'apply.workable.com / jobs.workable.com' },
  { name: "BambooHR",      site: 'site:*.bamboohr.com/careers',   domain: '*.bamboohr.com/careers' },
  { name: "Rippling ATS",  site: 'site:ats.rippling.com',         domain: 'ats.rippling.com' },
  { name: "Jobvite",       site: 'site:jobs.jobvite.com',         domain: 'jobs.jobvite.com' },
  { name: "Avature",       site: 'site:*.avature.net',            domain: '*.avature.net' },
  { name: "Teamtailor",    site: 'site:*.teamtailor.com',         domain: '*.teamtailor.com' },
  { name: "Pinpoint",      site: '(site:*.pinpointhq.com OR site:pinpointhq.com)', domain: '*.pinpointhq.com / pinpointhq.com' },
  { name: "JazzHR",        site: 'site:*.applytojob.com',         domain: '*.applytojob.com' },
  { name: "Paylocity",     site: 'site:recruiting.paylocity.com', domain: 'recruiting.paylocity.com' },
  { name: "Dayforce / Ceridian", site: 'site:careers.dayforcehcm.com', domain: 'careers.dayforcehcm.com' },
  { name: "Recruitee",     site: 'site:*.recruitee.com/o',        domain: '*.recruitee.com/o' },
  { name: "JobScore",      site: 'site:*.jobscore.com',           domain: '*.jobscore.com' },
  { name: "Comeet",        site: 'site:*.comeet.co',              domain: '*.comeet.co' },
  { name: "Zoho Recruit",  site: 'site:*.zohorecruit.com',        domain: '*.zohorecruit.com' },
  { name: "Jobylon",       site: 'site:*.jobylon.com',            domain: '*.jobylon.com' },

  // ───────────────────────────────
  // 6️⃣ Broad Catch-Alls — Safety Nets
  // ───────────────────────────────
  { name: "Generic Careers", site: '(site:jobs.* OR site:careers.* OR inurl:/careers/ OR inurl:/career/)', domain: 'jobs.* / careers.*' },
  { name: "People/Talent",   site: '(site:people.* OR site:talent.*)', domain: 'people.* / talent.*' },
];
