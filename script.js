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
  const phrases = ["Marketing digital", "Business Analyst", "Création de contenu", "Community management", "Professionnel polyvalent"];
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

  function resize() {
    dpr = Math.min(devicePixelRatio || 1, 2);
    w = canvas.width = innerWidth * dpr;
    h = canvas.height = innerHeight * dpr;
    canvas.style.width = innerWidth + "px";
    canvas.style.height = innerHeight + "px";
    const count = Math.min(90, Math.floor((innerWidth * innerHeight) / 16000));
    nodes = Array.from({ length: count }, () => ({
      x: Math.random() * w, y: Math.random() * h,
      vx: (Math.random() - 0.5) * 0.35 * dpr, vy: (Math.random() - 0.5) * 0.35 * dpr,
      r: (Math.random() * 1.4 + 0.6) * dpr, z: Math.random() * 0.8 + 0.2, // depth for parallax
    }));
  }
  resize();
  addEventListener("resize", resize);
  addEventListener("pointermove", (e) => { mouse.x = e.clientX * dpr; mouse.y = e.clientY * dpr; });
  document.addEventListener("pointerleave", () => { mouse.x = mouse.y = -9999; });

  let running = true;
  document.addEventListener("visibilitychange", () => {
    running = !document.hidden;
    if (running) requestAnimationFrame(draw);
  });

  const LINK = 140;
  function draw() {
    if (!running) return;
    // particles drift with scroll (parallax by depth)
    const delta = scrollY - lastScroll; lastScroll = scrollY;
    scrollShift += (delta - scrollShift) * 0.15;
    ctx.clearRect(0, 0, w, h);
    const link = LINK * dpr;
    for (const n of nodes) {
      n.x += n.vx; n.y += n.vy - scrollShift * n.z * 0.5 * dpr;
      if (n.x < 0 || n.x > w) n.vx *= -1;
      if (n.y < -20) n.y = h + 20; else if (n.y > h + 20) n.y = -20;
      const mdx = mouse.x - n.x, mdy = mouse.y - n.y, md = Math.hypot(mdx, mdy);
      if (md < 180 * dpr) { n.x += mdx * 0.004; n.y += mdy * 0.004; }
    }
    for (let i = 0; i < nodes.length; i++) {
      const a = nodes[i];
      for (let j = i + 1; j < nodes.length; j++) {
        const b = nodes[j];
        const d = Math.hypot(a.x - b.x, a.y - b.y);
        if (d < link) {
          ctx.strokeStyle = `rgba(110, 140, 255, ${(1 - d / link) * 0.35})`;
          ctx.lineWidth = dpr * 0.8;
          ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
        }
      }
      const md = Math.hypot(mouse.x - a.x, mouse.y - a.y);
      if (md < 180 * dpr) {
        ctx.strokeStyle = `rgba(34, 228, 255, ${(1 - md / (180 * dpr)) * 0.5})`;
        ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(mouse.x, mouse.y); ctx.stroke();
      }
      ctx.fillStyle = `rgba(160, 180, 255, ${0.4 + a.z * 0.5})`;
      ctx.beginPath(); ctx.arc(a.x, a.y, a.r, 0, Math.PI * 2); ctx.fill();
    }
    requestAnimationFrame(draw);
  }
  draw();
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
      gsap.fromTo(batch,
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
    return { track, dir: +row.dataset.dir, x: 0 };
  });
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
    rows.forEach((r) => {
      const half = r.track.scrollWidth / 2;
      r.x -= 0.6 * boost * r.dir * scrollDir;
      r.x = gsap.utils.wrap(-half, 0, r.x);
      gsap.set(r.track, { x: r.x });
    });
    // ease skew back toward 0
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
