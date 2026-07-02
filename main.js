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
    // Missing counter/bar would throw on the first frame and strand the scroll lock.
    if (!countEl || !barEl) { loader.style.display = "none"; unlockScroll(); done(); return; }
    // Arrived via a page transition — the wipe handles the reveal, skip the intro.
    if (document.documentElement.classList.contains("is-entering")) { loader.style.display = "none"; unlockScroll(); done(); return; }
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
    if (reduceMotion) { gsap.set("[data-reveal],[data-cap],[data-role],[data-rise]", { clearProps: "all" }); return; }
    gsap.utils.toArray("[data-reveal]").forEach(function (el) {
      gsap.to(el, { opacity: 1, y: 0, duration: 1, ease: "power3.out", scrollTrigger: { trigger: el, start: "top 88%" } });
    });
    ScrollTrigger.batch("[data-cap]", { start: "top 90%", onEnter: function (b) { gsap.to(b, { opacity: 1, y: 0, duration: 0.9, ease: "power3.out", stagger: 0.08 }); } });
    // Cards lie flat like a dossier on a table, then rise upright as they enter.
    ScrollTrigger.batch("[data-rise]", {
      start: "top 92%",
      onEnter: function (b) {
        gsap.fromTo(b,
          { opacity: 0, rotateX: 42, y: 52, transformOrigin: "50% 100%" },
          { opacity: 1, rotateX: 0, y: 0, duration: 1.05, ease: "power3.out", stagger: 0.09,
            onComplete: function () { b.forEach(function (el) { el.classList.add("is-risen"); }); gsap.set(b, { clearProps: "transform" }); } }
        );
      }
    });
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
    var tiles = gsap.utils.toArray(".toolbox__field .tool");
    if (!tiles.length) return;

    if (window.matchMedia("(max-width: 820px)").matches) {
      // Phones/small tablets: the tiles sit in a static grid — deal them onto
      // it from a deck above the section, one 3D flip each, in reading order.
      // Animate the inner card: the .tool wrapper's mobile transform is
      // !important-locked against desktop-scrub leftovers.
      var cards = tiles.map(function (t) { return t.querySelector(".tool__card") || t; });
      section.classList.add("is-undealt");
      ScrollTrigger.create({
        trigger: section, start: "top 78%", once: true,
        onEnter: function () {
          section.classList.remove("is-undealt");
          var fr = field.getBoundingClientRect();
          gsap.fromTo(cards, {
            x: function (i, el) { var r = el.getBoundingClientRect(); return fr.left + fr.width / 2 - (r.left + r.width / 2); },
            y: function (i, el) { return fr.top - 50 - el.getBoundingClientRect().top; },
            rotationY: -95, rotation: -8, scale: 0.85, opacity: 0, transformPerspective: 700
          }, {
            x: 0, y: 0, rotationY: 0, rotation: 0, scale: 1, opacity: 1,
            duration: 0.75, ease: "power3.out", stagger: 0.07,
            onComplete: function () { gsap.set(cards, { clearProps: "transform,opacity" }); }
          });
        }
      });
      return;
    }

    // Desktop: cascade into two switchback flights that flank the sticky
    // heading and descend into the page. Steps clear the card height, so
    // every tile lands fully visible; targets are anchored to the frame the
    // visitor sees at the end of the scrub.
    var L = Math.ceil(tiles.length / 2); // left flight size; right takes the rest
    function metrics() {
      var ch = 0;
      tiles.forEach(function (t) { ch = Math.max(ch, t.offsetHeight); });
      var cw = tiles[0].offsetWidth;
      var fw = field.clientWidth, vh = window.innerHeight;
      var headW = Math.min(fw * 0.42, 560); // column kept clear for the sticky heading
      var stepX = Math.max(8, Math.min(46, (fw / 2 - headW / 2 - cw - 8) / (L - 1)));
      var stepY = Math.min(ch + 18, (vh * 0.84 - ch) / (L - 0.5));
      var blockH = (L - 0.5) * stepY + ch;
      var topY = field.clientHeight - vh + Math.max(60, (vh - blockH) / 2);
      return { cw: cw, ch: ch, fw: fw, headW: headW, stepX: stepX, stepY: stepY, topY: topY };
    }
    var tl = gsap.timeline({
      scrollTrigger: { trigger: section, start: "top top", end: "bottom bottom", scrub: 0.6, invalidateOnRefresh: true }
    });
    tiles.forEach(function (tile, i) {
      var flight = i < L ? 0 : 1, k = flight ? i - L : i;
      var zk = -34 * k - (flight ? 17 : 0); // each step drops deeper into the page
      // perspective(p) divides the whole translate by w = 1 - z/p, so a card
      // at depth would land short of its slot — pre-scale the travel by w to
      // make the projected position exact (that's what keeps steps overlap-free).
      var wf = 1 - zk / 1200;
      tl.to(tile, {
        x: function () {
          var m = metrics();
          var cx = flight
            ? m.fw / 2 + m.headW / 2 + m.cw / 2 + k * m.stepX
            : m.fw / 2 - m.headW / 2 - m.cw / 2 - k * m.stepX;
          return (cx - (tile.offsetLeft + tile.offsetWidth / 2)) * wf;
        },
        y: function () {
          var m = metrics();
          var cy = m.topY + (k + flight * 0.5) * m.stepY + m.ch / 2;
          return (cy - (tile.offsetTop + tile.offsetHeight / 2)) * wf;
        },
        z: zk,
        rotationY: flight ? 7 : -7, // treads angle in toward the heading
        rotationX: 4,
        transformPerspective: 1200,
        ease: "none"
      }, 0);
      // The mess tidies itself: each card's scattered tilt (--r) straightens
      // as it lands, so the steps sit flush and never clip a neighbour.
      var card = tile.querySelector(".tool__card");
      if (card) tl.to(card, { rotation: 0, ease: "none" }, 0);
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
    var x = window.innerWidth / 2, y = window.innerHeight / 2, cx = x, cy = y;
    window.addEventListener("mousemove", function (e) { x = e.clientX; y = e.clientY; });
    (function render() {
      cx += (x - cx) * 0.18; cy += (y - cy) * 0.18;
      cursor.style.transform = "translate(" + cx + "px," + cy + "px) translate(-50%,-50%)";
      requestAnimationFrame(render);
    })();
    document.querySelectorAll("a, button, [data-cursor], [data-magnetic]").forEach(function (el) {
      el.addEventListener("mouseenter", function () {
        var text = el.getAttribute("data-cursor");
        if (text) { cursor.classList.add("is-label"); if (label) label.textContent = text; }
        else { cursor.classList.add("is-hover"); }
      });
      el.addEventListener("mouseleave", function () {
        cursor.classList.remove("is-hover", "is-label");
        if (label) label.textContent = "";
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
      if (state) {
        showReal();
        // Let the 3D scene answer the decrypt (scene3d.js listens).
        window.dispatchEvent(new CustomEvent("mt:decrypt"));
      }
    }
    function revealPhoto(state) { if (portrait) portrait.classList.toggle("is-revealed", state); }

    // Desktop reveals on hover; touch toggles on tap.
    if (fine) {
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
    if (reduceMotion || !fine) return;
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

  /* ---------- Theme switcher (rotates Bone → Cyber → Acid) ---------- */
  function initThemes() {
    var THEMES = ["bone", "colorblind", "cyber", "acid"];
    var META = {
      bone:       { label: "Bone",         desc: "Warm editorial",           sw: "#b8492c" },
      colorblind: { label: "Colour-blind", desc: "High-contrast, safe palette", sw: "linear-gradient(90deg, #0067b0 0 50%, #b26a00 50% 100%)" },
      cyber:      { label: "Cyber",        desc: "Neon on matte black",       sw: "#16e0ff" },
      acid:       { label: "Acid",         desc: "Acid green",                sw: "#39ff14" }
    };
    var html = document.documentElement;

    var picker = document.createElement("div");
    picker.className = "theme-picker";

    var panel = document.createElement("div");
    panel.className = "theme-picker__panel";
    panel.setAttribute("role", "menu");
    panel.setAttribute("aria-label", "Select colour theme");

    var opts = {};
    THEMES.forEach(function (t) {
      var m = META[t];
      var b = document.createElement("button");
      b.className = "theme-opt";
      b.type = "button";
      b.setAttribute("role", "menuitemradio");
      b.setAttribute("data-theme", t);
      b.title = m.label + " — " + m.desc;
      b.innerHTML =
        '<span class="theme-opt__sw" aria-hidden="true"></span>' +
        '<span class="theme-opt__text"><span class="theme-opt__name"></span>' +
        '<span class="theme-opt__desc"></span></span>';
      b.querySelector(".theme-opt__sw").style.background = m.sw;
      b.querySelector(".theme-opt__name").textContent = m.label;
      b.querySelector(".theme-opt__desc").textContent = m.desc;
      b.addEventListener("click", function () { apply(t); close(); toggle.focus(); });
      panel.appendChild(b);
      opts[t] = b;
    });

    var toggle = document.createElement("button");
    toggle.className = "theme-picker__toggle";
    toggle.type = "button";
    toggle.setAttribute("aria-haspopup", "true");
    toggle.setAttribute("aria-expanded", "false");
    toggle.setAttribute("aria-label", "Colour theme");
    toggle.innerHTML =
      '<span class="theme-fab__dot" aria-hidden="true"></span>' +
      '<span class="theme-picker__current"></span>' +
      '<span class="theme-picker__chev" aria-hidden="true">▴</span>';
    var currentEl = toggle.querySelector(".theme-picker__current");

    picker.appendChild(panel);
    picker.appendChild(toggle);
    document.body.appendChild(picker);

    function apply(theme) {
      if (THEMES.indexOf(theme) < 0) theme = "bone";
      html.dataset.theme = theme;
      currentEl.textContent = META[theme].label;
      THEMES.forEach(function (t) {
        var on = t === theme;
        opts[t].setAttribute("aria-checked", on ? "true" : "false");
        opts[t].classList.toggle("is-active", on);
      });
      try { localStorage.setItem("theme", theme); } catch (e) {}
    }
    function open() { picker.classList.add("is-open"); toggle.setAttribute("aria-expanded", "true"); }
    function close() { picker.classList.remove("is-open"); toggle.setAttribute("aria-expanded", "false"); }

    toggle.addEventListener("click", function () {
      picker.classList.contains("is-open") ? close() : open();
    });
    document.addEventListener("click", function (e) { if (!picker.contains(e.target)) close(); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape" && picker.classList.contains("is-open")) { close(); toggle.focus(); } });

    apply(html.dataset.theme || "bone");
  }

  /* ---------- Case files: dossier tilt + glare toward the pointer ---------- */
  function initCaseTilt() {
    if (!hasGSAP || reduceMotion || !fine) return;
    document.querySelectorAll(".case").forEach(function (el) {
      var rx = gsap.quickTo(el, "rotationX", { duration: 0.45, ease: "power2.out" });
      var ry = gsap.quickTo(el, "rotationY", { duration: 0.45, ease: "power2.out" });
      var ty = gsap.quickTo(el, "y", { duration: 0.45, ease: "power2.out" });
      var rect = null;
      el.addEventListener("mouseenter", function () {
        if (!el.classList.contains("is-risen")) return; // entrance owns the transform
        rect = el.getBoundingClientRect(); // measured once — the tilt itself would skew live reads
        gsap.set(el, { transformPerspective: 700 });
      });
      el.addEventListener("mousemove", function (e) {
        if (!rect) return;
        var dx = (e.clientX - rect.left) / rect.width - 0.5;
        var dy = (e.clientY - rect.top) / rect.height - 0.5;
        rx(dy * -6); ry(dx * 6); ty(-4);
        el.style.setProperty("--gx", ((dx + 0.5) * 100).toFixed(1) + "%");
        el.style.setProperty("--gy", ((dy + 0.5) * 100).toFixed(1) + "%");
      });
      el.addEventListener("mouseleave", function () { rect = null; rx(0); ry(0); ty(0); });
    });
  }

  /* ---------- Case file modal (card floats up + expands) ---------- */
  function initCaseModal() {
    var cards = document.querySelectorAll("[data-case]");
    if (!cards.length) return;

    var modal = document.createElement("div");
    modal.className = "cmodal";
    modal.setAttribute("role", "dialog");
    modal.setAttribute("aria-modal", "true");
    modal.setAttribute("aria-hidden", "true");
    modal.innerHTML =
      '<div class="cmodal__bg"></div>' +
      '<div class="cmodal__card">' +
        '<button class="cmodal__x" type="button" aria-label="Close case file">✕</button>' +
        '<div class="cmodal__head"><span class="cmodal__no"></span><span class="cmodal__tag"></span></div>' +
        '<h3 class="cmodal__title"></h3><div class="cmodal__content"></div>' +
      '</div>';
    document.body.appendChild(modal);
    var bg = modal.querySelector(".cmodal__bg");
    var card = modal.querySelector(".cmodal__card");
    var noEl = modal.querySelector(".cmodal__no");
    var tagEl = modal.querySelector(".cmodal__tag");
    var titleEl = modal.querySelector(".cmodal__title");
    var contentEl = modal.querySelector(".cmodal__content");
    var closeBtn = modal.querySelector(".cmodal__x");
    var fadeBits = [noEl, tagEl, titleEl];

    var source = null, first = null, busy = false;

    function fill(el) {
      // Works for case files (.case__*) and credentials (.cert__*) alike.
      var no = el.querySelector(".case__no, .cert__code");
      var tag = el.querySelector(".case__tag, .cert__by");
      var data = el.querySelector(".case__data, .cert__data");
      noEl.textContent = no ? no.textContent : "";
      tagEl.textContent = tag ? tag.textContent : "";
      titleEl.textContent = el.getAttribute("data-title") || "";
      contentEl.innerHTML = data ? data.innerHTML : "";
    }
    function lock(on) { if (lenis) { on ? lenis.stop() : lenis.start(); } else { document.body.style.overflow = on ? "hidden" : ""; } }

    function open(el) {
      if (busy) return;
      source = el;
      fill(el);
      modal.classList.add("is-open");
      modal.setAttribute("aria-hidden", "false");
      lock(true);
      card.scrollTop = 0;
      window.dispatchEvent(new CustomEvent("mt:hush", { detail: { on: true } }));
      if (!hasGSAP || reduceMotion) { bg.style.opacity = 1; closeBtn.focus(); return; }

      // The dossier tilt may hold a transform on the card — clear it before
      // measuring, or the FLIP start/end rects are skewed.
      gsap.set(el, { clearProps: "transform" });
      first = el.getBoundingClientRect();
      var last = card.getBoundingClientRect();
      busy = true;
      gsap.set(card, { transformOrigin: "0% 0%", x: first.left - last.left, y: first.top - last.top, scaleX: first.width / last.width, scaleY: first.height / last.height });
      gsap.set(bg, { opacity: 0 });
      gsap.set(contentEl, { opacity: 0 });
      gsap.set(fadeBits, { opacity: 0 });
      gsap.to(bg, { opacity: 1, duration: 0.35, ease: "power2.out" });
      gsap.to(card, { x: 0, y: 0, scaleX: 1, scaleY: 1, duration: 0.6, ease: "expo.out", onComplete: function () { busy = false; } });
      gsap.to(fadeBits, { opacity: 1, duration: 0.3, delay: 0.18 });
      gsap.to(contentEl, { opacity: 1, duration: 0.4, delay: 0.26 });
      closeBtn.focus();
    }

    function finish() {
      modal.classList.remove("is-open");
      modal.setAttribute("aria-hidden", "true");
      lock(false);
      window.dispatchEvent(new CustomEvent("mt:hush", { detail: { on: false } }));
      var s = source; source = null;
      if (s) s.focus();
    }
    function close() {
      if (busy || !source) { if (!source) finish(); return; }
      if (!hasGSAP || reduceMotion || !first) { finish(); return; }
      var last = card.getBoundingClientRect();
      busy = true;
      gsap.to([contentEl].concat(fadeBits), { opacity: 0, duration: 0.2 });
      gsap.to(bg, { opacity: 0, duration: 0.45, delay: 0.05 });
      gsap.to(card, {
        x: first.left - last.left, y: first.top - last.top,
        scaleX: first.width / last.width, scaleY: first.height / last.height,
        duration: 0.5, ease: "expo.inOut",
        onComplete: function () { busy = false; gsap.set(card, { clearProps: "transform" }); finish(); }
      });
    }

    cards.forEach(function (el) {
      el.addEventListener("click", function () { open(el); });
      el.addEventListener("keydown", function (e) { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); open(el); } });
    });
    bg.addEventListener("click", close);
    closeBtn.addEventListener("click", close);
    document.addEventListener("keydown", function (e) { if (e.key === "Escape" && modal.classList.contains("is-open")) close(); });
  }

  /* ---------- Matrix rain (active only on dark themes) ---------- */
  function initMatrix() {
    if (reduceMotion) return;
    var canvas = document.querySelector(".matrix");
    if (!canvas || !canvas.getContext) return;
    var ctx = canvas.getContext("2d");
    var html = document.documentElement;
    var GLYPHS = "0123456789ABCDEFｱｶｻﾀﾅﾊﾏﾝ".split("");
    var fontSize = 16, cols = 0, drops = [], w = 0, h = 0, raf = null, col = { glyph: "#16e0ff", bg: "#0b0b0d" };

    function readColors() {
      var cs = getComputedStyle(html);
      col.glyph = cs.getPropertyValue("--accent").trim() || "#16e0ff";
      col.bg = cs.getPropertyValue("--bone").trim() || "#0b0b0d";
    }
    function resize() {
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
      cols = Math.floor(w / fontSize);
      drops = [];
      for (var i = 0; i < cols; i++) drops[i] = Math.random() * -50;
    }
    function draw() {
      ctx.globalAlpha = 0.09; ctx.fillStyle = col.bg; ctx.fillRect(0, 0, w, h);
      ctx.globalAlpha = 1; ctx.fillStyle = col.glyph; ctx.font = fontSize + "px ui-monospace, monospace";
      for (var i = 0; i < drops.length; i++) {
        ctx.fillText(GLYPHS[Math.floor(Math.random() * GLYPHS.length)], i * fontSize, drops[i] * fontSize);
        if (drops[i] * fontSize > h && Math.random() > 0.975) drops[i] = 0;
        drops[i]++;
      }
      raf = requestAnimationFrame(draw);
    }
    function update() {
      var t = html.dataset.theme;
      var on = (t === "cyber" || t === "acid") && !document.hidden;
      if (on && !raf) { readColors(); resize(); canvas.style.display = "block"; draw(); }
      else if (!on && raf) { cancelAnimationFrame(raf); raf = null; canvas.style.display = "none"; }
      else if (on) { readColors(); }
    }
    new MutationObserver(update).observe(html, { attributes: true, attributeFilter: ["data-theme"] });
    window.addEventListener("resize", function () { if (raf) resize(); });
    document.addEventListener("visibilitychange", update);
    update();
  }

  /* ---------- Page transition wipe ---------- */
  function initTransitions() {
    var wipe = document.querySelector(".wipe");
    if (!wipe) return;
    var html = document.documentElement;

    // Arrived via a transition — uncover once the covered state has painted.
    if (html.classList.contains("is-entering")) {
      requestAnimationFrame(function () {
        requestAnimationFrame(function () { html.classList.remove("is-entering"); });
      });
    }
    try { sessionStorage.removeItem("wipe"); } catch (e) {}

    // Clear the cover if the page is restored from the back/forward cache.
    window.addEventListener("pageshow", function (e) {
      if (e.persisted) { wipe.classList.remove("is-cover"); html.classList.remove("is-entering"); }
    });

    if (reduceMotion) return; // navigate normally, no cover animation

    document.addEventListener("click", function (e) {
      if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      var a = e.target.closest ? e.target.closest("a[href]") : null;
      if (!a || a.target === "_blank" || a.hasAttribute("download")) return;
      var url;
      try { url = new URL(a.getAttribute("href"), location.href); } catch (_) { return; }
      if (url.origin !== location.origin || url.pathname === location.pathname) return;
      if (!/\.html?$/.test(url.pathname)) return; // only page-to-page navigation
      e.preventDefault();
      try { sessionStorage.setItem("wipe", "1"); } catch (e2) {}
      wipe.classList.add("is-cover");
      setTimeout(function () { location.href = url.href; }, 520);
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
    initThemes();
    initMatrix();
    initCaseModal();
    initCaseTilt();
    initTransitions();

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
