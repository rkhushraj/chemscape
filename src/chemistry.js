// ── Formula parsing ─────────────────────────────────────────────

// Parses a chemical formula (e.g. "Ca(OH)2") into element counts, e.g. { Ca: 1, O: 2, H: 2 }
export function parseFormula(formula) {
  let i = 0
  const str = formula

  function readNumber() {
    let numStr = ''
    while (i < str.length && /[0-9]/.test(str[i])) { numStr += str[i]; i++ }
    return numStr ? parseInt(numStr, 10) : 1
  }

  function parseGroup() {
    const counts = {}
    while (i < str.length) {
      const ch = str[i]
      if (ch === '(' || ch === '[') {
        i++
        const inner = parseGroup()
        i++ // skip closing bracket
        const mult = readNumber()
        for (const [el, c] of Object.entries(inner)) counts[el] = (counts[el] ?? 0) + c * mult
      } else if (ch === ')' || ch === ']') {
        return counts
      } else if (/[A-Z]/.test(ch)) {
        let el = ch
        i++
        while (i < str.length && /[a-z]/.test(str[i])) { el += str[i]; i++ }
        const mult = readNumber()
        counts[el] = (counts[el] ?? 0) + mult
      } else {
        i++ // skip charges, dots, spaces, etc.
      }
    }
    return counts
  }

  return parseGroup()
}

export function isElementFormula(formula) {
  const counts = parseFormula(formula)
  return Object.keys(counts).length === 1 && Object.values(counts)[0] >= 1
}

export function elementSymbol(formula) {
  const counts = parseFormula(formula)
  const keys = Object.keys(counts)
  return keys.length === 1 ? keys[0] : null
}

// ── Common name resolution ──────────────────────────────────────

export const COMMON_NAMES = {
  'water': 'H2O',
  'acetic acid': 'CH3COOH',
  'sodium hydroxide': 'NaOH',
  'sodium acetate': 'NaCH3COO',
  'sodium chloride': 'NaCl',
  'sodium nitrate': 'NaNO3',
  'sodium sulfate': 'Na2SO4',
  'sodium carbonate': 'Na2CO3',
  'potassium hydroxide': 'KOH',
  'hydrochloric acid': 'HCl',
  'sulfuric acid': 'H2SO4',
  'nitric acid': 'HNO3',
  'silver nitrate': 'AgNO3',
  'silver chloride': 'AgCl',
  'copper sulfate': 'CuSO4',
  'copper(ii) sulfate': 'CuSO4',
  'zinc sulfate': 'ZnSO4',
  'calcium carbonate': 'CaCO3',
  'calcium oxide': 'CaO',
  'calcium hydroxide': 'Ca(OH)2',
  'carbon dioxide': 'CO2',
  'ammonia': 'NH3',
  'barium chloride': 'BaCl2',
  'barium sulfate': 'BaSO4',
  'iron': 'Fe',
  'zinc': 'Zn',
  'copper': 'Cu',
  'magnesium': 'Mg',
}

// Reverse of COMMON_NAMES: maps a formula back to a common name, used as a
// fallback search term for compounds PubChem can't resolve by formula alone.
export const FORMULA_NAMES = {}
for (const [name, formula] of Object.entries(COMMON_NAMES)) {
  if (!(formula in FORMULA_NAMES)) FORMULA_NAMES[formula] = name
}

// Resolves a user-typed term (formula or common name) to a chemical formula.
// Returns null if the term can't be recognized.
export function resolveFormula(raw) {
  const trimmed = raw.trim()
  if (!trimmed) return null
  if (/\s/.test(trimmed) || /[a-z]{3,}/.test(trimmed)) {
    return COMMON_NAMES[trimmed.toLowerCase()] ?? null
  }
  return trimmed
}

// ── Number helpers ──────────────────────────────────────────────

function gcd(a, b) {
  a = Math.abs(a); b = Math.abs(b)
  while (b) { [a, b] = [b, a % b] }
  return a
}

function lcm(a, b) {
  return Math.abs(a * b) / gcd(a, b)
}

function gcdAll(nums) {
  return nums.reduce((acc, n) => gcd(acc, n))
}

