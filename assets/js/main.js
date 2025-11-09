/* Job Search Dashboard — main.js (Final Fixed Version) */
import {
	PORTALS as RAW_PORTALS,
	ROLE,
	DEFAULT_US,
	NEGATIVE_GEO,
	COUNTRY
} from "./config.js";

const NEG_GEO = typeof NEGATIVE_GEO === "string" ? NEGATIVE_GEO : "";

(function() {
	// ---------- helpers ----------
	const qs = (s) => document.querySelector(s);
	const qsa = (s) => Array.from(document.querySelectorAll(s));
	const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
	const STORAGE_KEY = "jsdash_v1";

	let locations = [];
	let focusResultsNextRender = false;
	let viewMode = "cards";
	let countryCode = "US";

	const ENABLE_SOFT_RECENCY = false;

	const portals = Array.isArray(RAW_PORTALS) && RAW_PORTALS.length ? RAW_PORTALS : [{
			name: "LinkedIn",
			site: "site:linkedin.com/jobs",
			domain: "linkedin.com/jobs"
		},
		{
			name: "Indeed",
			site: "site:indeed.com",
			domain: "indeed.com"
		},
		{
			name: "Glassdoor",
			site: "site:glassdoor.com",
			domain: "glassdoor.com"
		},
	];

	// ---------- storage ----------
	function saveState() {
		try {
			localStorage.setItem(STORAGE_KEY, JSON.stringify(serializeState()));
		} catch (err) {
			console.warn("⚠️ Save state failed:", err);
		}
	}

	function loadState() {
		try {
			const raw = localStorage.getItem(STORAGE_KEY);
			if (!raw) return;
			deserializeState(JSON.parse(raw));
		} catch (err) {
			console.warn("⚠️ State reset due to localStorage error:", err);
			localStorage.removeItem(STORAGE_KEY);
		}
	}

	function serializeState() {
		const chipsActive = qsa("#chipsRow .chip.active")
			.filter((c) => !c.classList.contains("removable"))
			.map((c) => c.dataset.k);

		return {
			recency: qs("#recency")?.value || "",
			extra: qs("#extra")?.value || "",
			custom: qs("#locationCustom")?.value || "",
			locations,
			chips: chipsActive,
			roles: {
				sre: !!qs("#roleSRE")?.checked,
				devops: !!qs("#roleDevOps")?.checked,
				cloud: !!qs("#roleCloud")?.checked,
				apigee: !!qs("#roleApigee")?.checked,
			},
			dark: !!qs("#darkToggle")?.checked,
			highContrast: !!qs("#highContrastToggle")?.checked,
			reduceMotion: !!qs("#reduceMotionToggle")?.checked,
			viewMode,
			country: countryCode,
		};
	}

	function deserializeState(state) {
		if (!state) return;
		const has = (k) => Object.prototype.hasOwnProperty.call(state, k);

		if (has("recency")) qs("#recency").value = state.recency || "";
		if (has("extra")) qs("#extra").value = state.extra || "";
		if (has("custom")) qs("#locationCustom").value = state.custom || "";
		if (has("locations")) locations = Array.isArray(state.locations) ? state.locations : [];

		document.body.classList.toggle("dark", !!state.dark);
		document.body.classList.toggle("hc", !!state.highContrast);
		document.body.classList.toggle("reduce-motion", !!state.reduceMotion);

		viewMode = state.viewMode === "table" ? "table" : "cards";
		countryCode = COUNTRY[state.country] ? state.country : "US";
	}

	// ---------- query helpers ----------
	function composeLocationFilter() {
		const custom = (qs("#locationCustom")?.value || "").trim();
		if (custom) return `(${custom})`;
		if (locations.length) return `(${locations.map((l) => `(${l})`).join(" OR ")})`;
		const C = COUNTRY[countryCode] || COUNTRY.US;
		return C.defaultQuery || DEFAULT_US;
	}

	function recencyParam() {
		const v = (qs("#recency")?.value || "").trim();
		if (!v) return "";
		if (v.startsWith("h")) return `&tbs=qdr:h${v.substring(1)}`;
		return `&tbs=qdr:${v}`;
	}

	function gUrl(q) {
		const C = COUNTRY[countryCode] || COUNTRY.US;
		const hardGeo = `&hl=${C.hl}&gl=${C.gl}${C.cr ? `&cr=${C.cr}` : ""}${C.uule ? `&uule=${C.uule}` : ""}`;
		return `https://www.google.com/search?q=${encodeURIComponent(q)}${recencyParam()}${hardGeo}&pws=0&nfpr=1`;
	}

	function composeQuery(roleBlock, siteFilter) {
		const filters = [];
		const loc = composeLocationFilter();
		if (loc) filters.push(loc);
		qsa(".chip.active").forEach((c) => {
			if (!c.classList.contains("removable")) filters.push(c.dataset.k);
		});
		const extra = (qs("#extra")?.value || "").trim();
		if (extra) filters.push(extra);
		const q = [roleBlock, ...filters, siteFilter].filter(Boolean).join(" ");
		return `${q} ${NEG_GEO}`.trim();
	}

	function firstCheckedRoleBlock() {
		if (qs("#roleSRE")?.checked) return ROLE.SRE;
		if (qs("#roleDevOps")?.checked) return ROLE.DevOps;
		if (qs("#roleCloud")?.checked) return ROLE.Cloud;
		if (qs("#roleApigee")?.checked) return ROLE.Apigee;
		return ROLE.SRE;
	}

	function updateBadges() {
		const rec = qs("#recency")?.value || "";
		const text = rec ?
			rec.startsWith("h") ?
			`Past ${rec.substring(1)} hours` :
			rec === "d" ?
			"Past day" :
			rec === "w" ?
			"Past week" :
			"Past month" :
			"Any time";
		["#recencyBadge", "#recencyBadge2"].forEach((id) => {
			const b = qs(id);
			if (b) b.textContent = text;
		});
	}

	function updateCountryBadges() {
		const label = COUNTRY[countryCode]?.label || countryCode;
		["#countryBadge", "#countryBadge2"].forEach((id) => {
			const b = qs(id);
			if (b) b.textContent = label;
		});
	}

	let renderTimer;

	function scheduleRender() {
		clearTimeout(renderTimer);
		renderTimer = setTimeout(render, 150);
	}

	// ---------- renderers ----------
	function updateBadges() {
		const rec = qs("#recency")?.value || "";
		const text = rec ?
			rec.startsWith("h") ?
			`Past ${rec.substring(1)} hours` :
			rec === "d" ?
			"Past day" :
			rec === "w" ?
			"Past week" :
			"Past month" :
			"Any time";
		["#recencyBadge", "#recencyBadge2"].forEach((id) => {
			const b = qs(id);
			if (b) b.textContent = text;
		});
	}

	function updateCountryBadges() {
		const label = COUNTRY[countryCode]?.label || countryCode;
		["#countryBadge", "#countryBadge2"].forEach((id) => {
			const b = qs(id);
			if (b) b.textContent = label;
		});
	}

	function updateBadges() {
		const rec = qs("#recency")?.value || "";
		const text = rec ?
			rec.startsWith("h") ?
			`Past ${rec.substring(1)} hours` :
			rec === "d" ?
			"Past day" :
			rec === "w" ?
			"Past week" :
			"Past month" :
			"Any time";
		["#recencyBadge", "#recencyBadge2"].forEach((id) => {
			const b = qs(id);
			if (b) b.textContent = text;
		});
	}

	function updateCountryBadges() {
		const label = COUNTRY[countryCode]?.label || countryCode;
		["#countryBadge", "#countryBadge2"].forEach((id) => {
			const b = qs(id);
			if (b) b.textContent = label;
		});
	}


	function renderCards() {
		const grid = qs("#resultsGrid");
		if (!grid) return;
		grid.innerHTML = "";
		const frag = document.createDocumentFragment();

		portals.forEach((p, i) => {
			if (!p || !p.name || !p.site) return;

			const card = document.createElement("div");
			card.className = "portal-card";
			card.tabIndex = 0;
			card.setAttribute("role", "listitem");
			card.setAttribute("aria-label", `Job portal ${p.name}`);

			const left = document.createElement("div");
			left.className = "left";
			left.textContent = i + 1;

			const header = document.createElement("div");
			header.className = "header";
			const title = document.createElement("h4");
			title.className = "portal";
			title.textContent = p.name;
			const domain = document.createElement("div");
			domain.className = "domain";
			domain.textContent = p.domain || "";
			header.append(title, domain);

			const roleRow = document.createElement("div");
			roleRow.className = "role-row";
			const addRoleButton = (label, block) => {
				const q = composeQuery(block, p.site);
				const a = document.createElement("a");
				a.className = "role-btn";
				a.href = gUrl(q);
				a.target = "_blank";
				a.rel = "noopener";
				const span = document.createElement("span");
				span.className = "label";
				span.textContent = label;
				const tools = document.createElement("div");
				tools.className = "role-tools";
				const copy = document.createElement("button");
				copy.className = "mini";
				copy.textContent = "Copy";
				copy.setAttribute("aria-label", `Copy ${p.name} ${label} search query`);
				copy.onclick = (e) => {
					e.preventDefault();
					navigator.clipboard.writeText(q).then(() => {
						copy.textContent = "Copied!";
						setTimeout(() => (copy.textContent = "Copy"), 900);
					});
				};
				tools.append(copy);
				a.append(span, tools);
				roleRow.append(a);
			};

			if (qs("#roleSRE")?.checked) addRoleButton("SRE", ROLE.SRE);
			if (qs("#roleDevOps")?.checked) addRoleButton("DevOps", ROLE.DevOps);
			if (qs("#roleCloud")?.checked) addRoleButton("Cloud", ROLE.Cloud);
			if (qs("#roleApigee")?.checked) addRoleButton("Apigee", ROLE.Apigee);

			const sel = document.createElement("div");
			const cb = document.createElement("input");
			cb.type = "checkbox";
			cb.className = "rowSelect";
			const openOne = document.createElement("button");
			openOne.className = "btn ghost mini";
			openOne.textContent = "Open";
			openOne.setAttribute("aria-label", `Open ${p.name} portal`);
			openOne.onclick = () => {
				const roleBlock = firstCheckedRoleBlock();
				const q = composeQuery(roleBlock, p.site);
				window.open(gUrl(q), "_blank");
			};
			sel.append(cb, openOne);

			card.append(left, header, roleRow, sel);
			frag.append(card);
		});

		grid.append(frag);
	}

	function renderTable() {
		const wrap = qs("#resultsTableWrap");
		if (!wrap) return;
		wrap.innerHTML = "";
		const table = document.createElement("table");
		table.className = "results-table";
		table.innerHTML = `
      <thead>
        <tr>
          <th>#</th>
          <th>Portal</th>
          <th>DevOps</th>
          <th>SRE</th>
          <th>Cloud</th>
          <th>Apigee</th>
          <th>Select</th>
          <th>Open</th>
        </tr>
      </thead>
    `;
		const tbody = document.createElement("tbody");

		portals.forEach((p, i) => {
			if (!p || !p.name || !p.site) return;
			const tr = document.createElement("tr");
			const idx = document.createElement("td");
			idx.textContent = i + 1;
			const portal = document.createElement("td");
			portal.innerHTML = `<strong>${p.name}</strong><br><span style="color:var(--muted);font-size:12px">${p.domain || ""}</span>`;

			const makeCell = (label, block) => {
				const q = composeQuery(block, p.site);
				const td = document.createElement("td");
				const a = document.createElement("a");
				a.href = gUrl(q);
				a.target = "_blank";
				a.textContent = label;
				const btn = document.createElement("button");
				btn.className = "mini";
				btn.textContent = "Copy";
				btn.setAttribute("aria-label", `Copy ${p.name} ${label} query`);
				btn.onclick = (e) => {
					e.preventDefault();
					navigator.clipboard.writeText(q).then(() => {
						btn.textContent = "Copied!";
						setTimeout(() => (btn.textContent = "Copy"), 900);
					});
				};
				td.append(a, " ", btn);
				return td;
			};

			tr.append(
				idx,
				portal,
				makeCell("DevOps", ROLE.DevOps),
				makeCell("SRE", ROLE.SRE),
				makeCell("Cloud", ROLE.Cloud),
				makeCell("Apigee", ROLE.Apigee)
			);

			const tdSel = document.createElement("td");
			const cb = document.createElement("input");
			cb.type = "checkbox";
			cb.className = "rowSelect";
			tdSel.append(cb);
			const tdOpen = document.createElement("td");
			const open = document.createElement("button");
			open.className = "btn ghost mini";
			open.textContent = "Open";
			open.onclick = () => {
				const roleBlock = firstCheckedRoleBlock();
				const q = composeQuery(roleBlock, p.site);
				window.open(gUrl(q), "_blank");
			};
			tdOpen.append(open);
			tr.append(tdSel, tdOpen);
			tbody.append(tr);
		});

		table.append(tbody);
		wrap.append(table);
	}

	// ---------- keyboard shortcuts ----------
	document.addEventListener("keydown", (e) => {
		const tag = (e.target?.tagName || "").toLowerCase();
		const isTyping = tag === "input" || tag === "textarea" || e.target.isContentEditable;
		if (isTyping || e.metaKey || e.ctrlKey) return;

		switch (e.key) {
			case "/":
			case "s":
			case "S":
				e.preventDefault();
				qs("#extra")?.focus();
				break;
			case "d":
			case "D":
				e.preventDefault();
				const darkEl = qs("#darkToggle");
				if (darkEl) {
					darkEl.checked = !darkEl.checked;
					darkEl.dispatchEvent(new Event("change"));
				}
				break;
			case "o":
			case "O":
				e.preventDefault();
				qs("#openSelectedBtn")?.click();
				break;
			default:
				break;
		}
	});

	// ---------- init ----------
	document.addEventListener("DOMContentLoaded", () => {
		loadState();
		render();

		// Dark toggle listener
		qs("#darkToggle")?.addEventListener("change", (e) => {
			document.body.classList.toggle("dark", e.target.checked);
			saveState();
		});

		// Country change
		qs("#country")?.addEventListener("change", (e) => {
			countryCode = e.target.value;
			updateCountryBadges();
			scheduleRender();
		});

		// View switch
		qs("#viewCards")?.addEventListener("change", (e) => {
			if (e.target.checked) {
				viewMode = "cards";
				scheduleRender();
			}
		});
		qs("#viewTable")?.addEventListener("change", (e) => {
			if (e.target.checked) {
				viewMode = "table";
				scheduleRender();
			}
		});

		// Chip toggle
		qsa("#chipsRow .chip").forEach((chip) =>
			chip.addEventListener("click", () => {
				chip.classList.toggle("active");
				scheduleRender();
			})
		);

		// Form submit
		qs("#searchForm")?.addEventListener("submit", (e) => {
			e.preventDefault();
			focusResultsNextRender = true;
			scheduleRender();
		});

		// Reset button
		qs("#resetBtn")?.addEventListener("click", () => {
			qsa("#chipsRow .chip").forEach((c) => c.classList.remove("active"));
			["extra", "locationCustom"].forEach((id) => (qs("#" + id).value = ""));
			if (qs("#recency")) qs("#recency").value = "";
			locations = [];
			scheduleRender();
		});
	});

})();