/* FR is written in index.html; this file holds the English version.
   Language = saved choice, otherwise the browser language (French → FR, anything else → EN). */
(() => {
  const saved = localStorage.getItem("lang");
  const lang = saved || ((navigator.language || "fr").toLowerCase().startsWith("fr") ? "fr" : "en");
  window.LANG = lang;
  document.documentElement.lang = lang;

  document.querySelectorAll(".lang-toggle").forEach((b) => {
    b.querySelectorAll("b").forEach((x) => x.classList.toggle("on", x.dataset.l === lang));
    b.addEventListener("click", () => {
      localStorage.setItem("lang", lang === "fr" ? "en" : "fr");
      location.reload();
    });
  });

  if (lang !== "en") return;

  const EN = {
    "loader": "&gt; loading profile backlog",
    "nav.about": "About", "nav.exp": "Experience", "nav.projects": "Projects", "nav.edu": "Education",
    "nav.skills": "Skills", "nav.photo": "Photo", "nav.contact": "Contact",

    "hero.eyebrow": "Open to internships &amp; opportunities · MBA in progress",
    "hero.lead": "Master's graduate in Marketing Management Innovation (ISCAM), currently pursuing a <strong>General MBA at the University of Technology, Mauritius</strong> since October 2026. Experienced in <strong>Business Analysis</strong> (Google Cloud projects, Jira, Scrum) and <strong>digital marketing</strong> — and I photograph products and events.",
    "hero.cta1": "See my projects", "hero.cta2": "Resume (PDF)",
    "hero.badge": "🎓 MBA · University of Technology, Mauritius",

    "stats.caption": "Metrics tracked during my internships — team results",
    "stats.1": "Facebook likes gained on average per page",
    "stats.2": "Facebook followers gained on average per page",
    "stats.3": "followers on the group's newest page (513 → 1,523)",
    "stats.4": "Google Cloud Platform projects followed as a Business Analyst",
    "stats.src1": "5 Groupe Métropole pharmacies · Jan–Mar 2022",
    "stats.src4": "eTECH Consulting · 2023",

    "about.title": "About", "about.h1": "My profile",
    "about.p1": "A hybrid <strong>business &amp; tech</strong> profile: trained in marketing and innovation management, I have worked on the project side (Business Analyst, Jira, Scrum) and on digital communication (KPI tracking, page management, content).",
    "about.p2": "My goal: contribute to digital projects by bridging business needs, technical teams and users — using data to make decisions.",
    "about.h2": "Outside work",
    "about.t1": "📷 Product &amp; event photography", "about.t2": "🖥️ Technology &amp; homelab", "about.t3": "🎵 Music",
    "about.p3": "Curious by nature, I like to understand how tools work — and how they can serve a business goal.",

    "exp.title": "Work experience",
    "exp.1.date": "Jul 2023 — Nov 2023 · Internship", "exp.1.role": "Business Analyst Intern",
    "exp.1.list": "<li>Followed <strong>4 Google Cloud Platform projects</strong> for the company's clients</li><li>Managed tickets in <strong>Jira</strong> (Kanban board): wrote and qualified bug tickets with screenshots and reproduction steps</li><li>Took part in <strong>daily scrums</strong> (done / to do / blockers) on Skype, then Teams</li><li>Wrote <strong>3 release notes</strong>; updated and finalised a project's <strong>user guide</strong></li><li>Ran <strong>3 demos</strong> of application releases; followed map-integration features</li>",
    "exp.2.date": "Jan 2022 — Mar 2022 · Internship", "exp.2.role": "Digital Marketing Intern",
    "exp.2.ctx": "WAKA is the shared back office of Groupe Métropole's 5 pharmacies, including Pharmacie Métropole, the oldest pharmacy in Madagascar (1949).",
    "exp.2.list": "<li><strong>Daily and monthly KPI reporting</strong> (followers, likes, reach, engagement rate) for the 5 pharmacies' Facebook &amp; Instagram pages in Excel</li><li>Created visuals and <strong>scheduled posts</strong> (Meta Business Suite, Creator Studio) following the media plan; yearly editorial calendar</li><li>Managed content for 9 Instagram/Facebook pages, 1 LinkedIn page, and updated the \"on-duty pharmacies\" block of the group website</li><li>Contributed to the project to <strong>unify the 5 pharmacies' Facebook pages</strong> (message routing with a chatbot)</li><li>Special-day activations (Feb 14, Mar 8) and supplier sourcing for decorations</li>",
    "exp.3.date": "Jul 2021 — Aug 2021 · Internship", "exp.3.role": "Intern — research &amp; surveys",
    "exp.3.list": "<li>Customer surveys to collect data for marketing strategies</li><li>Phone surveys with resellers to improve distribution strategies</li>",
    "chip.survey": "Surveys", "chip.data": "Data collection", "chip.fin": "Financial forecasts", "chip.bug": "Bug qualification",

    "proj.title": "Projects &amp; case studies",
    "case.ctx": "Context", "case.approach": "Approach", "case.deliv": "Deliverables", "case.question": "Question",
    "case.findings": "Findings", "case.tools": "Method", "case.role": "My role", "case.rituals": "Rituals",
    "p1.meta": "Master's thesis · 2024 · Business creation project",
    "p1.sub": "Emergency-management mobile app for Madagascar (Analamanga region)",
    "p1.ctx": "Insecurity is a major concern in Madagascar: according to the Afrobarometer survey cited in the thesis, 45% of Malagasy people feared a crime at home in 2013, versus 28% in 2005. \"Vonjy\" (rescue) + \"Maika\" (urgent).",
    "p1.approach": "Iterative approach (concept → prototype → tests). SWOT / PESTEL analysis, 5W2H, Business Model Canvas, 7P marketing mix, pricing per user profile, launch communication plan, intellectual-property protection (OMAPI) and 5-year financial forecasts.",
    "p1.deliv": "<li>App mockup (Adobe XD)</li><li>User permission matrix (below)</li><li>Income statement, break-even point, balance sheet, financing plan, cash budget</li><li>Interactive prototype (Google AI Studio, 2026): real-time tracking, community volunteering, offline reporting</li>",
    "p1.matrix": "View the permission matrix (profiles × features)",
    "p1.matrix.note": "Defining who can do what in the app: a key Business Analysis deliverable.",
    "p1.profiles": "Profiles", "p1.features": "Features",
    "p1.profiles.list": "<li>Visitors</li><li>Registered users</li><li>Families: parents / children</li><li>Client companies: managers / field staff</li><li>Authorities</li><li>Internal admin</li>",
    "p1.features.list": "<li>Event map</li><li>Offline map</li><li>Event reporting</li><li>Alert call</li><li>Relatives' location</li><li>Danger notifications</li><li>Event management (CRUD)</li><li>Alert reception</li><li>Survival tips</li>",
    "p2.meta": "Bachelor's internship report · 2022 · WAKA (Groupe Métropole)",
    "p2.title": "The link between digital and performance",
    "p2.sub": "Digital-marketing diagnosis of 5 pharmacies and action plan",
    "p2.q": "\"How does digital influence company performance?\" — targets were +84 followers per page per month and a monthly engagement rate between 5% and 10%.",
    "p2.f": "The follower target was largely exceeded (up to +666 in February on the newest page), but engagement stayed at 4% on the most-followed pages versus 7% on the newest: <strong>the more followers a page has, the lower its engagement</strong> — a sign that content needed better targeting.",
    "p2.m": "KPI tracking in Excel, interviews, observation; SWOT diagnosis with Ishikawa's 5M and PESTEL; recommendations prioritised with an Eisenhower matrix, plus an action plan and costed budget.",
    "p3.meta": "Experience · eTECH Consulting · 2023",
    "p3.title": "Quality follow-up &amp; tickets in an Agile team",
    "p3.sub": "A Business Analyst's day-to-day on Google Cloud projects",
    "k.1": "Remove unused panel", "k.2": "User guide", "k.3": "Release testing", "k.4": "Release note", "k.5": "Client demo",
    "p3.r": "Bridging the client and the development team: reproducing and documenting defects, writing clear tickets, tracking them on the Kanban board, then validating fixes before demos.",
    "p3.rit": "Daily scrum: what was done, what will be done, blockers. Team communication on Skype, then Microsoft Teams.",

    "edu.title": "Education",
    "edu.0.date": "Since Oct 2026 · in progress", "edu.0.t": "MBA (General)",
    "edu.1.t": "Master's in Marketing Management Innovation", "edu.1.n": "Thesis: the VonjyMaika app",
    "edu.2.t": "Bachelor's in Marketing Communication", "edu.2.n": "Report: the link between digital and performance",

    "skills.title": "Skills &amp; tools",
    "skills.h1": "Project management &amp; BA",
    "skills.l1": "<li>Jira (tickets, Kanban)</li><li>Daily scrum</li><li>Bug qualification</li><li>Release notes</li><li>User guides</li><li>Demos &amp; acceptance testing</li><li>Permission matrix</li><li>Map integration</li><li>Google Cloud projects</li>",
    "skills.h2": "Analysis &amp; strategy",
    "skills.l2": "<li>KPI tracking</li><li>SWOT</li><li>PESTEL</li><li>Ishikawa 5M</li><li>Eisenhower matrix</li><li>Business Model Canvas</li><li>5W2H</li><li>7P marketing mix</li><li>Financial forecasts</li>",
    "skills.h3": "Tools", "skills.h4": "Languages",
    "lang.native": "native", "lang.fr": "French", "lang.en": "English", "lang.en.n": "B1 with distinction",

    "photo.title": "Photography",
    "photo.intro": "Product and event photography: bouquets, a creative workshop and sport.",
    "photo.all": "All", "photo.product": "Products", "photo.event": "Events", "photo.sport": "Sport",
    "cap.product": "Product · bouquets", "cap.workshop": "Mirror-decorating workshop",
    "cap.mma": "MMA championship · my brother's gold medal",

    "cert.title": "Certificates",
    "cert.1.d": "Dec 2024", "cert.2.d": "Mar 2024", "cert.3.d": "Dec 2023", "cert.4.d": "Jan 2023", "cert.5.d": "Feb 2022",
    "cert.2.t": "Principles of authority &amp; basics of military life",
    "cert.4.t": "ICEBI participant", "cert.5.t": "Digital marketing fundamentals",

    "contact.title": "Let's work <span class=\"grad\">together</span>.",
    "contact.lead": "Open to internships and roles in Business Analysis, digital project management and marketing — in Mauritius, Madagascar or remote.",
    "form.name": "Name", "form.email": "Email", "form.msg": "Message", "form.send": "Send message",
  };

  document.querySelectorAll("[data-i18n]").forEach((el) => {
    const v = EN[el.dataset.i18n];
    if (v !== undefined) el.innerHTML = v;
  });
  document.title = "Sitraka Paul Randrianarijaona — Business Analyst & Digital Project Management";
})();
