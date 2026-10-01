/* Renders the four certification totems to transparent 640x640 WebP stills (assets/totems/).
   Development only, not shipped. Run in a browser page with an import map that resolves
   "three" to three@0.186.1 (build/three.module.js); call render() and save the returned data URLs.
   Cobb's top (MD-102), Arthur's loaded die (AZ-900), Ariadne's chess bishop (SC-900),
   Eames's poker chip (Google IT Support). */
import * as THREE from "three";

function tex(w, h, paint) {
  var c = document.createElement("canvas"); c.width = w; c.height = h;
  paint(c.getContext("2d"), w, h);
  var t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
}
function lathe(points, mat) { return new THREE.Mesh(new THREE.LatheGeometry(points.map(function (p) { return new THREE.Vector2(p[0], p[1]); }), 128), mat); }

function top() {
  var rings = tex(256, 512, function (x, w, h) {
    x.fillStyle = "#cfcbc3"; x.fillRect(0, 0, w, h);
    for (var y = 0; y < h; y += 3) { x.fillStyle = "rgba(0,0,0," + (0.04 + Math.random() * 0.08) + ")"; x.fillRect(0, y, w, 1); }
  });
  var g = new THREE.Group();
  var m = lathe([[0, 0], [0.03, 0.02], [0.09, 0.08], [0.2, 0.2], [0.33, 0.32], [0.42, 0.42], [0.46, 0.48], [0.46, 0.52], [0.42, 0.58], [0.3, 0.64], [0.14, 0.68], [0.07, 0.7], [0.06, 0.71], [0.055, 0.98], [0.07, 1.0], [0.07, 1.04], [0.045, 1.07], [0, 1.08]],
    new THREE.MeshStandardMaterial({ map: rings, color: "#d6d2ca", metalness: 1, roughness: 0.24 }));
  m.rotation.z = 0.32; m.position.y = 0.05; g.add(m); g.scale.setScalar(1.3); g.position.y = -0.12;
  return g;
}

function die() {
  var s = new THREE.Shape(), r = 0.08, a = 0.4;
  s.moveTo(-a + r, -a); s.lineTo(a - r, -a); s.quadraticCurveTo(a, -a, a, -a + r); s.lineTo(a, a - r); s.quadraticCurveTo(a, a, a - r, a);
  s.lineTo(-a + r, a); s.quadraticCurveTo(-a, a, -a, a - r); s.lineTo(-a, -a + r); s.quadraticCurveTo(-a, -a, -a + r, -a);
  var geo = new THREE.ExtrudeGeometry(s, { depth: 0.64, bevelEnabled: true, bevelThickness: 0.08, bevelSize: 0.08, bevelSegments: 6, curveSegments: 8 });
  geo.translate(0, 0, -0.32);
  var body = new THREE.Mesh(geo, new THREE.MeshPhysicalMaterial({ color: "#8f1d17", roughness: 0.28, clearcoat: 1, clearcoatRoughness: 0.15 }));
  var pip = new THREE.MeshStandardMaterial({ color: "#f1ede6", roughness: 0.5 }), dot = new THREE.CircleGeometry(0.075, 24);
  function face(n, normal, up) {
    var spots = { 1: [[0, 0]], 2: [[-1, -1], [1, 1]], 3: [[-1, -1], [0, 0], [1, 1]], 5: [[-1, -1], [1, 1], [-1, 1], [1, -1], [0, 0]] }[n];
    var q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 0, 1), normal);
    spots.forEach(function (sp) {
      var d = new THREE.Mesh(dot, pip);
      d.position.set(sp[0] * 0.22, sp[1] * 0.22, 0.481).applyQuaternion(q);
      d.quaternion.copy(q); body.add(d);
    });
  }
  face(5, new THREE.Vector3(0, 0, 1)); face(3, new THREE.Vector3(0, 1, 0)); face(2, new THREE.Vector3(1, 0, 0));
  body.rotation.set(-0.5, 0.65, 0.1); body.position.y = 0.55;
  var g = new THREE.Group(); g.add(body); return g;
}

