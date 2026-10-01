/* The Aspis: a bronze hoplite shield bearing the MT monogram, rendered live behind the
   opening titles and shot in five tableaux across the trailer beats. Backlit, eclipsed,
   with god rays past the rim; the light field behind carries the embers. Loaded by main.js after first paint.

   vendor/three.min.js is three@0.186.1 tree-shaken to the names imported below:
   esbuild entry.js --bundle --minify --format=esm   (entry re-exports exactly these names) */
import {
  WebGLRenderer, WebGLRenderTarget, Scene, PerspectiveCamera, OrthographicCamera, Group, Mesh, InstancedMesh,
  LatheGeometry, ExtrudeGeometry, Shape, TorusGeometry, SphereGeometry, PlaneGeometry, MeshStandardMaterial,
  MeshBasicMaterial, ShaderMaterial, CanvasTexture, Vector2, Vector3, Object3D, DirectionalLight,
  PMREMGenerator, CustomBlending, OneFactor, BackSide, DoubleSide, ACESFilmicToneMapping, SRGBColorSpace,
  RepeatWrapping
} from "./vendor/three.min.js";

/* five tableaux: the title, then one per trailer beat; DAWN is where the cold open starts */
var DAWN = { pos: [0, -3.2, 12], look: [0, -0.2, 0], fov: 26, sun: [0, 0.2, -3.5], size: 5, glow: 0.2, rays: 0, key: 0 };
var FRAMES = [
  { pos: [0, -0.7, 9.5], look: [0, -0.95, 0], fov: 30, sun: [0, 0.6, -3.5], size: 6, glow: 1, rays: 1, key: 0.6 },        // the title: high, behind the name
  { pos: [2.9, -1.2, 3.0], look: [-0.6, 0.25, 0], fov: 36, sun: [1.6, 1.8, -3.5], size: 5.5, glow: 0.9, rays: 0.8, key: 1 }, // low angle, looming
  { pos: [-0.95, 0.75, 1.25], look: [0.05, 0.05, 0.12], fov: 42, sun: [-2.5, 2.5, -3], size: 5, glow: 0.6, rays: 0.5, key: 1.2 }, // raking light on the hammer marks
  { pos: [0, 0, 8.5], look: [0, 0, 0], fov: 21, sun: [0, 0, -3.5], size: 11.5, glow: 1.5, rays: 1.5, key: 0.12 },  // the eclipse
  { pos: [-2.2, 2.0, 3.4], look: [0.3, -0.25, 0], fov: 33, sun: [1.2, 1.4, -3.5], size: 5.5, glow: 1, rays: 0.9, key: 1 }   // the hero, from above
];

/* front of the shield: a dome out to the rim, the height of the bronze at radius r */
function dome(r) { return r < 0.86 ? 0.3 - 0.22 * (r / 0.86) * (r / 0.86) : 0.085; }

function shape(pts) {
  var s = new Shape();
  s.moveTo(pts[0], pts[1]);
  for (var i = 2; i < pts.length; i += 2) s.lineTo(pts[i], pts[i + 1]);
  return s;
}

/* the monogram, drawn in letter units, extruded, then laid onto the curve of the dome */
function monogram(pts, depth) {
  var g = new ExtrudeGeometry(pts.map(shape), { depth: depth, bevelEnabled: true, bevelThickness: 0.008, bevelSize: 0.02, bevelSegments: 2, curveSegments: 1 });
  var p = g.attributes.position, s = 0.46;
  for (var i = 0; i < p.count; i++) {
    var x = p.getX(i) * s, y = (p.getY(i) - 0.07) * s;
    p.setXYZ(i, x, dome(Math.hypot(x, y)) + p.getZ(i), -y);
  }
  g.computeVertexNormals();
  return g;
}

/* hammer marks: a field of soft dents for the bump map */
function hammered() {
  var c = document.createElement("canvas"); c.width = c.height = 512;
  var x = c.getContext("2d");
  x.fillStyle = "#808080"; x.fillRect(0, 0, 512, 512);
  for (var i = 0; i < 900; i++) {
    var px = Math.random() * 512, py = Math.random() * 512, r = 6 + Math.random() * 22;
    for (var ox = -512; ox <= 512; ox += 512) for (var oy = -512; oy <= 512; oy += 512) { // wrap so the tile has no seam
      var g = x.createRadialGradient(px + ox, py + oy, 0, px + ox, py + oy, r);
      g.addColorStop(0, "rgba(0,0,0,0.22)"); g.addColorStop(1, "rgba(0,0,0,0)");
      x.fillStyle = g; x.beginPath(); x.arc(px + ox, py + oy, r, 0, 6.283); x.fill();
    }
  }
  var t = new CanvasTexture(c);
  t.wrapS = t.wrapT = RepeatWrapping; t.repeat.set(6, 3);
  return t;
}