class Frac {
  constructor(n, d = 1) {
    if (d === 0) throw new Error('division by zero')
    if (d < 0) { n = -n; d = -d }
    const g = gcd(n, d) || 1
    this.n = n / g
    this.d = d / g
  }
  add(o) { return new Frac(this.n * o.d + o.n * this.d, this.d * o.d) }
  sub(o) { return new Frac(this.n * o.d - o.n * this.d, this.d * o.d) }
  mul(o) { return new Frac(this.n * o.n, this.d * o.d) }
  div(o) { return new Frac(this.n * o.d, this.d * o.n) }
  neg() { return new Frac(-this.n, this.d) }
  isZero() { return this.n === 0 }
}

// ── Equation balancing ──────────────────────────────────────────

// Returns an array of positive integer coefficients [reactant coeffs..., product coeffs...]
// or null if a unique balance can't be found.
export function balanceEquation(reactantFormulas, productFormulas) {
  try {
    const speciesCounts = [...reactantFormulas, ...productFormulas].map(parseFormula)
    const elements = [...new Set(speciesCounts.flatMap(c => Object.keys(c)))]
    if (elements.length === 0) return null
    const nReactants = reactantFormulas.length
    const nSpecies = speciesCounts.length

    let matrix = elements.map(el =>
      speciesCounts.map((c, i) => new Frac((c[el] ?? 0) * (i < nReactants ? 1 : -1)))
    )

    const rows = matrix.length
    const cols = nSpecies
    const pivotCols = []
    let r = 0
    for (let c = 0; c < cols && r < rows; c++) {
      let pivot = -1
      for (let i = r; i < rows; i++) if (!matrix[i][c].isZero()) { pivot = i; break }
      if (pivot === -1) continue
      ;[matrix[r], matrix[pivot]] = [matrix[pivot], matrix[r]]
      const pv = matrix[r][c]
      matrix[r] = matrix[r].map(x => x.div(pv))
      for (let i = 0; i < rows; i++) {
        if (i !== r && !matrix[i][c].isZero()) {
          const factor = matrix[i][c]
          matrix[i] = matrix[i].map((x, j) => x.sub(factor.mul(matrix[r][j])))
        }
      }
      pivotCols.push(c)
      r++
    }

    const freeCols = []
    for (let c = 0; c < cols; c++) if (!pivotCols.includes(c)) freeCols.push(c)
    if (freeCols.length !== 1) return null

    const freeCol = freeCols[0]
    const solution = new Array(cols).fill(null)
    solution[freeCol] = new Frac(1)
    for (let i = 0; i < pivotCols.length; i++) {
      const pc = pivotCols[i]
      solution[pc] = matrix[i][freeCol].neg()
    }
    if (solution.some(x => x === null)) return null

    let denomLcm = 1
    for (const frac of solution) denomLcm = lcm(denomLcm, frac.d)
    let ints = solution.map(frac => (frac.n * denomLcm) / frac.d)

    if (ints.every(x => x <= 0)) ints = ints.map(x => -x)
    if (ints.some(x => x <= 0)) return null

    const g = gcdAll(ints)
    ints = ints.map(x => x / g)
    return ints
  } catch {
    return null
  }
}

// ── Acid / base detection ───────────────────────────────────────

export function isAcid(formula) {
  if (/COOH$/.test(formula)) return true
  if (/^H\d*[A-Z]/.test(formula) && !['H2', 'H2O', 'H2O2'].includes(formula)) return true
  return false
}

export function isBase(formula) {
  if (formula === 'NH3' || formula === 'NH4OH') return true
  return /^[A-Z][a-z]?(\(OH\)\d*|OH)$/.test(formula)
}

// ── Activity series (most reactive first) ───────────────────────

const METAL_ACTIVITY = [
  'Li', 'K', 'Ba', 'Sr', 'Ca', 'Na', 'Mg', 'Al', 'Mn', 'Zn', 'Cr', 'Fe',
  'Cd', 'Co', 'Ni', 'Sn', 'Pb', 'H', 'Sb', 'Bi', 'Cu', 'Hg', 'Ag', 'Pd', 'Pt', 'Au',
]
const HALOGEN_ACTIVITY = ['F', 'Cl', 'Br', 'I']

function activityIndex(symbol) {
  let idx = METAL_ACTIVITY.indexOf(symbol)
  if (idx !== -1) return { series: 'metal', idx }
  idx = HALOGEN_ACTIVITY.indexOf(symbol)
  if (idx !== -1) return { series: 'halogen', idx }
  return null
}

// ── Solubility rules (simplified) ───────────────────────────────

