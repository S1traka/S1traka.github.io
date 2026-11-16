const reduceMotion = document.documentElement.classList.contains("reduce-motion");

// FX toggle (saved in the browser)
document.querySelectorAll(".fx-toggle").forEach((b) => {
  b.setAttribute("aria-pressed", String(!reduceMotion));
  b.querySelector("b").textContent = reduceMotion ? "OFF" : "ON";
  b.addEventListener("click", () => {
    localStorage.setItem("motion", reduceMotion ? "on" : "off");
    location.reload();
  });
});
const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
const PERF = window.PERF || (window.PERF = { lite: false, fps: 60 });

/* FPS watchdog: if the device can't keep up during the first seconds,
   switch to the lite tier for the rest of the visit (no reload). */
function goLite() {
  if (PERF.lite) return;
  PERF.lite = true; PERF.fps = 30;
  document.documentElement.classList.add("lite");
  sessionStorage.setItem("lite", "1");
  dispatchEvent(new Event("perf-lite"));
}
if (!reduceMotion && !PERF.lite) {
  addEventListener("load", () => {
    const t0 = performance.now();
    let frames = 0, start = t0, slow = 0;
    (function sample(now) {
      if (document.hidden) return;
      frames++;
      if (now - start >= 1000) {
        if (frames < 45) slow++; else slow = 0;
        if (slow >= 2) return goLite();          // 2 slow seconds in a row
        frames = 0; start = now;
      }
      if (now - t0 < 10000) requestAnimationFrame(sample); // watch for 10 s
    })(t0);
  });
}
const hasGSAP = !!(window.gsap && window.ScrollTrigger) && !reduceMotion;

document.getElementById("year").textContent = new Date().getFullYear();
if (hasGSAP) document.documentElement.classList.add("has-gsap");

/* =========================================================
   Boot loader (once per session) — returns a promise
   ========================================================= */
function boot() {
  return new Promise((resolve) => {
    const loader = document.querySelector(".loader");
    if (reduceMotion || sessionStorage.getItem("booted")) { loader.remove(); resolve(); return; }
    const bar = loader.querySelector(".loader-bar i");
    const pct = loader.querySelector(".loader-pct");
    const start = performance.now();
    const DURATION = 1300;
    (function tick(now) {
      const p = Math.min((now - start) / DURATION, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      bar.style.width = eased * 100 + "%";
      pct.textContent = Math.round(eased * 100) + "%";
      if (p < 1) return requestAnimationFrame(tick);
      sessionStorage.setItem("booted", "1");
      loader.classList.add("done");
      setTimeout(() => loader.remove(), 700);
      resolve();
    })(start);
  });
}

/* =========================================================
   Mobile menu
   ========================================================= */
const toggle = document.querySelector(".nav-toggle");
const links = document.querySelector(".nav-links");
toggle.addEventListener("click", () => {
  const open = links.classList.toggle("open");
  toggle.setAttribute("aria-expanded", open);
});
links.querySelectorAll("a").forEach((a) =>
  a.addEventListener("click", () => {
    links.classList.remove("open");
    toggle.setAttribute("aria-expanded", "false");
  })
);

/* =========================================================
   Counters
   ========================================================= */
function runCounter(el) {
  if (reduceMotion || el.dataset.done) return;
  el.dataset.done = 1;
  const target = +el.dataset.target;
  const prefix = el.dataset.prefix || "";
  const obj = { v: 0 };
  const render = () => (el.textContent = prefix + Math.round(obj.v).toLocaleString("fr-FR"));
  if (window.gsap) gsap.to(obj, { v: target, duration: 2.2, ease: "expo.out", onUpdate: render });
  else { obj.v = target; render(); }
}

/* =========================================================
   Contact form (FormSubmit, no backend needed)
   ========================================================= */
(() => {
  const form = document.querySelector(".contact-form");
  if (!form) return;
  const status = form.querySelector(".form-status");
  const T = window.LANG === "en"
    ? { sending: "Sending…", ok: "✓ Message sent — thank you! I'll get back to you soon.", err: "Sending failed. Please email me directly." }
    : { sending: "Envoi en cours…", ok: "✓ Message envoyé — merci ! Je vous réponds rapidement.", err: "Échec de l'envoi. Écrivez-moi directement par e-mail." };
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const btn = form.querySelector("button[type=submit]");
    btn.disabled = true;
    status.textContent = T.sending;
    status.className = "form-status";
    try {
      const res = await fetch(form.action, {
        method: "POST",
        headers: { Accept: "application/json" },
        body: new FormData(form),
      });
      if (!res.ok) throw new Error(res.status);
      status.textContent = T.ok;
      status.classList.add("ok");
      form.reset();
    } catch {
      status.textContent = T.err;
      status.classList.add("err");
    } finally {
      btn.disabled = false;
    }
  });
})();

