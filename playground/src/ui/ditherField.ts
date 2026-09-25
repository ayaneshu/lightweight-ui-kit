import { Mesh, OrthographicCamera, PlaneGeometry, Scene, ShaderMaterial, Vector2, Vector3, WebGLRenderer } from 'three'

/**
 * The Overview's background: a slow, domain-warped noise field drawn as an
 * ordered (8×8 Bayer) dither in the theme's ink, at a few percent opacity.
 *
 * It renders at 1/CELL of the element's size and is scaled up with
 * `image-rendering: pixelated`, so every dot is a crisp CELL×CELL square and
 * the GPU shades a few thousand pixels, not millions. It pauses when it's off
 * screen or the tab is hidden, draws one still frame under reduced motion,
 * and re-reads the ink colour when the theme changes.
 */

const CELL = 3

const vertex = /* glsl */ `
  void main() { gl_Position = vec4(position.xy, 0.0, 1.0); }
`

const fragment = /* glsl */ `
  precision highp float;
  uniform vec2 uRes;
  uniform float uTime;
  uniform vec2 uMouse;
  uniform float uMouseOn;
  uniform vec3 uInk;
  uniform float uAlpha;

  float bayer2(vec2 a) { a = floor(a); return fract(dot(a, vec2(0.5, a.y * 0.75))); }
  float bayer4(vec2 a) { return bayer2(0.5 * a) * 0.25 + bayer2(a); }
  float bayer8(vec2 a) { return bayer4(0.5 * a) * 0.25 + bayer2(a); }

  float hash(vec2 p) { p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }
  float noise(vec2 p) {
    vec2 i = floor(p), f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x), mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
  }
  float fbm(vec2 p) {
    float v = 0.0, a = 0.5;
    for (int i = 0; i < 5; i++) { v += a * noise(p); p = p * 2.03 + vec2(1.7, 9.2); a *= 0.5; }
    return v;
  }

  void main() {
    vec2 uv = gl_FragCoord.xy / uRes;             // 0..1, y up
    float aspect = uRes.x / uRes.y;
    vec2 p = uv * vec2(aspect, 1.0) * 1.6;
    float t = uTime * 0.045;

    // Domain warping: noise pushed around by noise, so the field flows like smoke.
    vec2 q = vec2(fbm(p + vec2(0.0, t)), fbm(p + vec2(5.2, -t)));
    float n = fbm(p + 2.2 * q + vec2(t * 0.6, 0.0));

    // Densest toward the top right, clear behind the words and along the bottom edge.
    float bias = smoothstep(0.35, 1.15, uv.x * 1.05 + uv.y * 0.5);
    float fade = smoothstep(0.02, 0.5, uv.y);

    // The pointer warms the field around it, a little.
    vec2 d = (uv - uMouse) * vec2(aspect, 1.0);
    float glow = uMouseOn * exp(-dot(d, d) * 14.0) * 0.4;

    float v = clamp((n * 1.5 - 0.32) * bias * fade + glow * fade, 0.0, 1.0);
    float on = step(bayer8(gl_FragCoord.xy), v);
    gl_FragColor = vec4(uInk, on * uAlpha);
  }
`

/** The theme's ink, resolved in place (the variable holds a light-dark() expression). */
function readInk(host: HTMLElement): { rgb: [number, number, number]; dark: boolean } {
  const probe = document.createElement('span')
  probe.style.color = 'var(--color-ink)'
  host.appendChild(probe)
  const m = getComputedStyle(probe).color.match(/[\d.]+/g) ?? ['24', '25', '29']
  probe.remove()
  const [r, g, b] = m.slice(0, 3).map(Number)
  return { rgb: [r / 255, g / 255, b / 255], dark: (r + g + b) / 3 > 128 }
}