const ION_ELEMENTS = {
  Li: { Li: 1 }, Na: { Na: 1 }, K: { K: 1 }, Rb: { Rb: 1 }, Cs: { Cs: 1 }, Ag: { Ag: 1 },
  NH4: { N: 1, H: 4 },
  Mg: { Mg: 1 }, Ca: { Ca: 1 }, Ba: { Ba: 1 }, Sr: { Sr: 1 }, Zn: { Zn: 1 }, Cu: { Cu: 1 },
  Fe: { Fe: 1 }, Ni: { Ni: 1 }, Pb: { Pb: 1 }, Sn: { Sn: 1 }, Mn: { Mn: 1 }, Co: { Co: 1 }, Cd: { Cd: 1 }, Hg: { Hg: 1 },
  Al: { Al: 1 }, Cr: { Cr: 1 },
  Cl: { Cl: 1 }, Br: { Br: 1 }, I: { I: 1 }, F: { F: 1 },
  NO3: { N: 1, O: 3 }, OH: { O: 1, H: 1 }, CH3COO: { C: 2, H: 3, O: 2 },
  SO4: { S: 1, O: 4 }, CO3: { C: 1, O: 3 }, CrO4: { Cr: 1, O: 4 }, S: { S: 1 }, SO3: { S: 1, O: 3 }, PO4: { P: 1, O: 4 },
}

const CATIONS = {
  Li: 1, Na: 1, K: 1, Rb: 1, Cs: 1, NH4: 1, Ag: 1,
  Mg: 2, Ca: 2, Ba: 2, Sr: 2, Zn: 2, Cu: 2, Fe: 2, Ni: 2, Pb: 2, Sn: 2, Mn: 2, Co: 2, Cd: 2, Hg: 2,
  Al: 3, Cr: 3,
}
const ANIONS = {
  Cl: 1, Br: 1, I: 1, F: 1, NO3: 1, OH: 1, CH3COO: 1,
  SO4: 2, CO3: 2, CrO4: 2, S: 2, SO3: 2,
  PO4: 3,
}

function addCounts(target, source, mult) {
  for (const [el, c] of Object.entries(source)) target[el] = (target[el] ?? 0) + c * mult
}

function canonicalKey(counts) {
  const entries = Object.entries(counts).filter(([, v]) => v > 0)
  if (entries.length === 0) return ''
  const g = gcdAll(entries.map(([, v]) => v))
  return entries.map(([el, v]) => `${el}${v / g}`).sort().join('')
}

const COMPOUND_ION_MAP = (() => {
  const map = {}
  for (const [cation, cCharge] of Object.entries(CATIONS)) {
    for (const [anion, aCharge] of Object.entries(ANIONS)) {
      const g = gcd(cCharge, aCharge)
      const nCation = aCharge / g
      const nAnion = cCharge / g
      const counts = {}
      addCounts(counts, ION_ELEMENTS[cation], nCation)
      addCounts(counts, ION_ELEMENTS[anion], nAnion)
      map[canonicalKey(counts)] = { cation, anion }
    }
  }
  return map
})()

export function getIonsForCompound(formula) {
  const counts = parseFormula(formula)
  const key = canonicalKey(counts)
  return COMPOUND_ION_MAP[key] ?? null
}

// Returns true (soluble), false (insoluble/precipitate), or null (unknown)
export function isSoluble(formula) {
  const ions = getIonsForCompound(formula)
  if (!ions) return null
  const { cation, anion } = ions
  const ALKALI = ['Li', 'Na', 'K', 'Rb', 'Cs']
  if (ALKALI.includes(cation) || cation === 'NH4') return true
  if (anion === 'NO3' || anion === 'CH3COO') return true
  if (['Cl', 'Br', 'I'].includes(anion)) return !['Ag', 'Pb', 'Hg'].includes(cation)
  if (anion === 'SO4') return !['Ba', 'Pb', 'Sr', 'Ca'].includes(cation)
  if (anion === 'OH') return ['Ba', 'Sr', 'Ca'].includes(cation)
  return false // CO3, PO4, S, SO3, CrO4
}

// ── State of matter inference ───────────────────────────────────

