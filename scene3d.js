/* ===========================================================================
   Myat Thu — Page-wide 3D flight scene
   One endless particle field, flown through by scroll: the camera holds
   still while the field streams past. Each ring of particles is shaped by
   the section of the document it currently represents —
     hero   → loose drift        (a wide, open field of signals)
     stats  → cloud              (the field thickens around the numbers)
     work   → one-point corridor (tight rings; scroll dollies you down it)
     certs  → ordered drift      (the corridor relaxes, still structured)
     → contact: the field converges to a point, flares, and blinks out.
   Rings recycle modulo the window depth, so the flight never ends, and a
   recycled ring is re-profiled for the document position it now represents
   — upcoming sections literally take shape in the distance ahead.
   Fast scrolling widens the lens (a touch of warp); decrypting the hero
   name surges the flight forward. Colours track the active theme.
   Degrades gracefully (no JS / no WebGL / reduced-motion / Data Saver all
   get the plain gradient site).
   =========================================================================== */
(function () {
  "use strict";

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduceMotion) return;

  // Only meaningful on the home page (the flight's zones live there).
  if (!document.querySelector(".hero") || !document.querySelector(".work")) return;

  var conn = navigator.connection;
  if (conn && conn.saveData) return;

  // Three.js is the page's heaviest asset — load it lazily, off the critical path.
  var lib = document.createElement("script");
  lib.src = "vendor/three.slim.min.js";
  lib.async = true;
  lib.onload = function () { if (typeof window.THREE !== "undefined") init(); };
  document.head.appendChild(lib);

  function init() {
    var renderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "low-power" });
    } catch (e) { return; }

    var fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    var small = window.innerWidth < 760;
    var canvas = renderer.domElement;
    canvas.className = "scene3d";
    canvas.setAttribute("aria-hidden", "true");
    document.body.appendChild(canvas);

    var scene = new THREE.Scene();
    var camera = new THREE.PerspectiveCamera(60, 1, 0.1, 200);
    camera.position.set(0, 0, 26);

    var group = new THREE.Group(); // kept for the break-burst click mapping
    scene.add(group);

    var N = small ? 460 : 1120;
    var RING_N = small ? 18 : 26;             // particles per ring
    var RINGS = Math.ceil(N / RING_N);
    var DEPTH = 80, SPACING = DEPTH / RINGS;  // window depth; rings recycle through it
    var ZNEAR = small ? 18 : 19;              // wrap plane — in front of the lens (z=26)
    var ZSAFE = 20;                           // jitter may never push a particle past this
    var K = 0.03;                             // world units of travel per scrolled px

    var jit = new Float32Array(N * 3);        // per-particle scatter seed (-1..1)
    var wobble = new Float32Array(N * 2);     // per-particle idle-drift phase/speed
    for (var i = 0; i < N; i++) {
      var i3 = i * 3;
      jit[i3] = Math.random() * 2 - 1; jit[i3 + 1] = Math.random() * 2 - 1; jit[i3 + 2] = Math.random() * 2 - 1;
      wobble[i * 2] = Math.random() * Math.PI * 2; wobble[i * 2 + 1] = 0.4 + Math.random() * 0.8;
    }

    // "Click to break it" — per-particle burst offset + velocity, sprung back
    // toward the flight positions so scroll behaviour restores itself.
    var boff = new Float32Array(N * 3);
    var bvel = new Float32Array(N * 3);

    var pos = new Float32Array(N * 3);
    var geom = new THREE.BufferGeometry();
    var posAttr = new THREE.BufferAttribute(pos, 3);
    posAttr.setUsage(THREE.DynamicDrawUsage);
    geom.setAttribute("position", posAttr);
    var pmat = new THREE.PointsMaterial({ size: 0.14, sizeAttenuation: true, transparent: true, opacity: 0.6, depthWrite: false });
    var points = new THREE.Points(geom, pmat);
    group.add(points);

    // Flight zones (DOM order). Each shapes the rings that pass through the
    // stretch of document it owns: ring radius, scatter, and axis offset
    // (a fraction of the visible half-width; the path curves between zones).
    var ZONES = [
      { el: document.querySelector(".hero"), rad: 10, jitter: 5, ax: 0.42 },
      { el: document.querySelector(".stats"), rad: 8.5, jitter: 9, ax: 0 },
      { el: document.querySelector(".work"), rad: 5.2, jitter: 0.25, ax: 0.3 },
      { el: document.querySelector(".certs"), rad: 7, jitter: 3, ax: -0.08 }
    ].filter(function (z) { return z.el; });
    var contactEl = document.querySelector("#contact") || document.querySelector(".contact");

    var spread = { x: 20, y: 13 };
    function computeBounds() {
      var halfY = Math.tan((camera.fov * Math.PI) / 360) * camera.position.z;
      spread.y = halfY * 0.92; spread.x = halfY * camera.aspect * 1.15;
    }

    // Zone / contact positions in document space, cached so the frame loop
    // never calls getBoundingClientRect (avoids per-frame layout thrash).
    var centers = [], contactTop = Infinity;
    function computeCenters() {
      for (var m = 0; m < ZONES.length; m++) {
        var r = ZONES[m].el.getBoundingClientRect();
        centers[m] = r.top + window.scrollY + r.height / 2;
      }
      contactTop = contactEl ? contactEl.getBoundingClientRect().top + window.scrollY : Infinity;
    }

    var lastW = 0, lastH = 0;
    function resize() {
      var w = window.innerWidth, h = window.innerHeight;
      if (!w || !h || (w === lastW && h === lastH)) return;
      lastW = w; lastH = h;
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, fine ? 2 : 1.5));
      renderer.setSize(w, h);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      computeBounds();
      computeCenters();
    }
    var rt = null;
    window.addEventListener("resize", function () { clearTimeout(rt); rt = setTimeout(resize, 150); });
    // Section offsets shift as fonts/images settle — recompute after load.
    window.addEventListener("load", computeCenters);
    setTimeout(computeCenters, 1400);

    function applyTheme() {
      var cs = getComputedStyle(document.documentElement);
      var bone = new THREE.Color(cs.getPropertyValue("--bone").trim() || "#f1ede4");
      var dark = (0.2126 * bone.r + 0.7152 * bone.g + 0.0722 * bone.b) < 0.5;
      pmat.color.set(cs.getPropertyValue("--accent").trim() || "#b8492c");
      pmat.blending = dark ? THREE.AdditiveBlending : THREE.NormalBlending;
      pmat.needsUpdate = true;
      baseParticle = dark ? 0.7 : 0.62;
    }
    var baseParticle = 0.62;
    new MutationObserver(applyTheme).observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });

    var mx = 0, my = 0, cmx = 0, cmy = 0;
    if (fine) {
      window.addEventListener("mousemove", function (e) {
        mx = (e.clientX / window.innerWidth) * 2 - 1;
        my = (e.clientY / window.innerHeight) * 2 - 1;
      });
    }

    function smooth(x) { return x * x * (3 - 2 * x); }
    // interpolate the zone profile for a document position into pr
    var pr = { rad: 0, jitter: 0, ax: 0 };
    function profileAt(d) {
      var idx = 0;
      for (var m = 0; m < ZONES.length - 1; m++) { if (d >= centers[m]) idx = m; }
      var iB = Math.min(idx + 1, ZONES.length - 1);
      var A = ZONES[idx], B = ZONES[iB];
      var ca = centers[idx], cb = centers[iB];
      var seg = cb > ca ? (d - ca) / (cb - ca) : 0;
      seg = smooth(Math.max(0, Math.min(1, seg)));
      pr.rad = A.rad + (B.rad - A.rad) * seg;
      pr.jitter = A.jitter + (B.jitter - A.jitter) * seg;
      pr.ax = (A.ax + (B.ax - A.ax) * seg) * spread.x;
    }

    // Bridges from main.js (separate IIFE, so custom events are the channel):
    // decrypting the hero name surges the flight; an open modal hushes time.
    var warp = 0, warpT = 0, hush = 1, hushT = 1;
    window.addEventListener("mt:decrypt", function () { warp = 1; });
    window.addEventListener("mt:hush", function (e) { hushT = (e.detail && e.detail.on) ? 0.18 : 1; });

    // "Break things on purpose" — clicking the home-lab section detonates the
    // field from the click point; the spring integrator reassembles it.
    var burstT = 0, flash = 0, lastBreak = 0;
    var labEl = document.querySelector(".lab");
    var clickV = new THREE.Vector3();
    if (labEl) {
      labEl.addEventListener("click", function (e) {
        var nowMs = performance.now();
        if (nowMs - lastBreak < 400) return;
        var sel = window.getSelection && window.getSelection();
        if (sel && sel.toString()) return; // the visitor was selecting text
        lastBreak = nowMs;
        // Unproject the click onto the field's z=0 plane (group is identity,
        // so world coordinates are field coordinates).
        clickV.set((e.clientX / window.innerWidth) * 2 - 1, -(e.clientY / window.innerHeight) * 2 + 1, 0.5)
          .unproject(camera).sub(camera.position);
        if (clickV.z > -0.001) return;
        clickV.multiplyScalar(-camera.position.z / clickV.z).add(camera.position);
        for (var i = 0; i < N; i++) {
          var i3 = i * 3;
          var dx = pos[i3] - clickV.x, dy = pos[i3 + 1] - clickV.y, dz = pos[i3 + 2] - clickV.z;
          var d = Math.sqrt(dx * dx + dy * dy + dz * dz) || 1;
          var k = (9 + Math.random() * 5) / (d + 1.5); // hardest near the blast, never zero
          bvel[i3] += (dx / d) * k; bvel[i3 + 1] += (dy / d) * k; bvel[i3 + 2] += (dz / d) * k;
        }
        burstT = 3;
        flash = 1;
      });
    }

    // per-ring scratch, re-profiled every frame as rings travel and recycle
    var ringZ = new Float32Array(RINGS), ringRad = new Float32Array(RINGS);
    var ringJit = new Float32Array(RINGS), ringAx = new Float32Array(RINGS), ringAy = new Float32Array(RINGS);

    var raf = null, lastT = 0, lastSc = -1, t = 0, visible = false, fadedDrawn = false;
    function frame(now) {
      var dt = Math.min((now - lastT) / 1000, 0.05); lastT = now;
      hush += (hushT - hush) * Math.min(1, dt * 3);
      t += dt * hush; // the modal "holds the scene's breath"
      if (warp > 0) { warpT += dt * warp * 26; warp = Math.max(0, warp - dt * 0.8); }
      if (flash > 0) flash = Math.max(0, flash - dt * 1.4);
      var sc = window.scrollY + window.innerHeight / 2;

      // a touch of warp: fast scrolling widens the lens, easing back at rest
      var sv = lastSc < 0 ? 0 : Math.abs(sc - lastSc) / Math.max(dt, 0.001);
      lastSc = sc;
      var fovT = 60 + Math.min(9, sv * 0.004);
      if (Math.abs(camera.fov - fovT) > 0.03) {
        camera.fov += (fovT - camera.fov) * Math.min(1, dt * 5);
        camera.updateProjectionMatrix();
      }

      // "Transmission sent" — approaching the opaque contact panel the field
      // converges to a single bright point, flares, and blinks out.
      var send = 0;
      var sendStart = contactTop - window.innerHeight * 1.15;
      if (sc > sendStart) send = smooth(Math.min(1, (sc - sendStart) / (window.innerHeight * 0.85)));
      var fadeEnv = send < 0.8 ? 1 : Math.max(0, 1 - (send - 0.8) / 0.2);

      if (fadeEnv <= 0.001) { // fully sent — draw one clear frame, then idle cheaply
        if (!fadedDrawn) { pmat.opacity = 0; renderer.render(scene, camera); fadedDrawn = true; }
        raf = requestAnimationFrame(frame); return;
      }
      fadedDrawn = false;

      // re-profile every ring for the document position it now represents
      var T = sc * K + t * 0.55 + warpT;
      for (var r = 0; r < RINGS; r++) {
        var zw = ZNEAR - ((((r * SPACING - T) % DEPTH) + DEPTH) % DEPTH);
        var doc = sc + (ZNEAR - zw) / K;
        profileAt(doc);
        var tight = 1 - Math.min(1, pr.jitter / 2); // corridor-ness
        ringZ[r] = zw;
        ringRad[r] = pr.rad - (r % 5 === 0 ? 0.8 * tight : 0) + Math.sin(r * 1.7) * 0.15; // gate ribs
        ringJit[r] = pr.jitter;
        ringAx[r] = pr.ax;
        ringAy[r] = Math.sin(doc * 0.0011) * 1.5; // the path weaves gently
      }

      var doBurst = burstT > 0;
      var damp = 1;
      if (doBurst) {
        burstT -= dt;
        damp = Math.max(0, 1 - dt * 2.4);
        if (burstT <= 0) { boff.fill(0); bvel.fill(0); doBurst = false; }
      }
      var keep = 1 - send;
      for (var p = 0; p < N; p++) {
        var r2 = (p / RING_N) | 0, p3 = p * 3;
        var ang = ((p % RING_N) / RING_N) * Math.PI * 2 + r2 * 0.4; // slight spiral
        var wob = Math.sin(t * wobble[p * 2 + 1] + wobble[p * 2]) * 0.18;
        var jz = jit[p3 + 2] * ringJit[r2] * 0.6;
        if (ringZ[r2] + jz > ZSAFE) jz = ZSAFE - ringZ[r2]; // never drift into the lens
        pos[p3] = ringAx[r2] + Math.cos(ang) * ringRad[r2] + jit[p3] * ringJit[r2] + wob;
        pos[p3 + 1] = ringAy[r2] + Math.sin(ang) * ringRad[r2] * 0.85 + jit[p3 + 1] * ringJit[r2];
        pos[p3 + 2] = ringZ[r2] + jz + wob * 0.5;
        if (doBurst) { // integrate the blast, sprung back to the flight position
          bvel[p3] = (bvel[p3] - boff[p3] * 7 * dt) * damp;
          bvel[p3 + 1] = (bvel[p3 + 1] - boff[p3 + 1] * 7 * dt) * damp;
          bvel[p3 + 2] = (bvel[p3 + 2] - boff[p3 + 2] * 7 * dt) * damp;
          boff[p3] += bvel[p3] * dt; boff[p3 + 1] += bvel[p3 + 1] * dt; boff[p3 + 2] += bvel[p3 + 2] * dt;
          pos[p3] += boff[p3]; pos[p3 + 1] += boff[p3 + 1]; pos[p3 + 2] += boff[p3 + 2];
        }
        if (send > 0) { pos[p3] *= keep; pos[p3 + 1] *= keep; pos[p3 + 2] *= keep; }
      }
      posAttr.needsUpdate = true;

      // dim while the corridor owns the view — its far field converges right
      // behind the work copy, and the text keeps priority
      profileAt(sc);
      var tightHere = 1 - Math.min(1, pr.jitter / 2);
      pmat.opacity = Math.min(1, baseParticle * (1 + flash * 0.35)) * fadeEnv * (1 - tightHere * 0.28);
      pmat.size = 0.14 * (1 + send * 0.8) * (1 + flash * 0.3);

      if (fine) { cmx += (mx - cmx) * 0.04; cmy += (my - cmy) * 0.04; }
      else { cmx = Math.sin(t * 0.08) * 0.4; cmy = 0; }
      camera.position.x = cmx * 2.6; camera.position.y = -cmy * 1.6; camera.lookAt(0, 0, 0);

      renderer.render(scene, camera);
      if (!live) { live = true; canvas.classList.add("is-live"); document.documentElement.classList.add("has-scene"); }
      raf = requestAnimationFrame(frame);
    }
    var live = false;

    function update() {
      var on = visible && !document.hidden;
      if (on && !raf) { lastT = performance.now(); lastSc = -1; raf = requestAnimationFrame(frame); }
      else if (!on && raf) { cancelAnimationFrame(raf); raf = null; }
    }
    // Render only while the main content (not just one section) is on screen.
    new IntersectionObserver(function (e) { visible = e[0].isIntersecting; update(); })
      .observe(document.querySelector("main") || document.body);
    document.addEventListener("visibilitychange", update);
    canvas.addEventListener("webglcontextlost", function (e) { e.preventDefault(); if (raf) { cancelAnimationFrame(raf); raf = null; } });
    canvas.addEventListener("webglcontextrestored", update);

    applyTheme();
    resize();
    visible = true;
    update();
  }
})();
