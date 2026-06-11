import { useState, useEffect, useMemo } from 'react'
import ReactionScene from './ReactionScene.jsx'
import { RichText } from './Formula.jsx'
import { analyzeReaction, resolveFormula, FORMULA_NAMES, getBondChanges } from './chemistry.js'
import { fetchCompound } from './pubchem.js'

export default function ReactionViewer({ reaction, theme }) {
  const [stepIndex, setStepIndex] = useState(0)
  const [reactantSDFs, setReactantSDFs] = useState([])
  const [productSDFs,  setProductSDFs]  = useState([])

  const analysis = useMemo(
    () => analyzeReaction(reaction.reactants, reaction.products),
    [reaction]
  )

  const bondChanges = useMemo(
    () => analysis.allResolved
      ? getBondChanges(analysis.classification, reaction.reactants, reaction.products)
      : null,
    [analysis, reaction]
  )

  // Reset step when reaction changes
  useEffect(() => { setStepIndex(0) }, [reaction])

  // Fetch SDFs for all molecules
  useEffect(() => {
    setReactantSDFs([])
    setProductSDFs([])

    const loadSide = async (tokens) => {
      return Promise.all(
        tokens.map(async t => {
          const resolved = resolveFormula(t.formula) ?? t.formula
          try {
            const mol = await fetchCompound(resolved, FORMULA_NAMES[resolved] ?? t.formula)
            return mol.sdf ?? null
          } catch { return null }
        })
      )
    }

    loadSide(reaction.reactants).then(setReactantSDFs)
    loadSide(reaction.products).then(setProductSDFs)
  }, [reaction])

  const step = analysis.steps[stepIndex]

  return (
    <div className="reaction-viewer">
      <ReactionScene
        reactantSDFs={reactantSDFs}
        productSDFs={productSDFs}
        reactants={reaction.reactants}
        products={reaction.products}
        phase={step.phase}
        bondChanges={bondChanges}
        theme={theme}
      />

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
