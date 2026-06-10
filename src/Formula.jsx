// Renders a chemical formula string with numbers as subscripts, e.g. "C8H10N4O2" -> C₈H₁₀N₄O₂
// An optional state of matter (s, l, g, aq) is appended as "(state)".
export default function FormulaText({ formula, state }) {
  if (!formula) return null
  const parts = formula.split(/(\d+)/).filter(Boolean)
  return (
    <>
      {parts.map((part, i) =>
        /^\d+$/.test(part) ? <sub key={i}>{part}</sub> : <span key={i}>{part}</span>
      )}
      {state && <span className="state-label">({state})</span>}
    </>
  )
}

// Renders an array of segments where strings are plain text and { f: formula, state? }
// objects are rendered with FormulaText. Used for reaction step descriptions
// that mix prose with chemical formulas.
export function RichText({ parts }) {
  return (
    <>
      {parts.map((part, i) =>
        typeof part === 'string'
          ? <span key={i}>{part}</span>
          : <FormulaText key={i} formula={part.f} state={part.state} />
      )}
    </>
  )
}

// Helper for building segment arrays: f('CO2') -> { f: 'CO2' }
export function f(formula, state) {
  return { f: formula, state }
}

// Renders a full reaction equation string (e.g. "2 H2(g) + O2(g) -> 2 H2O(l)"),
// subscripting numbers that are part of a formula while leaving leading
// coefficients (numbers preceded by whitespace or nothing) as normal text.
// Each whitespace-delimited token is kept on one line so a formula and its
// state label (e.g. "H2O(l)") never get split across a wrap.
export function ReactionText({ text }) {
  return (
    <span>
      {text.split(/(\s+)/).map((token, i) => {
        if (/^\s+$/.test(token) || token === '') return token
        const parts = token.split(/(\d+)/)
        return (
          <span key={i} style={{ whiteSpace: 'nowrap' }}>
            {parts.map((part, j) => {
              if (/^\d+$/.test(part)) {
                const prevChar = (parts[j - 1] || '').slice(-1)
                if (/[A-Za-z)]/.test(prevChar)) {
                  return <sub key={j}>{part}</sub>
                }
              }
              return part
            })}
          </span>
        )
      })}
    </span>
  )
}