export function mountDitherField(host: HTMLElement): () => void {
  const renderer = new WebGLRenderer({ alpha: true, antialias: false, powerPreference: 'low-power', premultipliedAlpha: false })
  renderer.setPixelRatio(1)
  renderer.setClearColor(0x000000, 0)
  const canvas = renderer.domElement
  canvas.setAttribute('aria-hidden', 'true')
  Object.assign(canvas.style, { width: '100%', height: '100%', display: 'block', imageRendering: 'pixelated' })
  host.appendChild(canvas)

  const uniforms = {
    uRes: { value: new Vector2(1, 1) },
    uTime: { value: 0 },
    uMouse: { value: new Vector2(0.7, 0.6) },
    uMouseOn: { value: 0 },
    uInk: { value: new Vector3(0.1, 0.1, 0.11) },
    uAlpha: { value: 0.14 },
  }
  const material = new ShaderMaterial({ vertexShader: vertex, fragmentShader: fragment, uniforms, transparent: true, depthTest: false })
  const geometry = new PlaneGeometry(2, 2)
  const scene = new Scene()
  scene.add(new Mesh(geometry, material))
  const camera = new OrthographicCamera(-1, 1, 1, -1, 0, 1)

  const still = window.matchMedia('(prefers-reduced-motion: reduce)')
  let visible = true
  let raf = 0
  const start = performance.now() - 40_000 // start mid-flow, not from a blank field
  const target = { x: 0.7, y: 0.6, on: 0 }

  function theme() {
    const { rgb, dark } = readInk(host)
    uniforms.uInk.value.set(...rgb)
    // Deliberately faint: a texture you notice, not a picture you look at.
    // Light dots on a dark page read weaker than dark dots on white, so dark
    // mode gets several times the opacity for the same presence.
    uniforms.uAlpha.value = dark ? 0.24 : 0.07
  }

  function resize() {
    const w = Math.max(1, Math.ceil(host.clientWidth / CELL))
    const h = Math.max(1, Math.ceil(host.clientHeight / CELL))
    renderer.setSize(w, h, false)
    uniforms.uRes.value.set(w, h)
    if (still.matches || !raf) draw()
  }

  function draw() {
    renderer.render(scene, camera)
  }

  function frame(now: number) {
    raf = 0
    if (!visible || document.hidden) return
    uniforms.uTime.value = (now - start) / 1000
    // Follow the pointer with a lag, so the glow drifts rather than snaps.
    const m = uniforms.uMouse.value
    m.x += (target.x - m.x) * 0.06
    m.y += (target.y - m.y) * 0.06
    uniforms.uMouseOn.value += (target.on - uniforms.uMouseOn.value) * 0.05
    draw()
    raf = requestAnimationFrame(frame)
  }

  function play() {
    if (still.matches) {
      uniforms.uTime.value = 40
      uniforms.uMouseOn.value = 0
      draw()
      return
    }
    if (!raf && visible && !document.hidden) raf = requestAnimationFrame(frame)
  }

  function onPointer(e: PointerEvent) {
    if (e.pointerType !== 'mouse') return
    const r = host.getBoundingClientRect()
    target.x = (e.clientX - r.left) / r.width
    target.y = 1 - (e.clientY - r.top) / r.height
    target.on = target.y > 0 && target.y < 1 ? 1 : 0
  }

  theme()
  resize()
  play()

  const ro = new ResizeObserver(resize)
  ro.observe(host)
  const io = new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting
    play()
  })
  io.observe(host)
  const mo = new MutationObserver(() => {
    theme()
    if (!raf) draw()
  })
  mo.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme', 'class'] })
  const scheme = window.matchMedia('(prefers-color-scheme: dark)')
  const onScheme = () => {
    theme()
    if (!raf) draw()
  }
  scheme.addEventListener('change', onScheme)
  still.addEventListener('change', play)
  document.addEventListener('visibilitychange', play)
  window.addEventListener('pointermove', onPointer, { passive: true })

  return () => {
    cancelAnimationFrame(raf)
    ro.disconnect()
    io.disconnect()
    mo.disconnect()
    scheme.removeEventListener('change', onScheme)
    still.removeEventListener('change', play)
    document.removeEventListener('visibilitychange', play)
    window.removeEventListener('pointermove', onPointer)
    geometry.dispose()
    material.dispose()
    renderer.dispose()
    canvas.remove()
  }
}
