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
      var step = i - (tiles.length - 1) / 2; // centred staircase index
      tl.to(tile, {
        // Cascade every tile into a diagonal staircase centred below the heading.
        x: function () { return field.clientWidth / 2 - (tile.offsetLeft + tile.offsetWidth / 2) + step * 52; },
        y: function () { return field.clientHeight * 0.72 - (tile.offsetTop + tile.offsetHeight / 2) + step * 46; },
        rotation: -2,
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

  /* ---------- Encrypted name cipher (hover/tap to reveal) ---------- */
  function initCipher() {
    var words = Array.prototype.slice.call(document.querySelectorAll(".hero__title [data-cipher]"));
    var title = document.querySelector(".hero__title--cipher");
    if (!words.length || !title) return;
    var portrait = document.querySelector(".hero__portrait");

    // Mostly hex, a sprinkle of half-width katakana for a Matrix feel.
    var GLYPHS = "0123456789ABCDEF0123456789ABCDEF" + "ｱｶｻﾀﾅﾊﾏﾔﾗﾝｷｼﾆ";
    function scramble(el) {
      var n = parseInt(el.getAttribute("data-cipher"), 10) || el.textContent.length;
      var s = "";
      for (var i = 0; i < n; i++) s += GLYPHS.charAt(Math.floor(Math.random() * GLYPHS.length));
      el.textContent = s;
    }
    function showReal() { words.forEach(function (el) { el.textContent = el.getAttribute("data-real") || ""; }); }

    var nameShown = false;
    function revealName(state) {
      nameShown = state;
      title.classList.toggle("is-revealed", state);
      if (state) showReal();
    }
    function revealPhoto(state) { if (portrait) portrait.classList.toggle("is-revealed", state); }

    // Desktop reveals on hover; touch toggles on tap.
    if (window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
      title.addEventListener("mouseenter", function () { revealName(true); });
      title.addEventListener("mouseleave", function () { revealName(false); });
      if (portrait) {
        portrait.addEventListener("mouseenter", function () { revealPhoto(true); });
        portrait.addEventListener("mouseleave", function () { revealPhoto(false); });
      }
    } else {
      title.addEventListener("click", function () { revealName(!nameShown); });
      if (portrait) portrait.addEventListener("click", function () { revealPhoto(!portrait.classList.contains("is-revealed")); });
    }

    words.forEach(scramble);
    if (reduceMotion) return; // static cipher; hover/tap still reveals

    var timer = null;
    function tick() { if (!nameShown) words.forEach(scramble); }
    // Only churn while the hero is on screen.
    var hero = document.querySelector(".hero");
    if (hero && "IntersectionObserver" in window) {
      new IntersectionObserver(function (entries) {
        if (entries[0].isIntersecting) { if (!timer) timer = setInterval(tick, 90); }
        else if (timer) { clearInterval(timer); timer = null; }
      }).observe(hero);
    } else {
      timer = setInterval(tick, 90);
    }
  }

  /* ---------- Work list: a card preview that trails the cursor ---------- */
  function initWorkPreview() {
    if (reduceMotion || !window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    var roles = document.querySelectorAll(".work__list .role");
    if (!roles.length) return;

    var prev = document.createElement("div");
    prev.className = "workprev";
    prev.setAttribute("aria-hidden", "true");
    prev.innerHTML = '<img class="workprev__img" alt="" /><span class="workprev__org"></span>';
    document.body.appendChild(prev);
    var img = prev.querySelector(".workprev__img");
    var org = prev.querySelector(".workprev__org");

    var tx = 0, ty = 0, x = 0, y = 0, running = false;
    function raf() {
      x += (tx - x) * 0.15; y += (ty - y) * 0.15;
      prev.style.transform = "translate(" + Math.round(x) + "px," + Math.round(y) + "px)";
      if (running) requestAnimationFrame(raf);
    }
    roles.forEach(function (role) {
      role.addEventListener("mouseenter", function () {
        var src = role.querySelector(".logo-tile__img");
        var name = role.querySelector(".role__org");
        if (src) img.src = src.getAttribute("src");
        org.textContent = name ? name.textContent : "";
        prev.classList.add("is-on");
        if (!running) { running = true; requestAnimationFrame(raf); }
      });
      role.addEventListener("mousemove", function (e) { tx = e.clientX; ty = e.clientY; });
      role.addEventListener("mouseleave", function () { prev.classList.remove("is-on"); running = false; });
    });
  }

  /* ---------- Terminal easter egg (press ~ or the footer trigger) ---------- */
  function initTerminal() {
    var term = document.createElement("div");
    term.className = "term";
    term.setAttribute("role", "dialog");
    term.setAttribute("aria-label", "Terminal");
    term.setAttribute("aria-hidden", "true");
    term.innerHTML =
      '<div class="term__win">' +
        '<div class="term__bar"><i></i><i></i><i></i><span class="term__title">myat@portfolio — zsh</span>' +
          '<button class="term__x" type="button" aria-label="Close terminal">✕</button></div>' +
        '<div class="term__body"><div class="term__out"></div>' +
          '<div class="term__line"><span class="term__prompt">➜ ~</span>' +
          '<input class="term__in" type="text" autocomplete="off" autocapitalize="off" spellcheck="false" aria-label="Terminal command" /></div></div>' +
      '</div>';
    document.body.appendChild(term);
    var out = term.querySelector(".term__out");
    var input = term.querySelector(".term__in");
    var open = false;

    var COMMANDS = {
      help: "commands: whoami · skills · work · certs · contact · sudo hire-me · clear · exit",
      whoami: "Myat Thu — IT Professional · Modern Workplace & Cloud · Melbourne, AU",
      skills: "Intune · Entra ID · Microsoft 365 · Azure · Active Directory · Defender · PowerShell · Autopilot",
      work: "IPH Limited (2025–now) · The Reject Shop (2023–25) · Azured Consulting (2022) · MYER (2019–24)",
      certs: "MD-102 · AZ-900 · SC-900 · Google  [SC-300 in progress]",
      contact: "myatgeorgethu@gmail.com — Melbourne, Australia"
    };

    function print(text, cls) {
      var row = document.createElement("div");
      row.className = "term__row" + (cls ? " " + cls : "");
      row.textContent = text;
      out.appendChild(row);
      out.scrollTop = out.scrollHeight;
    }
    function run(raw) {
      var cmd = raw.trim();
      print("➜ ~ " + cmd, "term__echo");
      if (!cmd) return;
      var lc = cmd.toLowerCase();
      if (lc === "clear") { out.innerHTML = ""; return; }
      if (lc === "exit" || lc === "close" || lc === "q") { setOpen(false); return; }
      if (lc === "sudo hire-me" || lc === "sudo hire me") {
        print("[sudo] password for recruiter: ********", "term__muted");
        print("✓ access granted — opening mail…", "term__ok");
        setTimeout(function () { window.location.href = "mailto:myatgeorgethu@gmail.com?subject=Let%27s%20work%20together"; }, 650);
        return;
      }
      if (COMMANDS.hasOwnProperty(lc)) { print(COMMANDS[lc]); return; }
      print("zsh: command not found: " + cmd + " — try 'help'", "term__err");
    }
    function setOpen(state) {
      open = state;
      term.classList.toggle("is-open", open);
      term.setAttribute("aria-hidden", String(!open));
      if (lenis) { open ? lenis.stop() : lenis.start(); }
      else { document.body.style.overflow = open ? "hidden" : ""; }
      if (open) {
        if (!out.childElementCount) print("Myat Thu // portfolio shell — type 'help'", "term__muted");
        setTimeout(function () { input.focus(); }, 50);
      }
    }

    input.addEventListener("keydown", function (e) { if (e.key === "Enter") { run(input.value); input.value = ""; } });
    term.querySelector(".term__x").addEventListener("click", function () { setOpen(false); });
    term.addEventListener("click", function (e) { if (e.target === term) setOpen(false); });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && open) { setOpen(false); return; }
      if ((e.key === "`" || e.key === "~") && e.target !== input) { e.preventDefault(); setOpen(!open); }
    });
    document.querySelectorAll(".foot").forEach(function (foot) {
      var b = document.createElement("button");
      b.className = "term-trigger";
      b.type = "button";
      b.textContent = "[~] console";
      b.addEventListener("click", function () { setOpen(true); });
      foot.appendChild(b);
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
    initCipher();
    initCounters();
    initMarquee();
    initCursor();
    initMagnetic();
    initTilt();
    initWorkPreview();
    initTerminal();

    runLoader(function () {
      revealSplitWords(document.querySelector(".hero"));
      var heroTitle = document.querySelector(".hero__title");
      if (heroTitle && !reduceMotion) {
        setTimeout(function () {
          heroTitle.classList.add("is-glitch");
          setTimeout(function () { heroTitle.classList.remove("is-glitch"); }, 650);
        }, 800);
      }
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
