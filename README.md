# 🌎 Job Search Dashboard — Interactive (SRE / DevOps / Cloud / Apigee / Observability)

A **lightweight, framework-free job search dashboard** that lets you instantly query **40+ top career portals** (LinkedIn, Greenhouse, Workday, etc.) using **Google advanced search operators** — optimized for **SRE, DevOps, Cloud, Apigee**, and **Observability** roles.

🟢 **Live Demo:**
👉 [https://vasudhaambre.github.io/Job-Search-Dashboard/](https://vasudhaambre.github.io/Job-Search-Dashboard/)

---

## 🚀 Overview

This dashboard helps you **automate and centralize** all your job searches across major ATS and job boards.
You can filter by **role**, **location**, **recency**, **keywords**, and **job level**, and open all matching job portals with one click.

✅ Runs fully offline (client-side)
✅ No API keys or server setup
✅ Perfect for GitHub Pages or local use

---

## ✨ Features

* ✅ **Search across 40+ job portals** — LinkedIn, Workday, Greenhouse, Lever, Dice, and more
* ✅ **Multiple role filters** — SRE, DevOps, Cloud, Apigee, Observability
* ✅ **Geo filter (US-only)** — Excludes all India-based results automatically
* ✅ **Recency filters (1 hr → month)** — Includes “just posted” keyword support for ultra-fresh listings
* ✅ **Quick chips** — Remote, Sponsorship / H1B, Entry, Senior, US-only, and more
* ✅ **One-click utilities** — Open all portals, copy all search links, or batch open in groups of 5
* ✅ **Accessibility options** — Dark Mode, High Contrast, and Reduced Motion
* ✅ **Persistent preferences** — Auto-saves filters and settings using `localStorage`
* ✅ **Lightweight & offline-ready** — No dependencies, no build step, runs directly from `index.html`

---

## 🧭 Quick Start

### 🖥️ Run Locally

1. Clone or download this repo:

   ```bash
   git clone https://github.com/VasudhaAmbre/Job-Search-Dashboard.git
   cd Job-Search-Dashboard
   ```
2. Open `index.html` in your browser — no installation required.

### 🌐 Live on GitHub Pages

Already live here:
➡️ **[https://vasudhaambre.github.io/Job-Search-Dashboard/](https://vasudhaambre.github.io/Job-Search-Dashboard/)**

---

## ⚙️ How to Use

### 1️⃣ Select Role(s)

Toggle one or more:

* **SRE** – Site Reliability, Observability, Platform roles
* **DevOps** – DevOps, Infrastructure, CI/CD engineering
* **Cloud** – Cloud Engineer, Cloud Platform, AWS/Azure/GCP
* **Apigee** – API Management, API Gateway, Apigee roles

Each selected role builds a unique query per portal.

---

### 2️⃣ Apply Filters

#### 🔹 Quick Chips (one-click filters)

| Chip                  | Function                                                   |
| --------------------- | ---------------------------------------------------------- |
| **Remote / Hybrid**   | Adds remote / hybrid terms                                 |
| **Sponsorship / H1B** | Filters roles that mention sponsorship                     |
| **Entry / Junior**    | Adds “entry level” / “junior” keywords                     |
| **Senior / Staff**    | Adds “senior”, “staff”, or “lead” titles                   |
| **US-only** 🇺🇸      | Restricts results to U.S. jobs and excludes India postings |

*(You can toggle chips on/off — active chips turn highlighted.)*

#### 🔹 Text Filters

| Field                  | Description                                                     |
| ---------------------- | --------------------------------------------------------------- |
| **What (Keywords)**    | Add extra terms — e.g. `"Kubernetes" OR "Terraform"`            |
| **Where (Location)**   | Add custom states or cities (e.g. `"California" OR "New York"`) |
| **Recency (Dropdown)** | Filter by posting age: 1 hr · 3 hr · 24 hr · week · month       |

> 💡 **Tip:** Selecting “1–3 hours” adds text filters like
> `"minutes ago" OR "just posted"`
> to catch the newest listings.

---

### 3️⃣ Use the Toolbar

| Button               | Action                                      |
| -------------------- | ------------------------------------------- |
| **Open Selected**    | Opens all checked portals in new tabs       |
| **Copy All Links**   | Copies all generated Google queries         |
| **Open 5 at a Time** | Batch opens results (avoids popup blocking) |
| **Reset**            | Clears all filters and preferences          |

---

### 4️⃣ Advanced Sidebar

#### Roles

Choose one or multiple (SRE, DevOps, Cloud, Apigee).

#### Locations

Add or remove US cities/states as filters.

#### Preferences

* 🌓 **Dark Mode** (default)
* 🎨 **High Contrast** for readability
* 🌀 **Reduce Motion** for minimal animations

> Settings are saved automatically in your browser (localStorage).

---

## 🗓 Recency Logic

* **Past 1–24 hrs:** uses keyword filters + `tbs=qdr:h`
* **Past week/month:** uses Google’s time filters `tbs=qdr:w` and `tbs=qdr:m`
* Ensures you only see recently posted jobs.

---

## 🌎 Geo Filtering — “US-only” Mode

### ✅ Default US Filter

```js
(("United States" OR "U.S." OR "USA" OR "United States of America") OR ("Remote" AND ("US" OR "USA")))
```

### 🚫 Negative Geo Filter

```js
-site:*.in -site:in.* -"India" -"Bengaluru" -"Hyderabad" -"Pune" -"Gurgaon" -"Noida" -"Mumbai" -"Chennai" -"New Delhi"
```

### 🌐 Force U.S. Locale in Every Query

All queries include:

```
&hl=en&gl=us&cr=countryUS&pws=0
```

→ Ensures only **English**, **U.S.-localized** results appear.
→ **India results are fully excluded**, even with Google personalization.

---

## 🧩 Portal Coverage (40+ Integrated)

### 1️⃣ Must-Have Job Boards

LinkedIn · Indeed · Glassdoor · ZipRecruiter

### 2️⃣ Core Tech ATS

Greenhouse · Greenhouse Boards · Lever · Ashby

### 3️⃣ Enterprise Giants

Workday · iCIMS · Oracle (Taleo + Cloud HCM) · SAP SuccessFactors · ADP Recruiting · UKG / UltiPro · Phenom · Eightfold

### 4️⃣ Niche / Specialist Boards

Dice · Wellfound (AngelList) · GovernmentJobs · Remote Rocketship

### 5️⃣ Long-Tail ATS

Workable · BambooHR · Jobvite · Teamtailor · Rippling · Avature · Pinpoint · JazzHR · Paylocity · Dayforce · Recruitee · JobScore · Comeet · Zoho Recruit · Jobylon

### 6️⃣ Catch-All Safety Net

Generic `jobs.*` · `careers.*` · `people.*` · `talent.*`

---

## 🧠 Example Query Output

**Example:**

> Role: DevOps
> Chips: Remote + H1B + US-only
> Recency: Past 24 hours
> Location: California
> Extra Keywords: Kubernetes Terraform

Generated Google query:

```
("DevOps Engineer" OR "Platform Engineer" OR "Infrastructure Engineer")
("remote" OR "hybrid")
("sponsorship" OR "H1B")
(Kubernetes OR Terraform)
("California" OR "CA")
site:linkedin.com/jobs
("minute ago" OR "hours ago" OR "just posted")
-site:*.in -"India" -"Bangalore"
&hl=en&gl=us&cr=countryUS
```

---

## 💾 Data Persistence

Your theme, chips, and filters are auto-saved to `localStorage` under key `jsdash_v1`.
Use the “Reset” button to clear everything anytime.

---

## 🧱 Tech Stack

* **HTML5 + CSS3 + Vanilla JS (ES6)**
* **No dependencies** — 100% static
* **Google Search syntax** for smart filtering (`site:`, `inurl:`, `tbs=qdr`, etc.)
* **LocalStorage** persistence
* **Works on all major browsers** (Chrome, Firefox, Edge, Safari)

---

## 🧰 Customization

### 🔸 Add or Remove Portals

Edit `assets/js/config.js` → inside `PORTALS` array:

```js
{ name: "Tesla Careers", site: "site:tesla.com/careers", domain: "tesla.com" },
```

### 🔸 Modify Role Definitions

```js
export const ROLE = {
  SRE: '("Site Reliability Engineer" OR "Observability Engineer")',
  DevOps: '("DevOps Engineer" OR "Platform Engineer" OR "Infrastructure Engineer")',
  Cloud: '("Cloud Engineer" OR "Cloud Platform Engineer")',
  Apigee: '("Apigee" OR "API Gateway" OR "API Management")',
};
```

### 🔸 Add Custom Filter Chips

In `index.html` under `#chipsRow`:

```html
<span class="chip" data-k='"contract" OR "freelance"'>Contract</span>
```

---

## 🎨 Optional: Preview Screenshot

Add to your repo (optional):

```md
![Job Search Dashboard Preview](assets/images/dashboard-preview.png)
```

---

## 👩‍💻 Author

**Vasudha S. Ambre**
📍 Boston, MA
🎓 M.S. Information Systems — Northeastern University
💼 Focus: SRE · DevOps · Cloud Automation · Observability

🔗 **Live Dashboard:** [vasudhaambre.github.io/Job-Search-Dashboard](https://vasudhaambre.github.io/Job-Search-Dashboard/)
🔗 **GitHub:** [github.com/VasudhaAmbre](https://github.com/VasudhaAmbre)
🔗 **LinkedIn:** [linkedin.com/in/vasudhaambre](https://linkedin.com/in/vasudhaambre)

