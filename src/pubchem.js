const BASE = 'https://pubchem.ncbi.nlm.nih.gov/rest/pug'

export async function fetchCompound(query) {
  // Try to resolve CID from name or formula
  const nameUrl = `${BASE}/compound/name/${encodeURIComponent(query)}/cids/JSON`
  const res = await fetch(nameUrl)
  if (!res.ok) throw new Error(`Compound "${query}" not found`)
  const data = await res.json()
  const cid = data.IdentifierList?.CID?.[0]
  if (!cid) throw new Error(`No results for "${query}"`)

  // Fetch 3D SDF
  const sdfUrl = `${BASE}/compound/cid/${cid}/SDF?record_type=3d`
  const sdfRes = await fetch(sdfUrl)
  if (!sdfRes.ok) {
    // Fall back to 2D if no 3D coords available
    const sdf2dUrl = `${BASE}/compound/cid/${cid}/SDF`
    const sdf2dRes = await fetch(sdf2dUrl)
    if (!sdf2dRes.ok) throw new Error('Could not fetch structure data')
    const sdf = await sdf2dRes.text()
    return { cid, sdf, is2d: true }
  }
  const sdf = await sdfRes.text()
  return { cid, sdf, is2d: false }
}

export async function fetchCompoundInfo(cid) {
  const url = `${BASE}/compound/cid/${cid}/property/IUPACName,MolecularFormula,MolecularWeight,InChIKey,XLogP,HBondDonorCount,HBondAcceptorCount,RotatableBondCount/JSON`
  const res = await fetch(url)
  if (!res.ok) return null
  const data = await res.json()
  return data.PropertyTable?.Properties?.[0] ?? null
}