const GAS_FORMULAS = new Set([
  'H2', 'O2', 'N2', 'F2', 'Cl2', 'CO2', 'CO', 'NH3', 'CH4', 'SO2', 'SO3',
  'NO', 'NO2', 'N2O', 'H2S', 'HBr', 'HI', 'HF',
])
const LIQUID_FORMULAS = new Set(['H2O', 'Br2'])
const AQUEOUS_FORMULAS = new Set(['HCl', 'H2SO4', 'HNO3', 'CH3COOH', 'H3PO4', 'H2CO3'])

// Guesses a reasonable default state of matter (s/l/g/aq) for a formula when
// the user didn't specify one.
export function inferState(formula) {
  if (!formula) return null
  if (GAS_FORMULAS.has(formula)) return 'g'
  if (LIQUID_FORMULAS.has(formula)) return 'l'
  if (AQUEOUS_FORMULAS.has(formula)) return 'aq'
  if (isElementFormula(formula)) return 's'
  if (isBase(formula)) return isSoluble(formula) ? 'aq' : 's'
  const sol = isSoluble(formula)
  if (sol === true) return 'aq'
  if (sol === false) return 's'
  return null
}

// ── Product prediction (when the user only enters reactants) ───

const ACID_ANIONS = {
  HCl: { anion: 'Cl', charge: -1 },
  HBr: { anion: 'Br', charge: -1 },
  HI: { anion: 'I', charge: -1 },
  HF: { anion: 'F', charge: -1 },
  HNO3: { anion: 'NO3', charge: -1 },
  H2SO4: { anion: 'SO4', charge: -2 },
  H2CO3: { anion: 'CO3', charge: -2 },
  H3PO4: { anion: 'PO4', charge: -3 },
  CH3COOH: { anion: 'CH3COO', charge: -1 },
}

const HALOGENS = ['F2', 'Cl2', 'Br2', 'I2']

// Common molecular compounds formed from pairs of elements, keyed by their
// sorted element symbols (e.g. ['Cl','H'] -> "Cl,H" -> HCl).
const SYNTHESIS_PRODUCTS = {
  'H,O': { formula: 'H2O', state: 'l' },
  'H,N': { formula: 'NH3', state: 'g' },
  'Cl,H': { formula: 'HCl', state: 'g' },
  'Br,H': { formula: 'HBr', state: 'g' },
  'H,I': { formula: 'HI', state: 'g' },
  'F,H': { formula: 'HF', state: 'g' },
  'H,S': { formula: 'H2S', state: 'g' },
  'C,O': { formula: 'CO2', state: 'g' },
}

// Charges nonmetals take on when forming an ionic compound with a metal.
const NONMETAL_ANION_CHARGES = { O: -2, S: -2, N: -3, P: -3, Cl: -1, Br: -1, I: -1, F: -1 }

function ionPart(symbol, count) {
  if (count <= 1) return symbol
  // Single-element symbols (e.g. "Cl", "O") don't need parentheses; polyatomic
  // groups (e.g. "NH4", "SO4", "CH3COO") do, e.g. "ZnCl2" vs "(NH4)2SO4".
  const isSingleElement = /^[A-Z][a-z]?$/.test(symbol)
  return isSingleElement ? `${symbol}${count}` : `(${symbol})${count}`
}

// Builds an ionic formula, cation first, e.g. ('Ca', 2, 'Cl', -1) -> "CaCl2"
function buildIonicFormula(cation, cationCharge, anion, anionCharge) {
  const g = gcd(Math.abs(cationCharge), Math.abs(anionCharge))
  const nCation = Math.abs(anionCharge) / g
  const nAnion = Math.abs(cationCharge) / g
  return ionPart(cation, nCation) + ionPart(anion, nAnion)
}

// Given a base formula, returns its cation symbol and charge, e.g.
// "Ca(OH)2" -> { cation: 'Ca', charge: 2 }, "NH3" -> { cation: 'NH4', charge: 1 }
function baseCation(formula) {
  if (formula === 'NH3' || formula === 'NH4OH') return { cation: 'NH4', charge: 1 }
  const m = formula.match(/^([A-Z][a-z]?)\(OH\)(\d*)$/) || formula.match(/^([A-Z][a-z]?)OH$/)
  if (!m) return null
  return { cation: m[1], charge: m[2] ? parseInt(m[2], 10) : 1 }
}

