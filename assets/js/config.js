/* ----------------------------------------------------------
   Job Search Dashboard — Config
   Holds constants (portals, roles, defaults, recency options)
----------------------------------------------------------- */

export const PORTALS = [
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

export const ROLE = {
  SRE: '("Site Reliability Engineer" OR "SRE" OR "Platform Engineer" OR "Infrastructure Engineer" OR "Production Engineer" OR "Observability Engineer" OR "Monitoring Engineer" OR "Telemetry Engineer" OR "Observability")',
  DevOps: '("DevOps Engineer" OR "DevOps" OR "Platform Engineer" OR "Infrastructure Engineer" OR "Observability Engineer" OR "Monitoring Engineer" OR "Telemetry Engineer" OR "Observability")',
  Cloud: '("Cloud Engineer" OR "Cloud Infrastructure" OR "Cloud Platform" OR "Cloud DevOps" OR "Observability Engineer" OR "Monitoring Engineer" OR "Telemetry Engineer" OR "Observability")',
  Apigee: '("Apigee Engineer" OR "Apigee Developer" OR "API Platform Engineer" OR "API Gateway")'
};

export const DEFAULT_US = '("US" OR "United States" OR USA)';