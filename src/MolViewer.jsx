import { useEffect, useRef, useImperativeHandle, forwardRef } from 'react'
import * as $3Dmol from '3dmol/build/3Dmol.es6.js'
import { analyzeBonding } from './bonding.js'

const SURFACE_TYPE = $3Dmol.SurfaceType?.VDW ?? 1

const SHELL_BASE_RADIUS = 0.4
const SHELL_RADIUS_STEP = 0.3
const ELECTRON_RADIUS = 0.045
const ELECTRON_SPEED = 0.5

const THEME_COLORS = {
  dark: { bg: 0x0a0a0f, shell: '#4a5a7a', electron: '#7df9ff' },
  light: { bg: 0xf6f4fb, shell: '#c3b8e8', electron: '#1aa3c4' },
}
const BOND_ELECTRON_COLOR = '#ff6b9d' // shared covalent pairs
const SEA_ELECTRON_COLOR = '#ffd54a'  // delocalized metallic electrons
const SEA_COLOR = '#ffd54a'
const BOND_PAIR_RADIUS = 0.16
const BOND_PAIR_SPACING = 0.35
const BOND_PAIR_SPEED = 0.7
const ELECTRON_TICK_MS = 120
const TRANSFER_COLOR = '#b388ff'      // electron mid-transfer in an ionic bond
const TRANSFER_RADIUS = 0.07
const TRANSFER_ARC_HEIGHT = 0.6
const TRANSFER_SPEED = 0.15

function applyStyle(viewer, viewMode) {
  viewer.setStyle({}, {})
  if (viewMode === 'ball-stick') {
    viewer.setStyle({}, { sphere: { scale: 0.3 }, stick: { radius: 0.15 } })
  } else if (viewMode === 'cpk') {
    viewer.setStyle({}, { sphere: { scale: 1.0 } })
  } else if (viewMode === 'surface') {
    viewer.setStyle({}, { sphere: { scale: 0.25 }, stick: { radius: 0.12 } })
    viewer.addSurface(SURFACE_TYPE, { opacity: 0.65, colorscheme: 'ssJmol' })
  } else if (viewMode === 'electron-shells') {
    viewer.setStyle({}, { sphere: { scale: 0.18 }, stick: { radius: 0.08 } })
  }
}

function buildElementLegend(model) {
  if (!model) return []
  const counts = new Map()
  model.atoms.forEach(atom => {
    if (!atom.elem) return
    counts.set(atom.elem, (counts.get(atom.elem) ?? 0) + 1)
  })
  return [...counts.entries()]
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([elem, count]) => {
      const color = $3Dmol.elementColors.Jmol[elem] ?? $3Dmol.elementColors.defaultColor
      return { elem, count, color: '#' + color.toString(16).padStart(6, '0') }
    })
}

// Deterministic pseudo-random orthonormal basis (per atom) for shell orientation
function atomBasis(index) {
  const a = (index * 12.9898) % (Math.PI * 2)
  const b = (index * 78.233) % Math.PI
  const n = { x: Math.sin(b) * Math.cos(a), y: Math.sin(b) * Math.sin(a), z: Math.cos(b) }
  const ref = Math.abs(n.z) < 0.9 ? { x: 0, y: 0, z: 1 } : { x: 1, y: 0, z: 0 }
  const u = normalize(cross(n, ref))
  const v = cross(n, u)
  return { u, v }
}

// Orthonormal basis perpendicular to a bond axis
function bondBasis(axis) {
  const n = normalize(axis)
  const ref = Math.abs(n.z) < 0.9 ? { x: 0, y: 0, z: 1 } : { x: 1, y: 0, z: 0 }
  const u = normalize(cross(n, ref))
  const v = cross(n, u)
  return { n, u, v }
}

function cross(a, b) {
  return { x: a.y * b.z - a.z * b.y, y: a.z * b.x - a.x * b.z, z: a.x * b.y - a.y * b.x }
}
function normalize(a) {
  const len = Math.sqrt(a.x * a.x + a.y * a.y + a.z * a.z) || 1
  return { x: a.x / len, y: a.y / len, z: a.z / len }
}

function circlePoints(center, radius, u, v, segments = 32) {
  const pts = []
  for (let i = 0; i <= segments; i++) {
    const t = (i / segments) * Math.PI * 2
    pts.push({
      x: center.x + radius * (Math.cos(t) * u.x + Math.sin(t) * v.x),
      y: center.y + radius * (Math.cos(t) * u.y + Math.sin(t) * v.y),
      z: center.z + radius * (Math.cos(t) * u.z + Math.sin(t) * v.z),
    })
  }
  return pts
}

function formatCharge(charge) {
  if (!charge) return null
  const sign = charge > 0 ? '+' : '−'
  const mag = Math.abs(charge)
  return mag === 1 ? sign : `${mag}${sign}`
}

