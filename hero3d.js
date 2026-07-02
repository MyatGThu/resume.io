/* ===========================================================================
   Myat Thu — Hero 3D signal field
   A subtle Three.js scene behind the hero: rising accent particles and a
   slowly turning wireframe icosahedron, tinted by the active theme.
   Degrades gracefully (no WebGL / no JS / reduced-motion shows the plain hero).
   =========================================================================== */
(function () {
  "use strict";

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduceMotion) return;

  var hero = document.querySelector(".hero");
  if (!hero) return;

  // A decorative background isn't worth the bytes on a metered connection.
  var conn = navigator.connection;
  if (conn && conn.saveData) return;

  // Three.js is the heaviest asset on the page (134KB gzip), so it loads
  // lazily — only once we know the scene will actually run — instead of
  // costing every visitor download + parse via a static script tag.
  var lib = document.createElement("script");
  lib.src = "vendor/three.slim.min.js";
  lib.async = true;
  lib.onload = function () { if (typeof window.THREE !== "undefined") init(); };
  document.head.appendChild(lib);

  function init() {
    var renderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "low-power" });
    } catch (e) { return; } // no WebGL — the gradient hero stands on its own

    var fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    var canvas = renderer.domElement;
    canvas.className = "hero3d";
    canvas.setAttribute("aria-hidden", "true");
    hero.appendChild(canvas);

    var scene = new THREE.Scene();
    var camera = new THREE.PerspectiveCamera(60, 1, 0.1, 120);
    camera.position.set(0, 0, 26);

    var icosa = new THREE.LineSegments(
      new THREE.EdgesGeometry(new THREE.IcosahedronGeometry(7.2, 1)),
      new THREE.LineBasicMaterial({ transparent: true })
    );
    scene.add(icosa);

    var COUNT = Math.max(280, Math.min(760, Math.round(window.innerWidth * 0.45)));
    var pos = new Float32Array(COUNT * 3);
    var vel = new Float32Array(COUNT);
    var geom = new THREE.BufferGeometry();
    var posAttr = new THREE.BufferAttribute(pos, 3);
    posAttr.setUsage(THREE.DynamicDrawUsage); // rewritten every frame
    geom.setAttribute("position", posAttr);
    var pmat = new THREE.PointsMaterial({ size: 0.11, sizeAttenuation: true, transparent: true, depthWrite: false });
    var points = new THREE.Points(geom, pmat);
    scene.add(points);

    /* World-space bounds sized to the camera frustum so the field fills any
       aspect ratio; recomputed on real resizes. */
    var bounds = { x: 30, y: 16 };
    function seed() {
      for (var i = 0; i < COUNT; i++) {
        pos[i * 3] = THREE.MathUtils.randFloatSpread(bounds.x * 2);
        pos[i * 3 + 1] = THREE.MathUtils.randFloatSpread(bounds.y * 2);
        pos[i * 3 + 2] = THREE.MathUtils.randFloatSpread(18);
        vel[i] = THREE.MathUtils.randFloat(0.25, 0.9);
      }
      posAttr.needsUpdate = true;
    }

    var lastW = 0, lastH = 0;
    function resize() {
      var w = hero.clientWidth, h = hero.clientHeight;
      // Mobile URL-bar show/hide fires resize with unchanged dimensions —
      // bail early so the field doesn't reset mid-scroll.
      if (!w || !h || (w === lastW && h === lastH)) return;
      var firstRun = !lastW;
      lastW = w; lastH = h;
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, fine ? 2 : 1.5));
      renderer.setSize(w, h);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      var prevX = bounds.x, prevY = bounds.y;
      var halfY = Math.tan((camera.fov * Math.PI) / 360) * camera.position.z;
      bounds.y = halfY + 1;
      bounds.x = halfY * camera.aspect * 1.1 + 1;
      icosa.position.set(bounds.x * 0.35, 1, -4);
      if (firstRun) { seed(); return; }
      // Rescale existing positions into the new bounds — no visible teleport.
      var sx = bounds.x / prevX, sy = bounds.y / prevY;
      for (var i = 0; i < COUNT; i++) {
        pos[i * 3] *= sx;
        pos[i * 3 + 1] *= sy;
      }
      posAttr.needsUpdate = true;
    }
    var resizeTimer = null;
    window.addEventListener("resize", function () {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(resize, 150);
    });

    /* Colours come from the active theme; opacity steps down on light themes. */
    function applyTheme() {
      var cs = getComputedStyle(document.documentElement);
      var bone = new THREE.Color(cs.getPropertyValue("--bone").trim() || "#f1ede4");
      var dark = (0.2126 * bone.r + 0.7152 * bone.g + 0.0722 * bone.b) < 0.5;
      pmat.color.set(cs.getPropertyValue("--accent").trim() || "#b8492c");
      pmat.opacity = dark ? 0.55 : 0.6;
      icosa.material.color.set(cs.getPropertyValue("--ink").trim() || "#181511");
      icosa.material.opacity = dark ? 0.3 : 0.16;
    }
    new MutationObserver(applyTheme).observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });

    var raf = null, last = 0, t = 0, live = false;
    var mx = 0, my = 0, cx = 0, cy = 0;
    if (fine) {
      window.addEventListener("mousemove", function (e) {
        mx = (e.clientX / window.innerWidth) * 2 - 1;
        my = (e.clientY / window.innerHeight) * 2 - 1;
      });
    }

    function frame(now) {
      var dt = Math.min((now - last) / 1000, 0.05);
      last = now; t += dt;

      icosa.rotation.x = t * 0.1;
      icosa.rotation.y = t * 0.16;
      icosa.scale.setScalar(1 + Math.sin(t * 0.6) * 0.035);

      for (var i = 0; i < COUNT; i++) {
        var iy = i * 3 + 1;
        pos[iy] += vel[i] * dt;
        if (pos[iy] > bounds.y) pos[iy] = -bounds.y;
      }
      posAttr.needsUpdate = true;

      if (fine) { cx += (mx - cx) * 0.04; cy += (my - cy) * 0.04; }
      else { cx = Math.sin(t * 0.1) * 0.5; cy = Math.cos(t * 0.08) * 0.3; }
      camera.position.x = cx * 2.4;
      camera.position.y = -cy * 1.5;
      camera.lookAt(0, 0, 0);

      renderer.render(scene, camera);
      if (!live) { live = true; canvas.classList.add("is-live"); } // fade in on first frame
      raf = requestAnimationFrame(frame);
    }

    /* Only burn frames while the hero is on screen and the tab is visible. */
    var inView = false;
    function update() {
      var on = inView && !document.hidden;
      if (on && !raf) { last = performance.now(); raf = requestAnimationFrame(frame); }
      else if (!on && raf) { cancelAnimationFrame(raf); raf = null; }
    }
    new IntersectionObserver(function (entries) { inView = entries[0].isIntersecting; update(); }).observe(hero);
    document.addEventListener("visibilitychange", update);
    canvas.addEventListener("webglcontextlost", function (e) { e.preventDefault(); if (raf) { cancelAnimationFrame(raf); raf = null; } });
    canvas.addEventListener("webglcontextrestored", update);

    applyTheme();
    resize();
    update();
  }
})();