/* =========================================================
   Gallery: filters + lightbox
   ========================================================= */
(() => {
  const figs = [...document.querySelectorAll(".gallery figure")];
  if (!figs.length) return;
  document.querySelectorAll(".filter").forEach((b) =>
    b.addEventListener("click", () => {
      document.querySelectorAll(".filter").forEach((x) => x.classList.toggle("active", x === b));
      figs.forEach((f) => {
        const show = b.dataset.f === "all" || f.dataset.cat === b.dataset.f;
        f.classList.toggle("hidden", !show);
      });
      if (window.ScrollTrigger) setTimeout(() => ScrollTrigger.refresh(), 450);
    })
  );

  const lb = document.querySelector(".lightbox");
  const lbImg = lb.querySelector("img");
  const lbCap = lb.querySelector(".lb-cap");
  let idx = 0;
  const visible = () => figs.filter((f) => !f.classList.contains("hidden"));
  const open = (f) => {
    const list = visible();
    idx = list.indexOf(f);
    show();
    lb.classList.add("open");
    lb.setAttribute("aria-hidden", "false");
    window.lenis && window.lenis.stop();
  };
  const show = () => {
    const f = visible()[idx];
    lbImg.src = f.querySelector("img").src;
    lbImg.alt = f.querySelector("img").alt;
    lbCap.textContent = f.querySelector("figcaption").textContent;
  };
  const close = () => {
    lb.classList.remove("open");
    lb.setAttribute("aria-hidden", "true");
    window.lenis && window.lenis.start();
  };
  const step = (d) => { const n = visible().length; idx = (idx + d + n) % n; show(); };
  figs.forEach((f) => {
    f.tabIndex = 0;
    f.addEventListener("click", () => open(f));
    f.addEventListener("keydown", (e) => e.key === "Enter" && open(f));
  });
  lb.querySelector(".lb-close").addEventListener("click", close);
  lb.querySelector(".lb-prev").addEventListener("click", () => step(-1));
  lb.querySelector(".lb-next").addEventListener("click", () => step(1));
  lb.addEventListener("click", (e) => e.target === lb && close());
  addEventListener("keydown", (e) => {
    if (!lb.classList.contains("open")) return;
    if (e.key === "Escape") close();
    if (e.key === "ArrowLeft") step(-1);
    if (e.key === "ArrowRight") step(1);
  });
})();

/* =========================================================
   Active nav link + scroll progress (work with or without GSAP)
   ========================================================= */
const navLinks = [...document.querySelectorAll(".nav-links a")];
const sectionObserver = new IntersectionObserver(
  (entries) => entries.forEach((e) => {
    if (e.isIntersecting)
      navLinks.forEach((a) => a.classList.toggle("active", a.getAttribute("href") === "#" + e.target.id));
  }),
  { rootMargin: "-45% 0px -50% 0px" }
);
document.querySelectorAll("section[id]").forEach((s) => sectionObserver.observe(s));

const progress = document.querySelector(".scroll-progress");
const updateProgress = () => {
  const max = document.documentElement.scrollHeight - innerHeight;
  progress.style.transform = `scaleX(${max > 0 ? scrollY / max : 0})`;
};
addEventListener("scroll", updateProgress, { passive: true });