function clearElectronShells(viewer, electronState) {
  const state = electronState.current
  if (state.timer) {
    clearInterval(state.timer)
    state.timer = null
  }
  ;[...state.staticShapes, ...state.electronShapes].forEach(s => viewer.removeShape(s))
  state.chargeLabels.forEach(l => viewer.removeLabel(l))
  state.staticShapes = []
  state.electronShapes = []
  state.chargeLabels = []
  state.chargeLabelSpecs = []
}

function addChargeLabels(viewer, electronState) {
  const state = electronState.current
  state.chargeLabels = []
  state.chargeLabelSpecs.forEach(spec => {
    state.chargeLabels.push(viewer.addLabel(spec.text, {
      position: spec.position,
      fontSize: 24,
      fontColor: spec.color,
      backgroundOpacity: 0,
      borderThickness: 0,
      inFront: true,
      showBackground: false,
      alignment: 'bottomLeft',
      screenOffset: { x: 10, y: 10 },
    }))
  })
}

function startElectronShells(viewer, electronState, theme) {
  const model = viewer.getModel()
  if (!model) return
  const state = electronState.current
  const colors = THEME_COLORS[theme] ?? THEME_COLORS.dark
  const { atomMeta, covalentPairs, metallicCluster, ionicTransfers } = analyzeBonding(model)

  const atomInfo = []
  const bondInfo = []
  const chargeLabelSpecs = []

  model.atoms.forEach((atom, i) => {
    const meta = atomMeta[i]
    const shells = meta.shells
    const { u, v } = atomBasis(i)
    if (shells.length) {
      // Only the outermost (valence) shell is shown — inner/core electrons
      // aren't involved in bonding and just add visual noise.
      const valenceCount = shells[shells.length - 1]
      const radius = SHELL_BASE_RADIUS + (shells.length - 1) * SHELL_RADIUS_STEP
      if (valenceCount > 0) {
        const pts = circlePoints(atom, radius, u, v)
        state.staticShapes.push(viewer.addCurve({ points: pts, radius: 0.01, color: colors.shell }))
        atomInfo.push({ atom, count: valenceCount, radius, u, v })
      }
    }
    if (meta.charge) {
      chargeLabelSpecs.push({
        text: formatCharge(meta.charge),
        position: { x: atom.x, y: atom.y, z: atom.z },
        color: meta.charge > 0 ? '#ff8a65' : '#64b5f6',
      })
    }
  })

  covalentPairs.forEach(({ a, b, order }) => {
    const atomA = model.atoms[a]
    const atomB = model.atoms[b]
    const mid = { x: (atomA.x + atomB.x) / 2, y: (atomA.y + atomB.y) / 2, z: (atomA.z + atomB.z) / 2 }
    const axis = { x: atomB.x - atomA.x, y: atomB.y - atomA.y, z: atomB.z - atomA.z }
    const { n, u, v } = bondBasis(axis)
    for (let k = 0; k < order; k++) {
      const offset = (k - (order - 1) / 2) * BOND_PAIR_SPACING
      const center = { x: mid.x + n.x * offset, y: mid.y + n.y * offset, z: mid.z + n.z * offset }
      bondInfo.push({ center, u, v })
    }
  })

  if (metallicCluster) {
    state.staticShapes.push(viewer.addSphere({
      center: metallicCluster.center,
      radius: metallicCluster.radius,
      color: SEA_COLOR,
      opacity: 0.12,
    }))
    state.seaElectrons = []
    for (let i = 0; i < metallicCluster.electronCount; i++) {
      const dir = normalize({ x: Math.random() - 0.5, y: Math.random() - 0.5, z: Math.random() - 0.5 })
      const dist = metallicCluster.radius * Math.cbrt(Math.random())
      state.seaElectrons.push({
        x: metallicCluster.center.x + dir.x * dist,
        y: metallicCluster.center.y + dir.y * dist,
        z: metallicCluster.center.z + dir.z * dist,
      })
    }
    state.metallicCluster = metallicCluster
  } else {
    state.seaElectrons = []
    state.metallicCluster = null
  }

  state.chargeLabelSpecs = chargeLabelSpecs
  addChargeLabels(viewer, electronState)

  let t = 0
  const tick = () => {
    state.electronShapes.forEach(s => viewer.removeShape(s))
    state.electronShapes = []

    atomInfo.forEach(({ atom, count, radius, u, v }) => {
      for (let e = 0; e < count; e++) {
        const angle = (e / count) * Math.PI * 2 + t * ELECTRON_SPEED
        const pos = {
          x: atom.x + radius * (Math.cos(angle) * u.x + Math.sin(angle) * v.x),
          y: atom.y + radius * (Math.cos(angle) * u.y + Math.sin(angle) * v.y),
          z: atom.z + radius * (Math.cos(angle) * u.z + Math.sin(angle) * v.z),
        }
        state.electronShapes.push(viewer.addSphere({ center: pos, radius: ELECTRON_RADIUS, color: colors.electron }))
      }
    })

    bondInfo.forEach(({ center, u, v }) => {
      const speed = BOND_PAIR_SPEED
      for (let e = 0; e < 2; e++) {
        const angle = (e / 2) * Math.PI * 2 + t * speed
        const pos = {
          x: center.x + BOND_PAIR_RADIUS * (Math.cos(angle) * u.x + Math.sin(angle) * v.x),
          y: center.y + BOND_PAIR_RADIUS * (Math.cos(angle) * u.y + Math.sin(angle) * v.y),
          z: center.z + BOND_PAIR_RADIUS * (Math.cos(angle) * u.z + Math.sin(angle) * v.z),
        }
        state.electronShapes.push(viewer.addSphere({ center: pos, radius: ELECTRON_RADIUS, color: BOND_ELECTRON_COLOR }))
      }
    })

    ionicTransfers.forEach(({ from, to, count }) => {
      const a = model.atoms[from]
      const b = model.atoms[to]
      const axis = { x: b.x - a.x, y: b.y - a.y, z: b.z - a.z }
      const { u } = bondBasis(axis)
      for (let k = 0; k < count; k++) {
        const phase = k / count
        const progress = ((t * TRANSFER_SPEED) + phase) % 1
        const lift = Math.sin(progress * Math.PI) * TRANSFER_ARC_HEIGHT
        const pos = {
          x: a.x + (b.x - a.x) * progress + u.x * lift,
          y: a.y + (b.y - a.y) * progress + u.y * lift,
          z: a.z + (b.z - a.z) * progress + u.z * lift,
        }
        state.electronShapes.push(viewer.addSphere({ center: pos, radius: TRANSFER_RADIUS, color: TRANSFER_COLOR }))
      }
    })

    if (state.metallicCluster) {
      const { center, radius } = state.metallicCluster
      state.seaElectrons = state.seaElectrons.map(p => {
        let nx = p.x + (Math.random() - 0.5) * 0.12
        let ny = p.y + (Math.random() - 0.5) * 0.12
        let nz = p.z + (Math.random() - 0.5) * 0.12
        const d = Math.hypot(nx - center.x, ny - center.y, nz - center.z)
        if (d > radius) {
          const scale = radius / d
          nx = center.x + (nx - center.x) * scale
          ny = center.y + (ny - center.y) * scale
          nz = center.z + (nz - center.z) * scale
        }
        return { x: nx, y: ny, z: nz }
      })
      state.seaElectrons.forEach(pos => {
        state.electronShapes.push(viewer.addSphere({ center: pos, radius: ELECTRON_RADIUS, color: SEA_ELECTRON_COLOR }))
      })
    }

    viewer.render()
    t += 0.12
  }
  tick()
  state.timer = setInterval(tick, ELECTRON_TICK_MS)
}

