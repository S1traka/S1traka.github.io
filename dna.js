/* =========================================================
   DNA / GENETIC-MEMORY LAYER
   - 3D double helix background (reacts to scroll, mouse, section colour)
   - DNA side navigation (one node per "sequence")
   - Per-section "synchronisation" HUD + scan sweep + title glitch
   - Helix dividers drawn on scroll
   - Hero HUD readouts
   ========================================================= */
(() => {
  const html = document.documentElement;
  const RM = html.classList.contains("reduce-motion");
  const G = !!(window.gsap && window.ScrollTrigger) && !RM;

  const HUES = {
    home: "#4f7cff", about: "#22d3ee", experience: "#a78bfa", education: "#10b981",
    skills: "#4f7cff", certificates: "#f472b6", contact: "#22e4ff",
  };
  const NAMES = {
    home: "Initialisation", about: "À propos", experience: "Expérience", education: "Formation",
    skills: "Compétences", certificates: "Certificats", contact: "Contact",
  };
  // Business-analysis / tech tokens shown on the data helix
  const TOKENS = ["KPI", "ROI", "SQL", "API", "CRM", "SEO", "GCP", "CTR", "BI", "UX", "0x1F", "101", "Δ%", "MVP"];
  const sections = [...document.querySelectorAll("#home, main > section.section[id]")];
  const hexToRgb = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
  const color = { cur: hexToRgb(HUES.home), target: hexToRgb(HUES.home) };
  const rgba = (c, a) => `rgba(${c[0] | 0}, ${c[1] | 0}, ${c[2] | 0}, ${a})`;
  const VIOLET = [155, 107, 255];

  /* ---------- Loader: streaming DNA bases ---------- */
  const loaderDna = document.querySelector(".loader-dna");
  if (loaderDna) {
    const id = setInterval(() => {
      if (!loaderDna.isConnected) return clearInterval(id);
      loaderDna.textContent = Array.from({ length: 5 }, () =>
        Math.random() < 0.5
          ? ((Math.random() * 16) | 0).toString(2).padStart(4, "0")
          : ((Math.random() * 0xffff) | 0).toString(16).toUpperCase().padStart(4, "0")
      ).join(" ");
    }, 60);
  }

  /* ---------- Hero HUD ---------- */
  const hero = document.getElementById("home");
  hero.insertAdjacentHTML("beforeend", `
    <div class="hero-hud tl" aria-hidden="true">
      PROFIL <b>// BUSINESS_ANALYST · MARKETING</b><br>
      STACK <b>// GCP · OFFICE · CANVA · PS</b><br>
      STATUT <b>// DISPONIBLE ●</b>
    </div>
    <div class="hero-hud br" aria-hidden="true">
      NODE ANTANANARIVO · LAT -18.88 · LON 47.51<br>
      DATASTREAM <b class="hud-hex">0x2A6F1C</b><br>
      <span class="hud-time"></span>
    </div>`);
  const hudHex = hero.querySelector(".hud-hex");
  const hudTime = hero.querySelector(".hud-time");
  const tickHud = () => {
    hudTime.textContent = "T+ " + new Date().toLocaleTimeString("fr-FR");
    if (!RM) hudHex.textContent = "0x" + ((Math.random() * 0xffffff) | 0).toString(16).toUpperCase().padStart(6, "0");
  };
  tickHud();
  setInterval(tickHud, RM ? 1000 : 180);

  /* ---------- Sync HUD + helix dividers for each section ---------- */
  // Section dividers = animated KPI charts (growth line + bars + area), different per section
  function dividerSVG(seed) {
    const W = 1200, H = 80, step = 40, base = H - 6;
    let rnd = seed * 9301 + 49297;
    const rand = () => ((rnd = (rnd * 9301 + 49297) % 233280) / 233280);
    let line = "", bars = "", grid = "";
    const pts = [];
    for (let x = 0, i = 0; x <= W; x += step, i++) {
      const trend = Math.pow(x / W, 1.25);
      const y = base - 8 - trend * (H - 30) - (rand() - 0.5) * 14;
      pts.push([x, Math.max(6, y)]);
      const bh = 6 + rand() * (base - y) * 0.7;
      bars += `<rect class="chart-bar" x="${x + 8}" y="${(base - bh).toFixed(1)}" width="${step - 16}" height="${bh.toFixed(1)}"/>`;
      if (i % 5 === 0) grid += `<line class="chart-grid" vector-effect="non-scaling-stroke" x1="${x}" y1="0" x2="${x}" y2="${base}"/>`;
    }
    pts.forEach(([x, y], i) => (line += (i ? " L" : "M") + x + " " + y.toFixed(1)));
    const area = line + ` L${W} ${base} L0 ${base} Z`;
    const id = "g" + seed;
    const pulse = RM ? "" :
      `<circle class="pulse" r="3.5"><animateMotion dur="7s" repeatCount="indefinite" path="${line}"/></circle>`;
    return `<svg class="dna-divider" viewBox="0 0 ${W} ${H}" preserveAspectRatio="none" aria-hidden="true">
      <defs><linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="currentColor" stop-opacity="0.28"/><stop offset="1" stop-color="currentColor" stop-opacity="0"/>
      </linearGradient></defs>
      ${grid}
      <line class="chart-base" vector-effect="non-scaling-stroke" x1="0" y1="${base}" x2="${W}" y2="${base}"/>
      ${bars}
      <path class="chart-area" fill="url(#${id})" d="${area}"/>
      <path class="chart-line" pathLength="1" vector-effect="non-scaling-stroke" d="${line}"/>
      ${pulse}</svg>`;
  }

  sections.forEach((s, i) => {
    if (s.id === "home") return;
    const title = s.querySelector(".section-title, h2");
    title.insertAdjacentHTML("beforebegin", `
      <div class="sync-hud" aria-hidden="true">
        <span class="sync-seq">MODULE ${String(i).padStart(2, "0")}</span>
        <span>ANALYSE DES DONNÉES</span>
        <span class="sync-track"><i></i></span>
        <span class="sync-pct">${RM ? "100%" : "0%"}</span>
        <span class="sync-ok">✓ DONNÉES VALIDÉES</span>
      </div>`);
    if (RM) { s.classList.add("synced"); s.querySelector(".sync-hud").style.setProperty("--sync", 1); }
    s.insertAdjacentHTML("beforebegin", dividerSVG(i));
  });

  // Draw dividers as they scroll into view
  if (G) {
    document.querySelectorAll(".dna-divider").forEach((svg) => {
      const line = svg.querySelector(".chart-line");
      const area = svg.querySelector(".chart-area");
      const bars = svg.querySelectorAll(".chart-bar");
      gsap.set(line, { strokeDasharray: 1, strokeDashoffset: 1 });
      gsap.set(area, { opacity: 0 });
      gsap.set(bars, { scaleY: 0, transformOrigin: "50% 100%" });
      const tl = gsap.timeline({
        scrollTrigger: { trigger: svg, start: "top 92%", end: "top 45%", scrub: 0.8 },
      });
      tl.to(bars, { scaleY: 1, ease: "back.out(1.6)", stagger: 0.02, duration: 0.3 }, 0)
        .to(line, { strokeDashoffset: 0, ease: "none", duration: 1 }, 0.1)
        .to(area, { opacity: 1, duration: 0.5 }, 0.5);
    });
  }

  /* ---------- DNA side navigation ---------- */
  const navEl = document.querySelector(".dna-nav");
  const navCanvas = navEl.querySelector(".dna-nav-canvas");
  const nctx = navCanvas.getContext("2d");
  const navNodes = sections.map((s, i) => {
    const b = document.createElement("button");
    b.type = "button";
    b.className = "dna-node";
    b.style.top = 6 + i * (88 / (sections.length - 1)) + "%";
    b.setAttribute("aria-label", `Séquence ${i} : ${NAMES[s.id]}`);
    b.innerHTML = `<span class="lbl"><em>${String(i).padStart(2, "0")}</em>${NAMES[s.id]}</span>`;
    b.addEventListener("click", () => {
      if (window.lenis) window.lenis.scrollTo(s, { offset: s.id === "home" ? 0 : -70, duration: 1.8, easing: (t) => 1 - Math.pow(1 - t, 4) });
      else s.scrollIntoView({ behavior: RM ? "auto" : "smooth" });
    });
    navEl.appendChild(b);
    return b;
  });

  /* ---------- Synchronisation sequence for a section ---------- */
  let spinKick = 0;
  function synchronise(s) {
    if (s.dataset.synced) return;
    s.dataset.synced = "1";
    const idx = sections.indexOf(s);
    if (s.id === "home" || RM) { navNodes[idx].classList.add("synced"); return; }
    const hud = s.querySelector(".sync-hud");
    const pct = hud.querySelector(".sync-pct");
    const title = s.querySelector(".section-title");
    s.style.setProperty("--sweep-h", s.offsetHeight + "px");
    s.classList.add("syncing");
    if (title) {
      title.classList.add("glitching");
      setTimeout(() => title.classList.remove("glitching"), 650);
    }
    spinKick += 0.12;
    const start = performance.now(), D = 1400;
    (function step(now) {
      const p = Math.min((now - start) / D, 1);
      const e = 1 - Math.pow(1 - p, 3);
      hud.style.setProperty("--sync", e);
      pct.textContent = Math.round(e * 100) + "%";
      if (p < 1) return requestAnimationFrame(step);
      s.classList.add("synced");
      navNodes[idx].classList.add("synced");
      setTimeout(() => s.classList.remove("syncing"), 400);
    })(start);
  }
  const syncIO = new IntersectionObserver(
    (entries) => entries.forEach((e) => e.isIntersecting && synchronise(e.target)),
    { rootMargin: "0px 0px -30% 0px", threshold: 0 }
  );
  sections.forEach((s) => syncIO.observe(s));

  /* ---------- Active section: colour shift + nav highlight ---------- */
  let activeIdx = 0;
  const activeIO = new IntersectionObserver(
    (entries) => entries.forEach((e) => {
      if (!e.isIntersecting) return;
      activeIdx = sections.indexOf(e.target);
      const hue = HUES[e.target.id] || HUES.home;
      html.style.setProperty("--accent", hue);
      color.target = hexToRgb(hue);
      navNodes.forEach((n, i) => n.classList.toggle("active", i === activeIdx));
      if (RM) { color.cur = color.target; drawNav(0); }
    }),
    { rootMargin: "-45% 0px -50% 0px" }
  );
  sections.forEach((s) => activeIO.observe(s));

  /* ---------- Side-nav helix drawing ---------- */
  function sizeCanvas(c, ctx2) {
    const dpr = Math.min(devicePixelRatio || 1, 2);
    const r = c.getBoundingClientRect();
    c.width = r.width * dpr; c.height = r.height * dpr;
    ctx2.setTransform(dpr, 0, 0, dpr, 0, 0);
    return { w: r.width, h: r.height };
  }
  let navSize = sizeCanvas(navCanvas, nctx);

  function drawNav(phase) {
    const { w, h } = navSize;
    nctx.clearRect(0, 0, w, h);
    const top = h * 0.06, bottom = h * 0.94, cx = w / 2, A = w * 0.32;
    const max = document.documentElement.scrollHeight - innerHeight;
    const progY = top + (bottom - top) * (max > 0 ? scrollY / max : 0);
    for (let y = top; y <= bottom; y += 7) {
      const a = y * 0.045 + phase;
      const x1 = cx + A * Math.sin(a), x2 = cx - A * Math.sin(a);
      const done = y <= progY;
      const depth = (Math.cos(a) + 1) / 2;
      nctx.strokeStyle = done ? rgba(color.cur, 0.2 + depth * 0.35) : `rgba(160,180,255,${0.06 + depth * 0.1})`;
      nctx.lineWidth = 1;
      nctx.beginPath(); nctx.moveTo(x1, y); nctx.lineTo(x2, y); nctx.stroke();
      nctx.fillStyle = done ? rgba(color.cur, 0.5 + depth * 0.5) : `rgba(160,180,255,${0.2 + depth * 0.3})`;
      const s1 = 2.2 + depth * 2, s2 = 2.2 + (1 - depth) * 2;
      nctx.fillRect(x1 - s1 / 2, y - s1 / 2, s1, s1);
      nctx.fillStyle = done ? rgba(VIOLET, 0.4 + (1 - depth) * 0.5) : `rgba(160,180,255,${0.2 + (1 - depth) * 0.3})`;
      nctx.fillRect(x2 - s2 / 2, y - s2 / 2, s2, s2);
    }
    // progress head
    nctx.fillStyle = rgba(color.cur, 0.9);
    nctx.shadowColor = rgba(color.cur, 1); nctx.shadowBlur = 12;
    nctx.fillRect(cx - A - 4, progY - 0.5, A * 2 + 8, 1);
    nctx.shadowBlur = 0;
  }

  /* ---------- Big 3D helix background ---------- */
  const hc = document.getElementById("helix");
  const hctx = hc.getContext("2d");
  let W, H, DPR;
  function sizeHelix() {
    DPR = Math.min(devicePixelRatio || 1, 2);
    W = hc.width = innerWidth * DPR; H = hc.height = innerHeight * DPR;
    hc.style.width = innerWidth + "px"; hc.style.height = innerHeight + "px";
  }
  sizeHelix();
  addEventListener("resize", () => { sizeHelix(); navSize = sizeCanvas(navCanvas, nctx); if (RM) drawNav(0); });

  const mouse = { x: 0, y: 0, sx: 0, sy: 0 };
  addEventListener("pointermove", (e) => { mouse.x = e.clientX / innerWidth - 0.5; mouse.y = e.clientY / innerHeight - 0.5; });

  let angle = 0, spin = 0, lastY = scrollY, flow = 0;
  function drawHelix() {
    const mobile = innerWidth < 900;
    const sY = scrollY;
    const dy = sY - lastY; lastY = sY;
    spin += dy * 0.0009 + spinKick; spinKick = 0;
    spin *= 0.93;
    angle += 0.006 + spin;
    flow += 0.012 + Math.abs(spin) * 2;
    mouse.sx += (mouse.x - mouse.sx) * 0.05;
    mouse.sy += (mouse.y - mouse.sy) * 0.05;

    hctx.clearRect(0, 0, W, H);
    hctx.save();
    const cx = (mobile ? 0.5 : 0.8) * W + mouse.sx * 40 * DPR;
    hctx.translate(cx, H / 2 + mouse.sy * 30 * DPR);
    hctx.rotate(-0.38 + mouse.sx * 0.12);
    hctx.globalAlpha = mobile ? 0.3 : 0.75;

    const len = Math.hypot(W, H) * 1.1;
    const pairs = 48;
    const sp = len / pairs;
    const R = Math.min(W, H) * (mobile ? 0.16 : 0.11);
    const travel = sY * 0.25 * DPR;
    const shift = travel % sp;
    const baseIdx = Math.floor(travel / sp);
    const strandA = [], strandB = [];

    for (let i = 0; i <= pairs; i++) {
      const k = i + baseIdx;
      const y = -len / 2 + i * sp - shift;
      const a = k * 0.42 + angle;
      const x = R * Math.cos(a), z = Math.sin(a);
      // fade at the ends of the helix
      const edge = Math.min(1, Math.min(i, pairs - i) / 8);
      strandA.push({ x, y, z, edge, k });
      strandB.push({ x: -x, y, z: -z, edge, k });
      // data link between the two strands (dashed, flowing)
      const g = hctx.createLinearGradient(x, y, -x, y);
      g.addColorStop(0, rgba(color.cur, 0.35 * edge));
      g.addColorStop(1, rgba(VIOLET, 0.35 * edge));
      hctx.strokeStyle = g;
      hctx.lineWidth = DPR * (0.6 + Math.abs(Math.cos(a)) * 0.6);
      hctx.setLineDash([3 * DPR, 4 * DPR]);
      hctx.lineDashOffset = -flow * 20 * DPR;
      hctx.beginPath(); hctx.moveTo(x, y); hctx.lineTo(-x, y); hctx.stroke();
      hctx.setLineDash([]);
      // data packet travelling across some links
      if (k % 4 === 0) {
        const p = (flow * 0.6 + k * 0.137) % 1;
        const px = x + (-2 * x) * p;
        hctx.fillStyle = `rgba(34, 228, 255, ${0.9 * edge})`;
        hctx.fillRect(px - 1.5 * DPR, y - 1.5 * DPR, 3 * DPR, 3 * DPR);
      }
    }
    // backbones
    [[strandA, color.cur], [strandB, VIOLET]].forEach(([pts, c]) => {
      hctx.strokeStyle = rgba(c, 0.4);
      hctx.lineWidth = 1.4 * DPR;
      hctx.beginPath();
      pts.forEach((p, i) => (i ? hctx.lineTo(p.x, p.y) : hctx.moveTo(p.x, p.y)));
      hctx.stroke();
    });
    // data nodes (square "packets", depth-shaded) with BA/tech tokens on the front side
    hctx.font = `${10 * DPR}px ui-monospace, Consolas, monospace`;
    [[strandA, color.cur], [strandB, VIOLET]].forEach(([pts, c], si) => {
      pts.forEach((p) => {
        const d = (p.z + 1) / 2;
        const s = (2.4 + d * 4) * DPR;
        hctx.shadowColor = rgba(c, 1);
        hctx.shadowBlur = d > 0.8 ? 14 * DPR : 0;
        if (d > 0.6) {
          hctx.fillStyle = rgba(c, (0.35 + d * 0.65) * p.edge);
          hctx.fillRect(p.x - s / 2, p.y - s / 2, s, s);
        } else {
          hctx.strokeStyle = rgba(c, (0.3 + d * 0.5) * p.edge);
          hctx.lineWidth = DPR;
          hctx.strokeRect(p.x - s / 2, p.y - s / 2, s, s);
        }
        if (d > 0.85 && p.k % 3 === 0) {
          hctx.shadowBlur = 0;
          hctx.fillStyle = rgba(c, 0.6 * p.edge);
          hctx.fillText(TOKENS[(Math.abs(p.k) + si * 5) % TOKENS.length], p.x + 9 * DPR, p.y + 3 * DPR);
        }
      });
    });
    hctx.shadowBlur = 0;
    hctx.restore();
  }

  /* ---------- Main loop ---------- */
  if (RM) {
    drawNav(0);
    addEventListener("scroll", () => drawNav(0), { passive: true });
    return;
  }
  let running = true;
  document.addEventListener("visibilitychange", () => {
    running = !document.hidden;
    if (running) requestAnimationFrame(loop);
  });
  function loop(t) {
    if (!running) return;
    for (let i = 0; i < 3; i++) color.cur[i] += (color.target[i] - color.cur[i]) * 0.05;
    drawHelix();
    drawNav(t * 0.0012 + scrollY * 0.004);
    requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);
})();
