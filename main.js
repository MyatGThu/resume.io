/* ==========================================================================
   MYAT THU · GOING UNDER
   Scrolling is going under. The page descends four dream levels, and time
   dilates as it falls: the light field slows level by level, the matte
   clock runs faster in dream time, backwards in the inversion, and stops in
   limbo. Level cards are IMAX shots: the bars leave the frame.
   ========================================================================== */

(function () {
  "use strict";

  var root = document.documentElement;
  var calm = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var hasGSAP = typeof window.gsap !== "undefined" && typeof window.ScrollTrigger !== "undefined";
  var lenis = null;
  var BUILD = ((document.currentScript || {}).src || "").split("v=")[1] || "";

  if (hasGSAP) gsap.registerPlugin(ScrollTrigger);

  /* hold on the frame, travel between: a cubic in-out */
  function hold(t) { return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; }

  /* ------------------------------------------------------------ the clock */
  var film = {
    level: 0,          // which world the field shows: 0 reality, 1 city, 2 hotel, 3 inversion, 4 limbo
    scale: 1,          // how fast time runs in the field
    dir: 1,            // -1 in the inversion
    turn: 0,           // the hotel corridor's roll, 0 to 1
    dawn: 1,           // 0 to 1 as the cold open lifts the lamp on the top
    cut: 0,            // 1 when the end cuts to black
    vel: 0,
    shock: { x: 0, y: 0, age: 99 },
    strike: function (el) {
      if (!el) return;
      var r = el.getBoundingClientRect(), h = window.innerHeight || 1;
      film.shock.x = (r.left + r.width / 2) / h;
      film.shock.y = 1 - (r.top + r.height / 2) / h;
      film.shock.age = 0;
    }
  };
  var PACE = [1, 0.5, 0.25, 1, 0.08];   // time in the field, per level

  /* ------------------------------------------------- the field (one shader) */
  var FRAG = [
    "precision highp float;",
    "uniform vec2 uRes; uniform float uTime, uLevel, uDir, uTurn; uniform vec3 uShock;",
    "float h(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }",
    "float n(vec2 p){ vec2 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f);",
    "  return mix(mix(h(i), h(i + vec2(1.0, 0.0)), f.x), mix(h(i + vec2(0.0, 1.0)), h(i + vec2(1.0, 1.0)), f.x), f.y); }",
    "float fbm(vec2 p){ float v = 0.0, a = 0.5; for (int i = 0; i < 4; i++) { v += a * n(p); p *= 2.03; a *= 0.5; } return v; }",
    "float w(float i){ return clamp(1.0 - abs(uLevel - i), 0.0, 1.0); }",
    "float motes(vec2 p, float drift, float size, float keep){",
    "  p.y -= uTime * drift * uDir; p.x += sin(uTime * 0.21 + p.y * 0.6) * 0.25;",
    "  vec2 i = floor(p), f = fract(p); vec2 c = vec2(h(i + 3.1), h(i + 7.7)) * 0.8 + 0.1;",
    "  return smoothstep(size, 0.0, length(f - c)) * step(keep, h(i)); }",
    "void main(){",
    "  vec2 uv = gl_FragCoord.xy / uRes; float asp = uRes.x / uRes.y;",
    "  vec2 q = vec2((uv.x - 0.5) * asp, uv.y - 0.5);",
    "  vec3 col = vec3(0.046, 0.045, 0.044);",
    "  vec3 amber = vec3(1.0, 0.64, 0.23), white = vec3(0.93, 0.92, 0.9);",
    /* reality: one lamp over the table, dust in its cone */
    "  if (w(0.0) > 0.0) {",
    "    float cone = smoothstep(0.62, 0.0, abs(q.x) / (0.25 + (0.5 - q.y) * 0.85)) * smoothstep(-0.55, 0.45, q.y);",
    "    vec3 c = amber * exp(-length((q - vec2(0.0, 0.62)) * vec2(1.5, 1.0)) * 2.3) * 0.3 + amber * cone * 0.05;",
    "    c += white * motes(uv * vec2(asp, 1.0) * 30.0, 0.35, 0.07, 0.8) * cone * 0.45;",
    "    col += c * w(0.0);",
    "  }",
    /* the city: out-of-focus street light below, haze above */
    "  if (w(1.0) > 0.0) {",
    "    vec2 p = uv * vec2(asp, 1.0);",
    "    float low = smoothstep(0.8, 0.15, uv.y);",
    "    vec3 c = mix(white, amber, 0.75) * (motes(p * 7.0 + 1.3, 0.02, 0.28, 0.82) * 0.16 + motes(p * 13.0 + 8.1, 0.03, 0.2, 0.78) * 0.12) * low;",
    "    c += vec3(0.05) * fbm(p * 2.0 + uTime * 0.02) * smoothstep(0.2, 0.9, uv.y);",
    "    col += c * w(1.0);",
    "  }",
    /* the hotel: sconces receding down a corridor that rolls as gravity turns */
    "  if (w(2.0) > 0.0) {",
    "    float a = uTurn * 1.5708; vec2 r = mat2(cos(a), -sin(a), sin(a), cos(a)) * q;",
    "    vec3 c = vec3(0.0);",
    "    for (int k = 0; k < 9; k++) {",
    "      float d = fract(float(k) / 9.0 + uTime * 0.04 * uDir); float z = 0.12 + d * 3.0;",
    "      vec2 L = vec2(1.15 / z, 0.08 / z), R = vec2(-1.15 / z, 0.08 / z);",
    "      float g = exp(-length(r - L) * 22.0 * z) + exp(-length(r - R) * 22.0 * z);",
    "      c += amber * g * smoothstep(0.0, 0.2, d) * smoothstep(1.0, 0.6, d) * 0.3;",
    "    }",
    "    c += amber * exp(-length(r) * 9.0) * 0.12;",
    "    col += c * w(2.0);",
    "  }",
    /* the inversion: concrete, and dust falling the wrong way */
    "  if (w(3.0) > 0.0) {",
    "    vec2 p = uv * vec2(asp, 1.0);",
    "    vec3 c = vec3(0.06) * fbm(p * 3.0) + white * motes(p * 24.0, 0.3, 0.08, 0.78) * 0.35;",
    "    col += c * w(3.0);",
    "  }",
    /* limbo: a grey swell under a low sky, towers crumbling on the horizon, one fire on the shore */
    "  if (w(4.0) > 0.0) {",
    "    float hz = 0.46, x = uv.x * asp; vec3 c = vec3(0.0);",
    "    vec2 fire = vec2(-0.42 * asp, -0.07);",
    "    if (uv.y >= hz) {",
    "      c += vec3(0.075) * fbm(vec2(x * 1.4 + uTime * 0.01, uv.y * 3.0)) * smoothstep(1.0, hz, uv.y) + vec3(0.024);",
    "      float cell = floor(x * 13.0), fx = fract(x * 13.0);",
    "      float tall = 0.05 + pow(h(vec2(cell, 3.0)), 2.0) * 0.26, broken = step(0.45, h(vec2(cell, 1.0)));",
    "      float roof = tall * (1.0 - broken * 0.6 * smoothstep(0.2, 1.0, fx)) + (h(vec2(floor(x * 140.0), cell)) - 0.5) * 0.03 * broken;",
    "      float tower = step(0.3, fx) * step(fx, 0.68) * step(uv.y - hz, roof) * step(0.42, h(vec2(cell, 5.0)));",
    "      float haze = 1.0 - smoothstep(0.0, 0.3, uv.y - hz) * 0.5;",
    "      c = mix(c, vec3(0.012 + 0.018 * (1.0 - haze)), tower);",
    "    } else {",
    "      float dep = 1.0 / (hz - uv.y + 0.035);",
    "      float swell = fbm(vec2(x * 0.18 * dep + uTime * 0.04, dep * 0.32 - uTime * 0.22));",
    "      float crest = smoothstep(0.58, 0.7, swell) * (1.0 - smoothstep(0.7, 0.8, swell));",
    "      c += vec3(0.02) + vec3(0.13) * swell * smoothstep(0.0, hz, uv.y) + vec3(0.2) * crest * smoothstep(0.02, hz, uv.y);",
    "      float lane = exp(-abs(q.x - fire.x) * (6.0 + dep * 0.6)) * smoothstep(fire.y + 0.02, fire.y - 0.4, q.y);",
    "      c += amber * lane * (crest * 1.2 + smoothstep(0.5, 0.75, swell) * 0.4);",
    "    }",
    "    c += amber * exp(-length((q - fire) * vec2(1.0, 1.6)) * 26.0) * 0.6;",
    "    c += vec3(0.1) * exp(-abs(uv.y - hz) * 120.0);",
    "    col += c * w(4.0);",
    "  }",
    /* a beat lands: one ring through the frame */
    "  vec2 s = vec2((uShock.x - 0.5 * asp), uShock.y - 0.5);",
    "  float ring = exp(-pow((length(q - s) - uShock.z * 1.1) * 16.0, 2.0)) * exp(-uShock.z * 2.4);",
    "  col += white * ring * 0.08;",
    "  col *= mix(0.55, 1.0, smoothstep(1.25, 0.25, length(q * vec2(0.85, 1.0))));",
    "  gl_FragColor = vec4(col, 1.0);",
    "}"
  ].join("\n");

  var VERT = "attribute vec2 p; void main(){ gl_Position = vec4(p, 0.0, 1.0); }";

  function initAtmos() {
    var canvas = document.getElementById("atmos");
    if (!canvas) return;
    var gl = null;
    try { gl = canvas.getContext("webgl", { antialias: false, alpha: false, powerPreference: "high-performance" }); } catch (e) {}
    if (!gl) return;

    function compile(type, src) {
      var s = gl.createShader(type);
      gl.shaderSource(s, src); gl.compileShader(s);
      return gl.getShaderParameter(s, gl.COMPILE_STATUS) ? s : null;
    }
    var vs = compile(gl.VERTEX_SHADER, VERT), fs = compile(gl.FRAGMENT_SHADER, FRAG);
    if (!vs || !fs) return;
    var prog = gl.createProgram();
    gl.attachShader(prog, vs); gl.attachShader(prog, fs); gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return;
    gl.useProgram(prog);
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    var loc = gl.getAttribLocation(prog, "p");
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    var u = {};
    ["uRes", "uTime", "uLevel", "uDir", "uTurn", "uShock"].forEach(function (k) { u[k] = gl.getUniformLocation(prog, k); });

    var quality = window.innerWidth < 760 ? 0.5 : 0.6;
    function size() {
      var dpr = Math.min(window.devicePixelRatio || 1, 2);
      var w = Math.max(1, Math.round(window.innerWidth * dpr * quality)), h = Math.max(1, Math.round(window.innerHeight * dpr * quality));
      if (canvas.width !== w || canvas.height !== h) { canvas.width = w; canvas.height = h; gl.viewport(0, 0, w, h); }
    }
    size();
    window.addEventListener("resize", size);

    var t = 20, last = performance.now(), raf = 0, level = film.level, dir = 1;
    function draw(now) {
      var dt = Math.min((now - last) / 1000, 0.05); last = now;
      level += (film.level - level) * (1 - Math.exp(-dt * 2.2));
      dir += (film.dir - dir) * (1 - Math.exp(-dt * 3));
      var pace = PACE[Math.round(level)] * (1 + Math.min(Math.abs(film.vel) * 0.04, 1.5));
      film.scale += (pace - film.scale) * (1 - Math.exp(-dt * 3));
      t += dt * film.scale;
      film.shock.age += dt;
      film.vel *= Math.exp(-dt * 3);
      gl.uniform2f(u.uRes, canvas.width, canvas.height);
      gl.uniform1f(u.uTime, t);
      gl.uniform1f(u.uLevel, level);
      gl.uniform1f(u.uDir, dir);
      gl.uniform1f(u.uTurn, film.turn);
      gl.uniform3f(u.uShock, film.shock.x, film.shock.y, film.shock.age);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    }
    function loop(now) { draw(now); raf = requestAnimationFrame(loop); }
    function start() { if (!raf && !calm) { last = performance.now(); raf = requestAnimationFrame(loop); } }
    document.addEventListener("visibilitychange", function () { if (document.hidden) { cancelAnimationFrame(raf); raf = 0; } else start(); });
    canvas.addEventListener("webglcontextlost", function (e) { e.preventDefault(); cancelAnimationFrame(raf); raf = 0; canvas.classList.remove("is-live"); });

    if (calm) draw(performance.now()); else start();
    requestAnimationFrame(function () { canvas.classList.add("is-live"); });
  }

  /* -------------------------------------------------------- smooth scroll */
  function initLenis() {
    if (calm || typeof window.Lenis === "undefined") return;
    lenis = new Lenis({ duration: 1.1, smoothWheel: true });
    lenis.on("scroll", function (e) {
      film.vel = e.velocity || 0;
      if (hasGSAP) ScrollTrigger.update();
    });
    if (hasGSAP) {
      gsap.ticker.add(function (time) { lenis.raf(time * 1000); });
      gsap.ticker.lagSmoothing(0);
    } else {
      (function raf(time) { lenis.raf(time); requestAnimationFrame(raf); })(0);
    }
  }

  function goTo(target) {
    var el = typeof target === "string" ? document.querySelector(target) : target;
    if (!el) return;
    if (lenis) lenis.scrollTo(el, { offset: 0, duration: 1.6 });
    else el.scrollIntoView({ behavior: calm ? "auto" : "smooth" });
  }

  /* ---------------------------------------------- the levels, by position */
  var LEVELS = { "Reality": 0, "Going under": 0, "The City": 1, "The Hotel": 2, "The Inversion": 3, "Limbo": 4 };
  function currentSection() {
    var secs = document.querySelectorAll("[data-level]"), at = secs[0];
    for (var i = 0; i < secs.length; i++) if (secs[i].getBoundingClientRect().top <= window.innerHeight * 0.5) at = secs[i];
    return at;
  }

  /* the weight of a beat landing: a jolt and a ring, never a flash */
  function braam(el, frame) {
    film.strike(el);
    var a = window.innerWidth < 760 ? 4 : 7;
    gsap.timeline()
      .to(frame, { y: a, duration: 0.05, ease: "power1.out" })
      .to(frame, { y: -a * 0.5, duration: 0.07 })
      .to(frame, { y: 0, duration: 0.3, ease: "power3.out" });
  }

  /* ---------------------------------------------------------- cold open */
  function coldOpen(done) {
    var open = document.getElementById("open");
    var letters = document.querySelectorAll(".title__word b");
    var after = document.querySelectorAll(".title__log, .title__acts, .title__cue");
    var ident = document.querySelector(".open__ident"), tick = document.getElementById("openTick");
    var skip = document.getElementById("openSkip");

    function finish() {
      root.classList.remove("is-opening");
      try { sessionStorage.setItem("seen", "1"); } catch (e) {}
      if (lenis) lenis.start();
      done();
    }
    if (!root.classList.contains("is-opening") || !hasGSAP || !open) { finish(); return; }
    if (lenis) lenis.stop();
    window.scrollTo(0, 0);
    skip.tabIndex = 0;
    film.dawn = 0;
    gsap.set(letters, { rotationX: -90, opacity: 0 });
    gsap.set(after, { opacity: 0 });

    var count = { s: 5 };
    var tl = gsap.timeline({ onComplete: finish });
    tl.to(ident, { opacity: 1, letterSpacing: "0.62em", duration: 2.4, ease: "none" }, 0.1)
      .to(tick, { opacity: 1, duration: 0.3 }, 0.4)
      .to(count, { s: 0, duration: 2.0, ease: "steps(5)", onUpdate: function () { tick.textContent = "00:00:0" + Math.round(count.s); } }, 0.4)
      /* the cut: no fade, the black is simply gone */
      .add(function () { open.style.display = "none"; }, 2.6)
      .to(film, { dawn: 1, duration: 2.2, ease: "power2.out" }, 2.6)
      /* the name folds up off the floor, the way a street does in a dream */
      .to(letters, { rotationX: 0, opacity: 1, duration: 1.1, ease: "power3.out", stagger: { each: 0.06, from: "center" } }, 2.75)
      .add(function () { braam(document.querySelector(".title__word"), document.querySelector(".title")); }, 3.6)
      .to(after, { opacity: 1, duration: 0.6, ease: "power1.out", stagger: 0.08 }, 3.8);

    skip.addEventListener("click", function () { tl.progress(1); });
    document.addEventListener("keydown", function esc(e) {
      if (e.key === "Escape" && root.classList.contains("is-opening")) { tl.progress(1); document.removeEventListener("keydown", esc); }
    });
  }

  /* ---------------------- level cards: IMAX shots between the 35mm bars */
  function imax(self) { root.classList.toggle("is-imax", self.isActive); }

  function initCards() {
    document.querySelectorAll(".card").forEach(function (card) {
      var t = card.querySelector(".card__t"), d = card.querySelector(".card__d"), plate = card.querySelector(".card__plate");
      var tl = gsap.timeline({ paused: true });
      tl.fromTo(t, { opacity: 0, letterSpacing: "0.5em" }, { opacity: 1, letterSpacing: "0.16em", duration: 0.4, ease: "power2.out" }, 0)
        .fromTo(d, { opacity: 0 }, { opacity: 1, duration: 0.08, ease: "none" }, 0.08);
      if (plate) tl.fromTo(plate, { scale: 1.16 }, { scale: 1, duration: 1, ease: "none" }, 0);
      var struck = false;
      ScrollTrigger.create({
        trigger: card, start: "top top", end: "+=120%", pin: true, pinSpacing: true,
        onToggle: imax,
        onUpdate: function (self) {
          var p = self.progress;
          tl.progress(Math.min(1, p / 0.8));
          /* the hard cut out: the frame does not fade, it ends */
          gsap.set([t, d], { visibility: p > 0.9 ? "hidden" : "visible" });
          if (!struck && p > 0.18 && self.direction > 0) { struck = true; braam(t, card); }
          if (p < 0.05) struck = false;
        }
      });
    });
  }

  /* ---------------------------------------------------- going under */
  function initBeats() {
    var sec = document.getElementById("beats");
    if (!sec) return;
    var beats = sec.querySelectorAll(".beat"), n = beats.length;
    sec.classList.add("is-filmed");
    var tl = gsap.timeline({ paused: true });
    beats.forEach(function (b, i) {
      tl.fromTo(b, { opacity: 0, letterSpacing: "0.22em" }, { opacity: 1, letterSpacing: "0.02em", duration: 0.35, ease: "power2.out" }, i)
        .set(b, { opacity: 0 }, i + 0.92);
    });
    var struck = -1;
    ScrollTrigger.create({
      id: "beats", trigger: sec, start: "top top", end: "+=" + (n * 85) + "%", pin: sec.querySelector(".beats__stage"), pinSpacing: true,
      onUpdate: function (self) {
        var x = Math.min(self.progress * n, n - 0.0001), seg = Math.floor(x);
        tl.progress(x / n);
        if (x - seg > 0.2 && seg !== struck && self.direction > 0) { struck = seg; braam(beats[seg], sec.querySelector(".beats__stage")); }
        if (self.progress < 0.02) struck = -1;
      }
    });
  }

  /* --------------------------------------- the city: lights come on, floor by floor */
  function initRecord() {
    document.querySelectorAll(".role").forEach(function (role) {
      gsap.set(role, { opacity: 0.12 });
      ScrollTrigger.create({
        trigger: role, start: "top 78%", once: true,
        onEnter: function () {
          gsap.timeline().to(role, { opacity: 0.7, duration: 0.06 }).to(role, { opacity: 0.25, duration: 0.08 })
            .to(role, { opacity: 1, duration: 0.18 }).set(role, { clearProps: "opacity" });
        }
      });
    });
    var cast = document.querySelector(".cast__frame img");
    if (cast) gsap.fromTo(cast, { scale: 1.18 }, { scale: 1, ease: "none", scrollTrigger: { trigger: ".cast", start: "top bottom", end: "bottom top", scrub: true } });
  }

  /* --------------------------------------- the hotel: gravity turns */
  function initHotel() {
    var hotel = document.getElementById("hotel");
    if (!hotel) return;
    ScrollTrigger.create({ trigger: hotel, start: "top bottom", end: "bottom top", onUpdate: function (self) { film.turn = Math.sin(self.progress * Math.PI); } });
    document.querySelectorAll(".scene").forEach(function (scene, i) {
      /* the whole room rolls level, as the corridor does; the shot rolls further and lands true */
      var frame = scene.querySelector(".shot__frame"), side = i % 2 ? -1 : 1, wide = window.innerWidth >= 760;
      var roll = { trigger: scene, start: "top 100%", end: "top 55%", scrub: true };
      gsap.fromTo(scene, { rotation: side * 14, transformOrigin: "50% 0%" }, { rotation: 0, ease: hold, scrollTrigger: roll });
      if (wide) gsap.fromTo(frame, { rotation: side * 76, scale: 0.62 }, { rotation: 0, scale: 1, ease: hold, scrollTrigger: roll });
    });
  }

  /* --------------------------------------- the inversion: entropy runs backwards */
  function initInversion() {
    var inv = document.getElementById("inversion");
    if (!inv) return;
    inv.querySelectorAll(".room").forEach(function (room) {
      var parts = room.querySelectorAll(".room__h, .room__lede, .sheet__bill > *, .notes > div, .forge");
      gsap.from(parts, {
        y: -36, opacity: 0, duration: 0.7, ease: "power3.out", stagger: { each: 0.07, from: "end" },
        scrollTrigger: { trigger: room, start: "top 75%", once: true }
      });
    });
    /* the dailies run the wrong way through the gate */
    var strip = inv.querySelector(".dailies__strip"), reel = inv.querySelector(".dailies__frames");
    if (strip && reel) {
      reel.style.overflow = "visible";
      var travel = function () { return Math.max(reel.scrollWidth - strip.clientWidth, window.innerWidth * 0.24); };
      gsap.timeline({ scrollTrigger: { trigger: strip, start: "top bottom", end: "bottom top", scrub: true, invalidateOnRefresh: true } })
        .fromTo([reel].concat(gsap.utils.toArray(".dailies__edge")), { x: function () { return -travel() / 2; } }, { x: function () { return travel() / 2; }, ease: hold }, 0)
        .fromTo(strip, { "--run": "0px" }, { "--run": function () { return travel() + "px"; }, ease: hold }, 0);
    }
    /* totems fall back into the hand */
    var totems = gsap.utils.toArray(".totem");
    gsap.set(totems, { y: -90, opacity: 0, rotation: function (i) { return [-14, 10, -8, 16][i % 4]; } });
    ScrollTrigger.create({
      trigger: ".vault", start: "top 78%", once: true,
      onEnter: function () {
        gsap.to(totems, { y: 0, opacity: 1, rotation: 0, duration: 1.1, ease: "bounce.out", stagger: 0.12, clearProps: "transform" });
      }
    });
  }

  /* --------------------------------------------------- limbo: the credits */
  function initCredits() {
    var win = document.querySelector(".credits__window"), roll = document.querySelector(".credits__roll");
    if (!win || !roll) return;
    var dist = function () { return roll.offsetHeight + window.innerHeight * 0.35; };
    gsap.fromTo(roll, { y: function () { return window.innerHeight * 0.55; } }, {
      y: function () { return -dist() + window.innerHeight * 0.55; }, ease: "none",
      scrollTrigger: { trigger: win, start: "top top", end: function () { return "+=" + dist(); }, pin: true, scrub: true, invalidateOnRefresh: true }
    });
  }

  /* ----------------------------------- the kick: the top never gets to fall */
  function initEnd() {
    var end = document.getElementById("end");
    if (!end) return;
    ScrollTrigger.create({
      id: "end", trigger: end, start: "top bottom", end: "bottom bottom",
      onUpdate: function (self) {
        var cut = self.progress > 0.985 ? 1 : 0;
        if (cut !== film.cut) { film.cut = cut; end.classList.toggle("is-cut", !!cut); if (cut) braam(end.querySelector(".end__line"), end); }
        /* the finale is all IMAX, as The Odyssey is: the bars do not come back */
        root.classList.toggle("is-imax", self.progress > 0.6);
      }
    });
  }

  /* ------------------------------------------- matte: level and dream clock */
  function initHead() {
    var label = document.getElementById("levelLabel"), clock = document.getElementById("clock"), rate = document.getElementById("clockRate");
    var depth = document.getElementById("depth"), current = null;
    function pad(v) { return (v < 10 ? "0" : "") + v; }
    function hms(s) { s = Math.max(0, Math.floor(s)); return pad(Math.floor(s / 3600) % 100) + ":" + pad(Math.floor(s / 60) % 60) + ":" + pad(s % 60); }
    function update() {
      var max = document.documentElement.scrollHeight - window.innerHeight;
      var p = max > 0 ? Math.min(Math.max(window.pageYOffset / max, 0), 1) : 0;
      if (depth) depth.style.transform = "scaleX(" + p + ")";
      var sec = currentSection();
      if (!sec) return;
      var name = sec.getAttribute("data-level"), r = +sec.getAttribute("data-rate");
      var box = sec.getBoundingClientRect(), vh = window.innerHeight || 1;
      /* every screen of scroll is a minute up here; dream time runs at the level's rate */
      var mins = Math.max(0, (vh * 0.5 - box.top) / vh), span = box.height / vh;
      clock.textContent = r === 0 ? "--:--:--" : hms((r > 0 ? mins : span - mins) * 60 * Math.abs(r));
      rate.textContent = r === 0 ? "∞" : r < 0 ? "Reverse" : "×" + r;
      root.classList.toggle("is-backwards", r < 0);
      film.level = LEVELS[name] || 0;
      film.dir = r < 0 ? -1 : 1;
      if (label && name !== current) {
        current = name;
        label.classList.add("is-swap");
        setTimeout(function () { label.textContent = name; label.classList.remove("is-swap"); }, 160);
      }
    }
    if (lenis) lenis.on("scroll", update);
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    update();
  }

  /* ------------------------------------------------------- levels menu */
  function initMenu() {
    var btn = document.getElementById("menuBtn"), nav = document.getElementById("levels");
    if (!btn || !nav) return;
    var open = false;
    function set(state) {
      open = state;
      btn.setAttribute("aria-expanded", String(open));
      if (open) {
        nav.hidden = false;
        void nav.offsetWidth;
        nav.classList.add("is-open");
        root.classList.add("is-locked");
        if (lenis) lenis.stop();
        var first = nav.querySelector("a"); if (first) first.focus();
      } else {
        nav.classList.remove("is-open");
        root.classList.remove("is-locked");
        if (lenis) lenis.start();
        setTimeout(function () { if (!open) nav.hidden = true; }, calm ? 0 : 560);
      }
    }
    btn.addEventListener("click", function () { set(!open); });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && open) { set(false); btn.focus(); }
    });
    document.addEventListener("click", function (e) {
      var a = e.target.closest && e.target.closest('a[href^="#"]');
      if (!a) return;
      var id = a.getAttribute("href");
      if (id.length < 2 || !document.querySelector(id)) return;
      e.preventDefault();
      var wasOpen = open;
      if (open) set(false);
      setTimeout(function () { goTo(id); }, wasOpen ? 300 : 0);
    });
  }

  /* --------------------------------------- check the totem: the notice */
  function initNotice() {
    var certs = document.querySelectorAll(".cert");
    if (!certs.length) return;
    var modal = document.createElement("div");
    modal.className = "cmodal";
    modal.setAttribute("role", "dialog");
    modal.setAttribute("aria-modal", "true");
    modal.setAttribute("aria-labelledby", "cmodalT");
    modal.innerHTML =
      '<div class="cmodal__bg" data-close></div>' +
      '<div class="cmodal__card"><div class="cmodal__in">' +
      '<button class="cmodal__x" type="button" data-close aria-label="Close"><svg class="ic" aria-hidden="true"><use href="#i-close" /></svg></button>' +
      '<h2 class="cmodal__t" id="cmodalT"><span class="cmodal__name"></span> <span class="cmodal__code"></span></h2><div class="cmodal__body"></div>' +
      "</div></div>";
    document.body.appendChild(modal);
    var code = modal.querySelector(".cmodal__code"), title = modal.querySelector(".cmodal__name"),
        body = modal.querySelector(".cmodal__body"), x = modal.querySelector(".cmodal__x"), source = null;

    function show(cert, trigger) {
      code.textContent = cert.querySelector(".cert__code").textContent;
      title.textContent = cert.querySelector(".cert__title").textContent;
      body.innerHTML = cert.querySelector(".cert__info").innerHTML;
      modal.classList.add("is-open");
      root.classList.add("is-locked");
      if (lenis) lenis.stop();
      source = trigger;
      x.focus();
    }
    function hide() {
      modal.classList.remove("is-open");
      root.classList.remove("is-locked");
      if (lenis) lenis.start();
      if (source) { source.focus(); source = null; }
    }
    certs.forEach(function (cert) {
      var t = cert.querySelector(".totem");
      t.addEventListener("click", function () { show(cert, t); });
    });
    modal.addEventListener("click", function (e) { if (e.target.closest("[data-close]")) hide(); });
    document.addEventListener("keydown", function (e) {
      if (!modal.classList.contains("is-open")) return;
      if (e.key === "Escape") hide();
      if (e.key === "Tab") {
        var f = modal.querySelectorAll("a[href], button");
        var first = f[0], lastEl = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); lastEl.focus(); }
        else if (!e.shiftKey && document.activeElement === lastEl) { e.preventDefault(); first.focus(); }
      }
    });
  }

  /* ------------------------------- the spinning top: real 3D, loaded after first paint */
  function initTotem() {
    if ((navigator.connection || {}).saveData || !window.WebGL2RenderingContext) return;
    import("./totem.js?v=" + BUILD).then(function (m) { m.mount(film); }).catch(function () {});
  }

  /* ---------------------------------------------------------------- boot */
  function boot() {
    initAtmos();
    initLenis();
    initMenu();
    initNotice();
    initHead();
    if (!hasGSAP || calm) {
      root.classList.remove("is-opening");
      return;
    }
    initTotem();
    coldOpen(function () {
      initBeats();
      initCards();
      initRecord();
      initHotel();
      initInversion();
      initCredits();
      initEnd();
      ScrollTrigger.refresh();
    });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