function build() {
  var shield = new Group();
  var bronze = new MeshStandardMaterial({ color: "#c8873f", metalness: 1, roughness: 0.36, bumpMap: hammered(), bumpScale: 3, side: DoubleSide });
  var polished = new MeshStandardMaterial({ color: "#d9a35a", metalness: 1, roughness: 0.24 });
  var gold = new MeshStandardMaterial({ color: "#f2c572", metalness: 1, roughness: 0.28, emissive: "#3a2006" });

  var profile = [];
  for (var i = 0; i <= 16; i++) { var r = 0.86 * i / 16; profile.push(new Vector2(r, dome(r))); }
  [[0.88, 0.09], [0.95, 0.085], [1.0, 0.07], [1.03, 0.04], [1.035, 0], [1.0, -0.02], [0.86, -0.02], [0.6, 0.12], [0, 0.22]]
    .forEach(function (p) { profile.push(new Vector2(p[0], p[1])); });
  shield.add(new Mesh(new LatheGeometry(profile, 160), bronze));

  var groove = new Mesh(new TorusGeometry(0.58, 0.011, 8, 160), polished);
  groove.rotation.x = Math.PI / 2; groove.position.y = dome(0.58) + 0.002;
  shield.add(groove);

  var rivets = new InstancedMesh(new SphereGeometry(0.02, 10, 8), polished, 40), o = new Object3D();
  for (i = 0; i < 40; i++) {
    var a = i / 40 * Math.PI * 2;
    o.position.set(Math.cos(a) * 0.94, 0.09, Math.sin(a) * 0.94); o.updateMatrix();
    rivets.setMatrixAt(i, o.matrix);
  }
  shield.add(rivets);

  shield.add(new Mesh(monogram([[-0.72, -0.5, -0.4, -0.5, -0.4, -0.44, -0.5, -0.44, -0.5, 0.24, -0.03, -0.5, 0.03, -0.5, 0.5, 0.24, 0.5, -0.44, 0.4, -0.44, 0.4, -0.5, 0.72, -0.5, 0.72, -0.44, 0.62, -0.44, 0.62, 0.44, 0.7, 0.44, 0.7, 0.5, 0.47, 0.5, 0, -0.22, -0.47, 0.5, -0.7, 0.5, -0.7, 0.44, -0.62, 0.44, -0.62, -0.44, -0.72, -0.44]], 0.03), gold));
  shield.add(new Mesh(monogram([[-0.07, 0.5, 0.07, 0.5, 0.07, -0.44, 0.15, -0.44, 0.15, -0.5, -0.15, -0.5, -0.15, -0.44, -0.07, -0.44],
                               [-0.56, 0.42, -0.48, 0.42, -0.48, 0.5, 0.48, 0.5, 0.48, 0.42, 0.56, 0.42, 0.56, 0.64, -0.56, 0.64]], 0.045), gold));

  shield.rotation.x = Math.PI / 2; // lathe axis (y) now faces the camera (+z)
  var pivot = new Group(); pivot.add(shield);
  return pivot;
}

/* a warm studio for the bronze to reflect: crushed floor, umber walls, one gold softbox overhead */
function studio(renderer) {
  var env = new Scene();
  env.add(new Mesh(new SphereGeometry(10, 32, 16), new ShaderMaterial({
    side: BackSide,
    vertexShader: "varying vec3 d; void main(){ d = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }",
    fragmentShader: "varying vec3 d; void main(){ vec3 c = mix(vec3(0.02,0.015,0.01), vec3(0.10,0.06,0.03), smoothstep(-0.4,0.3,d.y)); c += vec3(0.5,0.3,0.12) * smoothstep(0.55,0.95,d.y); gl_FragColor = vec4(c,1.0); }"
  })));
  var box = new Mesh(new PlaneGeometry(6, 2), new MeshBasicMaterial({ color: 0xffffff }));
  box.material.color.setRGB(5, 3.2, 1.6); box.position.set(-2, 6, 2); box.lookAt(0, 0, 0);
  env.add(box);
  var bounce = new Mesh(new PlaneGeometry(8, 3), new MeshBasicMaterial({ color: 0xffffff }));
  bounce.material.color.setRGB(1.2, 0.75, 0.38); bounce.position.set(0, 2, 8); bounce.lookAt(0, 0, 0);
  env.add(bounce);
  return new PMREMGenerator(renderer).fromScene(env, 0.04).texture;
}

