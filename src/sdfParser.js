// Parses a V2000 SDF/MOL file into atoms and bonds arrays.
export function parseSDF(sdfText) {
  if (!sdfText) return null
  const lines = sdfText.split('\n')

  // Line 4 (index 3) is the counts line: aaabbblllfffcccsssxxxrrrpppiiimmmvvvvvv
  const countsLine = lines[3] || ''
  const atomCount = parseInt(countsLine.substring(0, 3), 10)
  const bondCount = parseInt(countsLine.substring(3, 6), 10)
  if (isNaN(atomCount) || isNaN(bondCount)) return null

  const atoms = []
  for (let i = 0; i < atomCount; i++) {
    const line = lines[4 + i] || ''
    atoms.push({
      x: parseFloat(line.substring(0, 10)),
      y: parseFloat(line.substring(10, 20)),
      z: parseFloat(line.substring(20, 30)),
      element: line.substring(31, 34).trim(),
    })
  }

  const bonds = []
  for (let i = 0; i < bondCount; i++) {
    const line = lines[4 + atomCount + i] || ''
    bonds.push({
      a1: parseInt(line.substring(0, 3), 10) - 1,  // 0-indexed
      a2: parseInt(line.substring(3, 6), 10) - 1,
      order: parseInt(line.substring(6, 9), 10) || 1,
    })
  }

  return { atoms, bonds }
}

export function getMoleculeCenter(atoms) {
  if (!atoms.length) return { x: 0, y: 0, z: 0 }
  const s = atoms.reduce((a, p) => ({ x: a.x + p.x, y: a.y + p.y, z: a.z + p.z }), { x: 0, y: 0, z: 0 })
  return { x: s.x / atoms.length, y: s.y / atoms.length, z: s.z / atoms.length }
}

export function getMoleculeBounds(atoms) {
  if (!atoms.length) return { min: { x: 0, y: 0, z: 0 }, max: { x: 0, y: 0, z: 0 } }
  const min = { x: Infinity, y: Infinity, z: Infinity }
  const max = { x: -Infinity, y: -Infinity, z: -Infinity }
  for (const a of atoms) {
    if (a.x < min.x) min.x = a.x
    if (a.y < min.y) min.y = a.y
    if (a.z < min.z) min.z = a.z
    if (a.x > max.x) max.x = a.x
    if (a.y > max.y) max.y = a.y
    if (a.z > max.z) max.z = a.z
  }
  return { min, max }
}
