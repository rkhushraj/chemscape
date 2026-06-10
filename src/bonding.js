import { ATOMIC_NUMBERS, getShellElectrons } from './elements.js'

// Pauling electronegativity values for common elements
export const ELECTRONEGATIVITY = {
  H: 2.20, Li: 0.98, Be: 1.57, B: 2.04, C: 2.55, N: 3.04, O: 3.44, F: 3.98,
  Na: 0.93, Mg: 1.31, Al: 1.61, Si: 1.90, P: 2.19, S: 2.58, Cl: 3.16,
  K: 0.82, Ca: 1.00, Sc: 1.36, Ti: 1.54, V: 1.63, Cr: 1.66, Mn: 1.55, Fe: 1.83,
  Co: 1.88, Ni: 1.91, Cu: 1.90, Zn: 1.65,
  Ga: 1.81, Ge: 2.01, As: 2.18, Se: 2.55, Br: 2.96, Kr: 3.00,
  Rb: 0.82, Sr: 0.95, Y: 1.22, Zr: 1.33, Nb: 1.6, Mo: 2.16, Tc: 1.9, Ru: 2.2,
  Rh: 2.28, Pd: 2.20, Ag: 1.93, Cd: 1.69,
  In: 1.78, Sn: 1.96, Sb: 2.05, Te: 2.1, I: 2.66, Xe: 2.6,
}

export const METALS = new Set([
  'Li', 'Na', 'K', 'Rb', 'Cs', 'Fr',
  'Be', 'Mg', 'Ca', 'Sr', 'Ba', 'Ra',
  'Sc', 'Ti', 'V', 'Cr', 'Mn', 'Fe', 'Co', 'Ni', 'Cu', 'Zn',
  'Y', 'Zr', 'Nb', 'Mo', 'Tc', 'Ru', 'Rh', 'Pd', 'Ag', 'Cd',
  'Al', 'Ga', 'In', 'Sn',
])

const IONIC_THRESHOLD = 1.7
const METALLIC_EN_DIFF = 0.4

function clampBondOrder(order) {
  if (!order || order >= 4) return 1 // treat aromatic/unknown as single
  return Math.round(order)
}

