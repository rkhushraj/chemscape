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
  const props = data.PropertyTable?.Properties?.[0] ?? null
  if (props?.IUPACName) {
    props.IUPACName = formatIUPACName(props.IUPACName)
  }
  return props
}

// PubChem's auto-generated "IUPAC" names are produced by a substitutive-nomenclature
// algorithm that often does not match the IUPAC-preferred name for simple ionic
// compounds: it adds redundant multiplying prefixes ("dialuminum trioxide"), splits
// salts into separate charged-ion fragments ("dialuminum;tris(oxygen(2-))"), uses
// systematic parent-hydride names instead of common ones ("oxidane", "azane",
// "azanium"), and uses additive "(2+)"/"oxo-" notation instead of Stock numerals.
// The functions below normalize these into conventional names, e.g.
// "calcium dichloride" -> "calcium chloride", "dialuminum;tris(oxygen(2-))" ->
// "aluminum oxide", "iron(2+);oxygen(2-)" -> "iron(II) oxide".

const MULTIPLYING_PREFIXES = ['hexa', 'penta', 'tetra', 'tri', 'di']
const MULTIPLYING_VALUES = { mono: 1, di: 2, tri: 3, tetra: 4, penta: 5, hexa: 6, hepta: 7, octa: 8 }

const FIXED_VALENCE_METALS = new Set([
  'lithium', 'sodium', 'potassium', 'rubidium', 'caesium', 'cesium', 'francium',
  'beryllium', 'magnesium', 'calcium', 'strontium', 'barium', 'radium',
  'aluminium', 'aluminum', 'zinc', 'cadmium', 'silver',
])

const VARIABLE_VALENCE_METALS = new Set([
  'iron', 'copper', 'manganese', 'chromium', 'cobalt', 'nickel', 'tin', 'lead',
  'mercury', 'titanium', 'vanadium', 'gold', 'platinum', 'tungsten', 'molybdenum',
])

const KNOWN_METAL_NAMES = new Set([
  ...FIXED_VALENCE_METALS,
  ...VARIABLE_VALENCE_METALS,
  'gallium', 'indium',
])

// Maps PubChem's "...oxo"/"...chloro" style additive prefixes to the corresponding
// monatomic anion name and charge.
const ANION_PREFIX_FORMS = {
  hydroxo: { name: 'hydroxide', charge: -1 },
  hydrido: { name: 'hydride', charge: -1 },
  cyanido: { name: 'cyanide', charge: -1 },
  sulfido: { name: 'sulfide', charge: -2 },
  nitrido: { name: 'nitride', charge: -3 },
  phosphido: { name: 'phosphide', charge: -3 },
  carbido: { name: 'carbide', charge: -4 },
  fluoro: { name: 'fluoride', charge: -1 },
  chloro: { name: 'chloride', charge: -1 },
  bromo: { name: 'bromide', charge: -1 },
  iodo: { name: 'iodide', charge: -1 },
  oxo: { name: 'oxide', charge: -2 },
}

// Maps a bare element name (as used inside PubChem's "oxygen(2-)" style ion
// fragments) to its monatomic anion name.
const ELEMENT_ANION_NAMES = {
  oxygen: 'oxide', sulfur: 'sulfide', selenium: 'selenide', tellurium: 'telluride',
  nitrogen: 'nitride', phosphorus: 'phosphide', arsenic: 'arsenide',
  carbon: 'carbide', silicon: 'silicide', boron: 'boride',
  fluorine: 'fluoride', chlorine: 'chloride', bromine: 'bromide', iodine: 'iodide',
  hydrogen: 'hydride',
}

// PubChem sometimes names simple metal compounds using substitutive parent-hydride
// names (e.g. "tetrachlorostannane" for SnCl4); map these back to the metal name.
const SUBSTITUTIVE_METAL_ALIASES = { stannane: 'tin', plumbane: 'lead' }

// A few common molecules get systematic names that nobody actually uses.
const SIMPLE_NAME_OVERRIDES = { oxidane: 'water', azane: 'ammonia' }

