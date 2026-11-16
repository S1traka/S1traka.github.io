/* =========================================================
   DIGITAL PROJECT MANAGEMENT THEME
   - Animated Gantt chart background (scroll = timeline, mouse = tilt)
   - Roadmap side navigation (one milestone per section)
   - Per-section "sprint" HUD: a ticket moves To do → Doing → Done
   - Burndown-chart dividers drawn on scroll
   - Hero HUD readouts
   ========================================================= */
(() => {
  const html = document.documentElement;
  const RM = html.classList.contains("reduce-motion");
  const G = !!(window.gsap && window.ScrollTrigger) && !RM;
  const EN = window.LANG === "en";

  const HUES = {
    home: "#4f7cff", about: "#22d3ee", experience: "#a78bfa", projects: "#f59e0b",
    education: "#10b981", skills: "#4f7cff", photography: "#f472b6", certificates: "#a78bfa", contact: "#22e4ff",
  };
  const NAMES = EN
    ? { home: "Kick-off", about: "About", experience: "Experience", projects: "Projects", education: "Education", skills: "Skills", photography: "Photography", certificates: "Certificates", contact: "Contact" }
    : { home: "Lancement", about: "À propos", experience: "Expérience", projects: "Projets", education: "Formation", skills: "Compétences", photography: "Photographie", certificates: "Certificats", contact: "Contact" };
  const TASKS = EN
    ? ["Requirements", "Backlog", "Sprint planning", "User stories", "Development", "Testing", "Release", "Demo", "KPI review", "Retro", "Bug fix", "Docs", "Go-live", "Roadmap"]
    : ["Recueil besoins", "Backlog", "Sprint planning", "User stories", "Développement", "Recette", "Release", "Démo", "Revue KPI", "Rétro", "Correctif", "Documentation", "Mise en prod", "Roadmap"];
  const T = EN
    ? { sprint: "SPRINT", todo: "TO DO", doing: "DOING", done: "DONE", ok: "✓ DONE", role: "ROLE", methods: "METHODS", status: "STATUS", avail: "MBA @ UTM · AVAILABLE", velocity: "VELOCITY" }
    : { sprint: "SPRINT", todo: "À FAIRE", doing: "EN COURS", done: "TERMINÉ", ok: "✓ TERMINÉ", role: "RÔLE", methods: "MÉTHODES", status: "STATUT", avail: "MBA @ UTM · DISPONIBLE", velocity: "VÉLOCITÉ" };

  const sections = [...document.querySelectorAll("#home, main > section.section[id]")];
  const hexToRgb = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
  const color = { cur: hexToRgb(HUES.home), target: hexToRgb(HUES.home) };
  const rgba = (c, a) => `rgba(${c[0] | 0}, ${c[1] | 0}, ${c[2] | 0}, ${a})`;
  const VIOLET = [155, 107, 255];

  /* ---------- Loader: tickets flying through the board ---------- */
  const loaderDna = document.querySelector(".loader-dna");
  if (loaderDna) {
    const states = [T.todo, T.doing, T.done];
    let n = 100;
    const id = setInterval(() => {
      if (!loaderDna.isConnected) return clearInterval(id);
      n += 1 + ((Math.random() * 3) | 0);
      loaderDna.textContent = `PRT-${n} · ${TASKS[n % TASKS.length]} → ${states[n % 3]}`;
    }, 70);
  }

  /* ---------- Hero HUD ---------- */
  const hero = document.getElementById("home");
  const week = (() => {
    const d = new Date(), j = new Date(d.getFullYear(), 0, 1);
    return Math.ceil(((d - j) / 864e5 + j.getDay() + 1) / 7);
  })();
  hero.insertAdjacentHTML("beforeend", `
    <div class="hero-hud tl" aria-hidden="true">
      ${T.role} <b>// BUSINESS ANALYST · DIGITAL PM</b><br>
      ${T.methods} <b>// SCRUM · KANBAN · JIRA</b><br>
      ${T.status} <b>// ${T.avail} ●</b>
    </div>
    <div class="hero-hud br" aria-hidden="true">
      ${T.sprint} ${new Date().getFullYear()}-W${String(week).padStart(2, "0")}<br>
      ${T.velocity} <b class="hud-hex">32 SP</b><br>
      <span class="hud-time"></span>
    </div>`);
  const hudVel = hero.querySelector(".hud-hex");
  const hudTime = hero.querySelector(".hud-time");
  const tickHud = () => {
    hudTime.textContent = "T+ " + new Date().toLocaleTimeString(EN ? "en-GB" : "fr-FR");
    if (!RM) hudVel.textContent = 28 + ((Math.random() * 9) | 0) + " SP";
  };
  tickHud();
  setInterval(tickHud, RM ? 1000 : 1200);

  /* ---------- Burndown-chart dividers ---------- */
  function burndownSVG(seed) {
    const W = 1200, H = 80, base = H - 6, top = 8, days = 15, step = W / days;
    let rnd = seed * 9301 + 49297;
    const rand = () => ((rnd = (rnd * 9301 + 49297) % 233280) / 233280);
    let actual = "", bars = "", grid = "";
    let remaining = 1;
    for (let i = 0; i <= days; i++) {
      const x = i * step;
      if (i > 0) remaining = Math.max(0, remaining - (1 / days) * (0.4 + rand() * 1.3));
      if (i === days) remaining = 0;
      const y = top + (1 - remaining) * (base - top);
      actual += (i ? " L" : "M") + x.toFixed(0) + " " + y.toFixed(1);
      if (i < days) {
        const bh = 4 + rand() * 18;
        bars += `<rect class="chart-bar" x="${(x + 10).toFixed(0)}" y="${(base - bh).toFixed(1)}" width="${(step - 20).toFixed(0)}" height="${bh.toFixed(1)}"/>`;
      }
      if (i % 5 === 0) grid += `<line class="chart-grid" vector-effect="non-scaling-stroke" x1="${x}" y1="0" x2="${x}" y2="${base}"/>`;
    }
    const area = actual + ` L${W} ${base} L0 ${base} Z`;
    const id = "bd" + seed;
    const pulse = RM ? "" : `<circle class="pulse" r="3.5"><animateMotion dur="7s" repeatCount="indefinite" path="${actual}"/></circle>`;
    return `<svg class="dna-divider" viewBox="0 0 ${W} ${H}" preserveAspectRatio="none" aria-hidden="true">
      <defs><linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="currentColor" stop-opacity="0.22"/><stop offset="1" stop-color="currentColor" stop-opacity="0"/>
      </linearGradient></defs>
      ${grid}
      <line class="chart-base" vector-effect="non-scaling-stroke" x1="0" y1="${base}" x2="${W}" y2="${base}"/>
      ${bars}
      <line class="chart-ideal" vector-effect="non-scaling-stroke" x1="0" y1="${top}" x2="${W}" y2="${base}"/>
      <path class="chart-area" fill="url(#${id})" d="${area}"/>
      <path class="chart-line" pathLength="1" vector-effect="non-scaling-stroke" d="${actual}"/>
      ${pulse}</svg>
      <p class="divider-label" aria-hidden="true">BURNDOWN · ${T.sprint} ${String(seed).padStart(2, "0")}</p>`;
  }

  /* ---------- Sprint HUD per section ---------- */
  sections.forEach((s, i) => {
    if (s.id === "home") return;
    const title = s.querySelector(".section-title, h2");
    const pts = 3 + ((i * 5) % 8);
    s.dataset.pts = pts;
    title.insertAdjacentHTML("beforebegin", `
      <div class="sync-hud" aria-hidden="true">
        <span class="sync-seq">${T.sprint} ${String(i).padStart(2, "0")}</span>
        <span class="ticket">SP-${100 + i}</span>
        <span class="kmini" data-stage="${RM ? 2 : 0}">
          <em>${T.todo}</em><em>${T.doing}</em><em>${T.done}</em><i class="kchip"></i>
        </span>
        <span class="sync-pct">${RM ? pts : 0}/${pts} SP</span>
        <span class="sync-ok">${T.ok}</span>
      </div>`);
    if (RM) s.classList.add("synced");
    s.insertAdjacentHTML("beforebegin", burndownSVG(i));
  });

  if (G) {
    document.querySelectorAll(".dna-divider").forEach((svg) => {
      const line = svg.querySelector(".chart-line");
      const ideal = svg.querySelector(".chart-ideal");
      const area = svg.querySelector(".chart-area");
      const bars = svg.querySelectorAll(".chart-bar");
      gsap.set(line, { strokeDasharray: 1, strokeDashoffset: 1 });
      gsap.set([area, ideal], { opacity: 0 });
      gsap.set(bars, { scaleY: 0, transformOrigin: "50% 100%" });
      gsap.timeline({ scrollTrigger: { trigger: svg, start: "top 92%", end: "top 45%", scrub: 0.8 } })
        .to(ideal, { opacity: 1, duration: 0.2 }, 0)
        .to(bars, { scaleY: 1, ease: "back.out(1.6)", stagger: 0.02, duration: 0.3 }, 0)
        .to(line, { strokeDashoffset: 0, ease: "none", duration: 1 }, 0.1)
        .to(area, { opacity: 1, duration: 0.5 }, 0.5);
    });
    // gallery: staggered pop-in
    ScrollTrigger.batch(".gallery figure", {
      start: "top 90%", once: true,
      onEnter: (b) => gsap.fromTo(b, { autoAlpha: 0, y: 60, scale: 0.92, rotate: () => gsap.utils.random(-3, 3) },
        { autoAlpha: 1, y: 0, scale: 1, rotate: 0, duration: 1, ease: "expo.out", stagger: 0.08 }),
    });
    gsap.set(".gallery figure", { autoAlpha: 0 });
  }

  /* ---------- Roadmap side navigation ---------- */
  const navEl = document.querySelector(".dna-nav");
  navEl.innerHTML = `<span class="rm-track"><i class="rm-fill"></i></span>`;
  const fill = navEl.querySelector(".rm-fill");
  const navNodes = sections.map((s, i) => {
    const b = document.createElement("button");
    b.type = "button";
    b.className = "rm-node";
    b.style.top = (i / (sections.length - 1)) * 100 + "%";
    b.setAttribute("aria-label", NAMES[s.id] || s.id);
    b.innerHTML = `<span class="lbl"><em>M${String(i).padStart(2, "0")}</em>${NAMES[s.id] || s.id}</span>`;
    b.addEventListener("click", () => {
      if (window.lenis) window.lenis.scrollTo(s, { offset: s.id === "home" ? 0 : -70, duration: 1.8, easing: (t) => 1 - Math.pow(1 - t, 4) });
      else s.scrollIntoView({ behavior: RM ? "auto" : "smooth" });
    });
    navEl.appendChild(b);
    return b;
  });
  const updateFill = () => {
    const max = document.documentElement.scrollHeight - innerHeight;
    fill.style.transform = `scaleY(${max > 0 ? scrollY / max : 0})`;
  };
  addEventListener("scroll", updateFill, { passive: true });
  updateFill();

  /* ---------- Sprint completion for a section ---------- */
  let kick = 0;
  function complete(s) {
    if (s.dataset.synced) return;
    s.dataset.synced = "1";
    const idx = sections.indexOf(s);
    if (s.id === "home" || RM) { navNodes[idx].classList.add("synced"); return; }
    const hud = s.querySelector(".sync-hud");
    const k = hud.querySelector(".kmini");
    const pct = hud.querySelector(".sync-pct");
    const pts = +s.dataset.pts;
    const title = s.querySelector(".section-title");
    s.style.setProperty("--sweep-h", s.offsetHeight + "px");
    s.classList.add("syncing");
    if (title) { title.classList.add("glitching"); setTimeout(() => title.classList.remove("glitching"), 650); }
    kick += 1;
    setTimeout(() => (k.dataset.stage = 1), 250);
    setTimeout(() => (k.dataset.stage = 2), 900);
    const start = performance.now(), D = 1300;
    (function step(now) {
      const p = Math.min((now - start) / D, 1);
      pct.textContent = Math.round((1 - Math.pow(1 - p, 3)) * pts) + "/" + pts + " SP";
      if (p < 1) return requestAnimationFrame(step);
      s.classList.add("synced");
      navNodes[idx].classList.add("synced");
      setTimeout(() => s.classList.remove("syncing"), 400);
    })(start);
  }
  const syncIO = new IntersectionObserver(
    (entries) => entries.forEach((e) => e.isIntersecting && complete(e.target)),
    { rootMargin: "0px 0px -30% 0px" }
  );
  sections.forEach((s) => syncIO.observe(s));

  /* ---------- Active section: colour shift + roadmap highlight ---------- */
  const activeIO = new IntersectionObserver(
    (entries) => entries.forEach((e) => {
      if (!e.isIntersecting) return;
      const i = sections.indexOf(e.target);
      const hue = HUES[e.target.id] || HUES.home;
      html.style.setProperty("--accent", hue);
      color.target = hexToRgb(hue);
      navNodes.forEach((n, j) => n.classList.toggle("active", j === i));
    }),
    { rootMargin: "-45% 0px -50% 0px" }
  );
  sections.forEach((s) => activeIO.observe(s));

  if (RM) return;

  /* ---------- Animated Gantt chart background ---------- */
  const hc = document.getElementById("helix");
  const ctx = hc.getContext("2d");
  let W, H, DPR, rows = [];
  const ROWS = 16, DAY = 34; // px per "day" (css px)
  const PERF = window.PERF || { lite: false, fps: 60 };
  let lastW = 0;
  function build(force) {
    if (force !== true && lastW === innerWidth && rows.length) return; // ignore mobile address-bar resizes
    lastW = innerWidth;
    DPR = PERF.lite ? 1 : Math.min(devicePixelRatio || 1, 1.5);
    W = hc.width = innerWidth * DPR; H = hc.height = innerHeight * DPR;
    hc.style.width = innerWidth + "px"; hc.style.height = innerHeight + "px";
    const span = Math.ceil(innerWidth / DAY) + 20;
    rows = Array.from({ length: ROWS }, (_, r) => {
      const bars = [];
      let d = Math.random() * 6;
      while (d < span * 2) {
        const len = 3 + Math.random() * 9;
        bars.push({ start: d, len, name: TASKS[(r * 3 + bars.length) % TASKS.length], ms: Math.random() < 0.18 });
        d += len + 1 + Math.random() * 5;
      }
      return { bars, span: d };
    });
  }
  build(true);
  addEventListener("resize", build);
  addEventListener("perf-lite", () => build(true));

  const mouse = { x: 0, y: 0, sx: 0, sy: 0 };
  addEventListener("pointermove", (e) => { mouse.x = e.clientX / innerWidth - 0.5; mouse.y = e.clientY / innerHeight - 0.5; }, { passive: true });

  let time = 0, vel = 0, lastY = scrollY;
  let running = true;
  document.addEventListener("visibilitychange", () => { running = !document.hidden; if (running) requestAnimationFrame(loop); });

  function draw(k) {
    const mobile = innerWidth < 900;
    const dy = scrollY - lastY; lastY = scrollY;
    vel += dy * 0.004 + kick * 0.6; kick = 0;
    vel *= 0.9;
    time += 0.012 * k + vel * 0.05;
    mouse.sx += (mouse.x - mouse.sx) * 0.05;
    mouse.sy += (mouse.y - mouse.sy) * 0.05;
    for (let i = 0; i < 3; i++) color.cur[i] += (color.target[i] - color.cur[i]) * 0.05;

    ctx.clearRect(0, 0, W, H);
    ctx.save();
    ctx.globalAlpha = mobile ? 0.18 : 0.38;
    ctx.translate(W / 2, H / 2);
    ctx.rotate(-0.12 + mouse.sx * 0.05);
    ctx.translate(-W / 2 - W * 0.1, -H / 2 + mouse.sy * 20 * DPR);

    const day = DAY * DPR, rowH = (H * 1.25) / ROWS, barH = rowH * 0.42;
    const offset = time + scrollY * 0.02;          // timeline position in days
    const todayX = W * (mobile ? 0.6 : 0.72);       // "today" marker
    const W2 = W * 1.25;

    // grid: day columns + week labels
    const first = Math.floor(offset);
    ctx.lineWidth = DPR;
    ctx.font = `${9 * DPR}px ui-monospace, Consolas, monospace`;
    for (let d = first; d < first + W2 / day + 2; d++) {
      const x = (d - offset) * day;
      const week = d % 7 === 0;
      ctx.strokeStyle = week ? "rgba(160,180,255,0.10)" : "rgba(160,180,255,0.04)";
      ctx.beginPath(); ctx.moveTo(x, -rowH); ctx.lineTo(x, H * 1.3); ctx.stroke();
      if (week) { ctx.fillStyle = "rgba(160,180,255,0.35)"; ctx.fillText("W" + (((d / 7) | 0) % 52 + 1), x + 4 * DPR, 14 * DPR); }
    }

    // bars
    rows.forEach((row, r) => {
      const y = r * rowH + rowH * 0.5;
      row.bars.forEach((b, bi) => {
        // loop each row's bars endlessly
        let s = b.start - (offset % row.span);
        if (s + b.len < 0) s += row.span;
        const x = (s) * day, w = b.len * day;
        if (x > W2 || x + w < -day) return;
        // progress = share of the bar already left of the "today" line
        const prog = Math.max(0, Math.min(1, (todayX / day - s) / b.len));
        const c = r % 3 === 2 ? VIOLET : color.cur;
        if (b.ms) {
          // milestone diamond
          const cx = x + w / 2, s2 = barH * 0.6;
          ctx.fillStyle = rgba(c, prog >= 1 ? 0.9 : 0.35);
          ctx.beginPath(); ctx.moveTo(cx, y - s2); ctx.lineTo(cx + s2, y); ctx.lineTo(cx, y + s2); ctx.lineTo(cx - s2, y); ctx.closePath(); ctx.fill();
          return;
        }
        ctx.strokeStyle = rgba(c, 0.45);
        ctx.lineWidth = DPR;
        ctx.strokeRect(x, y - barH / 2, w, barH);
        ctx.fillStyle = rgba(c, 0.12);
        ctx.fillRect(x, y - barH / 2, w, barH);
        if (prog > 0) {
          ctx.fillStyle = rgba(c, 0.55);
          ctx.fillRect(x, y - barH / 2, w * prog, barH);
        }
        if (w > 70 * DPR) {
          ctx.fillStyle = prog > 0.5 ? "rgba(10,11,16,0.85)" : rgba(c, 0.8);
          ctx.fillText(b.name, x + 6 * DPR, y + 3 * DPR);
        }
        // dependency arrow to next bar in the row below
        if (bi % 3 === 0 && r < ROWS - 1) {
          const nb = rows[r + 1].bars[bi % rows[r + 1].bars.length];
          let ns = nb.start - (offset % rows[r + 1].span);
          if (ns + nb.len < 0) ns += rows[r + 1].span;
          const nx = ns * day;
          if (nx > x + w && nx - (x + w) < 6 * day) {
            ctx.strokeStyle = rgba(c, 0.25);
            ctx.beginPath();
            ctx.moveTo(x + w, y);
            ctx.lineTo(x + w + 6 * DPR, y);
            ctx.lineTo(x + w + 6 * DPR, y + rowH);
            ctx.lineTo(nx, y + rowH);
            ctx.stroke();
          }
        }
      });
    });

    // today line
    ctx.strokeStyle = rgba(color.cur, 0.9);
    ctx.lineWidth = 1.5 * DPR;
    if (!PERF.lite) { ctx.shadowColor = rgba(color.cur, 1); ctx.shadowBlur = 12 * DPR; }
    ctx.beginPath(); ctx.moveTo(todayX, -rowH); ctx.lineTo(todayX, H * 1.3); ctx.stroke();
    ctx.shadowBlur = 0;
    ctx.fillStyle = rgba(color.cur, 1);
    ctx.fillText(EN ? "TODAY" : "AUJOURD'HUI", todayX + 6 * DPR, 28 * DPR);
    ctx.restore();
  }

  let lastFrame = 0;
  function loop(now = performance.now()) {
    if (!running) return;
    requestAnimationFrame(loop);
    const dt = now - lastFrame;
    if (dt < 1000 / PERF.fps - 2) return; // 30 fps cap on lite devices
    lastFrame = now;
    draw(Math.min(dt / 16.7, 3));
  }
  requestAnimationFrame(loop);
})();
