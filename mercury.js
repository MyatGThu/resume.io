/* ===========================================================================
   MERCURY — the living-metal résumé.
   One raymarched blob of liquid chrome performs the whole site: it drops in
   with the splash intro, breathes beside the bio, bursts into a grid of
   droplets for the toolbox, orbits as a ring of satellites for the career,
   dents and self-heals in the lab, presses out four medallions for the
   credentials, then melts into a rippling mirror puddle at contact.
   Three.js fullscreen ShaderMaterial quad; chapter states blend continuously
   with scroll, so the metal is always mid-transformation.
   =========================================================================== */
(function () {
  "use strict";

  var html = document.documentElement;
  if (!html.classList.contains("js")) return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  if (navigator.connection && navigator.connection.saveData) return;
  var probe = document.createElement("canvas");
  var glOK = !!(probe.getContext("webgl2") || probe.getContext("webgl"));
  if (!glOK) return;

  var chapters = document.querySelectorAll("main [data-chapter]");
  if (chapters.length < 3) return; // home page only

  var script = document.createElement("script");
  script.src = "vendor/three.mercury.min.js";
  script.async = true;
  script.onload = init;
  document.head.appendChild(script);

  var MAXB = 10;

  /* Per-chapter blob choreography: up to MAXB bodies [x, y, z, r] plus the
     material/space params the shader blends between. Positions are in view
     units (the visible frame is roughly x ±4.8, y ±3.1 on desktop). */
  function ring(n, rad, r, cx, cy) {
    var out = [];
    for (var i = 0; i < n; i++) {
      var a = (i / n) * Math.PI * 2;
      out.push([cx + Math.cos(a) * rad, cy + Math.sin(a) * rad * 0.72, 0, r]);
    }
    return out;
  }
  function grid(cols, rows, gap, r, cx, cy) {
    var out = [];
    for (var y = 0; y < rows; y++)
      for (var x = 0; x < cols; x++)
        out.push([cx + (x - (cols - 1) / 2) * gap, cy + ((rows - 1) / 2 - y) * gap * 0.86, 0, r]);
    return out;
  }
  var CONFIGS = [
    { b: [[0, 0.35, 0, 1.5], [-2.1, -1.15, 0, 0.3], [2.25, 1.3, 0, 0.24]], k: 0.9, ripple: 0.0, off: [0, 0], puddle: 0, hue: 0.0 },   // arrival
    { b: [[1.9, 0.1, 0, 1.15], [1.0, -1.0, 0, 0.42], [2.9, 1.05, 0, 0.3]], k: 0.7, ripple: 0.022, off: [0, 0], puddle: 0, hue: 0.7 }, // the person
    { b: grid(3, 3, 1.35, 0.44, 0, 0.1), k: 0.28, ripple: 0.0, off: [0, 0], puddle: 0, hue: 1.6 },                                    // the craft
    { b: ring(6, 2.35, 0.4, 0, 0.1).concat([[0, 0.1, 0, 0.78]]), k: 0.34, ripple: 0.0, off: [0, 0], puddle: 0, hue: 2.6 },            // the orbit
    { b: [[-2.0, 0.1, 0, 1.32], [-0.6, -1.2, 0, 0.34]], k: 0.75, ripple: 0.012, off: [0, 0], puddle: 0, hue: 3.6 },                   // the proof
    { b: [[-2.55, 0, 0, 0.56], [-0.85, 0, 0, 0.56], [0.85, 0, 0, 0.56], [2.55, 0, 0, 0.56]], k: 0.2, ripple: 0.0, off: [0, 0.2], puddle: 0, hue: 4.5 }, // the seals
    { b: [[0, -1.9, 0, 1.7]], k: 0.9, ripple: 0.05, off: [0, 0], puddle: 1, hue: 5.4 }                                                // connect
  ];

  function init() {
    var T = window.THREE;
    if (!T) return;

    var small = window.matchMedia("(max-width: 820px)").matches;
    var renderer;
    try {
      renderer = new T.WebGLRenderer({ antialias: false, alpha: true, powerPreference: "high-performance" });
    } catch (e) { return; }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, small ? 1.2 : 1.6) * (small ? 0.72 : 0.82));
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.domElement.className = "mercury";
    renderer.domElement.setAttribute("aria-hidden", "true");
    document.body.appendChild(renderer.domElement);

    var STEPS = small ? 40 : 56;

    // Flat float array for the vec4 blob uniform — no struct plumbing needed.
    var bArr = new Float32Array(MAXB * 4);
    var uniforms = {
      uTime: { value: 0 },
      uRes: { value: new T.Vector2(window.innerWidth, window.innerHeight) },
      uBlobs: { value: bArr },
      uN: { value: 3 },
      uK: { value: 0.9 },
      uOff: { value: new T.Vector2(0, 0) },
      uPuddle: { value: 0 },
      uRipple: { value: 0 },
      uHue: { value: 0 },
      uStretch: { value: new T.Vector2(1, 1) },
      uDent: { value: [0, 0, 0, 0] },
      uMouse: { value: new T.Vector2(0, 0) },
      uAlpha: { value: 0 }
    };

    var frag = [
      "precision highp float;",
      "uniform float uTime, uK, uPuddle, uRipple, uHue, uAlpha, uN;",
      "uniform vec2 uRes, uOff, uStretch, uMouse;",
      "uniform vec4 uBlobs[" + MAXB + "];",
      "uniform vec4 uDent;",
      "float smin(float a, float b, float k){ float h = clamp(0.5 + 0.5*(b-a)/k, 0.0, 1.0); return mix(b, a, h) - k*h*(1.0-h); }",
      "float map(vec3 p){",
      "  p.xy -= uOff;",
      "  p.xy /= uStretch;",
      "  float d = 1e9;",
      "  for (int i = 0; i < " + MAXB + "; i++) {",
      "    if (float(i) >= uN) break;",
      "    vec4 b = uBlobs[i];",
      "    d = smin(d, length(p - b.xyz) - b.w, uK);",
      "  }",
      "  d *= min(uStretch.x, uStretch.y);",
      "  if (uPuddle > 0.001) {",
      "    vec3 q = p - vec3(0.0, -1.9, 0.0);",
      "    float pd = (length(q / vec3(3.3, 0.34, 1.6)) - 1.0) * 0.28;",
      "    pd += sin(q.x*4.5 - uTime*1.4)*cos(q.z*4.0 + uTime)*0.012;",
      "    float mr = length(q.xz - uMouse) ;",
      "    pd += 0.05 * sin(mr*9.0 - uTime*5.0) * exp(-mr*1.6) * uPuddle;",
      "    d = mix(d, pd, uPuddle);",
      "  }",
      "  if (uRipple > 0.001) d += sin(p.x*7.0 + uTime*1.1)*sin(p.y*6.0 - uTime*0.8)*uRipple;",
      "  if (uDent.w > 0.001) d += uDent.w * exp(-3.0*dot(p - uDent.xyz, p - uDent.xyz));",
      "  return d;",
      "}",
      "vec3 normalAt(vec3 p){",
      "  vec2 e = vec2(0.004, -0.004);",
      "  return normalize(e.xyy*map(p+e.xyy) + e.yyx*map(p+e.yyx) + e.yxy*map(p+e.yxy) + e.xxx*map(p+e.xxx));",
      "}",
      "vec3 env(vec3 d){",
      "  float h = d.y*0.5 + 0.5;",
      "  vec3 base = mix(vec3(0.60, 0.595, 0.585), vec3(1.02, 1.01, 1.0), h);",
      "  float band = sin(d.x*2.6 + d.y*5.5 + d.z*1.7 + uTime*0.12);",
      "  vec3 iri = 0.5 + 0.5*cos(6.2831*(band*0.22 + vec3(0.0, 0.33, 0.67)) + uHue);",
      "  base += iri * 0.20 * smoothstep(0.15, 1.0, abs(band));",
      "  base += vec3(1.0, 0.98, 0.95) * pow(max(dot(d, normalize(vec3(0.55, 0.75, 0.35))), 0.0), 30.0) * 1.4;",
      "  base += vec3(0.9, 0.95, 1.0) * pow(max(dot(d, normalize(vec3(-0.6, 0.2, 0.45))), 0.0), 40.0) * 0.7;",
      "  return base;",
      "}",
      "void main(){",
      "  vec2 uv = (gl_FragCoord.xy * 2.0 - uRes) / uRes.y;",
      "  vec3 ro = vec3(0.0, 0.0, 5.0);",
      "  vec3 rd = normalize(vec3(uv, -1.6));",
      "  float t = 0.0; float d; vec3 p; bool hit = false; float glow = 1e9;",
      "  for (int i = 0; i < " + STEPS + "; i++) {",
      "    p = ro + rd * t;",
      "    d = map(p);",
      "    glow = min(glow, d);",
      "    if (d < 0.0025 * t) { hit = true; break; }",
      "    t += d * 0.92;",
      "    if (t > 14.0) break;",
      "  }",
      "  if (!hit) {",
      "    float halo = exp(-glow*22.0) * 0.10;",
      "    gl_FragColor = vec4(vec3(0.08, 0.09, 0.11), halo * uAlpha);",
      "    return;",
      "  }",
      "  vec3 n = normalAt(p);",
      "  vec3 r = reflect(rd, n);",
      "  float fre = pow(1.0 - max(dot(-rd, n), 0.0), 3.0);",
      "  vec3 col = env(r) * (0.62 + fre*0.55);",
      "  float ao = clamp(map(p + n*0.22) / 0.22, 0.0, 1.0);",
      "  col *= 0.62 + ao*0.38;",
      "  col = pow(col, vec3(0.92));",
      "  gl_FragColor = vec4(col, uAlpha);",
      "}"
    ].join("\n");

    var mat = new T.ShaderMaterial({
      uniforms: uniforms,
      vertexShader: "void main(){ gl_Position = vec4(position.xy, 0.0, 1.0); }",
      fragmentShader: frag,
      transparent: true,
      depthTest: false,
      depthWrite: false
    });
    var scene = new T.Scene();
    scene.add(new T.Mesh(new T.PlaneGeometry(2, 2), mat));
    var cam = new T.OrthographicCamera(-1, 1, 1, -1, 0, 1);

    /* ---------- Choreography state ---------- */
    var pos = new Float32Array(MAXB * 3);
    var vel = new Float32Array(MAXB * 3);
    var rad = new Float32Array(MAXB);
    for (var i = 0; i < MAXB; i++) { pos[i * 3] = 0; pos[i * 3 + 1] = 8 + i * 0.7; rad[i] = 0; } // parked above: the splash drop
    var released = false;
    setTimeout(function () { released = true; }, html.classList.contains("is-entering") ? 300 : 1750);

    var secs = Array.prototype.slice.call(chapters);
    var centers = [];
    function measure() {
      centers = secs.map(function (s) {
        var r = s.getBoundingClientRect();
        return r.top + window.scrollY + r.height / 2;
      });
    }
    measure();
    window.addEventListener("resize", function () {
      measure();
      uniforms.uRes.value.set(window.innerWidth, window.innerHeight);
      renderer.setSize(window.innerWidth, window.innerHeight);
    });

    // Blend chapter configs by document position (smoothstep between centres).
    var target = { b: [], k: 0.9, ripple: 0, off: [0, 0], puddle: 0, hue: 0 };
    function lerp(a, b, t) { return a + (b - a) * t; }
    function blendConfigs(sc) {
      var mid = sc + window.innerHeight * 0.5;
      var i = 0;
      while (i < centers.length - 1 && mid > centers[i + 1]) i++;
      var A = CONFIGS[Math.min(i, CONFIGS.length - 1)];
      var B = CONFIGS[Math.min(i + 1, CONFIGS.length - 1)];
      var span = Math.max(1, (centers[Math.min(i + 1, centers.length - 1)] - centers[i]));
      var f = Math.min(1, Math.max(0, (mid - centers[i]) / span));
      f = f * f * (3 - 2 * f);
      var n = Math.max(A.b.length, B.b.length);
      target.b.length = 0;
      for (var j = 0; j < n; j++) {
        // A body with no counterpart shrinks into (or grows out of) its nearest sibling.
        var a = A.b[Math.min(j, A.b.length - 1)];
        var bb = B.b[Math.min(j, B.b.length - 1)];
        var ra = j < A.b.length ? a[3] : 0;
        var rb = j < B.b.length ? bb[3] : 0;
        target.b.push([lerp(a[0], bb[0], f), lerp(a[1], bb[1], f), lerp(a[2], bb[2], f), lerp(ra, rb, f)]);
      }
      target.k = lerp(A.k, B.k, f);
      target.ripple = lerp(A.ripple, B.ripple, f);
      target.off[0] = lerp(A.off[0], B.off[0], f);
      target.off[1] = lerp(A.off[1], B.off[1], f);
      target.puddle = lerp(A.puddle, B.puddle, f);
      target.hue = lerp(A.hue, B.hue, f);
      return n;
    }

    /* ---------- Interaction ---------- */
    var VIEW = 3.125; // world units per NDC unit at the z=0 plane
    function worldX(cx) { return ((cx / window.innerWidth) * 2 - 1) * VIEW * (window.innerWidth / window.innerHeight); }
    function worldY(cy) { return -(((cy / window.innerHeight) * 2 - 1) * VIEW); }
    var mx = 0, my = 0;
    window.addEventListener("pointermove", function (e) {
      mx = worldX(e.clientX); my = worldY(e.clientY);
      uniforms.uMouse.value.set(mx * 0.35, 0);
    }, { passive: true });

    var dent = [0, 0, 0, 0];
    var lab = document.querySelector(".lab");
    var lastBreak = 0;
    if (lab) lab.addEventListener("click", function (e) {
      var now = performance.now();
      if (now - lastBreak < 350) return;
      var s = window.getSelection && window.getSelection();
      if (s && s.type === "Range") return;
      lastBreak = now;
      dent[0] = worldX(e.clientX) - uniforms.uOff.value.x;
      dent[1] = worldY(e.clientY) - uniforms.uOff.value.y;
      dent[2] = 0.9;
      dent[3] = 0.62;
    });

    var hushed = false;
    window.addEventListener("mt:hush", function (e) { hushed = !!(e.detail && e.detail.on); });

    /* ---------- Frame loop ---------- */
    var lastSc = -1, lastT = performance.now(), running = true, shown = false;
    document.addEventListener("visibilitychange", function () { running = !document.hidden; if (running) { lastT = performance.now(); lastSc = -1; tick(); } });

    function tick() {
      if (!running) return;
      requestAnimationFrame(tick);
      var now = performance.now();
      var dt = Math.min(0.05, (now - lastT) / 1000);
      lastT = now;
      var timeScale = hushed ? 0.25 : 1;
      uniforms.uTime.value += dt * timeScale;

      var sc = window.scrollY;
      var v = lastSc < 0 ? 0 : (sc - lastSc) / Math.max(dt, 0.001);
      lastSc = sc;

      var n = blendConfigs(sc);
      uniforms.uN.value = n;
      uniforms.uK.value += (target.k - uniforms.uK.value) * Math.min(1, dt * 6);
      uniforms.uRipple.value += (target.ripple - uniforms.uRipple.value) * Math.min(1, dt * 4);
      uniforms.uPuddle.value += (target.puddle - uniforms.uPuddle.value) * Math.min(1, dt * 3);
      uniforms.uHue.value += (target.hue - uniforms.uHue.value) * Math.min(1, dt * 3);
      uniforms.uOff.value.x += (target.off[0] - uniforms.uOff.value.x) * Math.min(1, dt * 4);
      uniforms.uOff.value.y += (target.off[1] - uniforms.uOff.value.y) * Math.min(1, dt * 4);

      // Scroll velocity stretches the metal; volume is roughly conserved.
      var sy = 1 + Math.min(0.5, Math.abs(v) * 0.00035);
      uniforms.uStretch.value.y += (sy - uniforms.uStretch.value.y) * Math.min(1, dt * 7);
      uniforms.uStretch.value.x = 1 / Math.sqrt(uniforms.uStretch.value.y);

      // Springy bodies: they lag their targets, so every chapter change sloshes.
      for (var i = 0; i < MAXB; i++) {
        var tx = 0, ty = -9, r = 0;
        if (i < target.b.length) { tx = target.b[i][0]; ty = target.b[i][1]; r = target.b[i][3]; }
        if (!released) { tx = pos[i * 3]; ty = pos[i * 3 + 1]; }
        // The cursor tugs the smaller droplets a little.
        if (released && r > 0.01 && r < 0.6) {
          var dx = mx - tx, dy = my - ty, q = Math.max(0.4, dx * dx + dy * dy);
          tx += dx / q * 0.14; ty += dy / q * 0.14;
        }
        var k = 26, damp = Math.exp(-5.2 * dt);
        vel[i * 3] = (vel[i * 3] + (tx - pos[i * 3]) * k * dt) * damp;
        vel[i * 3 + 1] = (vel[i * 3 + 1] + (ty - pos[i * 3 + 1]) * k * dt) * damp;
        pos[i * 3] += vel[i * 3] * dt;
        pos[i * 3 + 1] += vel[i * 3 + 1] * dt;
        var wob = Math.sin(uniforms.uTime.value * 1.3 + i * 2.1) * 0.045;
        bArr[i * 4] = pos[i * 3];
        bArr[i * 4 + 1] = pos[i * 3 + 1] + wob;
        bArr[i * 4 + 2] = 0;
        bArr[i * 4 + 3] += (r - bArr[i * 4 + 3]) * Math.min(1, dt * 5);
      }

      // Dent heals itself.
      dent[3] *= Math.exp(-2.2 * dt);
      uniforms.uDent.value = dent;

      if (released && uniforms.uAlpha.value < 1) uniforms.uAlpha.value = Math.min(1, uniforms.uAlpha.value + dt * 1.4);

      renderer.render(scene, cam);
      if (!shown) {
        shown = true;
        renderer.domElement.classList.add("is-live");
        html.classList.add("has-scene");
      }
    }
    tick();

    renderer.domElement.addEventListener("webglcontextlost", function (e) { e.preventDefault(); running = false; });
    renderer.domElement.addEventListener("webglcontextrestored", function () { running = true; lastT = performance.now(); tick(); });
  }
})();
