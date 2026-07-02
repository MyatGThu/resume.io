/* ===========================================================================
   Myat Thu — Page-wide 3D scroll scene
   One particle system, morphed by scroll across the page:
     hero      → SPHERE  (a wireframe icosahedron + shell of particles)
     stats     → CLOUD   (the sphere disperses into a drifting field)
     work      → SPINE   (particles form a vertical helical timeline)
     certs     → SPHERE  (the object reforms)
     → contact → fades out before the opaque contact section covers it.
   Colours track the active theme. Degrades gracefully (no JS / no WebGL /
   reduced-motion / Data Saver all get the plain gradient site).
   =========================================================================== */
(function () {
  "use strict";

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduceMotion) return;

  // Only meaningful on the home page (the scene's milestones live there).
  if (!document.querySelector(".hero") || !document.querySelector(".work")) return;

  var conn = navigator.connection;
  if (conn && conn.saveData) return;

  // Three.js is the page's heaviest asset — load it lazily, off the critical path.
  var lib = document.createElement("script");
  lib.src = "vendor/three.slim.min.js";
  lib.async = true;
  lib.onload = function () { if (typeof window.THREE !== "undefined") init(); };
  document.head.appendChild(lib);

  var SPHERE = 0, CLOUD = 1, SPINE = 2;

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

    var group = new THREE.Group();
    scene.add(group);

    var icosa = new THREE.LineSegments(
      new THREE.EdgesGeometry(new THREE.IcosahedronGeometry(7.2, 1)),
      new THREE.LineBasicMaterial({ transparent: true, opacity: 0 })
    );
    group.add(icosa);

    var N = small ? 460 : 1120;
    var sphere = new Float32Array(N * 3);   // Fibonacci sphere shell
    var cloudN = new Float32Array(N * 3);   // normalised random cloud (scaled by spread)
    var spine = new Float32Array(N * 3);    // vertical helix timeline
    var wobble = new Float32Array(N * 2);   // per-particle idle-drift phase/speed
    var GOLD = Math.PI * (3 - Math.sqrt(5));
    for (var i = 0; i < N; i++) {
      var i3 = i * 3;
      // sphere
      var y = 1 - (i / (N - 1)) * 2, r = Math.sqrt(Math.max(0, 1 - y * y)), th = i * GOLD;
      sphere[i3] = Math.cos(th) * r * 7.2; sphere[i3 + 1] = y * 7.2; sphere[i3 + 2] = Math.sin(th) * r * 7.2;
      // cloud (normalised -1..1)
      cloudN[i3] = Math.random() * 2 - 1; cloudN[i3 + 1] = Math.random() * 2 - 1; cloudN[i3 + 2] = Math.random() * 2 - 1;
      // spine — tall helix
      var f = i / (N - 1), ang = f * Math.PI * 9, rad = 2.3 + Math.sin(f * Math.PI * 22) * 0.5;
      spine[i3] = Math.cos(ang) * rad; spine[i3 + 1] = (0.5 - f) * 40; spine[i3 + 2] = Math.sin(ang) * rad;
      wobble[i * 2] = Math.random() * Math.PI * 2; wobble[i * 2 + 1] = 0.4 + Math.random() * 0.8;
    }

    // "Click to break it" — per-particle burst offset + velocity, sprung back
    // toward the scroll-morph targets so scroll behaviour restores itself.
    var boff = new Float32Array(N * 3);
    var bvel = new Float32Array(N * 3);

    var pos = new Float32Array(N * 3);
    var geom = new THREE.BufferGeometry();
    var posAttr = new THREE.BufferAttribute(pos, 3);
    posAttr.setUsage(THREE.DynamicDrawUsage);
    geom.setAttribute("position", posAttr);
    var pmat = new THREE.PointsMaterial({ size: 0.13, sizeAttenuation: true, transparent: true, opacity: 0.6, depthWrite: false });
    var points = new THREE.Points(geom, pmat);
    group.add(points);

    // Scroll milestones (DOM order). Each has a target formation and a world
    // centre; the field lerps between consecutive milestones as you scroll.
    var MILES = [
      { el: document.querySelector(".hero"), form: SPHERE, c: [9, 1, 0] },
      { el: document.querySelector(".stats"), form: CLOUD, c: [0, 0, 0] },
      { el: document.querySelector(".work"), form: SPINE, c: [7.5, 0, -2] },
      { el: document.querySelector(".certs"), form: SPHERE, c: [-2, 0, 0] }
    ].filter(function (m) { return m.el; });
    var contactEl = document.querySelector("#contact") || document.querySelector(".contact");

    var spread = { x: 20, y: 13, z: 8 };
    function computeBounds() {
      var halfY = Math.tan((camera.fov * Math.PI) / 360) * camera.position.z;
      spread.y = halfY * 0.92; spread.x = halfY * camera.aspect * 1.15; spread.z = 8;
      MILES[0].c[0] = spread.x * 0.42; // keep the hero sphere to the right of the title
      if (MILES[2]) MILES[2].c[0] = spread.x * 0.32;
    }

    // Milestone / contact positions in document space, cached so the frame
    // loop never calls getBoundingClientRect (avoids per-frame layout thrash).
    var centers = [], contactTop = Infinity;
    function computeCenters() {
      for (var m = 0; m < MILES.length; m++) {
        var r = MILES[m].el.getBoundingClientRect();
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
      icosa.material.color.set(cs.getPropertyValue("--ink").trim() || "#181511");
      baseIcosa = dark ? 0.34 : 0.16;
    }
    var baseParticle = 0.62, baseIcosa = 0.16;
    new MutationObserver(applyTheme).observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });

    var mx = 0, my = 0, cmx = 0, cmy = 0;
    if (fine) {
      window.addEventListener("mousemove", function (e) {
        mx = (e.clientX / window.innerWidth) * 2 - 1;
        my = (e.clientY / window.innerHeight) * 2 - 1;
      });
    }

    function smooth(x) { return x * x * (3 - 2 * x); }
    // read a particle's target xyz for a formation into out[0..2]
    function target(form, i, out) {
      var i3 = i * 3;
      if (form === SPHERE) { out[0] = sphere[i3]; out[1] = sphere[i3 + 1]; out[2] = sphere[i3 + 2]; }
      else if (form === SPINE) { out[0] = spine[i3]; out[1] = spine[i3 + 1]; out[2] = spine[i3 + 2]; }
      else { out[0] = cloudN[i3] * spread.x; out[1] = cloudN[i3 + 1] * spread.y; out[2] = cloudN[i3 + 2] * spread.z; }
    }

    // Bridges from main.js (separate IIFE, so custom events are the channel):
    // a decrypt of the hero name pulses the sphere; an open modal hushes time.
    var pulse = 0, hush = 1, hushT = 1;
    window.addEventListener("mt:decrypt", function () { pulse = 1; });
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
        // Unproject the click onto the field's z=0 plane, then into the
        // group's local space (its rotation accumulates, so world coords
        // would aim the burst wrong after a while on the page).
        clickV.set((e.clientX / window.innerWidth) * 2 - 1, -(e.clientY / window.innerHeight) * 2 + 1, 0.5)
          .unproject(camera).sub(camera.position);
        if (clickV.z > -0.001) return;
        clickV.multiplyScalar(-camera.position.z / clickV.z).add(camera.position);
        group.worldToLocal(clickV);
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

    var raf = null, lastT = 0, t = 0, visible = false, fadedDrawn = false, ta = [0, 0, 0], tb = [0, 0, 0];
    function frame(now) {
      var dt = Math.min((now - lastT) / 1000, 0.05); lastT = now;
      hush += (hushT - hush) * Math.min(1, dt * 3);
      t += dt * hush; // the modal "holds the scene's breath"
      if (pulse > 0) pulse = Math.max(0, pulse - dt * 0.9);
      var sc = window.scrollY + window.innerHeight / 2;

      // find the active milestone segment (cached document-space centres)
      var idx = 0;
      for (var m = 0; m < MILES.length - 1; m++) { if (sc >= centers[m]) idx = m; }
      var iB = Math.min(idx + 1, MILES.length - 1);
      var A = MILES[idx], B = MILES[iB];
      var ca = centers[idx], cb = centers[iB];
      var seg = cb > ca ? (sc - ca) / (cb - ca) : 0;
      seg = smooth(Math.max(0, Math.min(1, seg)));

      // "Transmission sent" — approaching the opaque contact panel the field
      // converges to a single bright point, flares, and blinks out.
      var send = 0;
      var sendStart = contactTop - window.innerHeight * 1.15;
      if (sc > sendStart) send = smooth(Math.min(1, (sc - sendStart) / (window.innerHeight * 0.85)));
      var fadeEnv = send < 0.8 ? 1 : Math.max(0, 1 - (send - 0.8) / 0.2);

      if (fadeEnv <= 0.001) { // fully sent — draw one clear frame, then idle cheaply
        if (!fadedDrawn) { pmat.opacity = 0; icosa.material.opacity = 0; renderer.render(scene, camera); fadedDrawn = true; }
        raf = requestAnimationFrame(frame); return;
      }
      fadedDrawn = false;

      var cxw = A.c[0] + (B.c[0] - A.c[0]) * seg;
      var cyw = A.c[1] + (B.c[1] - A.c[1]) * seg;
      var czw = A.c[2] + (B.c[2] - A.c[2]) * seg;
      var spineW = ((A.form === SPINE ? (1 - seg) : 0) + (B.form === SPINE ? seg : 0)); // helix-ness
      var sphereness = ((A.form === SPHERE ? (1 - seg) : 0) + (B.form === SPHERE ? seg : 0));

      var doPulse = pulse > 0.001 && sphereness > 0.01;
      var wavePhase = (1 - pulse) * 9;
      var keep = 1 - send;
      var doBurst = burstT > 0;
      var damp = 1;
      if (doBurst) {
        burstT -= dt;
        damp = Math.max(0, 1 - dt * 2.4);
        if (burstT <= 0) { boff.fill(0); bvel.fill(0); doBurst = false; }
      }
      if (flash > 0) flash = Math.max(0, flash - dt * 1.4);
      for (var i = 0; i < N; i++) {
        target(A.form, i, ta); target(B.form, i, tb);
        var i3 = i * 3;
        var wob = Math.sin(t * wobble[i * 2 + 1] + wobble[i * 2]) * (0.15 + spineW * 0.25);
        pos[i3] = ta[0] + (tb[0] - ta[0]) * seg + cxw + wob;
        pos[i3 + 1] = ta[1] + (tb[1] - ta[1]) * seg + cyw;
        pos[i3 + 2] = ta[2] + (tb[2] - ta[2]) * seg + czw + wob;
        if (doPulse) { // radial shockwave along the sphere normal
          var amp = Math.sin(wavePhase - sphere[i3 + 1] * 0.35) * pulse * 0.9 * sphereness;
          pos[i3] += (sphere[i3] / 7.2) * amp;
          pos[i3 + 1] += (sphere[i3 + 1] / 7.2) * amp;
          pos[i3 + 2] += (sphere[i3 + 2] / 7.2) * amp;
        }
        if (doBurst) { // integrate the blast, sprung back to the morph target
          bvel[i3] = (bvel[i3] - boff[i3] * 7 * dt) * damp;
          bvel[i3 + 1] = (bvel[i3 + 1] - boff[i3 + 1] * 7 * dt) * damp;
          bvel[i3 + 2] = (bvel[i3 + 2] - boff[i3 + 2] * 7 * dt) * damp;
          boff[i3] += bvel[i3] * dt; boff[i3 + 1] += bvel[i3 + 1] * dt; boff[i3 + 2] += bvel[i3 + 2] * dt;
          pos[i3] += boff[i3]; pos[i3 + 1] += boff[i3 + 1]; pos[i3 + 2] += boff[i3 + 2];
        }
        if (send > 0) { pos[i3] *= keep; pos[i3 + 1] *= keep; pos[i3 + 2] *= keep; }
      }
      posAttr.needsUpdate = true;

      // flash composes as multipliers — milestone math owns these every frame
      icosa.material.opacity = Math.min(1, baseIcosa * sphereness + pulse * 0.3 * sphereness) * fadeEnv * keep * (1 - flash);
      icosa.position.set(cxw, cyw, czw);
      icosa.scale.setScalar((0.6 + sphereness * 0.4 + Math.sin(t * 0.6) * 0.03) * Math.max(0.05, 1 - send * 0.95) * (1 + flash * 0.9));
      icosa.visible = icosa.material.opacity > 0.002;
      pmat.opacity = Math.min(1, baseParticle * (1 + flash * 0.35)) * fadeEnv;
      pmat.size = (0.13 - spineW * 0.03) * (1 + send * 0.8) * (1 + flash * 0.3);

      group.rotation.y = t * 0.05 + sphereness * Math.sin(t * 0.2) * 0.15;
      icosa.rotation.set(t * 0.12, t * 0.16, 0);

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
      if (on && !raf) { lastT = performance.now(); raf = requestAnimationFrame(frame); }
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