/* =========================================================
   Text scramble (decoding effect)
   ========================================================= */
function startScramble() {
  const el = document.getElementById("scramble");
  if (reduceMotion) return;
  const phrases = window.LANG === "en"
    ? ["Business Analyst", "Digital project management", "Digital marketing", "MBA student · UTM", "Scrum · Jira · Kanban"]
    : ["Business Analyst", "Gestion de projet digital", "Marketing digital", "Étudiant MBA · UTM", "Scrum · Jira · Kanban"];
  const chars = "!<>-_\\/[]{}—=+*^?#01";
  let i = 0;
  const scrambleTo = (text) => new Promise((resolve) => {
    const from = el.textContent;
    const len = Math.max(from.length, text.length);
    const queue = Array.from({ length: len }, (_, n) => {
      const start = Math.floor(Math.random() * 20);
      return { from: from[n] || "", to: text[n] || "", start, end: start + Math.floor(Math.random() * 20) };
    });
    let frame = 0;
    (function update() {
      let out = "", done = 0;
      for (const q of queue) {
        if (frame >= q.end) { done++; out += q.to; }
        else if (frame >= q.start) {
          if (!q.ch || Math.random() < 0.28) q.ch = chars[Math.floor(Math.random() * chars.length)];
          out += `<span class="sc">${q.ch}</span>`;
        } else out += q.from;
      }
      el.innerHTML = out;
      if (done === queue.length) resolve();
      else { frame++; requestAnimationFrame(update); }
    })();
  });
  (async function loop() {
    await new Promise((r) => setTimeout(r, 2600));
    i = (i + 1) % phrases.length;
    await scrambleTo(phrases[i]);
    loop();
  })();
}

/* Glitch name: auto-trigger briefly every few seconds */
if (!reduceMotion) {
  const g = document.querySelector(".glitch");
  setInterval(() => {
    g.classList.add("auto");
    setTimeout(() => g.classList.remove("auto"), 280);
  }, 5000);
}

/* =========================================================
   Particle network background
   ========================================================= */
