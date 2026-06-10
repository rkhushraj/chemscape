export function cross(a, b) {
  return { x: a.y * b.z - a.z * b.y, y: a.z * b.x - a.x * b.z, z: a.x * b.y - a.y * b.x }
}

export function normalize(a) {
  const len = Math.sqrt(a.x * a.x + a.y * a.y + a.z * a.z) || 1
  return { x: a.x / len, y: a.y / len, z: a.z / len }
}

// Deterministic pseudo-random orthonormal basis (per index) for shell orientation
export function atomBasis(index) {
  const a = (index * 12.9898) % (Math.PI * 2)
  const b = (index * 78.233) % Math.PI
  const n = { x: Math.sin(b) * Math.cos(a), y: Math.sin(b) * Math.sin(a), z: Math.cos(b) }
  const ref = Math.abs(n.z) < 0.9 ? { x: 0, y: 0, z: 1 } : { x: 1, y: 0, z: 0 }
  const u = normalize(cross(n, ref))
  const v = cross(n, u)
  return { u, v }
}

export function dot(a, b) {
  return a.x * b.x + a.y * b.y + a.z * b.z
}

// Rotates vector v by angle (radians) around a unit axis (Rodrigues' formula)
export function rotateAroundAxis(v, axis, angle) {
  const cos = Math.cos(angle)
  const sin = Math.sin(angle)
  const k = cross(axis, v)
  const d = dot(axis, v) * (1 - cos)
  return {
    x: v.x * cos + k.x * sin + axis.x * d,
    y: v.y * cos + k.y * sin + axis.y * d,
    z: v.z * cos + k.z * sin + axis.z * d,
  }
}

export function circlePoints(center, radius, u, v, segments = 32) {
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
