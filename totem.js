/* The totem: a machined steel spinning top on a dark table under one lamp, rendered live.
   It opens the film behind the name, is seen from overhead through the descent, and closes
   it at the kick, wobbling, until the cut. Loaded by main.js after first paint.

   vendor/three.min.js is three@0.186.1 tree-shaken to the names imported below:
   esbuild entry.js --bundle --minify --format=esm   (entry re-exports exactly these names) */
import {
  WebGLRenderer, Scene, PerspectiveCamera, Group, Mesh, LatheGeometry, PlaneGeometry, SphereGeometry,
  MeshStandardMaterial, MeshBasicMaterial, ShaderMaterial, CanvasTexture, Vector2, Vector3, Quaternion,
  DirectionalLight, PMREMGenerator, BackSide, ACESFilmicToneMapping, SRGBColorSpace
} from "./vendor/three.min.js";

/* three shots: behind the name, overhead through the descent, low and close at the kick */
var SHOTS = {
  title: { pos: [0, 0.95, 7.5], look: [0, 1.64, 0], fov: 30 },
  above: { pos: [0.2, 4.4, 0.6], look: [0, 0.3, 0], fov: 26 },
  end: { pos: [0.6, 0.9, 6.2], look: [0, 0.02, 0], fov: 28 }
};

function canvasTexture(w, h, paint) {
  var c = document.createElement("canvas"); c.width = w; c.height = h;
  paint(c.getContext("2d"), w, h);
  return new CanvasTexture(c);
}

/* the top: turned on a lathe, with machining rings and one engraved line so the spin reads */
function top() {
  var profile = [[0, 0], [0.03, 0.02], [0.09, 0.08], [0.2, 0.2], [0.33, 0.32], [0.42, 0.42], [0.46, 0.48], [0.46, 0.52],
    [0.42, 0.58], [0.3, 0.64], [0.14, 0.68], [0.07, 0.7], [0.06, 0.71], [0.055, 0.98], [0.07, 1.0], [0.07, 1.04], [0.045, 1.07], [0, 1.08]]
    .map(function (p) { return new Vector2(p[0], p[1]); });
  var rings = canvasTexture(256, 512, function (x, w, h) {
    x.fillStyle = "#cfcbc3"; x.fillRect(0, 0, w, h);
    for (var y = 0; y < h; y += 3) { x.fillStyle = "rgba(0,0,0," + (0.04 + Math.random() * 0.08) + ")"; x.fillRect(0, y, w, 1); }
    x.fillStyle = "rgba(20,20,20,0.85)"; x.fillRect(0, h * 0.28, 5, h * 0.36); // the engraved line
  });
  var mat = new MeshStandardMaterial({ map: rings, color: "#d6d2ca", metalness: 1, roughness: 0.24, bumpMap: rings, bumpScale: 0.6 });
  rings.colorSpace = SRGBColorSpace;
  var mesh = new Mesh(new LatheGeometry(profile, 96), mat);
  var spin = new Group(); spin.add(mesh);
  var tilt = new Group(); tilt.add(spin);
  return { tilt: tilt, spin: spin };
}

/* the table: a pool of lamplight on dark stone that fades into the field, and the top's own shadow */
function table() {
  var g = new Group();
  var pool = new Mesh(new PlaneGeometry(9, 9), new MeshBasicMaterial({
    transparent: true, depthWrite: false,
    map: canvasTexture(256, 256, function (x, w) {
      var r = x.createRadialGradient(w / 2, w / 2, 0, w / 2, w / 2, w / 2);
      r.addColorStop(0, "rgba(46,38,30,0.9)"); r.addColorStop(0.3, "rgba(22,20,18,0.7)"); r.addColorStop(1, "rgba(11,11,12,0)");
      x.fillStyle = r; x.fillRect(0, 0, w, w);
    })
  }));
  pool.material.map.colorSpace = SRGBColorSpace;
  pool.rotation.x = -Math.PI / 2; g.add(pool);
  var shadow = new Mesh(new PlaneGeometry(1.4, 1.4), new MeshBasicMaterial({
    transparent: true, depthWrite: false,
    map: canvasTexture(128, 128, function (x, w) {
      var r = x.createRadialGradient(w / 2, w / 2, 0, w / 2, w / 2, w / 2);
      r.addColorStop(0, "rgba(0,0,0,0.75)"); r.addColorStop(1, "rgba(0,0,0,0)");
      x.fillStyle = r; x.fillRect(0, 0, w, w);
    })
  }));
  shadow.rotation.x = -Math.PI / 2; shadow.position.y = 0.002; g.add(shadow);
  return { group: g, shadow: shadow };
}

/* a dark room with one warm lamp overhead, for the steel to reflect */
function room(renderer) {
  var env = new Scene();
  env.add(new Mesh(new SphereGeometry(10, 32, 16), new ShaderMaterial({
    side: BackSide,
    vertexShader: "varying vec3 d; void main(){ d = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }",
    fragmentShader: "varying vec3 d; void main(){ vec3 c = mix(vec3(0.012), vec3(0.05, 0.048, 0.045), smoothstep(-0.3, 0.4, d.y)); c += vec3(1.0, 0.7, 0.4) * smoothstep(0.86, 0.99, d.y) * 3.0; c += vec3(0.6) * smoothstep(0.93, 1.0, -d.z) * 0.4; gl_FragColor = vec4(c, 1.0); }"
  })));
  return new PMREMGenerator(renderer).fromScene(env, 0.03).texture;
}

