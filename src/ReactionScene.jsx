import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { parseSDF, getMoleculeCenter, getMoleculeBounds } from './sdfParser.js'
import { resolveFormula } from './chemistry.js'

// ── Jmol element colors ─────────────────────────────────────────
const ELEMENT_COLORS = {
  H: 0xffffff, C: 0x909090, N: 0x3050f8, O: 0xff0d0d,
  F: 0x90e050, Cl: 0x1ff01f, Br: 0xa62929, S: 0xffff30,
  P: 0xff8000, Na: 0xab5cf2, K: 0x8f40d4, Ca: 0x3dff00,
  Fe: 0xe06633, Cu: 0xc88033, Zn: 0x7d80b0, Ag: 0xc0c0c0,
  Au: 0xffd123, Mg: 0x8aff00, Al: 0xbfa6a6, Si: 0xf0c8a0,
  Mn: 0x9c7ac7, Co: 0xf090a0, Ni: 0x50d050, Pb: 0x575961,
  Ba: 0x00c900, Cr: 0x8a99c7, I: 0x940094, default: 0xaaaaaa,
}

// Ball-stick atom radii
const ATOM_RADII = {
  H: 0.12, C: 0.20, N: 0.19, O: 0.18, F: 0.16,
  Cl: 0.28, Br: 0.32, S: 0.28, P: 0.26, Na: 0.35,
  K: 0.40, Ca: 0.32, Fe: 0.30, Cu: 0.28, Zn: 0.28,
  Ag: 0.34, Au: 0.33, Mg: 0.28, Al: 0.28, default: 0.24,
}

const BOND_RADIUS = 0.06
const GAP = 1.4   // space between molecules

function elementColor(el) { return ELEMENT_COLORS[el] ?? ELEMENT_COLORS.default }
function atomRadius(el)   { return ATOM_RADII[el]    ?? ATOM_RADII.default    }

function lerp(a, b, t) { return a + (b - a) * t }
function easeOutCubic(t) { return 1 - Math.pow(1 - t, 3) }
function easeInCubic(t)  { return t * t * t }

function randRange(min, max) { return min + Math.random() * (max - min) }

// ── Build a Three.js group for one molecule ─────────────────────
function buildMolGroup(parsed) {
  const group = new THREE.Group()
  const { atoms, bonds } = parsed

  // Center the molecule at origin
  const center = getMoleculeCenter(atoms)
  const centered = atoms.map(a => ({ ...a, x: a.x - center.x, y: a.y - center.y, z: a.z - center.z }))

  // Atom meshes
  const atomMeshes = centered.map(atom => {
    const geo = new THREE.SphereGeometry(atomRadius(atom.element), 16, 12)
    const mat = new THREE.MeshPhongMaterial({
      color: elementColor(atom.element),
      transparent: true,
      opacity: 1,
      shininess: 80,
    })
    const mesh = new THREE.Mesh(geo, mat)
    mesh.position.set(atom.x, atom.y, atom.z)
    mesh.userData = { element: atom.element, basePos: new THREE.Vector3(atom.x, atom.y, atom.z) }
    group.add(mesh)
    return mesh
  })

  // Bond meshes
  const bondMeshes = bonds.map(bond => {
    const a1 = centered[bond.a1]
    const a2 = centered[bond.a2]
    if (!a1 || !a2) return null
    const p1 = new THREE.Vector3(a1.x, a1.y, a1.z)
    const p2 = new THREE.Vector3(a2.x, a2.y, a2.z)
    const dir = new THREE.Vector3().subVectors(p2, p1)
    const len = dir.length()
    if (len < 0.001) return null

    const geo = new THREE.CylinderGeometry(BOND_RADIUS, BOND_RADIUS, len, 8, 1)
    const mat = new THREE.MeshPhongMaterial({
      color: 0x888888,
      transparent: true,
      opacity: 1,
      shininess: 40,
    })
    const mesh = new THREE.Mesh(geo, mat)

    const mid = new THREE.Vector3().addVectors(p1, p2).multiplyScalar(0.5)
    mesh.position.copy(mid)
    mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.normalize())
    mesh.userData = {
      el1: a1.element, el2: a2.element,
      basePos: mid.clone(),
    }
    group.add(mesh)
    return mesh
  }).filter(Boolean)

  group.userData = { atomMeshes, bondMeshes, centered }
  return group
}

