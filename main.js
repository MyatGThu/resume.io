/* ==========================================================================
   MYAT THU · THE DIRECTOR'S CUT
   One idea runs the whole film: the speed ramp. Time rushes in, hangs in
   slow motion, then whips out, and the light field's clock follows it, so
   the embers freeze whenever a title hangs in the air.
   Every module degrades: without JS, WebGL or motion, the page is printed
   plainly and every word stays readable.
   ========================================================================== */
(function () {
  "use strict";

  var root = document.documentElement;
  var calm = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var hasGSAP = typeof window.gsap !== "undefined" && typeof window.ScrollTrigger !== "undefined";
  var lenis = null;
  var BUILD = ((document.currentScript || {}).src || "").split("v=")[1] || "";

  if (hasGSAP) gsap.registerPlugin(ScrollTrigger);

  /* fast, then slow motion, then fast: the ramp every sequence rides on */
  function ramp(p) {
    var u = 2 * p - 1;
    return 0.5 + 0.5 * (0.14 * u + 0.86 * u * u * u);
  }

  /* ------------------------------------------------------------ the clock */
  var film = {
    scale: 1,          // how fast time runs in the light field
    hold: 0,           // 1 while a title hangs in the air
    dawn: 1,           // 0 to 1 as the cold open raises the aspis out of the dark
    vel: 0,            // scroll velocity, normalised
    shock: { x: 0, y: 0, age: 99 },
    strike: function (el) {
      if (!el) return;
      var r = el.getBoundingClientRect(), h = window.innerHeight || 1;
      film.shock.x = (r.left + r.width / 2) / h;
      film.shock.y = 1 - (r.top + r.height / 2) / h;
      film.shock.age = 0;
    }
  };

  /* ------------------------------------------------------- the light field */
  var FRAG = [
    "#ifdef GL_FRAGMENT_PRECISION_HIGH",
    "precision highp float;",
    "#else",
    "precision mediump float;",
    "#endif",
    "uniform vec2 uRes; uniform float uTime; uniform vec2 uPtr; uniform vec3 uShock; uniform float uVel; uniform float uHold;",
    "float h21(vec2 p){ p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }",
    "float n2(vec2 p){ vec2 i = floor(p), f = fract(p); vec2 u = f * f * (3.0 - 2.0 * f);",
    "  return mix(mix(h21(i), h21(i + vec2(1.0, 0.0)), u.x), mix(h21(i + vec2(0.0, 1.0)), h21(i + vec2(1.0, 1.0)), u.x), u.y); }",
    "float fbm(vec2 p){ float v = 0.0, a = 0.5; for (int i = 0; i < 4; i++) { v += a * n2(p); p = p * 2.03 + 11.7; a *= 0.5; } return v; }",
    "vec3 embers(vec2 uv, float t, float seed, float sc, float sp, float sz){",
    "  vec2 p = uv * sc; p.y -= t * sp; p.x += sin(t * 0.21 + seed) * 0.6;",
    "  vec2 id = floor(p); vec2 f = fract(p) - 0.5;",
    "  float h = h21(id + seed * 17.0);",
    "  if (h > 0.34) return vec3(0.0);",
    "  vec2 o = vec2(h21(id + 3.1) - 0.5, h21(id + 7.7) - 0.5) * 0.66;",
    "  o.x += sin(t * 1.3 + h * 40.0) * 0.12;",
    "  vec2 d = f - o; d.y /= 1.0 + abs(uVel) * 2.6;",
    "  float r = length(d);",
    "  float fl = 0.55 + 0.45 * sin(t * 5.0 + h * 90.0);",
    "  float c = smoothstep(sz, 0.0, r) + smoothstep(sz * 4.5, 0.0, r) * 0.32;",
    "  vec3 col = mix(vec3(1.0, 0.42, 0.1), vec3(1.0, 0.8, 0.48), h21(id + 1.3));",
    "  return col * c * fl;",
    "}",
    "void main(){",
    "  vec2 uv = gl_FragCoord.xy / uRes.y;",
    "  float asp = uRes.x / uRes.y;",
    "  vec2 q = gl_FragCoord.xy / uRes;",
    "  float t = uTime;",
    /* the shockwave pushes the air outward from a slam */
    "  vec2 sc = uShock.xy; float age = uShock.z;",
    "  vec2 sd = uv - sc; float sr = length(sd);",
    "  vec2 push = age < 2.5 ? normalize(sd + 1e-4) * 0.09 * exp(-age * 2.2) * smoothstep(0.9, 0.0, abs(sr - age * 0.8)) : vec2(0.0);",
    "  vec2 uvp = uv - push;",
    /* the grade: warm umber overhead, crushed black below, a low fire on the horizon */
    "  vec3 col = mix(vec3(0.030, 0.024, 0.017), vec3(0.085, 0.062, 0.040), smoothstep(0.1, 1.1, q.y));",
    "  col += vec3(0.30, 0.13, 0.04) * pow(1.0 - q.y, 5.0) * 0.55;",
    /* smoke drifting across the light */
    "  float sm = fbm(uvp * 1.6 + vec2(t * 0.012, -t * 0.02));",
    "  col += vec3(0.16, 0.12, 0.085) * smoothstep(0.45, 0.95, sm) * 0.5;",
    /* god rays from a sun just above the frame */
    "  vec2 src = vec2(asp * 0.5 + uPtr.x * 0.12, 1.32 + uPtr.y * 0.04);",
    "  vec2 d = uvp - src; float ang = atan(d.x, -d.y);",
    "  float rays = pow(n2(vec2(ang * 9.0, t * 0.035)), 3.0) + 0.6 * pow(n2(vec2(ang * 23.0 + 10.0, t * 0.05)), 4.0);",
    "  rays *= smoothstep(1.75, 0.15, length(d)) * (0.5 + 0.5 * sm);",
    "  col += vec3(1.0, 0.78, 0.46) * rays * 0.36;",
    /* embers in three depths; the far ones slower and finer */
    "  col += embers(uvp, t, 1.0, 5.0, 0.055, 0.050) * 0.55;",
    "  col += embers(uvp, t, 2.0, 9.0, 0.090, 0.040) * 0.45;",
    "  col += embers(uvp, t, 3.0, 16.0, 0.140, 0.034) * 0.32;",
    /* the slam: a flash and a ring of heat */
    "  if (age < 2.5) {",
    "    col += vec3(1.0, 0.72, 0.38) * smoothstep(0.03, 0.0, abs(sr - age * 0.8)) * (1.0 - age / 2.5) * 0.55;",
    "    col += vec3(1.0, 0.8, 0.52) * exp(-age * 7.0) * 0.22;",
    "  }",
    /* bullet time lifts the rays a touch, like dust hanging in light */
    "  col += vec3(1.0, 0.8, 0.5) * rays * uHold * 0.12;",
    "  float vig = smoothstep(1.2, 0.3, length((q - 0.5) * vec2(1.25, 1.0)));",
    "  col *= mix(0.55, 1.0, vig);",
    "  gl_FragColor = vec4(col, 1.0);",
    "}"
  ].join("\n");

  var VERT = "attribute vec2 p; void main(){ gl_Position = vec4(p, 0.0, 1.0); }";

  function initAtmos() {
    var canvas = document.getElementById("atmos");
    if (!canvas) return null;
    var gl = null;
    try { gl = canvas.getContext("webgl", { antialias: false, alpha: false, powerPreference: "high-performance" }); } catch (e) {}
    if (!gl) return null;

    function compile(type, src) {
      var s = gl.createShader(type);
      gl.shaderSource(s, src); gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) { console.warn(gl.getShaderInfoLog(s)); return null; }
      return s;
    }
    var vs = compile(gl.VERTEX_SHADER, VERT), fs = compile(gl.FRAGMENT_SHADER, FRAG);
    if (!vs || !fs) return null;
    var prog = gl.createProgram();
    gl.attachShader(prog, vs); gl.attachShader(prog, fs); gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return null;
    gl.useProgram(prog);

    var buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    var loc = gl.getAttribLocation(prog, "p");
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

    var u = {};
    ["uRes", "uTime", "uPtr", "uShock", "uVel", "uHold"].forEach(function (n) { u[n] = gl.getUniformLocation(prog, n); });

    var coarse = window.matchMedia("(pointer: coarse)").matches;
    var quality = coarse ? 0.42 : 0.55;
    function size() {
      var dpr = Math.min(window.devicePixelRatio || 1, 2);
      var w = Math.max(1, Math.round(window.innerWidth * dpr * quality));
      var h = Math.max(1, Math.round(window.innerHeight * dpr * quality));
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w; canvas.height = h;
        gl.viewport(0, 0, w, h);
      }
    }
    size();
    window.addEventListener("resize", size);

    var ptr = { x: 0, y: 0, tx: 0, ty: 0 };
    window.addEventListener("pointermove", function (e) {
      ptr.tx = (e.clientX / window.innerWidth) * 2 - 1;
      ptr.ty = (e.clientY / window.innerHeight) * 2 - 1;
    }, { passive: true });

    var t = 14.0, last = performance.now(), hold = 0, raf = 0;
    function draw(now) {
      var dt = Math.min((now - last) / 1000, 0.05); last = now;
      var target = film.hold ? 0.05 : 1 + Math.min(Math.abs(film.vel) * 0.05, 2.2);
      film.scale += (target - film.scale) * (1 - Math.exp(-dt * (film.hold ? 9 : 4)));
      t += dt * film.scale;
      hold += ((film.hold ? 1 : 0) - hold) * (1 - Math.exp(-dt * 5));
      film.shock.age += dt * Math.max(film.scale, 0.35);
      film.vel *= Math.exp(-dt * 3);
      ptr.x += (ptr.tx - ptr.x) * (1 - Math.exp(-dt * 2));
      ptr.y += (ptr.ty - ptr.y) * (1 - Math.exp(-dt * 2));

      gl.uniform2f(u.uRes, canvas.width, canvas.height);
      gl.uniform1f(u.uTime, t);
      gl.uniform2f(u.uPtr, ptr.x, -ptr.y);
      gl.uniform3f(u.uShock, film.shock.x, film.shock.y, film.shock.age);
      gl.uniform1f(u.uVel, Math.max(-1, Math.min(1, film.vel / 40)));
      gl.uniform1f(u.uHold, hold);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    }

    function loop(now) { draw(now); raf = requestAnimationFrame(loop); }
    function start() { if (!raf && !calm) { last = performance.now(); raf = requestAnimationFrame(loop); } }
    function stop() { cancelAnimationFrame(raf); raf = 0; }

    document.addEventListener("visibilitychange", function () { document.hidden ? stop() : start(); });
    canvas.addEventListener("webglcontextlost", function (e) { e.preventDefault(); stop(); canvas.classList.remove("is-live"); });

    if (calm) { draw(performance.now()); } else { start(); }
    requestAnimationFrame(function () { canvas.classList.add("is-live"); });
    return { stop: stop, start: start };
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

  /* ------------------------------------------------------------ the matte */
  var matte = {
    reading: function () { return window.innerWidth <= 760 ? 46 : 52; },
    cinema: function () {
      var vh = window.innerHeight, vw = window.innerWidth;
      return Math.max(matte.reading(), Math.min((vh - vw / 2.39) / 2, vh * 0.16));
    },
    set: function (mode, dur) {
      var h = mode === "cinema" ? matte.cinema() : matte.reading();
      gsap.to(root, { "--mt": h + "px", "--mb": h + "px", duration: dur == null ? 0.7 : dur, ease: "expo.out", overwrite: "auto" });
    },
    // ScrollTrigger onToggle: widen to cinema while a pinned sequence plays, release any hang after.
    follow: function (self) { matte.set(self.isActive ? "cinema" : "reading"); if (!self.isActive) film.hold = 0; }
  };

  /* the flare that crosses the lens */
  function flare(y, dur) {
    var f = document.getElementById("flare");
    if (!f) return;
    gsap.killTweensOf(f);
    gsap.set(f, { top: y, xPercent: -35, opacity: 0 });
    gsap.timeline()
      .to(f, { opacity: 1, duration: 0.12, ease: "none" })
      .to(f, { xPercent: 35, duration: dur || 0.9, ease: "power2.inOut" }, 0)
      .to(f, { opacity: 0, duration: 0.35, ease: "power1.in" }, (dur || 0.9) - 0.3);
  }

  function shake(el, amp) {
    if (!el) return;
    var a = amp || 8;
    gsap.timeline()
      .to(el, { x: a, y: -a * 0.6, duration: 0.04 })
      .to(el, { x: -a * 0.8, y: a * 0.5, duration: 0.04 })
      .to(el, { x: a * 0.5, y: a * 0.3, duration: 0.04 })
      .to(el, { x: -a * 0.3, y: -a * 0.2, duration: 0.05 })
      .to(el, { x: 0, y: 0, duration: 0.08, ease: "power2.out" });
  }

  function slam(el, shakeEl) {
    film.strike(el);
    shake(shakeEl || el, window.innerWidth < 760 ? 5 : 9);
  }

  /* ---------------------------------------------------------- cold open */
  function coldOpen(done) {
    var open = document.getElementById("open");
    var title = document.querySelector(".title");
    var letters = document.querySelectorAll(".title__word b");
    var after = document.querySelectorAll(".title__log, .title__acts, .title__cue, .title__slate");
    var ident = document.querySelector(".open__ident");
    var skip = document.getElementById("openSkip");

    function finish() {
      root.classList.remove("is-opening");
      try { sessionStorage.setItem("seen", "1"); } catch (e) {}
      film.hold = 0;
      matte.set("reading", 1);
      if (lenis) lenis.start();
      done();
    }

    if (!root.classList.contains("is-opening") || !hasGSAP || !open) { finish(); return; }
    if (lenis) lenis.stop();
    window.scrollTo(0, 0);
    skip.tabIndex = 0;

    var vw = window.innerWidth, vh = window.innerHeight;
    gsap.set(letters, {
      opacity: 0, filter: "blur(18px)", scale: 2.3,
      x: function () { return (Math.random() - 0.5) * vw * 0.7; },
      y: function () { return (Math.random() - 0.5) * vh * 0.5; },
      rotation: function () { return (Math.random() - 0.5) * 70; }
    });
    gsap.set(after, { opacity: 0, y: 18 });
    film.dawn = 0;
    root.style.setProperty("--mt", matte.cinema() + "px");
    root.style.setProperty("--mb", matte.cinema() + "px");

    var tl = gsap.timeline({ onComplete: finish });
    tl.to(ident, { opacity: 1, letterSpacing: "0.42em", duration: 1.1, ease: "power2.out" }, 0.2)
      .add(function () { flare(vh * 0.5, 1.0); }, 1.05)
      .to(ident, { opacity: 0, duration: 0.35, ease: "power2.in" }, 1.55)
      .fromTo(open, { "--open-top": "0%", "--open-bot": "0%" }, { "--open-top": "-100%", "--open-bot": "100%", duration: 0.7, ease: "expo.inOut" }, 1.8)
      /* the forge: letters rush in, hang in the air, then lock */
      .add(function () { film.hold = 1; }, 2.35)
      .to(film, { dawn: 1, duration: 2.6, ease: ramp }, 1.85)
      .to(letters, { opacity: 1, filter: "blur(0px)", scale: 1, x: 0, y: 0, rotation: 0, duration: 2.4, ease: ramp, stagger: { each: 0.03, from: "center" } }, 2.0)
      .add(function () { film.hold = 0; slam(document.querySelector(".title__word"), title); flare(document.querySelector(".title__word").getBoundingClientRect().top + 40, 0.8); }, 4.5)
      .to(after, { opacity: 1, y: 0, duration: 0.8, ease: "expo.out", stagger: 0.08 }, 4.6)
      .add(function () { open.style.display = "none"; }, 4.7);

    skip.addEventListener("click", function () { tl.progress(1); });
    document.addEventListener("keydown", function esc(e) {
      if (e.key === "Escape" && root.classList.contains("is-opening")) { tl.progress(1); document.removeEventListener("keydown", esc); }
    });
  }

  /* --------------------------------------------------------- act cards */
  function initCards() {
    document.querySelectorAll(".card").forEach(function (card) {
      var n = card.querySelector(".card__n"), t = card.querySelector(".card__t");
      var tl = gsap.timeline({ paused: true });
      tl.fromTo(n, { scale: 2.1, opacity: 0, filter: "blur(16px)", letterSpacing: "0.32em" },
                   { scale: 1, opacity: 1, filter: "blur(0px)", letterSpacing: "0.05em", duration: 0.3, ease: "none" }, 0)
        .fromTo(t, { opacity: 0, y: 44 }, { opacity: 1, y: 0, duration: 0.26, ease: "none" }, 0.06)
        .to([n, t], { scale: 1.07, duration: 0.4, ease: "none" }, 0.3)
        .to(n, { xPercent: -38, scaleX: 1.7, opacity: 0, filter: "blur(10px)", duration: 0.3, ease: "none" }, 0.7)
        .to(t, { xPercent: 45, opacity: 0, duration: 0.3, ease: "none" }, 0.7);

      var struck = false;
      ScrollTrigger.create({
        trigger: card, start: "top top", end: "+=150%", pin: true, pinSpacing: true,
        onToggle: matte.follow,
        onUpdate: function (self) {
          var p = self.progress, r = ramp(p);
          tl.progress(r);
          film.hold = p > 0.3 && p < 0.7 ? 1 : 0;
          if (!struck && r >= 0.3 && self.direction > 0) { struck = true; slam(n, card); flare(n.getBoundingClientRect().top + n.offsetHeight / 2, 0.8); }
          if (p < 0.05) struck = false;
        }
      });
    });
  }

  /* ---------------------------------------------------- trailer beats */
  function initBeats() {
    var sec = document.getElementById("beats");
    if (!sec) return;
    var beats = sec.querySelectorAll(".beat"), n = beats.length;
    sec.classList.add("is-filmed");
    var tl = gsap.timeline({ paused: true });
    beats.forEach(function (b, i) {
      tl.fromTo(b, { opacity: 0, scale: 1.4, filter: "blur(14px)" }, { opacity: 1, scale: 1, filter: "blur(0px)", duration: 0.3, ease: "none" }, i)
        .to(b, { scale: 1.06, duration: 0.4, ease: "none" }, i + 0.3)
        .to(b, { opacity: 0, scale: 0.86, filter: "blur(10px)", duration: 0.3, ease: "none" }, i + 0.7);
    });
    var struck = -1;
    ScrollTrigger.create({
      id: "beats", trigger: sec, start: "top top", end: "+=" + (n * 85) + "%", pin: sec.querySelector(".beats__stage"), pinSpacing: true,
      onToggle: matte.follow,
      onUpdate: function (self) {
        var x = Math.min(self.progress * n, n - 0.0001), seg = Math.floor(x), local = x - seg, r = ramp(local);
        tl.progress((seg + r) / n);
        film.hold = local > 0.3 && local < 0.7 ? 1 : 0;
        if (r >= 0.3 && seg !== struck && self.direction > 0) { struck = seg; slam(beats[seg], sec.querySelector(".beats__stage")); }
        if (self.progress < 0.02) struck = -1;
      }
    });
  }

  /* ---------------------------------------------- act II: the phalanx */
  function initRecord() {
    document.querySelectorAll(".role").forEach(function (role, i) {
      var sh = role.querySelector(".shield"), body = role.querySelector(".role__body");
      var from = i % 2 ? 1 : -1, locked = false;
      gsap.set(body, { clipPath: "inset(0% 100% 0% 0%)" });
      function lock() {
        if (locked) return; locked = true;
        gsap.set(sh, { x: 0, y: 0, rotation: 0, scale: 1 });   /* once locked, it holds the line */
        gsap.to(body, { clipPath: "inset(0% 0% 0% 0%)", duration: 1.1, ease: "expo.out" });
        film.strike(sh);
        shake(sh, 6);
        var r = sh.getBoundingClientRect(), dust = document.createElement("span");
        dust.className = "dust";
        role.style.position = "relative";
        var rr = role.getBoundingClientRect();
        gsap.set(dust, { left: r.left - rr.left + r.width / 2, top: r.top - rr.top + r.height / 2, width: 10, height: 10, xPercent: -50, yPercent: -50 });
        role.appendChild(dust);
        gsap.to(dust, { width: r.width * 2.1, height: r.width * 2.1, opacity: 0, duration: 1.2, ease: "expo.out", onComplete: function () { dust.remove(); } });
      }
      ScrollTrigger.create({
        trigger: role, start: "top 95%", end: "top 45%",
        onUpdate: function (self) {
          if (locked) return;
          var r = ramp(self.progress), k = 1 - r;
          gsap.set(sh, { x: from * k * window.innerWidth * 0.55, y: -k * 140, rotation: from * k * -540, scale: 0.55 + 0.45 * r });
          if (self.progress > 0.985) lock();
        },
        onLeave: lock
      });
    });
  }

  /* ---------------------------------------- act III: shots on the reel */
  function initReports() {
    document.querySelectorAll(".scene").forEach(function (scene) {
      var frame = scene.querySelector(".shot__frame"), img = frame.querySelector("img");
      gsap.fromTo(frame, { clipPath: "inset(41% 0% 41% 0%)" }, {
        clipPath: "inset(0% 0% 0% 0%)", ease: "none",
        scrollTrigger: { trigger: scene, start: "top 92%", end: "top 38%", scrub: true,
          onLeave: function () { var r = frame.getBoundingClientRect(); flare(r.top + r.height / 2, 1.0); } }
      });
      gsap.fromTo(img, { scale: 1.3 }, { scale: 1, ease: "none", scrollTrigger: { trigger: scene, start: "top bottom", end: "bottom top", scrub: true } });
    });
    var cast = document.querySelector(".cast__frame img");
    if (cast) gsap.fromTo(cast, { scale: 1.22 }, { scale: 1, ease: "none", scrollTrigger: { trigger: ".cast", start: "top bottom", end: "bottom top", scrub: true } });
  }

  /* ------------------------- act IV: the dailies run through the gate */
  function initDailies() {
    var strip = document.querySelector(".dailies__strip"), reel = document.querySelector(".dailies__frames");
    var title = document.querySelector(".sheet__t");
    if (!strip || !reel) return;
    reel.style.overflow = "visible";
    // Wide screens drift the reel through the gate; narrow ones run every frame past it.
    var travel = function () { return Math.max(reel.scrollWidth - strip.clientWidth, window.innerWidth * 0.24); };
    gsap.timeline({ scrollTrigger: { trigger: strip, start: "top bottom", end: "bottom top", scrub: true, invalidateOnRefresh: true } })
      .fromTo([reel].concat(gsap.utils.toArray(".dailies__edge")), { x: function () { return travel() / 2; } }, { x: function () { return -travel() / 2; }, ease: ramp }, 0)
      .fromTo(strip, { "--run": "0px" }, { "--run": function () { return -travel() + "px"; }, ease: ramp }, 0);
    if (title) gsap.from(title, {
      scale: 1.5, opacity: 0, filter: "blur(14px)", duration: 0.55, ease: "expo.in",
      scrollTrigger: { trigger: ".sheet", start: "top 80%", once: true },
      onComplete: function () { gsap.set(title, { clearProps: "filter,transform" }); slam(title, document.querySelector(".sheet")); }
    });
  }

  /* --------------------------------------- act V: coins struck in bronze */
  function initCoins() {
    var bodies = gsap.utils.toArray(".coin__body");
    if (!bodies.length) return;
    gsap.set(bodies, { rotationY: -1080, y: -70, opacity: 0 });
    ScrollTrigger.create({
      trigger: ".vault", start: "top 78%", once: true,
      onEnter: function () {
        bodies.forEach(function (b, i) {
          gsap.timeline({ delay: i * 0.16 })
            .to(b, { rotationY: 0, y: 0, opacity: 1, duration: 2.1, ease: ramp })
            .add(function () { film.strike(b); }, 2.0)
            .fromTo(b, { "--glint": "130%" }, { "--glint": "-30%", duration: 0.9, ease: "power2.inOut" }, 1.95)
            .set(b, { clearProps: "transform" });
        });
      }
    });
  }

  /* --------------------------------------------------- end credits roll */
  function initCredits() {
    var win = document.querySelector(".credits__window"), roll = document.querySelector(".credits__roll");
    if (!win || !roll) return;
    var dist = function () { return roll.offsetHeight + window.innerHeight * 0.35; };
    gsap.fromTo(roll, { y: function () { return window.innerHeight * 0.55; } }, {
      y: function () { return -dist() + window.innerHeight * 0.55; }, ease: "none",
      scrollTrigger: { trigger: win, start: "top top", end: function () { return "+=" + dist(); }, pin: true, scrub: true, invalidateOnRefresh: true,
        onToggle: matte.follow }
    });
    var line = document.querySelector(".post__line");
    if (line) {
      gsap.set(line, { opacity: 0, scale: 1.35, filter: "blur(14px)" });
      ScrollTrigger.create({
        trigger: ".post", start: "top 60%", once: true,
        onEnter: function () {
          gsap.timeline()
            .add(function () { film.hold = 1; })
            .to(line, { opacity: 1, scale: 1, filter: "blur(0px)", duration: 1.6, ease: ramp })
            .add(function () { film.hold = 0; slam(line, document.querySelector(".post")); }, 1.5);
        }
      });
    }
  }

  /* --------------------------------- the running head: act, timecode, scrub */
  function initHead() {
    var label = document.getElementById("actLabel");
    var tc = document.getElementById("timecode");
    var scrub = document.getElementById("scrub");
    var acts = Array.prototype.slice.call(document.querySelectorAll("[data-act]"));
    var RUNTIME = (7 * 60 + 42) * 24, current = "";
    function pad(v) { return (v < 10 ? "0" : "") + v; }
    function update() {
      var max = document.documentElement.scrollHeight - window.innerHeight;
      var p = max > 0 ? Math.min(Math.max(window.pageYOffset / max, 0), 1) : 0;
      var f = Math.round(p * RUNTIME), ff = f % 24, s = Math.floor(f / 24);
      if (tc) tc.textContent = "00:" + pad(Math.floor(s / 60)) + ":" + pad(s % 60) + ":" + pad(ff);
      if (scrub) scrub.style.transform = "scaleX(" + p + ")";
      var name = acts[0] ? acts[0].getAttribute("data-act") : "";
      for (var i = 0; i < acts.length; i++) if (acts[i].getBoundingClientRect().top <= window.innerHeight * 0.45) name = acts[i].getAttribute("data-act");
      if (p > 0.995 && acts.length) name = acts[acts.length - 1].getAttribute("data-act");
      if (label && name !== current) {
        current = name;
        label.classList.add("is-swap");
        setTimeout(function () { label.textContent = name; label.classList.remove("is-swap"); }, 180);
      }
    }
    if (lenis) lenis.on("scroll", update);
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    update();
  }

  /* ------------------------------------------------- scene selection menu */
  function initMenu() {
    var btn = document.getElementById("menuBtn"), nav = document.getElementById("scenes");
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

  /* ------------------------------------------ the certification notice */
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
      var info = cert.querySelector(".cert__info");
      if (!info) return;
      var c = cert.querySelector(".c-code");
      code.textContent = c ? c.textContent : "";
      title.textContent = cert.querySelector(".cert__name").textContent;
      body.innerHTML = info.innerHTML;
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
      var coin = cert.querySelector(".coin");
      if (coin) coin.addEventListener("click", function () { show(cert, coin); });
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

  /* ------------------------------- the aspis: real 3D, loaded after first paint */
  function initAspis() {
    if ((navigator.connection || {}).saveData || !window.WebGL2RenderingContext) return;
    import("./aspis.js?v=" + BUILD).then(function (m) { m.mount(film); }).catch(function () {});
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
    initAspis();
    coldOpen(function () {
      initBeats();
      initCards();
      initRecord();
      initReports();
      initDailies();
      initCoins();
      initCredits();
      ScrollTrigger.refresh();
    });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
