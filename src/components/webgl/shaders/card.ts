// Shaders for one showcase card (a subdivided plane, scaled in pixels).
//
// Vertex:   bends the plane around the viewer — every vertex is pushed back
//           by x² in world space, so cards curve like the inside of a
//           cylinder and the curve is continuous across the whole row.
// Fragment: draws either the uploaded cover texture (cover-fit) or one of
//           seven procedural nobug covers, then splits R/G/B horizontally in
//           proportion to the carousel's velocity (chromatic aberration),
//           rounds the corners and dims cards that are not active.

export const cardVertex = /* glsl */ `
  uniform float uBend;    // curvature, in 1/px — set from the viewport width
  uniform float uExpand;  // 0 = card in the row, 1 = expanded to full screen (flat)
  varying vec2 vUv;

  void main() {
    vUv = uv;
    vec4 world = modelMatrix * vec4(position, 1.0);
    // parabola ~ cylinder near the centre; flattens while the card expands
    world.z -= world.x * world.x * uBend * (1.0 - uExpand);
    gl_Position = projectionMatrix * viewMatrix * world;
  }
`;

export const cardFragment = /* glsl */ `
  precision highp float;

  uniform float uTime;
  uniform float uShift;     // signed carousel velocity, already eased (0 when reduced motion)
  uniform float uActive;    // 1 = centred card, 0 = neighbour
  uniform float uPattern;   // 0..6, which procedural cover
  uniform float uHasTex;    // 1 when an uploaded image is bound
  uniform float uAspect;    // plane width / height
  uniform float uImgAspect; // texture width / height
  uniform float uRadius;    // corner radius in plane-height units
  uniform float uOpacity;
  uniform vec3 uAccent;
  uniform sampler2D uTex;
  varying vec2 vUv;

  const vec3 GROUND = vec3(0.055, 0.058, 0.066);
  const vec3 INK = vec3(0.86, 0.85, 0.82);

  float hash(float n) { return fract(sin(n * 127.1) * 43758.5453); }
  float hash2(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }

  // anti-aliased line of width w around distance d (d in pattern units)
  float line(float d, float w) {
    float aa = fwidth(d) * 1.2;
    return 1.0 - smoothstep(w, w + aa, abs(d));
  }
  float box(vec2 p, vec2 b, float r) {
    vec2 q = abs(p) - b + r;
    return length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - r;
  }
  float fill(float d) { return 1.0 - smoothstep(0.0, fwidth(d) * 1.5, d); }

  // q: centred, aspect-corrected coordinates (height = 1)
  vec3 coverWeb(vec2 q, float t) {
    // receding wall of browser windows, one lit in the accent colour
    vec2 p = q;
    p.y += 0.6;
    float depth = 1.0 / max(p.y + 0.35, 0.08);
    vec2 g = vec2(p.x * depth * 3.0, depth * 2.2 + t * 0.35);
    vec2 id = floor(g), f = fract(g) - 0.5;
    float frame = fill(box(f, vec2(0.42, 0.38), 0.04)) - fill(box(f, vec2(0.40, 0.36), 0.03));
    float bar = fill(box(f - vec2(0.0, -0.31), vec2(0.40, 0.035), 0.0));
    float fog = smoothstep(9.0, 2.0, depth);
    vec3 col = GROUND + INK * (frame * 0.5 + bar * 0.18) * fog;
    float lit = step(0.93, hash2(id + floor(t * 0.25)));
    col = mix(col, uAccent * 0.9, lit * fill(box(f, vec2(0.40, 0.36), 0.03)) * fog);
    return col;
  }

  vec3 coverQa(vec2 q, float t) {
    // test coverage radar: rings, a sweeping beam, nodes found by the beam
    float r = length(q);
    float a = atan(q.y, q.x);
    float rings = line(fract(r * 9.0) - 0.5, 0.012) * smoothstep(0.75, 0.05, r);
    float sweep = mod(a - t * 0.9, 6.28318);
    float beam = exp(-sweep * 2.2) * smoothstep(0.62, 0.0, r);
    vec3 col = GROUND + INK * rings * 0.28 + uAccent * beam * 0.45;
    for (int i = 0; i < 9; i++) {
      float fi = float(i);
      vec2 n = vec2(cos(fi * 2.4 + 0.5), sin(fi * 2.4 + 0.5)) * (0.15 + hash(fi) * 0.42);
      float d = length(q - n);
      float hit = exp(-mod(atan(n.y, n.x) - t * 0.9, 6.28318) * 1.5);
      col += mix(INK, uAccent, hit) * fill(d - 0.012) * (0.5 + hit);
    }
    col = mix(col, uAccent, fill(r - 0.018));
    return col;
  }

  vec3 coverCrm(vec2 q, float t) {
    // stacked system layers — sales, stock, finance — one in the accent colour
    vec3 col = GROUND;
    for (int i = 0; i < 6; i++) {
      float fi = float(i);
      float y = -0.33 + fi * 0.13 + sin(t * 0.8 + fi) * 0.008;
      vec2 p = q - vec2(-0.05 + fi * 0.03, y);
      p.y += p.x * 0.09; // skew: isometric hint
      float d = box(p, vec2(0.42 - fi * 0.015, 0.035), 0.004);
      vec3 c = mix(vec3(0.30), vec3(0.78), fi / 5.0);
      if (i == 3) c = uAccent;
      col = mix(col, c, fill(d));
      col += INK * line(d, 0.0015) * 0.25;
    }
    col += INK * line(q.x - 0.5, 0.001) * 0.2 * step(abs(q.y), 0.4);
    return col;
  }

  vec3 coverAnalytics(vec2 q, float t) {
    // live bar chart over a dotted field
    vec3 col = GROUND;
    vec2 g = fract(q * 24.0) - 0.5;
    col += INK * fill(length(g) - 0.05) * 0.10;
    float n = 14.0;
    float x = (q.x + 0.55) / 1.1 * n;
    float id = floor(x);
    if (id >= 0.0 && id < n) {
      float hgt = 0.15 + 0.5 * (0.5 + 0.5 * sin(t * 0.7 + id * 0.9)) * (0.4 + 0.6 * hash(id));
      float base = -0.35;
      float inBar = step(abs(fract(x) - 0.5), 0.3) * step(base, q.y) * step(q.y, base + hgt);
      vec3 c = (id == 9.0) ? uAccent : mix(vec3(0.25), vec3(0.7), q.y + 0.35);
      col = mix(col, c, inBar);
    }
    col += INK * line(q.y + 0.35, 0.002) * 0.6 * step(abs(q.x), 0.56);
    return col;
  }

  vec3 coverMarketing(vec2 q, float t) {
    // long-exposure light trails: reach, moving across channels
    vec3 col = GROUND;
    float rows = 46.0;
    float row = floor((q.y + 0.5) * rows);
    float fy = fract((q.y + 0.5) * rows) - 0.5;
    float speed = 0.2 + hash(row) * 0.9;
    float x = q.x * (1.5 + hash(row + 3.0)) - t * speed + hash(row + 7.0) * 10.0;
    float seg = smoothstep(0.55, 0.95, fract(x)) * smoothstep(1.0, 0.95, fract(x));
    float band = exp(-abs(q.y) * 3.5);
    float thin = 1.0 - smoothstep(0.08, 0.3, abs(fy));
    vec3 c = hash(row + 11.0) > 0.9 ? uAccent : INK;
    col += c * seg * thin * band * 0.9;
    return col;
  }

  vec3 coverMobile(vec2 q, float t) {
    // a phone with a scrolling app feed
    vec3 col = GROUND;
    vec2 p = q;
    float body = box(p, vec2(0.2, 0.4), 0.05);
    col += INK * line(body, 0.002) * 0.7;
    if (body < -0.012) {
      vec2 s = p;
      s.y += t * 0.06;
      float rowH = 0.13;
      float id = floor(s.y / rowH);
      vec2 f = vec2(s.x, mod(s.y, rowH) - rowH * 0.5);
      float card = box(f, vec2(0.16, 0.05), 0.012);
      vec3 c = mod(id, 5.0) == 2.0 ? uAccent : vec3(0.22);
      col = mix(col, c, fill(card) * 0.9);
      float txt = box(f - vec2(-0.05, 0.0), vec2(0.07, 0.008), 0.004);
      col = mix(col, INK * 0.6, fill(txt) * step(mod(id, 5.0), 1.5));
    }
    col += INK * fill(box(p - vec2(0.0, 0.37), vec2(0.04, 0.006), 0.006)) * 0.4;
    return col;
  }

  vec3 coverAi(vec2 q, float t) {
    // fibre bundle: many signals converging through one model
    vec3 col = GROUND;
    float env = pow(abs(q.x) * 1.8, 1.6) + 0.015;
    for (int i = 0; i < 26; i++) {
      float fi = float(i);
      float k = (hash(fi) - 0.5) * 0.9;
      float y = k * env + sin(q.x * 4.0 + t * 0.6 + fi) * 0.012 * env * 10.0;
      float d = q.y - y;
      vec3 c = mod(fi, 9.0) == 0.0 ? uAccent : INK * (0.35 + hash(fi + 1.0) * 0.4);
      col += c * line(d, 0.0008) * 0.8;
    }
    col += uAccent * exp(-length(q) * 14.0) * 0.6;
    return col;
  }

  vec3 pattern(vec2 uv) {
    vec2 q = (uv - 0.5) * vec2(uAspect, 1.0);
    float t = uTime;
  #ifdef PATTERN
    // single-cover build (case-study header): only one pattern is compiled
    #if PATTERN == 0
      return coverWeb(q, t);
    #elif PATTERN == 1
      return coverQa(q, t);
    #elif PATTERN == 2
      return coverCrm(q, t);
    #elif PATTERN == 3
      return coverAnalytics(q, t);
    #elif PATTERN == 4
      return coverMarketing(q, t);
    #elif PATTERN == 5
      return coverMobile(q, t);
    #else
      return coverAi(q, t);
    #endif
  #endif
    int p = int(uPattern + 0.5);
    if (p == 0) return coverWeb(q, t);
    if (p == 1) return coverQa(q, t);
    if (p == 2) return coverCrm(q, t);
    if (p == 3) return coverAnalytics(q, t);
    if (p == 4) return coverMarketing(q, t);
    if (p == 5) return coverMobile(q, t);
    return coverAi(q, t);
  }

  vec3 image(vec2 uv) {
    // cover-fit the texture into the plane
    vec2 s = uAspect > uImgAspect ? vec2(1.0, uImgAspect / uAspect) : vec2(uAspect / uImgAspect, 1.0);
    return texture2D(uTex, (uv - 0.5) * s + 0.5).rgb;
  }

  vec3 sampleCover(vec2 uv) {
    return uHasTex > 0.5 ? image(uv) : pattern(uv);
  }

  void main() {
    vec2 uv = vUv;
    vec3 col;
    // chromatic aberration: R and B sampled either side of G, along the motion
    float s = clamp(uShift, -1.0, 1.0) * 0.035;
    if (abs(s) > 0.0005) {
      // the split is strongest at the card edges, like a lens
      vec2 off = vec2(s * (0.6 + abs(uv.x - 0.5)), 0.0);
      col = vec3(sampleCover(uv + off).r, sampleCover(uv).g, sampleCover(uv - off).b);
    } else {
      col = sampleCover(uv);
    }

    // neighbours sit back a little
    col *= mix(0.78, 1.0, uActive);
    // film grain keeps the dark gradients from banding
    col += (hash2(uv * 900.0 + fract(uTime)) - 0.5) * 0.025;

    // rounded corners
    vec2 p = (uv - 0.5) * vec2(uAspect, 1.0);
    float d = box(p, vec2(uAspect * 0.5, 0.5), uRadius);
    float alpha = 1.0 - smoothstep(-fwidth(d), 0.0, d);

    gl_FragColor = vec4(col, alpha * uOpacity);
  }
`;