/* light is added, never painted: colour adds, and coverage follows brightness so the canvas stays clear */
var GLOW = { transparent: true, depthWrite: false, blending: CustomBlending, blendSrc: OneFactor, blendDst: OneFactor, blendSrcAlpha: OneFactor, blendDstAlpha: OneFactor };
function lit(c) { return "gl_FragColor = vec4(" + c + ", max(max(" + c + ".r, " + c + ".g), " + c + ".b));"; }
function shot(f) { return Object.assign({}, f, { pos: new Vector3().fromArray(f.pos), look: new Vector3().fromArray(f.look), sun: new Vector3().fromArray(f.sun) }); }

var FULL = "varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }";

export function mount(film) {
  var canvas = document.getElementById("aspis");
  if (!canvas) return;
  var phone = Math.min(window.innerWidth, window.innerHeight) < 600;
  var renderer = new WebGLRenderer({ canvas: canvas, antialias: !phone, alpha: true, powerPreference: "high-performance" });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, phone ? 1.25 : 1.75));
  renderer.toneMapping = ACESFilmicToneMapping; renderer.toneMappingExposure = 0.85;
  renderer.outputColorSpace = SRGBColorSpace;
  renderer.setClearColor(0x000000, 0);
  renderer.autoClear = false;

  var stage = new Scene(), sky = new Scene(), post = new Scene();
  stage.environment = studio(renderer); stage.environmentIntensity = 0.9;
  var cam = new PerspectiveCamera(30, 1, 0.1, 60), flat = new OrthographicCamera(-1, 1, 1, -1, 0, 1);

  var aspis = build(); stage.add(aspis);
  var key = new DirectionalLight("#ffd6a0", 2.6); key.position.set(-3, 4, 4); stage.add(key);
  var rim = new DirectionalLight("#ff9b4d", 4); rim.position.set(2, 3, -4); stage.add(rim);

  /* the sun behind the shield: a billboarded glow, kept in its own scene for the occlusion pass */
  var sun = new Mesh(new PlaneGeometry(1, 1), new ShaderMaterial(Object.assign({
    uniforms: { uGlow: { value: 1 } },
    vertexShader: "varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }",
    fragmentShader: "uniform float uGlow; varying vec2 vUv; void main(){ float d = length(vUv - 0.5) * 2.0; vec3 c = vec3(1.0,0.72,0.38) * (smoothstep(0.32,0.08,d) * 1.4 + exp(-d * 4.5) * 0.55) * uGlow; " + lit("c") + " }"
  }, GLOW)));
  sky.add(sun);

  /* god rays: the sun with the shield in silhouette, smeared toward the light (quarter resolution) */
  var occ = new WebGLRenderTarget(1, 1, { depthBuffer: false }), ray = new WebGLRenderTarget(1, 1, { depthBuffer: false });
  var black = new MeshBasicMaterial({ color: 0x000000 });
  var rays = new ShaderMaterial({
    uniforms: { tOcc: { value: occ.texture }, uLight: { value: new Vector2(0.5, 0.5) }, uStrength: { value: 1 } },
    defines: { TAPS: phone ? 28 : 56 }, depthTest: false, depthWrite: false,
    vertexShader: FULL,
    fragmentShader: "uniform sampler2D tOcc; uniform vec2 uLight; uniform float uStrength; varying vec2 vUv;" +
      "void main(){ vec2 st = (vUv - uLight) * (0.92 / float(TAPS)); vec2 uv = vUv; float fall = 1.0; vec3 acc = vec3(0.0);" +
      " for (int i = 0; i < TAPS; i++) { uv -= st; acc += texture2D(tOcc, uv).rgb * fall; fall *= 0.955; }" +
      " gl_FragColor = vec4(acc * (uStrength * 2.2 / float(TAPS)), 1.0); }"
  });
  var smear = new Scene(); smear.add(new Mesh(new PlaneGeometry(2, 2), rays));
  post.add(new Mesh(new PlaneGeometry(2, 2), new ShaderMaterial(Object.assign({
    uniforms: { tRay: { value: ray.texture } }, depthTest: false, vertexShader: FULL,
    fragmentShader: "uniform sampler2D tRay; varying vec2 vUv; void main(){ vec3 c = texture2D(tRay, vUv).rgb; " + lit("c") + " }"
  }, GLOW))));

  function size() {
    var w = window.innerWidth, h = window.innerHeight;
    renderer.setSize(w, h, false);
    [occ, ray].forEach(function (rt) { rt.setSize(Math.max(1, w >> 2), Math.max(1, h >> 2)); });
    cam.aspect = w / h; cam.updateProjectionMatrix();
  }
  size(); window.addEventListener("resize", size);

  /* the camera rides the scroll: hold on each tableau, whip between them */
  var dawn = shot(DAWN), frames = FRAMES.map(shot), cur = shot(FRAMES[0]), view = shot(FRAMES[0]), lightUv = new Vector3();
  function mix(a, b, t, out) {
    out.pos.copy(a.pos).lerp(b.pos, t); out.look.copy(a.look).lerp(b.look, t); out.sun.copy(a.sun).lerp(b.sun, t);
    ["fov", "size", "glow", "rays", "key"].forEach(function (k) { out[k] = a[k] + (b[k] - a[k]) * t; });
  }
  function frameAt(y) {
    var st = ScrollTrigger.getById("beats"), fade = 1;
    var k = [0, Infinity];
    if (st) {
      var L = st.end - st.start;
      k = [0, st.start + L * 0.125, st.start + L * 0.375, st.start + L * 0.625, st.start + L * 0.875];
      fade = 1 - Math.min(1, Math.max(0, (y - k[4]) / (st.end - k[4] + window.innerHeight * 0.6)));
    }
    var i = 0; while (i < k.length - 2 && y >= k[i + 1]) i++;
    var t = Math.min(1, Math.max(0, (y - k[i]) / (k[i + 1] - k[i]) || 0));
    t = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    mix(frames[i], frames[i + 1], t, cur);
    return fade;
  }

  var time = 0, last = performance.now(), raf = 0;
  function draw(now) {
    var dt = Math.min((now - last) / 1000, 0.05); last = now;
    time += dt * film.scale;
    var fade = frameAt(window.scrollY);
    canvas.style.opacity = fade.toFixed(3);
    if (fade <= 0.001) return;

    mix(dawn, cur, film.dawn, view);
    /* portrait screens: shrink the shield and its sun together, so every tableau keeps its composition */
    var fit = Math.min(1, Math.pow(cam.aspect / 1.25, 0.85));
    aspis.scale.setScalar(fit);
    cam.position.copy(view.pos);
    if (film.shock.age < 0.35) cam.position.addScalar((Math.random() - 0.5) * 0.05 * (1 - film.shock.age / 0.35));
    cam.fov = view.fov; cam.updateProjectionMatrix();
    cam.lookAt(view.look);
    aspis.rotation.y = Math.sin(time * 0.3) * 0.08;
    aspis.rotation.x = Math.sin(time * 0.21) * 0.03;
    key.intensity = 2.6 * view.key;
    stage.environmentIntensity = 0.9 * Math.min(1, view.key);
    sun.position.copy(view.sun); sun.lookAt(cam.position); sun.scale.setScalar(view.size * fit);
    sun.material.uniforms.uGlow.value = view.glow;

    lightUv.copy(view.sun).project(cam);
    rays.uniforms.uLight.value.set(lightUv.x * 0.5 + 0.5, lightUv.y * 0.5 + 0.5);
    rays.uniforms.uStrength.value = view.rays;

    renderer.setRenderTarget(occ); renderer.clear();
    renderer.render(sky, cam);
    stage.overrideMaterial = black;
    renderer.render(stage, cam);
    stage.overrideMaterial = null;

    renderer.setRenderTarget(ray); renderer.render(smear, flat);
    renderer.setRenderTarget(null); renderer.clear();
    renderer.render(sky, cam);
    renderer.render(stage, cam);
    renderer.render(post, flat);
  }

  function loop(now) { draw(now); raf = requestAnimationFrame(loop); }
  function start() { if (!raf) { last = performance.now(); raf = requestAnimationFrame(loop); } }
  document.addEventListener("visibilitychange", function () { if (document.hidden) { cancelAnimationFrame(raf); raf = 0; } else start(); });
  canvas.addEventListener("webglcontextlost", function () { cancelAnimationFrame(raf); raf = 0; document.documentElement.classList.remove("has-aspis"); });

  start();
  document.documentElement.classList.add("has-aspis");
}