// Predicts the products of a reaction given only its reactants, covering the
// common reaction types (combustion, acid-base, displacement, synthesis,
// decomposition). Returns an array of { formula, state } or null if the
// products can't be confidently predicted.
export function predictProducts(reactants) {
  const R = reactants.map(t => ({ ...t, resolvedFormula: resolveFormula(t.formula) }))
  if (R.some(r => !r.resolvedFormula)) return null
  const formulas = R.map(r => r.resolvedFormula)

  // Combustion: hydrocarbon/alcohol + O2 -> CO2 + H2O
  if (R.length === 2) {
    const o2 = R.find(r => r.resolvedFormula === 'O2')
    const fuel = R.find(r => r.resolvedFormula !== 'O2')
    if (o2 && fuel) {
      const counts = parseFormula(fuel.resolvedFormula)
      if (counts.C > 0 && counts.H > 0) {
        return [{ formula: 'CO2', state: 'g' }, { formula: 'H2O', state: 'l' }]
      }
    }
  }

  // Acid-base neutralization: acid + base -> salt + water
  if (R.length === 2) {
    const acid = R.find(r => isAcid(r.resolvedFormula))
    const base = R.find(r => isBase(r.resolvedFormula))
    if (acid && base) {
      const acidInfo = ACID_ANIONS[acid.resolvedFormula]
      const baseInfo = baseCation(base.resolvedFormula)
      if (acidInfo && baseInfo) {
        const salt = buildIonicFormula(baseInfo.cation, baseInfo.charge, acidInfo.anion, acidInfo.charge)
        return [{ formula: salt, state: inferState(salt) }, { formula: 'H2O', state: 'l' }]
      }
    }
  }

  // Single displacement: metal + acid -> salt + H2
  if (R.length === 2) {
    const metal = R.find(r => isElementFormula(r.resolvedFormula) && CATIONS[r.resolvedFormula])
    const acid = R.find(r => isAcid(r.resolvedFormula))
    if (metal && acid) {
      const acidInfo = ACID_ANIONS[acid.resolvedFormula]
      if (acidInfo) {
        const salt = buildIonicFormula(metal.resolvedFormula, CATIONS[metal.resolvedFormula], acidInfo.anion, acidInfo.charge)
        return [{ formula: salt, state: inferState(salt) }, { formula: 'H2', state: 'g' }]
      }
    }
  }

  // Single displacement: metal + salt -> new salt + displaced metal
  if (R.length === 2) {
    const elem = R.find(r => isElementFormula(r.resolvedFormula) && CATIONS[r.resolvedFormula])
    const compound = R.find(r => r !== elem)
    if (elem && compound) {
      const ions = getIonsForCompound(compound.resolvedFormula)
      if (ions && CATIONS[ions.cation] && ions.cation !== elem.resolvedFormula) {
        const newSalt = buildIonicFormula(elem.resolvedFormula, CATIONS[elem.resolvedFormula], ions.anion, ANIONS[ions.anion])
        return [{ formula: newSalt, state: inferState(newSalt) }, { formula: ions.cation, state: 's' }]
      }
    }
  }

  // Halogen displacement: halogen + halide salt -> new halide salt + halogen
  if (R.length === 2) {
    const halogen = R.find(r => HALOGENS.includes(r.resolvedFormula))
    const compound = R.find(r => r !== halogen)
    if (halogen && compound) {
      const ions = getIonsForCompound(compound.resolvedFormula)
      const newHalogenSym = elementSymbol(halogen.resolvedFormula)
      if (ions && ['F', 'Cl', 'Br', 'I'].includes(ions.anion) && ions.anion !== newHalogenSym) {
        const newSalt = buildIonicFormula(ions.cation, CATIONS[ions.cation], newHalogenSym, -1)
        const displaced = `${ions.anion}2`
        return [{ formula: newSalt, state: inferState(newSalt) }, { formula: displaced, state: inferState(displaced) }]
      }
    }
  }

  // Double displacement: two ionic compounds swap ions
  if (R.length === 2) {
    const ions0 = getIonsForCompound(R[0].resolvedFormula)
    const ions1 = getIonsForCompound(R[1].resolvedFormula)
    if (ions0 && ions1 && ions0.cation !== ions1.cation) {
      const product1 = buildIonicFormula(ions0.cation, CATIONS[ions0.cation], ions1.anion, ANIONS[ions1.anion])
      const product2 = buildIonicFormula(ions1.cation, CATIONS[ions1.cation], ions0.anion, ANIONS[ions0.anion])
      return [
        { formula: product1, state: inferState(product1) },
        { formula: product2, state: inferState(product2) },
      ]
    }
  }

  // Synthesis: two elements combine
  if (R.length === 2 && formulas.every(f => isElementFormula(f))) {
    const syms = formulas.map(elementSymbol)
    const key = [...syms].sort().join(',')
    if (SYNTHESIS_PRODUCTS[key]) {
      return [SYNTHESIS_PRODUCTS[key]]
    }
    const metalIdx = syms.findIndex(s => CATIONS[s])
    if (metalIdx !== -1) {
      const metalSym = syms[metalIdx]
      const nonmetalSym = syms[metalIdx === 0 ? 1 : 0]
      if (NONMETAL_ANION_CHARGES[nonmetalSym]) {
        const compound = buildIonicFormula(metalSym, CATIONS[metalSym], nonmetalSym, NONMETAL_ANION_CHARGES[nonmetalSym])
        return [{ formula: compound, state: inferState(compound) }]
      }
    }
  }

  // Decomposition of a single compound
  if (R.length === 1) {
    const formula = R[0].resolvedFormula
    if (formula === 'H2O2') return [{ formula: 'H2O', state: 'l' }, { formula: 'O2', state: 'g' }]
    const ions = getIonsForCompound(formula)
    if (ions && ions.anion === 'CO3' && CATIONS[ions.cation]) {
      const oxide = buildIonicFormula(ions.cation, CATIONS[ions.cation], 'O', -2)
      return [{ formula: oxide, state: 's' }, { formula: 'CO2', state: 'g' }]
    }
  }

  return null
}