(() => {
  if (reduceMotion) return;
  const canvas = document.getElementById("network");
  const ctx = canvas.getContext("2d");
  const mouse = { x: -9999, y: -9999 };
  let w, h, dpr, nodes = [], scrollShift = 0, lastScroll = scrollY;

  let lastW = 0;
  function resize() {
    // mobile browsers fire resize when the address bar hides: ignore height-only changes
    if (lastW === innerWidth && nodes.length && !resize.force) return;
    resize.force = false; lastW = innerWidth;
    dpr = PERF.lite ? 1 : Math.min(devicePixelRatio || 1, 1.5);
    w = canvas.width = innerWidth * dpr;
    h = canvas.height = innerHeight * dpr;
    canvas.style.width = innerWidth + "px";
    canvas.style.height = innerHeight + "px";
    const count = Math.min(PERF.lite ? 34 : 80, Math.floor((innerWidth * innerHeight) / (PERF.lite ? 22000 : 16000)));
    nodes = Array.from({ length: count }, () => ({
      x: Math.random() * w, y: Math.random() * h,
      vx: (Math.random() - 0.5) * 0.35 * dpr, vy: (Math.random() - 0.5) * 0.35 * dpr,
      r: (Math.random() * 1.4 + 0.6) * dpr, z: Math.random() * 0.8 + 0.2, // depth for parallax
    }));
  }
  resize();
  addEventListener("resize", resize);
  addEventListener("perf-lite", () => { resize.force = true; resize(); });
  if (finePointer) addEventListener("pointermove", (e) => { mouse.x = e.clientX * dpr; mouse.y = e.clientY * dpr; }, { passive: true });
  document.addEventListener("pointerleave", () => { mouse.x = mouse.y = -9999; });

  let running = true;
  document.addEventListener("visibilitychange", () => {
    running = !document.hidden;
    if (running) requestAnimationFrame(draw);
  });

  const LINK = 140;
  let lastFrame = 0;
  function draw(now = performance.now()) {
    if (!running) return;
    requestAnimationFrame(draw);
    // frame cap (30 fps on lite devices) — movement scales with elapsed time
    const dt = now - lastFrame;
    if (dt < 1000 / PERF.fps - 2) return;
    lastFrame = now;
    const k = Math.min(dt / 16.7, 3);
    // particles drift with scroll (parallax by depth)
    const delta = scrollY - lastScroll; lastScroll = scrollY;
    scrollShift += (delta - scrollShift) * 0.15;
    ctx.clearRect(0, 0, w, h);
    const link = LINK * dpr, link2 = link * link, mr = 180 * dpr, mr2 = mr * mr;
    for (const n of nodes) {
      n.x += n.vx * k; n.y += n.vy * k - scrollShift * n.z * 0.5 * dpr;
      if (n.x < 0 || n.x > w) n.vx *= -1;
      if (n.y < -20) n.y = h + 20; else if (n.y > h + 20) n.y = -20;
      const mdx = mouse.x - n.x, mdy = mouse.y - n.y;
      if (mdx * mdx + mdy * mdy < mr2) { n.x += mdx * 0.004; n.y += mdy * 0.004; }
    }
    ctx.lineWidth = dpr * 0.8;
    for (let i = 0; i < nodes.length; i++) {
      const a = nodes[i];
      for (let j = i + 1; j < nodes.length; j++) {
        const b = nodes[j];
        const dx = a.x - b.x, dy = a.y - b.y, d2 = dx * dx + dy * dy;
        if (d2 < link2) {
          ctx.strokeStyle = `rgba(110, 140, 255, ${(1 - Math.sqrt(d2) / link) * 0.35})`;
          ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
        }
      }
      const mdx = mouse.x - a.x, mdy = mouse.y - a.y, md2 = mdx * mdx + mdy * mdy;
      if (md2 < mr2) {
        ctx.strokeStyle = `rgba(34, 228, 255, ${(1 - Math.sqrt(md2) / mr) * 0.5})`;
        ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(mouse.x, mouse.y); ctx.stroke();
      }
      ctx.fillStyle = `rgba(160, 180, 255, ${0.4 + a.z * 0.5})`;
      ctx.beginPath(); ctx.arc(a.x, a.y, a.r, 0, Math.PI * 2); ctx.fill();
    }
  }
  requestAnimationFrame(draw);
})();

/* =========================================================
   FALLBACK (no GSAP / reduced motion): simple CSS reveals
   ========================================================= */
if (!hasGSAP) {
  const io = new IntersectionObserver((entries) => entries.forEach((e) => {
    if (!e.isIntersecting) return;
    e.target.classList.add("visible");
    e.target.querySelectorAll(".counter").forEach(runCounter);
    io.unobserve(e.target);
  }), { threshold: 0.15 });
  document.querySelectorAll(".reveal").forEach((el) => io.observe(el));
  boot().then(startScramble);
}

/* =========================================================
   GSAP MOTION SYSTEM
   ========================================================= */
