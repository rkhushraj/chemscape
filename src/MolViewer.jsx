import { useEffect, useRef, useImperativeHandle, forwardRef } from 'react'
import * as $3Dmol from '3dmol/build/3Dmol.es6.js'
import { ATOMIC_NUMBERS, getShellElectrons } from './elements.js'

const SURFACE_TYPE = $3Dmol.SurfaceType?.VDW ?? 1

const SHELL_BASE_RADIUS = 0.4
const SHELL_RADIUS_STEP = 0.3
const SHELL_COLOR = '#4a5a7a'
const ELECTRON_RADIUS = 0.05
const ELECTRON_COLOR = '#7df9ff'
const ELECTRON_TICK_MS = 90

function applyStyle(viewer, viewMode) {
  viewer.setStyle({}, {})
  if (viewMode === 'ball-stick') {
    viewer.setStyle({}, { sphere: { scale: 0.3 }, stick: { radius: 0.15 } })
  } else if (viewMode === 'cpk') {
    viewer.setStyle({}, { sphere: { scale: 1.0 } })
  } else if (viewMode === 'wireframe') {
    viewer.setStyle({}, { line: { linewidth: 2 } })
  } else if (viewMode === 'surface') {
    viewer.setStyle({}, { sphere: { scale: 0.25 }, stick: { radius: 0.12 } })
    viewer.addSurface(SURFACE_TYPE, { opacity: 0.65, colorscheme: 'ssJmol' })
  } else if (viewMode === 'electron-shells') {
    viewer.setStyle({}, { sphere: { scale: 0.18 }, stick: { radius: 0.08 } })
  }
}

function addAtomLabels(viewer) {
  viewer.removeAllLabels()
  const model = viewer.getModel()
  if (!model) return
  model.atoms.forEach(atom => {
    if (!atom.elem) return
    viewer.addLabel(atom.elem, {
      position: { x: atom.x, y: atom.y, z: atom.z },
      fontSize: 11,
      fontColor: 'white',
      backgroundOpacity: 0.55,
      backgroundColor: 'black',
      borderThickness: 0,
      inFront: true,
      showBackground: true,
    })
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

function clearElectronShells(viewer, electronState) {
  const state = electronState.current
  if (state.timer) {
    clearInterval(state.timer)
    state.timer = null
  }
  ;[...state.staticShapes, ...state.electronShapes].forEach(s => viewer.removeShape(s))
  state.staticShapes = []
  state.electronShapes = []
}

function startElectronShells(viewer, electronState) {
  const model = viewer.getModel()
  if (!model) return
  const state = electronState.current
  const atomInfo = []

  model.atoms.forEach((atom, i) => {
    const atomicNumber = ATOMIC_NUMBERS[atom.elem]
    if (!atomicNumber) return
    const shells = getShellElectrons(atomicNumber)
    const { u, v } = atomBasis(i)
    shells.forEach((_, shellIdx) => {
      const radius = SHELL_BASE_RADIUS + shellIdx * SHELL_RADIUS_STEP
      const pts = circlePoints(atom, radius, u, v)
      state.staticShapes.push(viewer.addCurve({ points: pts, radius: 0.01, color: SHELL_COLOR }))
    })
    atomInfo.push({ atom, shells, u, v })
  })

  let t = 0
  const tick = () => {
    state.electronShapes.forEach(s => viewer.removeShape(s))
    state.electronShapes = []
    atomInfo.forEach(({ atom, shells, u, v }) => {
      shells.forEach((count, shellIdx) => {
        const radius = SHELL_BASE_RADIUS + shellIdx * SHELL_RADIUS_STEP
        const speed = 0.9 / (shellIdx + 1)
        for (let e = 0; e < count; e++) {
          const angle = (e / count) * Math.PI * 2 + t * speed
          const pos = {
            x: atom.x + radius * (Math.cos(angle) * u.x + Math.sin(angle) * v.x),
            y: atom.y + radius * (Math.cos(angle) * u.y + Math.sin(angle) * v.y),
            z: atom.z + radius * (Math.cos(angle) * u.z + Math.sin(angle) * v.z),
          }
          state.electronShapes.push(viewer.addSphere({ center: pos, radius: ELECTRON_RADIUS, color: ELECTRON_COLOR }))
        }
      })
    })
    viewer.render()
    t += 0.12
  }
  tick()
  state.timer = setInterval(tick, ELECTRON_TICK_MS)
}

const MolViewer = forwardRef(function MolViewer({ sdf, viewMode, showLabels, spinning }, ref) {
  const containerRef = useRef(null)
  const viewerRef = useRef(null)
  const electronState = useRef({ timer: null, staticShapes: [], electronShapes: [] })

  useImperativeHandle(ref, () => ({
    resetView: () => {
      viewerRef.current?.zoomTo()
      viewerRef.current?.render()
    },
  }))

  useEffect(() => {
    if (!containerRef.current) return
    const viewer = $3Dmol.createViewer(containerRef.current, {
      backgroundColor: '0x0a0a0f',
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
    viewer.addModel(sdf, 'sdf')
    applyStyle(viewer, viewMode)
    if (showLabels) addAtomLabels(viewer)
    viewer.zoomTo()
    viewer.render()
    if (spinning) viewer.spin('y', 0.6)
    if (viewMode === 'electron-shells') startElectronShells(viewer, electronState)
  }, [sdf])

  useEffect(() => {
    const viewer = viewerRef.current
    if (!viewer || !sdf) return
    clearElectronShells(viewer, electronState)
    viewer.removeAllSurfaces()
    applyStyle(viewer, viewMode)
    if (showLabels) addAtomLabels(viewer); else viewer.removeAllLabels()
    viewer.render()
    if (viewMode === 'electron-shells') startElectronShells(viewer, electronState)
  }, [viewMode])

  useEffect(() => {
    const viewer = viewerRef.current
    if (!viewer || !sdf) return
    if (showLabels) addAtomLabels(viewer); else viewer.removeAllLabels()
    viewer.render()
  }, [showLabels])

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