export function mount(film) {
  var canvas = document.getElementById("totem");
  var phone = Math.min(window.innerWidth, window.innerHeight) < 600;
  var renderer = new WebGLRenderer({ canvas: canvas, antialias: true, alpha: true, powerPreference: "high-performance" });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, phone ? 1.5 : 2));
  renderer.toneMapping = ACESFilmicToneMapping; renderer.toneMappingExposure = 1.0;
  renderer.outputColorSpace = SRGBColorSpace;
  renderer.setClearColor(0x000000, 0);

  var scene = new Scene();
  scene.environment = room(renderer);
  var cam = new PerspectiveCamera(30, 1, 0.05, 40);
  var t = top(), stage = table(), world = new Group();
  world.add(t.tilt, stage.group); scene.add(world);
  var lamp = new DirectionalLight("#ffc98a", 3.2); lamp.position.set(-0.6, 5, 1.2); scene.add(lamp);
  var rim = new DirectionalLight("#e9e7e2", 1.1); rim.position.set(1.5, 1.6, -3); scene.add(rim);

  function size() {
    renderer.setSize(window.innerWidth, window.innerHeight, false);
    cam.aspect = window.innerWidth / window.innerHeight; cam.updateProjectionMatrix();
  }
  size(); window.addEventListener("resize", size);

  var shots = {}, axis = new Vector3(), q = new Quaternion();
  Object.keys(SHOTS).forEach(function (k) { shots[k] = { pos: new Vector3().fromArray(SHOTS[k].pos), look: new Vector3().fromArray(SHOTS[k].look), fov: SHOTS[k].fov }; });
  var from = { pos: new Vector3(), look: new Vector3(), fov: 30 };
  function ease(x) { x = Math.min(1, Math.max(0, x)); return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2; }
  function between(a, b, x) {
    from.pos.copy(a.pos).lerp(b.pos, x); from.look.copy(a.look).lerp(b.look, x); from.fov = a.fov + (b.fov - a.fov) * x;
    return from;
  }

  /* where the scroll is: the title and descent first, then nothing until the kick */
  function frame() {
    var beats = ScrollTrigger.getById("beats"), end = ScrollTrigger.getById("end"), y = window.scrollY, vh = window.innerHeight;
    if (end && end.progress > 0) return { shot: shots.end, show: Math.min(1, end.progress * 2.5), wobble: end.progress };
    if (!beats) return { shot: shots.title, show: 1, wobble: 0 };
    var x = ease(y / (beats.start + (beats.end - beats.start) * 0.25));
    return { shot: between(shots.title, shots.above, x), show: 1 - Math.min(1, Math.max(0, (y - beats.end) / (vh * 0.7))), wobble: 0 };
  }

  var angle = 0, phi = 0, last = performance.now(), raf = 0;
  function draw(now) {
    var dt = Math.min((now - last) / 1000, 0.05); last = now;
    var f = frame(), show = film.cut ? 0 : f.show;
    canvas.style.opacity = (show * film.dawn).toFixed(3);
    if (show <= 0.001) return;

    /* spin, precess, and at the kick begin to wobble */
    angle += dt * (16 - f.wobble * 6);
    phi += dt * (1.8 + f.wobble * 6);
    var theta = 0.05 + f.wobble * f.wobble * 0.32;
    axis.set(Math.cos(phi), 0, Math.sin(phi));
    t.tilt.quaternion.copy(q.setFromAxisAngle(axis, theta));
    t.tilt.position.set(Math.sin(phi) * 0.03 * f.wobble, 0, Math.cos(phi) * 0.03 * f.wobble);
    t.spin.rotation.y = angle;
    stage.shadow.position.x = t.tilt.position.x + Math.sin(phi) * theta * 0.5;
    stage.shadow.position.z = t.tilt.position.z - Math.cos(phi) * theta * 0.5;

    /* portrait screens: shrink the world so the shot keeps its composition */
    world.scale.setScalar(Math.min(1, Math.pow(cam.aspect / 1.25, 0.6)));
    cam.position.copy(f.shot.pos); cam.fov = f.shot.fov; cam.updateProjectionMatrix(); cam.lookAt(f.shot.look);
    lamp.intensity = 3.2 * film.dawn;
    if (film.shock.age < 0.3) cam.position.y += (Math.random() - 0.5) * 0.03 * (1 - film.shock.age / 0.3);
    renderer.render(scene, cam);
  }

  function loop(now) { draw(now); raf = requestAnimationFrame(loop); }
  function start() { if (!raf) { last = performance.now(); raf = requestAnimationFrame(loop); } }
  document.addEventListener("visibilitychange", function () { if (document.hidden) { cancelAnimationFrame(raf); raf = 0; } else start(); });
  canvas.addEventListener("webglcontextlost", function () { cancelAnimationFrame(raf); raf = 0; document.documentElement.classList.remove("has-totem"); });

  start();
  document.documentElement.classList.add("has-totem");
}
