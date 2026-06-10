import { useEffect, useRef, useImperativeHandle, forwardRef } from 'react'
import * as $3Dmol from '3dmol/build/3Dmol.es6.js'
import { atomBasis, circlePoints, rotateAroundAxis } from './geometry.js'

const THEME_COLORS = {
  dark: { bg: 0x0a0a0f, shell: '#4a5a7a', electron: '#7df9ff' },
  light: { bg: 0xf6f4fb, shell: '#c3b8e8', electron: '#1aa3c4' },
}
const PROTON_COLOR = '#ff5252'
const NEUTRON_COLOR = '#5c7cfa'
const NUCLEON_RADIUS = 0.22
const ELECTRON_RADIUS = 0.06
const SHELL_RADIUS_STEP = 0.55
const ELECTRON_SPEED = 0.5
const ELECTRON_TICK_MS = 120
const SHELL_PRECESSION_SPEED = 0.25

// Deterministic pseudo-random point inside a unit sphere
function spherePoint(seed) {
  const a = (seed * 12.9898) % (Math.PI * 2)
  const b = (seed * 78.233) % Math.PI
  const r = Math.cbrt((seed * 0.6180339887) % 1)
  return {
    x: r * Math.sin(b) * Math.cos(a),
    y: r * Math.sin(b) * Math.sin(a),
    z: r * Math.cos(b),
  }
}

const AtomViewer = forwardRef(function AtomViewer({ protons, neutrons, shells, theme, spinning }, ref) {
  const containerRef = useRef(null)
  const viewerRef = useRef(null)
  const stateRef = useRef({ timer: null, shapes: [], shellShapes: [], electronShapes: [] })

  useImperativeHandle(ref, () => ({
    resetView: () => {
      viewerRef.current?.zoomTo()
      viewerRef.current?.render()
    },
  }))

  useEffect(() => {
    if (!containerRef.current) return
    const viewer = $3Dmol.createViewer(containerRef.current, {
      backgroundColor: (THEME_COLORS[theme] ?? THEME_COLORS.dark).bg,
      antialias: true,
    })
    viewerRef.current = viewer
    return () => {
      const state = stateRef.current
      if (state.timer) clearInterval(state.timer)
      viewer.clear()
    }
  }, [])

  useEffect(() => {
    const viewer = viewerRef.current
    if (!viewer) return
    const state = stateRef.current
    if (state.timer) cancelAnimationFrame(state.timer)
    viewer.setBackgroundColor((THEME_COLORS[theme] ?? THEME_COLORS.dark).bg)
    viewer.removeAllShapes()
    state.shapes = []
    state.shellShapes = []
    state.electronShapes = []

    const colors = THEME_COLORS[theme] ?? THEME_COLORS.dark

    const nucleonRadius = Math.cbrt(protons + neutrons) * 0.17 + 0.25
    let seed = 1
    for (let i = 0; i < protons; i++, seed++) {
      const p = spherePoint(seed)
      state.shapes.push(viewer.addSphere({
        center: { x: p.x * nucleonRadius, y: p.y * nucleonRadius, z: p.z * nucleonRadius },
        radius: NUCLEON_RADIUS, color: PROTON_COLOR,
      }))
    }
    for (let i = 0; i < neutrons; i++, seed++) {
      const p = spherePoint(seed)
      state.shapes.push(viewer.addSphere({
        center: { x: p.x * nucleonRadius, y: p.y * nucleonRadius, z: p.z * nucleonRadius },
        radius: NUCLEON_RADIUS, color: NEUTRON_COLOR,
      }))
    }

    const shellBasis = shells.map((_, i) => atomBasis(i * 7 + 3))
    const shellRadii = shells.map((_, i) => nucleonRadius + NUCLEON_RADIUS + 0.6 + i * SHELL_RADIUS_STEP)
    // Each shell tumbles around an axis distinct from its own orbital normal,
    // so the ring's plane visibly tilts and sweeps around the nucleus over time.
    const precessionAxes = shells.map((_, i) => atomBasis(i * 11 + 17).u)
    const precessionDirs = shells.map((_, i) => (i % 2 === 0 ? 1 : -1))

    let t = 0
    let lastTime = null
    const tick = (now) => {
      if (lastTime == null) lastTime = now
      const dt = (now - lastTime) / ELECTRON_TICK_MS
      lastTime = now
      t += dt * 0.12

      ;[...state.shellShapes, ...state.electronShapes].forEach(s => viewer.removeShape(s))
      state.shellShapes = []
      state.electronShapes = []
      shells.forEach((count, i) => {
        if (count <= 0) return
        const precessAngle = t * SHELL_PRECESSION_SPEED * precessionDirs[i] / (1 + i * 0.25)
        const u = rotateAroundAxis(shellBasis[i].u, precessionAxes[i], precessAngle)
        const v = rotateAroundAxis(shellBasis[i].v, precessionAxes[i], precessAngle)
        const radius = shellRadii[i]

        const pts = circlePoints({ x: 0, y: 0, z: 0 }, radius, u, v, 48)
        state.shellShapes.push(viewer.addCurve({ points: pts, radius: 0.012, color: colors.shell }))

        const speed = ELECTRON_SPEED / (1 + i * 0.4)
        for (let e = 0; e < count; e++) {
          const angle = (e / count) * Math.PI * 2 + t * speed
          const pos = {
            x: radius * (Math.cos(angle) * u.x + Math.sin(angle) * v.x),
            y: radius * (Math.cos(angle) * u.y + Math.sin(angle) * v.y),
            z: radius * (Math.cos(angle) * u.z + Math.sin(angle) * v.z),
          }
          state.electronShapes.push(viewer.addSphere({ center: pos, radius: ELECTRON_RADIUS, color: colors.electron }))
        }
      })
      viewer.render()
      state.timer = requestAnimationFrame(tick)
    }
    state.timer = requestAnimationFrame(tick)

    viewer.zoomTo()
    viewer.render()
    if (spinning) viewer.spin('y', 0.4)

    return () => {
      if (state.timer) {
        cancelAnimationFrame(state.timer)
        state.timer = null
      }
    }
  }, [protons, neutrons, shells, theme])

  useEffect(() => {
    const viewer = viewerRef.current
    if (!viewer) return
    if (spinning) viewer.spin('y', 0.4)
    else viewer.spin(false)
  }, [spinning])

  return (
    <div
      ref={containerRef}
      style={{ width: '100%', height: '100%' }}
    />
  )
})

export default AtomViewer
