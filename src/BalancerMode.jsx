import { useState } from 'react'
import { BALANCER_EQUATIONS } from './balancer.js'

const DIFFICULTY_LABEL = { easy: 'Easy', medium: 'Medium', hard: 'Hard' }
const DIFFICULTY_COLOR = { easy: '#34d399', medium: '#fbbf24', hard: '#f87171' }

function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export default function BalancerMode({ onClose }) {
  const DIFFICULTY_ORDER = { easy: 0, medium: 1, hard: 2 }
  const [queue, setQueue] = useState(() => {
    const easy = shuffle(BALANCER_EQUATIONS.filter(e => e.difficulty === 'easy'))
    const medium = shuffle(BALANCER_EQUATIONS.filter(e => e.difficulty === 'medium'))
    const hard = shuffle(BALANCER_EQUATIONS.filter(e => e.difficulty === 'hard'))
    return [...easy, ...medium, ...hard]
  })
  const [index, setIndex] = useState(0)
  const [inputs, setInputs] = useState({})
  const [checked, setChecked] = useState(false)
  const [showHint, setShowHint] = useState(false)
  const [score, setScore] = useState({ correct: 0, total: 0 })
  const [done, setDone] = useState(false)

  const eq = queue[index]
  const allSpecies = [...eq.reactants, ...eq.products]
  const totalCoeffs = eq.coefficients.length

  function getValue(i) {
    return inputs[i] ?? ''
  }

  function setInput(i, val) {
    const n = val.replace(/[^0-9]/g, '')
    if (n.length <= 2) setInputs(prev => ({ ...prev, [i]: n }))
  }

  function isCorrect() {
    return eq.coefficients.every((c, i) => {
      const v = parseInt(getValue(i), 10)
      return v === c
    })
  }

  function handleCheck() {
    setChecked(true)
    if (isCorrect()) {
      setScore(s => ({ correct: s.correct + 1, total: s.total + 1 }))
    } else {
      setScore(s => ({ ...s, total: s.total + 1 }))
    }
  }

  function handleNext() {
    if (index + 1 >= queue.length) {
      setDone(true)
    } else {
      setIndex(i => i + 1)
      setInputs({})
      setChecked(false)
      setShowHint(false)
    }
  }

  function handleRestart() {
    setQueue(shuffle(BALANCER_EQUATIONS))
    setIndex(0)
    setInputs({})
    setChecked(false)
    setShowHint(false)
    setScore({ correct: 0, total: 0 })
    setDone(false)
  }

  // ── Done screen ───────────────────────────────────────────────
  if (done) {
    const pct = Math.round((score.correct / score.total) * 100)
    return (
      <div className="study-page">
        <div className="study-topbar">
          <button className="study-topbar-back" onClick={onClose}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>
            </svg>
            Back
          </button>
          <span className="study-topbar-title">Equation Balancer</span>
          <span />
        </div>
        <div className="quiz-results">
          <div className={`quiz-score-circle ${pct >= 80 ? 'great' : pct >= 50 ? 'ok' : 'low'}`}>
            <span className="quiz-score-pct">{pct}%</span>
            <span className="quiz-score-label">{score.correct}/{score.total} correct</span>
          </div>
          <p className="quiz-results-msg">
            {pct === 100 ? 'Perfect! You balanced every equation.' : pct >= 80 ? 'Great work — almost perfect!' : pct >= 50 ? 'Good effort. Keep practicing stoichiometry.' : 'Keep at it — balancing takes practice!'}
          </p>
          <div className="study-done-btns">
            <button className="study-outline-btn" onClick={handleRestart}>Try again</button>
            <button className="study-solid-btn" onClick={onClose}>Back to study</button>
          </div>
        </div>
      </div>
    )
  }

  const correct = checked && isCorrect()
  const wrong = checked && !isCorrect()
  const pct = Math.round((index / queue.length) * 100)

  return (
    <div className="study-page">
      <div className="study-topbar">
        <button className="study-topbar-back" onClick={onClose}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>
          </svg>
          Back
        </button>
        <span className="study-topbar-title">Equation Balancer</span>
        <span className="study-topbar-counter">{index + 1}/{queue.length}</span>
      </div>

      <div className="study-pbar-wrap">
        <div className="study-pbar-fill" style={{ width: `${pct}%` }} />
      </div>

      <div className="balancer-area">
        <div className="balancer-difficulty">
          <span className="balancer-diff-badge" style={{ color: DIFFICULTY_COLOR[eq.difficulty], borderColor: DIFFICULTY_COLOR[eq.difficulty] }}>
            {DIFFICULTY_LABEL[eq.difficulty]}
          </span>
          <span className="balancer-score-label">{score.correct}/{score.total} correct</span>
        </div>

        <p className="balancer-instruction">Fill in the coefficients to balance the equation</p>

        <div className={`balancer-equation ${checked ? (correct ? 'eq-correct' : 'eq-wrong') : ''}`}>
          {/* Reactants */}
          {eq.reactants.map((r, i) => (
            <span key={i} className="balancer-term">
              {i > 0 && <span className="balancer-op">+</span>}
              <input
                className={`coeff-input ${checked ? (parseInt(getValue(i), 10) === eq.coefficients[i] ? 'coeff-ok' : 'coeff-bad') : ''}`}
                type="text"
                inputMode="numeric"
                value={getValue(i)}
                onChange={e => setInput(i, e.target.value)}
                disabled={checked}
                placeholder="?"
              />
              <span className="balancer-formula">{r.display}</span>
            </span>
          ))}

          <span className="balancer-arrow">→</span>

          {/* Products */}
          {eq.products.map((p, i) => {
            const ci = eq.reactants.length + i
            return (
              <span key={i} className="balancer-term">
                {i > 0 && <span className="balancer-op">+</span>}
                <input
                  className={`coeff-input ${checked ? (parseInt(getValue(ci), 10) === eq.coefficients[ci] ? 'coeff-ok' : 'coeff-bad') : ''}`}
                  type="text"
                  inputMode="numeric"
                  value={getValue(ci)}
                  onChange={e => setInput(ci, e.target.value)}
                  disabled={checked}
                  placeholder="?"
                />
                <span className="balancer-formula">{p.display}</span>
              </span>
            )
          })}
        </div>

        {/* Correct answer reveal */}
        {checked && (
          <div className={`balancer-answer-row ${correct ? 'answer-correct' : 'answer-wrong'}`}>
            {correct ? (
              <>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                Correct! Well balanced.
              </>
            ) : (
              <>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                The correct coefficients are: {eq.coefficients.join(', ')}
              </>
            )}
          </div>
        )}

        {/* Hint */}
        {!checked && (
          <button className="balancer-hint-btn" onClick={() => setShowHint(h => !h)}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/>
            </svg>
            {showHint ? 'Hide hint' : 'Show hint'}
          </button>
        )}
        {showHint && !checked && (
          <div className="balancer-hint">{eq.hint}</div>
        )}

        <div className="balancer-actions">
          {!checked ? (
            <button
              className="study-solid-btn"
              onClick={handleCheck}
              disabled={eq.coefficients.some((_, i) => getValue(i) === '')}
            >
              Check answer
            </button>
          ) : (
            <button className="study-solid-btn" onClick={handleNext}>
              {index + 1 < queue.length ? 'Next equation' : 'See results'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