// ── Classification ──────────────────────────────────────────────

function classify(R, P) {
  const rCounts = R.map(r => parseFormula(r.resolvedFormula))
  const pCounts = P.map(p => parseFormula(p.resolvedFormula))
  const rIsEl = rCounts.map(c => Object.keys(c).length === 1)
  const pIsEl = pCounts.map(c => Object.keys(c).length === 1)

  const hasO2 = R.some(r => r.resolvedFormula === 'O2')
  const hasCO2 = P.some(p => p.resolvedFormula === 'CO2')
  const hasWaterProduct = P.some(p => p.resolvedFormula === 'H2O')
  const reactantHasCH = rCounts.some(c => c.C > 0 && c.H > 0)

  if (hasO2 && hasCO2 && hasWaterProduct && reactantHasCH) {
    return {
      type: 'combustion',
      label: 'Combustion',
      reason: 'A carbon- and hydrogen-containing compound reacts with O2 to produce CO2 and H2O — the signature of a combustion reaction.',
    }
  }

  if (R.length === 1 && P.length >= 2) {
    return {
      type: 'decomposition',
      label: 'Decomposition',
      reason: `A single compound (${R[0].resolvedFormula}) breaks down into ${P.length} simpler substances.`,
    }
  }

  if (R.length >= 2 && P.length === 1) {
    return {
      type: 'synthesis',
      label: 'Synthesis (Combination)',
      reason: `${R.length} substances combine to form a single product, ${P[0].resolvedFormula}.`,
    }
  }

  if (R.length === 2 && P.length === 2) {
    const rEl = R.filter((_, i) => rIsEl[i])
    const rCo = R.filter((_, i) => !rIsEl[i])
    const pEl = P.filter((_, i) => pIsEl[i])
    const pCo = P.filter((_, i) => !pIsEl[i])

    if (rEl.length === 1 && rCo.length === 1 && pEl.length === 1 && pCo.length === 1) {
      return {
        type: 'single-displacement',
        label: 'Single Displacement',
        reason: `${rEl[0].resolvedFormula} is a free element that displaces another element from ${rCo[0].resolvedFormula}.`,
      }
    }

    if (rCo.length === 2 && pCo.length === 2) {
      const acid = R.find(r => isAcid(r.resolvedFormula))
      const base = R.find(r => isBase(r.resolvedFormula))
      if (acid && base && hasWaterProduct) {
        return {
          type: 'acid-base',
          label: 'Acid–Base (Neutralization)',
          reason: `${acid.resolvedFormula} is an acid and ${base.resolvedFormula} is a base — they neutralize each other to form a salt and water.`,
        }
      }
      return {
        type: 'double-displacement',
        label: 'Double Displacement',
        reason: 'The positive and negative ions of the two reactant compounds swap partners to form two new compounds.',
      }
    }
  }

  return {
    type: 'other',
    label: 'Other / Complex Reaction',
    reason: "This reaction doesn't fit a single standard category — it may be a multi-step or combined reaction.",
  }
}

