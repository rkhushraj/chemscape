import { resolveFormula, inferState, predictProducts } from './chemistry.js'

export const EXAMPLE_REACTIONS = [
  'CH4(g) + 2 O2(g) -> CO2(g) + 2 H2O(l)',
  '2 H2(g) + O2(g) -> 2 H2O(l)',
  'N2(g) + 3 H2(g) -> 2 NH3(g)',
  'Acetic acid(aq) + Sodium hydroxide(aq) -> Sodium acetate(aq) + Water(l)',
  'AgNO3(aq) + NaCl(aq) -> AgCl(s) + NaNO3(aq)',
  'Zn(s) + 2 HCl(aq) -> ZnCl2(aq) + H2(g)',
  'Cu(s) + ZnSO4(aq) -> CuSO4(aq) + Zn(s)',
  '2 KClO3(s) -> 2 KCl(s) + 3 O2(g)',
]

export function parseReaction(input) {
  const normalized = input.trim().replace(/[⇌⇄→⟶=]+|-+>/g, '->')
  if (!normalized) return null

  if (normalized.includes('->')) {
    const parts = normalized.split('->')
    if (parts.length !== 2) return null
    const [lhs, rhs] = parts
    const reactants = parseSide(lhs)
    const products = parseSide(rhs)
    if (reactants.length === 0 || products.length === 0) return null
    return finalizeReaction(reactants, products)
  }

  // No "->" given — treat the whole input as reactants and predict the products.
  const reactants = parseSide(normalized)
  if (reactants.length === 0) return null
  const predicted = predictProducts(reactants)
  return finalizeReaction(reactants, predicted)
}

// Fills in any missing states of matter with a sensible default.
function finalizeReaction(reactants, products) {
  const fillStates = terms => terms.map(t => ({
    ...t,
    state: t.state ?? inferState(resolveFormula(t.formula) ?? t.formula),
  }))
  return {
    reactants: fillStates(reactants),
    products: products ? fillStates(products) : null,
  }
}

function parseSide(side) {
  return side
    .split('+')
    .map(term => {
      let trimmed = term.trim()
      let state = null
      const stateMatch = trimmed.match(/^(.*?)\s*\(\s*(s|l|g|aq)\s*\)$/i)
      if (stateMatch) {
        trimmed = stateMatch[1].trim()
        state = stateMatch[2].toLowerCase()
      }
      const match = trimmed.match(/^(\d+)\s*(.+)$/)
      if (match) {
        return { coeff: parseInt(match[1], 10), formula: match[2].trim(), state }
      }
      return { coeff: 1, formula: trimmed, state }
    })
    .filter(t => t.formula.length > 0)
}