if (hasGSAP) {
  gsap.registerPlugin(ScrollTrigger);
  const hasSplit = !!window.SplitText;
  if (hasSplit) gsap.registerPlugin(SplitText);

  /* ---------- Lenis smooth scroll, synced with ScrollTrigger ---------- */
  let lenis = null;
  if (window.Lenis) {
    lenis = new Lenis({ lerp: 0.085, smoothWheel: true, wheelMultiplier: 0.95 });
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
    lenis.stop(); // locked during intro
    window.lenis = lenis;
  }

  // Smooth anchor navigation
  document.querySelectorAll('a[href^="#"]').forEach((a) => {
    a.addEventListener("click", (e) => {
      const target = document.querySelector(a.getAttribute("href"));
      if (!target) return;
      e.preventDefault();
      if (lenis) lenis.scrollTo(target, { offset: -70, duration: 1.6, easing: (t) => 1 - Math.pow(1 - t, 4) });
      else target.scrollIntoView({ behavior: "smooth" });
    });
  });

  /* ---------- Initial states for intro ---------- */
  const nav = document.querySelector(".nav");
  const glitch = document.querySelector(".glitch");
  const grad = document.querySelector("h1 .grad");
  let nameChars = [glitch];
  if (hasSplit) nameChars = new SplitText(glitch, { type: "chars", charsClass: "char" }).chars;

  nav.classList.add("nav-hidden");
  gsap.set(nameChars, { yPercent: 110, rotationX: -90, autoAlpha: 0, transformOrigin: "50% 100%" });
  gsap.set(grad, { clipPath: "inset(0 100% 0 0)" });
  gsap.set([".eyebrow", ".role", ".hero .lead", ".hero-actions .btn"], { y: 30, autoAlpha: 0 });
  gsap.set(".photo-ring", { scale: 0.6, rotation: -25, autoAlpha: 0 });
  gsap.set(".badge", { y: 20, autoAlpha: 0 });
  gsap.set(".hero-glow", { scale: 0.4, autoAlpha: 0 });

  /* ---------- Hero intro timeline ---------- */
  boot().then(() => {
    const tl = gsap.timeline({
      defaults: { ease: "expo.out", duration: 1.2 },
      onComplete: () => { lenis && lenis.start(); startScramble(); },
    });
    tl.to(".hero-glow", { scale: 1, autoAlpha: 1, duration: 2 }, 0)
      .call(() => nav.classList.remove("nav-hidden"), null, 0.1)
      .to(".eyebrow", { y: 0, autoAlpha: 1 }, 0.2)
      .to(nameChars, { yPercent: 0, rotationX: 0, autoAlpha: 1, stagger: 0.035 }, 0.3)
      .to(grad, { clipPath: "inset(0 0% 0 0)", duration: 1.4, ease: "power4.inOut" }, 0.55)
      .to(".photo-ring", { scale: 1, rotation: 0, autoAlpha: 1, duration: 1.6, ease: "elastic.out(1, 0.6)" }, 0.4)
      .to(".badge", { y: 0, autoAlpha: 1 }, 0.9)
      .to([".role", ".hero .lead", ".hero-actions .btn"], { y: 0, autoAlpha: 1, stagger: 0.1 }, 0.8);
    // release scroll early so users aren't blocked
    gsap.delayedCall(1.0, () => lenis && lenis.start());
  });

  /* ---------- Hero scroll parallax ---------- */
  gsap.to(".hero-text", {
    y: -120, autoAlpha: 0.15, ease: "none",
    scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true },
  });
  gsap.to(".hero-photo", {
    y: -60, scale: 0.88, ease: "none",
    scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true },
  });
  gsap.to(".hero-glow", {
    yPercent: 60, ease: "none",
    scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true },
  });

  /* ---------- Section titles: char-by-char reveal ---------- */
  document.querySelectorAll(".section-title").forEach((title) => {
    const targets = hasSplit
      ? new SplitText(title, { type: "words,chars", charsClass: "char", mask: "words" }).chars
      : [title];
    gsap.from(targets, {
      yPercent: 110, autoAlpha: 0, stagger: 0.025, duration: 1, ease: "expo.out",
      scrollTrigger: { trigger: title, start: "top 85%" },
    });
  });

  /* ---------- Batch reveals (blur + rise + stagger) ---------- */
  const revealEls = gsap.utils.toArray(".reveal").filter((el) => !el.closest(".hero"));
  gsap.set(revealEls, { autoAlpha: 0, y: 70 });
  ScrollTrigger.batch(revealEls, {
    start: "top 88%",
    once: true,
    onEnter: (batch) => {
      batch.forEach((el) => {
        el.classList.add("visible");
        el.querySelectorAll(".counter").forEach(runCounter);
      });
      if (PERF.lite) // same rise, without the costly blur filter
        gsap.fromTo(batch, { autoAlpha: 0, y: 50 }, { autoAlpha: 1, y: 0, duration: 0.9, ease: "expo.out", stagger: 0.08 });
      else gsap.fromTo(batch,
        { autoAlpha: 0, y: 70, filter: "blur(10px)" },
        { autoAlpha: 1, y: 0, filter: "blur(0px)", duration: 1.2, ease: "expo.out", stagger: 0.12, clearProps: "filter" });
    },
  });

  /* ---------- Timeline line draws as you scroll ---------- */
  gsap.to(".timeline", {
    "--tl": 1, ease: "none",
    scrollTrigger: { trigger: ".timeline", start: "top 75%", end: "bottom 55%", scrub: 0.6 },
  });

  /* ---------- Stats: number cells pop in ---------- */
  gsap.from(".stats > div", {
    scale: 0.85, autoAlpha: 0, stagger: 0.1, duration: 1, ease: "back.out(1.6)",
    scrollTrigger: { trigger: ".stats", start: "top 85%" },
  });

  /* ---------- Certificates: 3D flip-in ---------- */
  gsap.from(".cert", {
    rotationY: -35, transformPerspective: 900, transformOrigin: "left center",
    stagger: 0.1, duration: 1.2, ease: "expo.out",
    scrollTrigger: { trigger: ".cert-grid", start: "top 85%" },
  });

  /* ---------- Contact headline scales up with scroll ---------- */
  gsap.fromTo(".contact h2", { scale: 0.7, letterSpacing: "0.08em" }, {
    scale: 1, letterSpacing: "-0.01em", ease: "none",
    scrollTrigger: { trigger: ".contact", start: "top bottom", end: "center center", scrub: 0.8 },
  });

  /* ---------- Velocity skew: content leans with scroll speed ---------- */
  const skewTargets = gsap.utils.toArray(".section-title, .timeline, .edu-grid, .cert-grid, .about-grid");
  const skewTo = gsap.quickTo(skewTargets, "skewY", { duration: 0.6, ease: "power3" });
  const clampSkew = gsap.utils.clamp(-3, 3);

  /* ---------- Marquee driven by scroll velocity & direction ---------- */
  const rows = gsap.utils.toArray(".marquee-row").map((row) => {
    const track = row.querySelector(".marquee-track");
    track.innerHTML += track.innerHTML; // duplicate for seamless loop
    return { track, dir: +row.dataset.dir, x: 0, half: track.scrollWidth / 2, setX: gsap.quickSetter(track, "x", "px") };
  });
  // measure once (and on resize) instead of every frame — avoids layout thrashing
  const measureRows = () => rows.forEach((r) => (r.half = r.track.scrollWidth / 2));
  addEventListener("resize", measureRows);
  addEventListener("load", measureRows);
  // only animate the marquee while it is on screen
  let marqueeOn = true;
  const mq = document.querySelector(".marquee");
  if (mq) new IntersectionObserver(([e]) => (marqueeOn = e.isIntersecting)).observe(mq);
  let boost = 1, scrollDir = 1, skewTarget = 0;

  ScrollTrigger.create({
    start: 0, end: "max",
    onUpdate: (self) => {
      const v = self.getVelocity();
      skewTarget = clampSkew(v / -400);
      boost = 1 + Math.min(Math.abs(v) / 250, 12);
      scrollDir = self.direction;
      // hide nav on scroll down, show on scroll up
      nav.classList.toggle("nav-hidden", self.direction === 1 && self.scroll() > 300);
    },
  });

  gsap.ticker.add(() => {
    boost += (1 - boost) * 0.05;
    if (marqueeOn) rows.forEach((r) => {
      r.x -= 0.6 * boost * r.dir * scrollDir;
      r.x = gsap.utils.wrap(-r.half, 0, r.x);
      r.setX(r.x);
    });
    // ease skew back toward 0 (skipped on lite devices: skewing big blocks forces repaints)
    if (PERF.lite) return;
    if (Math.abs(skewTarget) < 0.01 && skewTarget !== 0) { skewTarget = 0; skewTo(0); return; }
    if (skewTarget === 0) return;
    skewTarget *= 0.9;
    skewTo(skewTarget);
  });

  /* ---------- Pointer-driven motion (desktop) ---------- */
  if (finePointer) {
    // Custom cursor (dot + lagging ring)
    const dot = document.querySelector(".cursor-dot");
    const ring = document.querySelector(".cursor-ring");
    const glow = document.querySelector(".cursor-glow");
    const dotX = gsap.quickTo(dot, "x", { duration: 0.12, ease: "power3" });
    const dotY = gsap.quickTo(dot, "y", { duration: 0.12, ease: "power3" });
    const ringX = gsap.quickTo(ring, "x", { duration: 0.5, ease: "power3" });
    const ringY = gsap.quickTo(ring, "y", { duration: 0.5, ease: "power3" });
    gsap.set(glow, { xPercent: -50, yPercent: -50 });
    const glowX = gsap.quickTo(glow, "x", { duration: 1.2, ease: "power3" });
    const glowY = gsap.quickTo(glow, "y", { duration: 1.2, ease: "power3" });

    addEventListener("pointermove", (e) => {
      document.body.classList.add("cursor-on");
      dotX(e.clientX); dotY(e.clientY);
      ringX(e.clientX); ringY(e.clientY);
      glowX(e.clientX); glowY(e.clientY);
    });
    document.addEventListener("pointerleave", () => document.body.classList.remove("cursor-on"));
    document.querySelectorAll("a, button, .card, .cert, .tags li, .stats > div").forEach((el) => {
      el.addEventListener("pointerenter", () => document.body.classList.add("cursor-hover"));
      el.addEventListener("pointerleave", () => document.body.classList.remove("cursor-hover"));
    });

    // Spotlight + smooth 3D tilt on cards
    document.querySelectorAll(".card, .cert").forEach((card) => {
      gsap.set(card, { transformPerspective: 900 });
      const rx = gsap.quickTo(card, "rotationX", { duration: 0.8, ease: "power3" });
      const ry = gsap.quickTo(card, "rotationY", { duration: 0.8, ease: "power3" });
      card.addEventListener("pointermove", (e) => {
        const r = card.getBoundingClientRect();
        const x = e.clientX - r.left, y = e.clientY - r.top;
        card.style.setProperty("--mx", x + "px");
        card.style.setProperty("--my", y + "px");
        rx(((y / r.height) - 0.5) * -10);
        ry(((x / r.width) - 0.5) * 10);
      });
      card.addEventListener("pointerleave", () => { rx(0); ry(0); });
    });

    // Magnetic buttons (button + label move at different strengths)
    document.querySelectorAll(".btn, .nav-cta, .logo").forEach((btn) => {
      const xTo = gsap.quickTo(btn, "x", { duration: 0.6, ease: "power3" });
      const yTo = gsap.quickTo(btn, "y", { duration: 0.6, ease: "power3" });
      btn.addEventListener("pointermove", (e) => {
        const r = btn.getBoundingClientRect();
        xTo((e.clientX - r.left - r.width / 2) * 0.35);
        yTo((e.clientY - r.top - r.height / 2) * 0.45);
      });
      btn.addEventListener("pointerleave", () => {
        gsap.to(btn, { x: 0, y: 0, duration: 1, ease: "elastic.out(1, 0.35)", overwrite: true });
      });
    });

    // Photo follows mouse (parallax depth)
    const ring2 = document.querySelector(".photo-ring");
    const pX = gsap.quickTo(ring2, "x", { duration: 1.2, ease: "power3" });
    const pY = gsap.quickTo(ring2, "y", { duration: 1.2, ease: "power3" });
    addEventListener("pointermove", (e) => {
      pX((e.clientX / innerWidth - 0.5) * 30);
      pY((e.clientY / innerHeight - 0.5) * 30);
    });
  }

  // Recalculate positions once fonts/images are ready
  addEventListener("load", () => ScrollTrigger.refresh());
}