// ── Occurrence check ────────────────────────────────────────────

function checkOccurrence(classification, R, P) {
  if (classification.type === 'single-displacement') {
    const rIsEl = R.map(r => isElementFormula(r.resolvedFormula))
    const pIsEl = P.map(p => isElementFormula(p.resolvedFormula))
    const freeReactant = R[rIsEl.indexOf(true)]
    const freeProduct = P[pIsEl.indexOf(true)]
    if (!freeReactant || !freeProduct) return { occurs: true, reason: null }

    const a = elementSymbol(freeReactant.resolvedFormula)
    const b = elementSymbol(freeProduct.resolvedFormula)
    const ai = activityIndex(a)
    const bi = activityIndex(b)
    if (ai && bi && ai.series === bi.series) {
      if (ai.idx < bi.idx) {
        return { occurs: true, reason: `${a} is more reactive than ${b} (higher on the activity series), so it can displace ${b}.` }
      }
      return { occurs: false, reason: `${a} is less reactive than ${b} on the activity series, so it cannot displace ${b} — no reaction occurs.` }
    }
    return { occurs: true, reason: null }
  }

  if (classification.type === 'double-displacement') {
    const solubilities = P.map(p => ({ formula: p.resolvedFormula, soluble: isSoluble(p.resolvedFormula) }))
    const precipitate = solubilities.find(s => s.soluble === false)
    const gasOrWater = P.some(p => ['H2O', 'CO2', 'NH3'].includes(p.resolvedFormula))

    if (precipitate) {
      return { occurs: true, reason: `${precipitate.formula} is insoluble and precipitates out of solution — this is the driving force for the reaction.` }
    }
    if (gasOrWater) {
      return { occurs: true, reason: 'A gas or water forms, driving the reaction forward.' }
    }
    if (solubilities.every(s => s.soluble === true)) {
      return { occurs: false, reason: 'Both products are soluble in water — the ions stay dissolved and no new substance actually forms. No reaction occurs.' }
    }
    return { occurs: true, reason: null }
  }

  return { occurs: true, reason: null }
}

// ── Step descriptions ───────────────────────────────────────────

// For a single-displacement reaction A + BC -> AC + B, identifies the
// displacing element (A), the displaced element (B), and the compounds
// it moves between.
function singleDisplacementInfo(R, P) {
  const rIsEl = R.map(r => isElementFormula(r.resolvedFormula))
  const pIsEl = P.map(p => isElementFormula(p.resolvedFormula))
  const freeReactantIdx = rIsEl.indexOf(true)
  const freeProductIdx = pIsEl.indexOf(true)
  return {
    displacingEl: elementSymbol(R[freeReactantIdx].resolvedFormula),
    displacedEl: elementSymbol(P[freeProductIdx].resolvedFormula),
    freeProduct: P[freeProductIdx],
    compoundReactant: R[1 - freeReactantIdx],
    compoundProduct: P[1 - freeProductIdx],
  }
}

function breakingDescription(classification, R, P) {
  switch (classification.type) {
    case 'combustion':
      return ['The C–H and C–C bonds in the fuel and the O=O double bonds in O2 all break apart.']
    case 'synthesis':
      return ['The bonds within ', ...joinFormulas(R, ' and '), ' break, freeing the atoms to recombine.']
    case 'decomposition':
      return ['The bonds holding ', { f: R[0].resolvedFormula, state: R[0].state }, ' together break apart, separating it into its components.']
    case 'single-displacement': {
      const info = singleDisplacementInfo(R, P)
      return ['The bond between the displaced element (', info.displacedEl, ') and the rest of ', { f: info.compoundReactant.resolvedFormula, state: info.compoundReactant.state }, ' breaks.']
    }
    case 'double-displacement':
    case 'acid-base':
      return ['The ionic bonds in both ', ...joinFormulas(R, ' and '), ' break, releasing their ions into solution.']
    default:
      return ['Bonds in the reactants break, freeing the atoms to rearrange.']
  }
}

