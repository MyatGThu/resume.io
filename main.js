/* ===========================================================================
   Myat Thu — Portfolio motion
   Lenis smooth scroll + GSAP reveals, fullscreen menu, text scramble,
   custom cursor, magnetic buttons, tilt, parallax, counters, marquee.
   Degrades gracefully (no JS / reduced-motion shows static content).
   =========================================================================== */
(function () {
  "use strict";

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  var hasGSAP = typeof window.gsap !== "undefined";
  if (hasGSAP) gsap.registerPlugin(ScrollTrigger);

  /* ---------- Split helpers ---------- */
  function splitWords(el) {
    var text = el.textContent.trim();
    el.textContent = "";
    var frag = document.createDocumentFragment();
    var parts = text.split(/\s+/);
    parts.forEach(function (word, i) {
      var span = document.createElement("span");
      span.className = "w";
      span.textContent = word;
      frag.appendChild(span);
      if (i < parts.length - 1) frag.appendChild(document.createTextNode(" "));
    });
    el.appendChild(frag);
    return el.querySelectorAll(".w");
  }

  /* ---------- Scroll lock ---------- */
  function lockScroll() {
    document.documentElement.classList.add("is-loading");
    if (lenis) lenis.stop();
  }
  function unlockScroll() {
    document.documentElement.classList.remove("is-loading");
    if (lenis) lenis.start();
  }

  /* ---------- Preloader ---------- */
  function runLoader(done) {
    var loader = document.getElementById("loader");
    var countEl = document.getElementById("loaderCount");
    var barEl = document.getElementById("loaderBar");
    if (!loader) { unlockScroll(); done(); return; }
    if (reduceMotion || !hasGSAP) { loader.style.display = "none"; unlockScroll(); done(); return; }

    lockScroll();
    var obj = { v: 0 };
    var tl = gsap.timeline({ onComplete: function () { unlockScroll(); done(); } });
    tl.to(obj, {
      v: 100, duration: 1.2, ease: "power2.inOut",
      onUpdate: function () { var n = Math.round(obj.v); countEl.textContent = n; barEl.style.width = n + "%"; }
    });
    tl.to(".loader__inner, .loader__bar", { y: -16, opacity: 0, duration: 0.5, ease: "power2.in" }, "+=0.12");
    tl.to(loader, { yPercent: -100, duration: 0.8, ease: "expo.inOut" }, "-=0.1");
    tl.set(loader, { display: "none" });
  }

  /* ---------- Smooth scroll ---------- */
  var lenis = null;
  function initLenis() {
    if (reduceMotion || typeof window.Lenis === "undefined") return;
    lenis = new Lenis({ duration: 1.1, smoothWheel: true });
    lenis.on("scroll", function () { if (hasGSAP) ScrollTrigger.update(); });
    if (hasGSAP) {
      gsap.ticker.add(function (time) { lenis.raf(time * 1000); });
      gsap.ticker.lagSmoothing(0);
    } else {
      (function raf(t) { lenis.raf(t); requestAnimationFrame(raf); })(0);
    }
  }
  function scrollTo(target) {
    if (lenis) lenis.scrollTo(target, { offset: 0 });
    else target.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth" });
  }

  /* ---------- Text scramble ---------- */
  var CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#%&";
  function scramble(el) {
    if (reduceMotion) return;
    if (el.dataset.scrambling === "1") return;
    var original = el.dataset.text || el.textContent;
    el.dataset.text = original;
    var len = original.length;
    el.dataset.scrambling = "1";
    var frame = 0;
    var total = 16 + len;          // frames
    var settleAt = function (i) { return 6 + i; }; // per-char reveal frame
    function tick() {
      var out = "";
      for (var i = 0; i < len; i++) {
        var c = original[i];
        if (c === " ") { out += " "; continue; }
        if (frame >= settleAt(i)) out += c;
        else out += CHARS[Math.floor(Math.random() * CHARS.length)];
      }
      el.textContent = out;
      frame++;
      if (frame <= total) { requestAnimationFrame(tick); }
      else { el.textContent = original; el.dataset.scrambling = "0"; }
    }
    tick();
  }
  function initScramble() {
    document.querySelectorAll("[data-scramble]").forEach(function (el) {
      el.dataset.text = el.textContent.trim();
      el.addEventListener("mouseenter", function () { scramble(el); });
      el.addEventListener("focus", function () { scramble(el); });
    });
  }

  /* ---------- Fullscreen menu ---------- */
  function initMenu() {
    var btn = document.getElementById("menuBtn");
    var menu = document.getElementById("menu");
    if (!btn || !menu) return;
    var links = menu.querySelectorAll(".menu__links a, .menu__meta a, .menu__meta span, .menu__h");
    var open = false;
    var tl = null;

    if (hasGSAP && !reduceMotion) {
      gsap.set(menu, { clipPath: "inset(0 0 100% 0)" });
      gsap.set(".menu__links li a, .menu__meta > *", { yPercent: 100, opacity: 0 });
    }

    function setOpen(state) {
      open = state;
      btn.classList.toggle("is-open", open);
      btn.setAttribute("aria-expanded", String(open));
      menu.setAttribute("aria-hidden", String(!open));
      menu.classList.toggle("is-open", open);
      var label = btn.querySelector(".menu-btn__label");
      if (label) label.textContent = open ? "Close" : "Menu";

      if (lenis) { open ? lenis.stop() : lenis.start(); }
      else { document.body.style.overflow = open ? "hidden" : ""; }

      if (!hasGSAP || reduceMotion) {
        menu.style.clipPath = open ? "inset(0 0 0% 0)" : "inset(0 0 100% 0)";
        return;
      }
      if (tl) tl.kill();
      tl = gsap.timeline();
      if (open) {
        tl.to(menu, { clipPath: "inset(0 0 0% 0)", duration: 0.7, ease: "expo.inOut" })
          .to(".menu__links li a, .menu__meta > *", { yPercent: 0, opacity: 1, duration: 0.6, stagger: 0.05, ease: "power3.out" }, "-=0.3");
      } else {
        tl.to(".menu__links li a, .menu__meta > *", { yPercent: 100, opacity: 0, duration: 0.3, ease: "power2.in" })
          .to(menu, { clipPath: "inset(0 0 100% 0)", duration: 0.6, ease: "expo.inOut" }, "-=0.1");
      }
    }

    btn.addEventListener("click", function () { setOpen(!open); });
    menu.querySelectorAll('a[href^="#"]').forEach(function (a) {
      a.addEventListener("click", function (e) {
        var t = document.querySelector(a.getAttribute("href"));
        if (!t) return;
        e.preventDefault();
        setOpen(false);
        setTimeout(function () { scrollTo(t); }, 420);
      });
    });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape" && open) setOpen(false); });
  }

  /* ---------- In-page anchor links (non-menu) ---------- */
  function initAnchors() {
    document.querySelectorAll('header a[href^="#"], .hero__scroll, .badge, .foot a[href^="#"], .contact a[href^="#"]').forEach(function (a) {
      a.addEventListener("click", function (e) {
        var href = a.getAttribute("href");
        if (!href || href[0] !== "#" || href.length < 2) return;
        var t = document.querySelector(href);
        if (!t) return;
        e.preventDefault();
        scrollTo(t);
      });
    });
  }

  /* ---------- Hero / contact heading reveal ---------- */
  function revealSplitWords(scope) {
    var words = scope.querySelectorAll("[data-split]");
    if (!words.length) return;
    if (!hasGSAP || reduceMotion) { if (hasGSAP) gsap.set(words, { yPercent: 0, clearProps: "all" }); return; }
    gsap.fromTo(words, { yPercent: 110 }, { yPercent: 0, duration: 1.1, ease: "expo.out", stagger: 0.08, delay: 0.05 });
  }

  /* ---------- Generic reveals ---------- */
  function initReveals() {
    if (!hasGSAP) return;
    if (reduceMotion) { gsap.set("[data-reveal],[data-cap],[data-role]", { clearProps: "all" }); return; }
    gsap.utils.toArray("[data-reveal]").forEach(function (el) {
      gsap.to(el, { opacity: 1, y: 0, duration: 1, ease: "power3.out", scrollTrigger: { trigger: el, start: "top 88%" } });
    });
    ScrollTrigger.batch("[data-cap]", { start: "top 90%", onEnter: function (b) { gsap.to(b, { opacity: 1, y: 0, duration: 0.9, ease: "power3.out", stagger: 0.08 }); } });
    gsap.utils.toArray("[data-role]").forEach(function (el) {
      gsap.to(el, { opacity: 1, y: 0, duration: 1, ease: "power3.out", scrollTrigger: { trigger: el, start: "top 85%" } });
    });
  }

  /* ---------- Scroll-driven word reveal ---------- */
  function initWordReveal() {
    var lead = document.querySelector("[data-words]");
    if (!lead) return;
    var words = splitWords(lead);
    if (!hasGSAP || reduceMotion) { words.forEach(function (w) { w.classList.add("on"); }); return; }
    ScrollTrigger.create({
      trigger: lead, start: "top 75%", end: "bottom 60%", scrub: true,
      onUpdate: function (self) { var n = Math.floor(self.progress * words.length); words.forEach(function (w, i) { w.classList.toggle("on", i < n); }); }
    });
  }

  /* ---------- Parallax ---------- */
  function initParallax() {
    if (!hasGSAP || reduceMotion) return;
    gsap.utils.toArray("[data-parallax]").forEach(function (el) {
      var y = parseFloat(el.getAttribute("data-parallax")) || 0;
      var x = parseFloat(el.getAttribute("data-parallax-x")) || 0;
      var rot = parseFloat(el.getAttribute("data-parallax-rot")) || 0;
      gsap.to(el, {
        yPercent: y * 100, xPercent: x * 100, rotation: rot, ease: "none",
        scrollTrigger: { trigger: el, start: "top bottom", end: "bottom top", scrub: true }
      });
    });
  }

  /* ---------- Toolbox: scatter <-> gather on scroll ---------- */
  function initToolbox() {
    if (!hasGSAP || reduceMotion) return;
    var section = document.querySelector(".toolbox");
    var field = document.querySelector(".toolbox__field");
    if (!section || !field) return;
    if (window.matchMedia("(max-width: 820px)").matches) return; // static grid on mobile
    var tiles = gsap.utils.toArray(".toolbox__field .tool");
    if (!tiles.length) return;

    var tl = gsap.timeline({
      scrollTrigger: { trigger: section, start: "top top", end: "bottom bottom", scrub: 0.6, invalidateOnRefresh: true }
    });
    tiles.forEach(function (tile, i) {
      var col = i % 4, row = Math.floor(i / 4);
      tl.to(tile, {
        // Pull every tile into a tidy 4-column cluster centred below the heading.
        x: function () { return field.clientWidth / 2 - (tile.offsetLeft + tile.offsetWidth / 2) + (col - 1.5) * 122; },
        y: function () { return field.clientHeight * 0.72 - (tile.offsetTop + tile.offsetHeight / 2) + (row - 1) * 88; },
        rotation: (i % 2 ? 1 : -1) * 2,
        ease: "none"
      }, 0);
    });
  }

  /* ---------- Counters ---------- */
  function initCounters() {
    if (!hasGSAP) return;
    gsap.utils.toArray("[data-count]").forEach(function (el) {
      var target = parseFloat(el.getAttribute("data-count"));
      var suffix = el.getAttribute("data-suffix") || "";
      if (reduceMotion) { el.textContent = target + suffix; return; }
      var obj = { v: 0 };
      ScrollTrigger.create({
        trigger: el, start: "top 90%", once: true,
        onEnter: function () { gsap.to(obj, { v: target, duration: 1.6, ease: "power2.out", onUpdate: function () { el.textContent = Math.round(obj.v) + suffix; } }); }
      });
    });
  }

  /* ---------- Marquee ---------- */
  function initMarquee() {
    var track = document.getElementById("marquee");
    if (!track || !hasGSAP || reduceMotion) return;
    var loop = gsap.to(track, { xPercent: -50, repeat: -1, duration: 24, ease: "none" });
    if (lenis) lenis.on("scroll", function (e) { var v = Math.min(Math.abs(e.velocity || 0), 40); loop.timeScale(1 + v * 0.12); });
  }

  /* ---------- Custom cursor ---------- */
  function initCursor() {
    var cursor = document.querySelector(".cursor");
    if (!cursor || !fine) return;
    var label = cursor.querySelector(".cursor__label");
    var x = innerWidth / 2, y = innerHeight / 2, cx = x, cy = y;
    addEventListener("mousemove", function (e) { x = e.clientX; y = e.clientY; });
    (function render() {
      cx += (x - cx) * 0.18; cy += (y - cy) * 0.18;
      cursor.style.transform = "translate(" + cx + "px," + cy + "px) translate(-50%,-50%)";
      requestAnimationFrame(render);
    })();
    document.querySelectorAll("a, button, [data-cursor], [data-magnetic]").forEach(function (el) {
      el.addEventListener("mouseenter", function () {
        var text = el.getAttribute("data-cursor");
        if (text) { cursor.classList.add("is-label"); label.textContent = text; }
        else { cursor.classList.add("is-hover"); }
      });
      el.addEventListener("mouseleave", function () {
        cursor.classList.remove("is-hover", "is-label");
        label.textContent = "";
      });
    });
  }

  /* ---------- Magnetic ---------- */
  function initMagnetic() {
    if (reduceMotion || !hasGSAP || !fine) return;
    document.querySelectorAll("[data-magnetic]").forEach(function (el) {
      el.addEventListener("mousemove", function (e) {
        var r = el.getBoundingClientRect();
        gsap.to(el, { x: (e.clientX - (r.left + r.width / 2)) * 0.3, y: (e.clientY - (r.top + r.height / 2)) * 0.4, duration: 0.6, ease: "power3.out" });
      });
      el.addEventListener("mouseleave", function () { gsap.to(el, { x: 0, y: 0, duration: 0.6, ease: "elastic.out(1,0.4)" }); });
    });
  }

  /* ---------- Tilt ---------- */
  function initTilt() {
    if (reduceMotion || !hasGSAP || !fine) return;
    document.querySelectorAll("[data-tilt]").forEach(function (el) {
      el.addEventListener("mousemove", function (e) {
        var r = el.getBoundingClientRect();
        gsap.to(el, { rotateY: ((e.clientX - r.left) / r.width - 0.5) * 12, rotateX: -(((e.clientY - r.top) / r.height) - 0.5) * 12, duration: 0.5, ease: "power2.out", transformPerspective: 800 });
      });
      el.addEventListener("mouseleave", function () { gsap.to(el, { rotateY: 0, rotateX: 0, duration: 0.8, ease: "elastic.out(1,0.5)" }); });
    });
  }

  /* ---------- Boot ---------- */
  function boot() {
    initLenis();
    initMenu();
    initAnchors();
    initScramble();
    initReveals();
    initWordReveal();
    initParallax();
    initToolbox();
    initCounters();
    initMarquee();
    initCursor();
    initMagnetic();
    initTilt();

    runLoader(function () {
      revealSplitWords(document.querySelector(".hero"));
      var contact = document.querySelector(".contact");
      if (contact && hasGSAP && !reduceMotion) {
        ScrollTrigger.create({ trigger: contact, start: "top 70%", once: true, onEnter: function () { revealSplitWords(contact); } });
      } else if (contact) {
        revealSplitWords(contact);
      }
      if (hasGSAP) ScrollTrigger.refresh();
    });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