// Place molecules side by side, centered as a group
function layoutMolecules(parsedList) {
  const widths = parsedList.map(p => {
    if (!p) return 1
    const b = getMoleculeBounds(p.atoms)
    return Math.max((b.max.x - b.min.x), 1)
  })
  const totalW = widths.reduce((s, w) => s + w, 0) + GAP * (parsedList.length - 1)
  const offsets = []
  let cursor = -totalW / 2
  for (const w of widths) {
    offsets.push(cursor + w / 2)
    cursor += w + GAP
  }
  return offsets
}

// Find breaking bond meshes in a group based on patterns
function findBreakingBonds(group, patterns) {
  if (!group) return []
  const { bondMeshes } = group.userData
  if (patterns === 'all') return [...bondMeshes]
  return bondMeshes.filter(m => {
    const { el1, el2 } = m.userData
    return patterns.some(([p1, p2]) =>
      (el1 === p1 && el2 === p2) || (el1 === p2 && el2 === p1)
    )
  })
}

const BG_DARK  = 0x080f0f
const BG_LIGHT = 0xf0faf8

export default function ReactionScene({ reactantSDFs, productSDFs, reactants, products, phase, bondChanges, theme }) {
  const mountRef = useRef(null)
  const ss = useRef(null) // scene state

  // ── Init Three.js ─────────────────────────────────────────────
  useEffect(() => {
    const container = mountRef.current
    if (!container) return

    const w = container.clientWidth
    const h = container.clientHeight

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setPixelRatio(window.devicePixelRatio)
    renderer.setSize(w, h)
    renderer.setClearColor(theme === 'light' ? BG_LIGHT : BG_DARK, 1)
    container.appendChild(renderer.domElement)

    const scene = new THREE.Scene()

    const camera = new THREE.PerspectiveCamera(40, w / h, 0.1, 200)
    camera.position.set(0, 0, 18)

    // Lights
    scene.add(new THREE.AmbientLight(0xffffff, 0.6))
    const dir = new THREE.DirectionalLight(0xffffff, 0.9)
    dir.position.set(5, 8, 10)
    scene.add(dir)
    const back = new THREE.DirectionalLight(0x8888ff, 0.3)
    back.position.set(-5, -4, -8)
    scene.add(back)

    const controls = new OrbitControls(camera, renderer.domElement)
    controls.enableDamping = true
    controls.dampingFactor = 0.08
    controls.minDistance = 3
    controls.maxDistance = 50

    const state = {
      renderer, scene, camera, controls,
      reactantGroups: [],   // THREE.Group per molecule
      productGroups: [],
      animPhase: null,      // 'highlight' | 'scatter' | 'form' | null
      animStart: 0,
      animDuration: 0,
      animData: null,
      rafId: null,
    }
    ss.current = state

    function onResize() {
      const W = container.clientWidth
      const H = container.clientHeight
      renderer.setSize(W, H)
      camera.aspect = W / H
      camera.updateProjectionMatrix()
    }
    const ro = new ResizeObserver(onResize)
    ro.observe(container)

    function loop() {
      state.rafId = requestAnimationFrame(loop)
      tickAnimation(state)
      controls.update()
      renderer.render(scene, camera)
    }
    loop()

    return () => {
      cancelAnimationFrame(state.rafId)
      ro.disconnect()
      controls.dispose()
      renderer.dispose()
      container.removeChild(renderer.domElement)
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Rebuild scene when SDF data changes ───────────────────────
  useEffect(() => {
    const state = ss.current
    if (!state) return

    // Clear existing groups
    state.reactantGroups.forEach(g => state.scene.remove(g))
    state.productGroups.forEach(g => state.scene.remove(g))
    state.reactantGroups = []
    state.productGroups = []
    state.animPhase = null

    // Parse reactants
    const parsedR = reactantSDFs.map(s => s ? parseSDF(s) : null)
    const validR = parsedR.filter(Boolean)
    if (!validR.length) return

    const offsetsR = layoutMolecules(validR)
    let validIdx = 0
    parsedR.forEach((p, i) => {
      if (!p) return
      const g = buildMolGroup(p)
      g.position.x = offsetsR[validIdx++]
      g.userData.formula = resolveFormula(reactants[i]?.formula) ?? reactants[i]?.formula
      state.scene.add(g)
      state.reactantGroups.push(g)
    })

    // Parse products (built but hidden until forming step)
    const parsedP = productSDFs.map(s => s ? parseSDF(s) : null)
    const validP = parsedP.filter(Boolean)
    const offsetsP = validP.length ? layoutMolecules(validP) : []
    let pIdx = 0
    parsedP.forEach((p, i) => {
      if (!p) return
      const g = buildMolGroup(p)
      g.position.x = offsetsP[pIdx++]
      g.userData.formula = resolveFormula(products[i]?.formula) ?? products[i]?.formula
      g.visible = false
      setGroupOpacity(g, 0)
      state.scene.add(g)
      state.productGroups.push(g)
    })

    // Fit camera to reactant groups
    fitCamera(state)
  }, [reactantSDFs, productSDFs])

  // ── React to phase changes ────────────────────────────────────
  useEffect(() => {
    const state = ss.current
    if (!state) return

    if (phase === 'breaking') {
      triggerBreak(state, bondChanges)
    } else if (phase === 'forming' || phase === 'result') {
      // If reactants are still visible, skip straight to products
      showProducts(state)
    } else {
      // 'reactants', 'no-reaction' or anything else → reset to reactant view
      resetToReactants(state)
    }
  }, [phase]) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Theme changes ─────────────────────────────────────────────
  useEffect(() => {
    if (ss.current?.renderer) {
      ss.current.renderer.setClearColor(theme === 'light' ? BG_LIGHT : BG_DARK, 1)
    }
  }, [theme])

  return <div ref={mountRef} className="reaction-scene" />
}

// ── Animation tick ────────────────────────────────────────────
function tickAnimation(state) {
  if (!state.animPhase) return
  const now = performance.now()
  const elapsed = now - state.animStart
  const t = Math.min(elapsed / state.animDuration, 1)

  if (state.animPhase === 'highlight') {
    // Pulse breaking bonds orange → red
    const pulse = Math.sin(t * Math.PI * 4) * 0.5 + 0.5
    state.animData.breakingBonds.forEach(mesh => {
      mesh.material.color.setHex(lerpHex(0xff8800, 0xff2200, pulse))
      mesh.material.emissive = new THREE.Color(lerpHex(0x441100, 0x660000, pulse))
      mesh.material.emissiveIntensity = 0.6
    })
    if (t >= 1) {
      state.animPhase = 'scatter'
      state.animStart = performance.now()
      state.animDuration = 700
      // Assign random scatter velocities to all atom/bond meshes
      const allMeshes = []
      state.reactantGroups.forEach(g => {
        const { atomMeshes, bondMeshes } = g.userData
        ;[...atomMeshes, ...bondMeshes].forEach(m => {
          const dir = new THREE.Vector3(
            randRange(-1, 1), randRange(-0.3, 1), randRange(-0.5, 0.5)
          ).normalize()
          const speed = randRange(0.04, 0.10)
          allMeshes.push({ mesh: m, velocity: dir.multiplyScalar(speed) })
        })
      })
      state.animData = { allMeshes }
    }
    return
  }

  if (state.animPhase === 'scatter') {
    state.animData.allMeshes.forEach(({ mesh, velocity }) => {
      mesh.position.x += velocity.x
      mesh.position.y += velocity.y
      mesh.position.z += velocity.z
      velocity.y -= 0.002
      mesh.material.opacity = 1 - easeInCubic(t)
    })
    if (t >= 1) {
      state.reactantGroups.forEach(g => { g.visible = false })
      state.animPhase = null
    }
    return
  }

  if (state.animPhase === 'form') {
    const ease = easeOutCubic(t)
    state.animData.formItems.forEach(({ mesh, from, to }) => {
      mesh.position.set(
        lerp(from.x, to.x, ease),
        lerp(from.y, to.y, ease),
        lerp(from.z, to.z, ease)
      )
      mesh.material.opacity = t
    })
    // Bonds fade in after atoms are halfway there
    if (t > 0.55) {
      const bt = (t - 0.55) / 0.45
      state.animData.bondItems.forEach(({ mesh }) => {
        mesh.material.opacity = bt
        mesh.visible = true
      })
    }
    if (t >= 1) {
      setGroupsOpaque(state.productGroups)
      state.animPhase = null
    }
    return
  }
}

function triggerBreak(state, bondChanges) {
  // Reset product groups to hidden
  state.productGroups.forEach(g => { g.visible = false; setGroupOpacity(g, 0) })

  // Restore reactants fully visible
  state.reactantGroups.forEach(g => {
    g.visible = true
    restoreGroupMaterials(g)
  })

  // Find which bonds to highlight
  const breakingBonds = []
  if (bondChanges) {
    state.reactantGroups.forEach((g, idx) => {
      const formula = g.userData.formula
      const entry = bondChanges.breaking.find(b => b.formula === formula)
      if (entry) {
        findBreakingBonds(g, entry.patterns).forEach(m => breakingBonds.push(m))
      } else {
        // No specific entry: highlight all bonds in this group
        findBreakingBonds(g, 'all').forEach(m => breakingBonds.push(m))
      }
    })
  } else {
    state.reactantGroups.forEach(g => findBreakingBonds(g, 'all').forEach(m => breakingBonds.push(m)))
  }

  state.animPhase = 'highlight'
  state.animStart = performance.now()
  state.animDuration = 900
  state.animData = { breakingBonds }
}

function beginFormAnimation(state) {
  const formItems = []
  const bondItems = []

  state.productGroups.forEach(g => {
    g.visible = true
    const { atomMeshes, bondMeshes } = g.userData

    atomMeshes.forEach(mesh => {
      // basePos and from are both group-local coordinates
      const to = mesh.userData.basePos.clone()
      const from = new THREE.Vector3(randRange(-4, 4), randRange(-3, 3), randRange(-2, 2))
      mesh.position.copy(from)
      mesh.material.opacity = 0
      formItems.push({ mesh, from, to })
    })

    bondMeshes.forEach(mesh => {
      mesh.material.opacity = 0
      mesh.visible = false
      bondItems.push({ mesh })
    })
  })

  state.animPhase = 'form'
  state.animStart = performance.now()
  state.animDuration = 1100
  state.animData = { formItems, bondItems }
}

function showProducts(state) {
  // Cancel any running animation
  state.animPhase = null

  // Hide reactants
  state.reactantGroups.forEach(g => { g.visible = false })

  // Immediately show/animate products if not already visible
  const anyVisible = state.productGroups.some(g => g.visible && g.userData.atomMeshes?.[0]?.material.opacity > 0.5)
  if (!anyVisible) {
    beginFormAnimation(state)
  }
}

function resetToReactants(state) {
  state.animPhase = null
  state.productGroups.forEach(g => { g.visible = false; setGroupOpacity(g, 0) })
  state.reactantGroups.forEach(g => {
    g.visible = true
    restoreGroupMaterials(g)
  })
}

function fitCamera(state) {
  const box = new THREE.Box3()
  state.reactantGroups.forEach(g => box.expandByObject(g))
  if (box.isEmpty()) return
  const size = box.getSize(new THREE.Vector3())
  const center = box.getCenter(new THREE.Vector3())
  const maxDim = Math.max(size.x, size.y, size.z)
  const fov = state.camera.fov * (Math.PI / 180)
  const dist = (maxDim / 2) / Math.tan(fov / 2) * 1.6
  state.camera.position.set(center.x, center.y, center.z + dist)
  state.controls.target.copy(center)
  state.controls.update()
}

function setGroupOpacity(group, opacity) {
  group.traverse(obj => {
    if (obj.isMesh) {
      obj.material.opacity = opacity
      obj.material.transparent = true
    }
  })
}

function setGroupsOpaque(groups) {
  groups.forEach(g => {
    g.traverse(obj => {
      if (obj.isMesh) obj.material.opacity = 1
    })
  })
}

function restoreGroupMaterials(group) {
  const { atomMeshes, bondMeshes, centered } = group.userData
  atomMeshes?.forEach((mesh, i) => {
    const c = centered[i]
    mesh.position.set(c.x, c.y, c.z)
    mesh.material.opacity = 1
    mesh.material.color.setHex(elementColor(c.element))
    if (mesh.material.emissive) mesh.material.emissive.set(0x000000)
    mesh.material.emissiveIntensity = 0
  })
  bondMeshes?.forEach(mesh => {
    mesh.position.copy(mesh.userData.basePos)
    mesh.material.opacity = 1
    mesh.material.color.setHex(0x888888)
    if (mesh.material.emissive) mesh.material.emissive.set(0x000000)
    mesh.material.emissiveIntensity = 0
  })
}

function lerpHex(c1, c2, t) {
  const r1 = (c1 >> 16) & 0xff, g1 = (c1 >> 8) & 0xff, b1 = c1 & 0xff
  const r2 = (c2 >> 16) & 0xff, g2 = (c2 >> 8) & 0xff, b2 = c2 & 0xff
  return (
    (Math.round(r1 + (r2 - r1) * t) << 16) |
    (Math.round(g1 + (g2 - g1) * t) << 8) |
     Math.round(b1 + (b2 - b1) * t)
  )
}