function formingDescription(classification, P, R) {
  switch (classification.type) {
    case 'combustion':
      return ['New C=O bonds form in CO2 and O–H bonds form in H2O.']
    case 'synthesis':
      return ['New bonds form between the atoms, creating ', { f: P[0].resolvedFormula, state: P[0].state }, '.']
    case 'decomposition':
      return ['The freed atoms settle into new, more stable arrangements: ', ...joinFormulas(P, ' and '), '.']
    case 'single-displacement': {
      const info = singleDisplacementInfo(R, P)
      return ['The displacing element (', info.displacingEl, ') forms a new bond, creating ', { f: info.compoundProduct.resolvedFormula, state: info.compoundProduct.state }, ', while the displaced element (', info.displacedEl, ') is set free as ', { f: info.freeProduct.resolvedFormula, state: info.freeProduct.state }, '.']
    }
    case 'double-displacement':
      return ['The ions recombine with new partners, forming ', ...joinFormulas(P, ' and '), '.']
    case 'acid-base':
      return ['H+ from the acid combines with OH- from the base to form water, while the remaining ions form a salt.']
    default:
      return ['New bonds form, creating the products.']
  }
}

// Builds segments from an array of { resolvedFormula, state } items, e.g. for "A and B".
function joinFormulas(items, sep) {
  const parts = []
  items.forEach((item, i) => {
    if (i > 0) parts.push(sep)
    parts.push({ f: item.resolvedFormula ?? item.formula, state: item.state })
  })
  return parts
}

function formatBalancedEquation(R, P, balance) {
  const n = R.length
  const lhs = []
  R.forEach((r, i) => {
    if (i > 0) lhs.push(' + ')
    if (balance[i] > 1) lhs.push(`${balance[i]} `)
    lhs.push({ f: r.resolvedFormula, state: r.state })
  })
  const rhs = []
  P.forEach((p, i) => {
    if (i > 0) rhs.push(' + ')
    if (balance[n + i] > 1) rhs.push(`${balance[n + i]} `)
    rhs.push({ f: p.resolvedFormula, state: p.state })
  })
  return [...lhs, ' → ', ...rhs]
}

// ── Main entry point ────────────────────────────────────────────

export function analyzeReaction(reactants, products) {
  const R = reactants.map(t => ({ ...t, resolvedFormula: resolveFormula(t.formula) }))
  const P = products.map(t => ({ ...t, resolvedFormula: resolveFormula(t.formula) }))
  const allResolved = [...R, ...P].every(t => t.resolvedFormula)

  const classification = allResolved
    ? classify(R, P)
    : { type: 'unknown', label: 'Unknown', reason: "Couldn't identify all of the substances well enough to classify this reaction." }

  const occurrence = allResolved ? checkOccurrence(classification, R, P) : { occurs: true, reason: null }

  const balance = allResolved ? balanceEquation(R.map(r => r.resolvedFormula), P.map(p => p.resolvedFormula)) : null

  const steps = []
  steps.push({
    title: 'Reactants',
    phase: 'reactants',
    description: [`We start with `, ...joinFormulas(R, ' and '), '.'],
  })

  steps.push({
    title: 'Identify the Reaction Type',
    phase: 'reactants',
    description: [classification.reason],
    badge: classification.label,
  })

  if (allResolved && balance) {
    steps.push({
      title: 'Balance the Equation',
      phase: 'reactants',
      description: ['The balanced equation is ', ...formatBalancedEquation(R, P, balance), '. Atom counts now match on both sides.'],
    })
  }

  if (occurrence.occurs) {
    steps.push({
      title: 'Bonds Break',
      phase: 'breaking',
      description: breakingDescription(classification, R, P),
    })
    steps.push({
      title: 'New Bonds Form',
      phase: 'forming',
      description: formingDescription(classification, P, R),
    })
    const resultParts = ['The reaction completes, producing ', ...joinFormulas(P, ' and '), '.']
    if (occurrence.reason) resultParts.push(' ' + occurrence.reason)
    steps.push({
      title: 'Result',
      phase: 'result',
      description: resultParts,
    })
  } else {
    steps.push({
      title: 'Check if the Reaction Proceeds',
      phase: 'reactants',
      description: [occurrence.reason],
    })
    steps.push({
      title: 'No Reaction',
      phase: 'no-reaction',
      description: [...joinFormulas(R, ' and '), ' do not react under normal conditions — the substances remain unchanged.'],
    })
  }

  return { classification, occurrence, balance, steps, allResolved }
}
