export const EXAMPLE_REACTIONS = [
  'CH4 + 2 O2 -> CO2 + 2 H2O',
  '2 H2 + O2 -> 2 H2O',
  'N2 + 3 H2 -> 2 NH3',
  'Acetic acid + Sodium hydroxide -> Sodium acetate + Water',
  'AgNO3 + NaCl -> AgCl + NaNO3',
  'Zn + 2 HCl -> ZnCl2 + H2',
  'Cu + ZnSO4 -> CuSO4 + Zn',
  '2 KClO3 -> 2 KCl + 3 O2',
]

export function parseReaction(input) {
  const normalized = input.trim().replace(/[⇌⇄→⟶=]+|-+>/g, '->')
  const parts = normalized.split('->')
  if (parts.length !== 2) return null
  const [lhs, rhs] = parts
  const reactants = parseSide(lhs)
  const products = parseSide(rhs)
  if (reactants.length === 0 || products.length === 0) return null
  return { reactants, products }
}

function parseSide(side) {
  return side
    .split('+')
    .map(term => {
      const trimmed = term.trim()
      const match = trimmed.match(/^(\d+)\s*(.+)$/)
      if (match) {
        return { coeff: parseInt(match[1], 10), formula: match[2].trim() }
      }
      return { coeff: 1, formula: trimmed }
    })
    .filter(t => t.formula.length > 0)
}
