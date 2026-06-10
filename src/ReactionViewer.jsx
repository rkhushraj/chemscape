import { useState, useEffect, useMemo } from 'react'
import MoleculeCard from './MoleculeCard.jsx'
import { RichText } from './Formula.jsx'
import { analyzeReaction, resolveFormula, FORMULA_NAMES } from './chemistry.js'

function reactantAnimState(phase) {
  switch (phase) {
    case 'breaking': return 'reacting'
    case 'forming':
    case 'result': return 'consumed'
    case 'no-reaction': return 'no-reaction'
    default: return ''
  }
}

function productAnimState(phase) {
  return phase === 'forming' || phase === 'result' ? 'formed' : 'pending'
}

function arrowState(phase) {
  if (phase === 'no-reaction') return 'no-reaction'
  if (phase === 'breaking' || phase === 'forming' || phase === 'result') return 'reacting'
  return ''
}

export default function ReactionViewer({ reaction }) {
  const [stepIndex, setStepIndex] = useState(0)

  const analysis = useMemo(
    () => analyzeReaction(reaction.reactants, reaction.products),
    [reaction]
  )

  useEffect(() => {
    setStepIndex(0)
  }, [reaction])

  const step = analysis.steps[stepIndex]
  const showProducts = step.phase !== 'no-reaction'

  return (
    <div className="reaction-viewer">
      <div className="reaction-row">
        {reaction.reactants.map((r, i) => {
          const resolved = resolveFormula(r.formula) ?? r.formula
          return (
            <MoleculeCard
              key={`r-${i}-${r.formula}`}
              formula={resolved}
              altQuery={FORMULA_NAMES[resolved] ?? r.formula}
              matterState={r.state}
              coeff={r.coeff}
              spinning={step.phase !== 'reactants'}
              animState={reactantAnimState(step.phase)}
            />
          )
        })}

        <div className={`reaction-arrow ${arrowState(step.phase)}`}>
          <span className="arrow-head">▶</span>
          {step.phase === 'no-reaction' && <span className="arrow-cross">✕</span>}
        </div>

        {showProducts && reaction.products.map((p, i) => {
          const resolved = resolveFormula(p.formula) ?? p.formula
          return (
            <MoleculeCard
              key={`p-${i}-${p.formula}`}
              formula={resolved}
              altQuery={FORMULA_NAMES[resolved] ?? p.formula}
              matterState={p.state}
              coeff={p.coeff}
              spinning={step.phase === 'forming' || step.phase === 'result'}
              animState={productAnimState(step.phase)}
            />
          )
        })}
      </div>

      <div className="step-panel">
        <div className="step-header">
          <span className="step-counter">Step {stepIndex + 1} of {analysis.steps.length}</span>
          {step.badge && <span className="step-badge">{step.badge}</span>}
        </div>
        <p className="step-title"><RichText parts={[step.title]} /></p>
        <p className="step-description"><RichText parts={step.description} /></p>

        <div className="step-nav">
          <button
            className="step-btn"
            onClick={() => setStepIndex(i => Math.max(0, i - 1))}
            disabled={stepIndex === 0}
          >
            ← Previous
          </button>
          <div className="step-dots">
            {analysis.steps.map((_, i) => (
              <span key={i} className={`step-dot ${i === stepIndex ? 'active' : ''}`} />
            ))}
          </div>
          <button
            className="step-btn"
            onClick={() => setStepIndex(i => Math.min(analysis.steps.length - 1, i + 1))}
            disabled={stepIndex === analysis.steps.length - 1}
          >
            Next →
          </button>
        </div>
      </div>
    </div>
  )
}