const MolViewer = forwardRef(function MolViewer({ sdf, viewMode, spinning, theme, onLegendChange }, ref) {
  const containerRef = useRef(null)
  const viewerRef = useRef(null)
  const electronState = useRef({
    timer: null,
    staticShapes: [],
    electronShapes: [],
    chargeLabels: [],
    chargeLabelSpecs: [],
    seaElectrons: [],
    metallicCluster: null,
  })

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
      clearElectronShells(viewer, electronState)
      viewer.clear()
    }
  }, [])

  useEffect(() => {
    const viewer = viewerRef.current
    if (!viewer || !sdf) return
    clearElectronShells(viewer, electronState)
    viewer.clear()
    viewer.removeAllSurfaces()
    viewer.setBackgroundColor((THEME_COLORS[theme] ?? THEME_COLORS.dark).bg)
    viewer.addModel(sdf, 'sdf')
    applyStyle(viewer, viewMode)
    onLegendChange?.(buildElementLegend(viewer.getModel()))
    viewer.zoomTo()
    viewer.render()
    if (spinning) viewer.spin('y', 0.6)
    if (viewMode === 'electron-shells') startElectronShells(viewer, electronState, theme)
  }, [sdf])

  useEffect(() => {
    const viewer = viewerRef.current
    if (!viewer || !sdf) return
    clearElectronShells(viewer, electronState)
    viewer.removeAllSurfaces()
    applyStyle(viewer, viewMode)
    viewer.removeAllLabels()
    viewer.render()
    if (viewMode === 'electron-shells') startElectronShells(viewer, electronState, theme)
  }, [viewMode])

  useEffect(() => {
    const viewer = viewerRef.current
    if (!viewer || !sdf) return
    viewer.setBackgroundColor((THEME_COLORS[theme] ?? THEME_COLORS.dark).bg)
    if (viewMode === 'electron-shells') {
      clearElectronShells(viewer, electronState)
      startElectronShells(viewer, electronState, theme)
    }
    viewer.render()
  }, [theme])

  useEffect(() => {
    const viewer = viewerRef.current
    if (!viewer || !sdf) return
    if (spinning) viewer.spin('y', 0.6)
    else viewer.spin(false)
  }, [spinning])

  return (
    <div
      ref={containerRef}
      style={{ width: '100%', height: '100%' }}
    />
  )
})

export default MolViewer