const ROMAN_NUMERALS = ['', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII']
function toRoman(n) {
  return ROMAN_NUMERALS[n] || String(n)
}

function stripMultiplyingPrefix(word) {
  for (const prefix of MULTIPLYING_PREFIXES) {
    if (word.toLowerCase().startsWith(prefix) && word.length > prefix.length + 2) {
      return word.slice(prefix.length)
    }
  }
  return word
}

// "calcium dichloride" -> "calcium chloride" (redundant prefix on a fixed-valence
// metal salt's anion).
function simplifyFixedValenceSaltName(name) {
  const words = name.trim().split(/\s+/)
  if (words.length !== 2) return name
  const [cationRaw, anionRaw] = words
  const cation = stripMultiplyingPrefix(cationRaw)
  if (!FIXED_VALENCE_METALS.has(cation.toLowerCase())) return name
  const anion = stripMultiplyingPrefix(anionRaw)
  if (!anion.toLowerCase().endsWith('ide')) return name
  return `${cation} ${anion}`
}

// "barium(2+) sulfate" -> "barium sulfate"; "iron(2+) chloride" -> "iron(II) chloride"
function formatChargeAnnotatedName(name) {
  return name.split(/\s+/).map(word => {
    const m = word.match(/^([a-z]+)\((\d*)([+-])\)$/i)
    if (!m) return word
    const [, base, mag, sign] = m
    const magnitude = mag ? parseInt(mag, 10) : 1
    if (sign === '-') {
      return ELEMENT_ANION_NAMES[base.toLowerCase()] || base
    }
    if (VARIABLE_VALENCE_METALS.has(base.toLowerCase())) {
      return `${base}(${toRoman(magnitude)})`
    }
    return base
  }).join(' ')
}

// "dichlorozinc" -> "zinc chloride"; "trichloroiron" -> "iron(III) chloride";
// "dioxomanganese" -> "manganese(IV) oxide"
function formatOxoMetalName(name) {
  if (/[\s;]/.test(name)) return name
  const lower = name.toLowerCase()
  const anionPrefixes = Object.keys(ANION_PREFIX_FORMS).sort((a, b) => b.length - a.length)
  const countPrefixes = Object.keys(MULTIPLYING_VALUES).filter(p => p !== 'mono').sort((a, b) => b.length - a.length)

  const tryMatch = (countPrefix, anionPrefix, count) => {
    const prefix = countPrefix + anionPrefix
    if (!lower.startsWith(prefix)) return null
    const rest = name.slice(prefix.length)
    if (!KNOWN_METAL_NAMES.has(rest.toLowerCase())) return null
    const anion = ANION_PREFIX_FORMS[anionPrefix]
    if (VARIABLE_VALENCE_METALS.has(rest.toLowerCase())) {
      const charge = count * Math.abs(anion.charge)
      return `${rest}(${toRoman(charge)}) ${anion.name}`
    }
    return `${rest} ${anion.name}`
  }

  for (const cp of countPrefixes) {
    for (const ap of anionPrefixes) {
      const result = tryMatch(cp, ap, MULTIPLYING_VALUES[cp])
      if (result) return result
    }
  }
  for (const ap of anionPrefixes) {
    const result = tryMatch('', ap, 1)
    if (result) return result
  }
  return name
}

// "dialuminum;tris(oxygen(2-))" -> "aluminum oxide"
// "iron(2+);oxygen(2-)" -> "iron(II) oxide"
// "diazanium;sulfate" -> "ammonium sulfate"
function formatIonPairName(name) {
  const fragments = name.split(';').map(p => p.trim()).filter(Boolean).map(formatIonFragment)
  fragments.sort((a, b) => (a.isCation === b.isCation ? 0 : a.isCation ? -1 : 1))
  return fragments.map(f => f.text).join(' ')
}

function formatIonFragment(part) {
  // "tris(oxygen(2-))" / "bis(phosphorus(3-))" -> unwrap to "oxygen(2-)" / "phosphorus(3-)"
  const wrapMatch = part.match(/^(?:bis|tris|tetrakis|pentakis|hexakis)\((.+)\)$/i)
  if (wrapMatch) part = wrapMatch[1]

  const chargeMatch = part.match(/^([a-z]+)\((\d*)([+-])\)$/i)
  if (chargeMatch) {
    const [, base, mag, sign] = chargeMatch
    const magnitude = mag ? parseInt(mag, 10) : 1
    if (sign === '-') {
      return { text: ELEMENT_ANION_NAMES[base.toLowerCase()] || base, isCation: false }
    }
    if (VARIABLE_VALENCE_METALS.has(base.toLowerCase())) {
      return { text: `${base}(${toRoman(magnitude)})`, isCation: true }
    }
    return { text: base, isCation: true }
  }

  const stripped = stripMultiplyingPrefix(part)
  if (KNOWN_METAL_NAMES.has(stripped.toLowerCase()) || stripped.toLowerCase() === 'ammonium') {
    return { text: stripped, isCation: true }
  }
  return { text: part, isCation: false }
}

function formatIUPACName(rawName) {
  if (!rawName) return rawName
  let name = rawName.trim()

  if (SIMPLE_NAME_OVERRIDES[name.toLowerCase()]) {
    return SIMPLE_NAME_OVERRIDES[name.toLowerCase()]
  }

  // "azanium" -> "ammonium" (also fixes "diazanium" -> "diammonium" -> "ammonium")
  name = name.replace(/azanium/gi, 'ammonium')

  for (const [alias, metal] of Object.entries(SUBSTITUTIVE_METAL_ALIASES)) {
    if (name.toLowerCase().endsWith(alias)) {
      name = name.slice(0, name.length - alias.length) + metal
    }
  }

  if (name.includes(';')) {
    return formatIonPairName(name)
  }

  name = formatChargeAnnotatedName(name)
  name = formatOxoMetalName(name)
  name = simplifyFixedValenceSaltName(name)
  return name
}