// Classifies every bond as covalent, ionic, or metallic, and computes an
// adjusted electron-shell distribution per atom reflecting that bonding.
export function analyzeBonding(model) {
  const atoms = model.atoms
  const n = atoms.length

  const atomMeta = atoms.map(atom => {
    const Z = ATOMIC_NUMBERS[atom.elem]
    return {
      elem: atom.elem,
      shells: Z ? getShellElectrons(Z).slice() : [],
      electronChange: 0,
      covalentDepletion: 0,
      metallic: false,
      charge: 0,
    }
  })

  const covalentPairs = []
  const metallicEdges = []
  const ionicTransfers = []

  function classifyEdge(i, j, order) {
    const elemA = atomMeta[i].elem
    const elemB = atomMeta[j].elem
    const enA = ELECTRONEGATIVITY[elemA]
    const enB = ELECTRONEGATIVITY[elemB]
    const diff = (enA != null && enB != null) ? Math.abs(enA - enB) : 0

    if (METALS.has(elemA) && METALS.has(elemB) && diff < METALLIC_EN_DIFF) {
      metallicEdges.push([i, j])
    } else if (enA != null && enB != null && diff >= IONIC_THRESHOLD) {
      // the more electronegative atom gains electron(s); the other loses them
      if (enA > enB) {
        atomMeta[i].electronChange += order
        atomMeta[j].electronChange -= order
        ionicTransfers.push({ from: j, to: i, count: order })
      } else {
        atomMeta[j].electronChange += order
        atomMeta[i].electronChange -= order
        ionicTransfers.push({ from: i, to: j, count: order })
      }
    } else {
      covalentPairs.push({ a: i, b: j, order })
      atomMeta[i].covalentDepletion += order
      atomMeta[j].covalentDepletion += order
    }
  }

  const bondedAtoms = new Set()
  for (let i = 0; i < n; i++) {
    const atom = atoms[i]
    if (!atom.bonds) continue
    atom.bonds.forEach((j, idx) => {
      if (j <= i) return
      bondedAtoms.add(i)
      bondedAtoms.add(j)
      const order = clampBondOrder(atom.bondOrder ? atom.bondOrder[idx] : 1)
      classifyEdge(i, j, order)
    })
  }

  // Atoms with no real bond connectivity (e.g. a counter-ion like Ca2+ next
  // to a carbonate group, or 2D fallback structures with no bonds at all)
  // get distance-based pairing so ionic electron transfer still renders.
  // If the structure also contains a nonmetal that some metal could form an
  // ionic bond with, treat any nearby metal-metal pairs as a 2D layout
  // artifact rather than metallic bonding (e.g. the two Al atoms drawn next
  // to each other in Al2O3 aren't a metallic bond).
  const hasIonicNonmetalPartner = atoms.some(b => {
    if (METALS.has(b.elem)) return false
    const enB = ELECTRONEGATIVITY[b.elem]
    if (enB == null) return false
    return atoms.some(a => METALS.has(a.elem) && ELECTRONEGATIVITY[a.elem] != null && Math.abs(ELECTRONEGATIVITY[a.elem] - enB) >= IONIC_THRESHOLD)
  })

  const DIST_CUTOFF = 3.5
  const processedPairs = new Set()
  for (let i = 0; i < n; i++) {
    if (bondedAtoms.has(i)) continue
    for (let j = 0; j < n; j++) {
      if (j === i) continue
      const elemA = atoms[i].elem
      const elemB = atoms[j].elem
      const bothMetal = METALS.has(elemA) && METALS.has(elemB)
      if (hasIonicNonmetalPartner && bothMetal) continue
      const enA = ELECTRONEGATIVITY[elemA]
      const enB = ELECTRONEGATIVITY[elemB]
      const diff = (enA != null && enB != null) ? Math.abs(enA - enB) : 0
      // Only pair atoms that aren't actually bonded if the relationship is
      // ionic or metallic; nearby nonmetal-nonmetal atoms in a 2D layout
      // (e.g. O...O distances in Al2O3) aren't a real bond.
      const isIonic = enA != null && enB != null && diff >= IONIC_THRESHOLD
      const isMetallic = bothMetal && diff < METALLIC_EN_DIFF
      if (!isIonic && !isMetallic) continue
      const a = Math.min(i, j), b = Math.max(i, j)
      const key = `${a}-${b}`
      if (processedPairs.has(key)) continue
      const dist = Math.hypot(atoms[a].x - atoms[b].x, atoms[a].y - atoms[b].y, atoms[a].z - atoms[b].z)
      if (dist < DIST_CUTOFF) {
        processedPairs.add(key)
        classifyEdge(a, b, 1)
      }
    }
  }

  const metallicAtomSet = new Set()
  metallicEdges.forEach(([i, j]) => { metallicAtomSet.add(i); metallicAtomSet.add(j) })

  let metallicCluster = null
  if (metallicAtomSet.size > 0) {
    const indices = [...metallicAtomSet]
    let cx = 0, cy = 0, cz = 0
    indices.forEach(i => { cx += atoms[i].x; cy += atoms[i].y; cz += atoms[i].z })
    cx /= indices.length; cy /= indices.length; cz /= indices.length
    let radius = 0
    indices.forEach(i => {
      radius = Math.max(radius, Math.hypot(atoms[i].x - cx, atoms[i].y - cy, atoms[i].z - cz))
    })

    let totalElectrons = 0
    indices.forEach(i => {
      const shells = atomMeta[i].shells
      const valence = shells[shells.length - 1] || 0
      totalElectrons += valence
      atomMeta[i].electronChange = -valence
      atomMeta[i].covalentDepletion = 0
      atomMeta[i].metallic = true
    })

    metallicCluster = {
      indices,
      center: { x: cx, y: cy, z: cz },
      radius: radius + 0.6,
      electronCount: Math.min(Math.max(Math.round(totalElectrons), 4), 24),
    }
  }

  atomMeta.forEach(meta => {
    if (!meta.shells.length) return
    const last = meta.shells.length - 1
    const original = meta.shells[last]
    let change = meta.electronChange
    if (change < 0) {
      // can't give away more electrons than the atom actually has
      change = Math.max(change, -original)
    } else if (change > 0) {
      // can't receive more electrons than the shell has room for
      const capacity = (last === 0 ? 2 : 8) - original - meta.covalentDepletion
      change = Math.min(change, Math.max(capacity, 0))
    }
    const valence = Math.max(0, original + change - meta.covalentDepletion)
    meta.shells[last] = valence
    meta.charge = -change
    if (meta.metallic) {
      meta.shells = meta.shells.slice(0, -1)
    }
  })

  return { atomMeta, covalentPairs, metallicCluster, ionicTransfers }
}