function bishop() {
  var brass = new THREE.MeshStandardMaterial({ color: "#b98d4f", metalness: 1, roughness: 0.26 });
  var g = new THREE.Group();
  g.add(lathe([[0, 0], [0.34, 0], [0.36, 0.04], [0.34, 0.08], [0.26, 0.12], [0.22, 0.16], [0.24, 0.2], [0.18, 0.24], [0.12, 0.42], [0.1, 0.62], [0.17, 0.66], [0.17, 0.7], [0.11, 0.73],
    [0.15, 0.8], [0.18, 0.9], [0.16, 1.0], [0.1, 1.08], [0.04, 1.12], [0.06, 1.15], [0.05, 1.19], [0, 1.2]], brass));
  return g;
}

function chip() {
  var side = tex(1024, 64, function (x, w, h) {
    x.fillStyle = "#9c2219"; x.fillRect(0, 0, w, h);
    x.fillStyle = "#efeae2"; for (var i = 0; i < 8; i++) x.fillRect(i * w / 8 + w / 32, 0, w / 16, h);
  });
  var face = tex(512, 512, function (x, w) {
    x.fillStyle = "#9c2219"; x.fillRect(0, 0, w, w);
    x.fillStyle = "#efeae2"; for (var i = 0; i < 8; i++) { x.save(); x.translate(w / 2, w / 2); x.rotate(i * Math.PI / 4); x.fillRect(-w * 0.05, -w / 2, w * 0.1, w * 0.12); x.restore(); }
    x.strokeStyle = "#efeae2"; x.lineWidth = w * 0.012; x.beginPath(); x.arc(w / 2, w / 2, w * 0.3, 0, Math.PI * 2); x.stroke();
    x.fillStyle = "#7d1a13"; x.beginPath(); x.arc(w / 2, w / 2, w * 0.27, 0, Math.PI * 2); x.fill();
  });
  var mat = function (m) { return new THREE.MeshStandardMaterial({ map: m, roughness: 0.42 }); };
  var c = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.5, 0.09, 96), [mat(side), mat(face), mat(face)]);
  c.rotation.set(1.05, 0, 0.35); c.position.y = 0.5;
  var g = new THREE.Group(); g.add(c); return g;
}

export async function render() {
  var renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true });
  renderer.setSize(640, 640); renderer.setPixelRatio(1);
  renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.setClearColor(0, 0);
  var env = new THREE.Scene();
  env.add(new THREE.Mesh(new THREE.SphereGeometry(10, 32, 16), new THREE.ShaderMaterial({
    side: THREE.BackSide,
    vertexShader: "varying vec3 d; void main(){ d = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }",
    fragmentShader: "varying vec3 d; void main(){ vec3 c = mix(vec3(0.015), vec3(0.08, 0.078, 0.075), smoothstep(-0.3, 0.4, d.y)); c += vec3(1.0, 0.72, 0.42) * smoothstep(0.84, 0.99, d.y) * 3.0; c += vec3(0.7) * smoothstep(0.9, 1.0, -d.z) * 0.6; c += vec3(0.5) * smoothstep(0.9, 1.0, d.x) * 0.5; gl_FragColor = vec4(c, 1.0); }"
  })));
  var envMap = new THREE.PMREMGenerator(renderer).fromScene(env, 0.03).texture;
  var cam = new THREE.PerspectiveCamera(26, 1, 0.1, 50);
  cam.position.set(0, 1.5, 3.6); cam.lookAt(0, 0.55, 0);
  var out = {};
  var kinds = { top: top, die: die, bishop: bishop, chip: chip };
  for (var k in kinds) {
    var scene = new THREE.Scene(); scene.environment = envMap;
    var key = new THREE.DirectionalLight("#ffc98a", 3); key.position.set(-1, 5, 2); scene.add(key);
    var rim = new THREE.DirectionalLight("#e9e7e2", 1.4); rim.position.set(2, 2, -3); scene.add(rim);
    scene.add(kinds[k]());
    renderer.render(scene, cam);
    out[k] = renderer.domElement.toDataURL("image/webp", 0.86);
  }
  return out;
}
