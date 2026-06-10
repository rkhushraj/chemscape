// Renders a chemical formula string with numbers as subscripts, e.g. "C8H10N4O2" -> C₈H₁₀N₄O₂
export default function FormulaText({ formula }) {
  if (!formula) return null
  const parts = formula.split(/(\d+)/).filter(Boolean)
  return (
    <>
      {parts.map((part, i) =>
        /^\d+$/.test(part) ? <sub key={i}>{part}</sub> : <span key={i}>{part}</span>
      )}
    </>
  )
}

// Renders an array of segments where strings are plain text and { f: formula }
// objects are rendered with FormulaText. Used for reaction step descriptions
// that mix prose with chemical formulas.
export function RichText({ parts }) {
  return (
    <>
      {parts.map((part, i) =>
        typeof part === 'string'
          ? <span key={i}>{part}</span>
          : <FormulaText key={i} formula={part.f} />
      )}
    </>
  )
}

// Helper for building segment arrays: f('CO2') -> { f: 'CO2' }
export function f(formula) {
  return { f: formula }
}
