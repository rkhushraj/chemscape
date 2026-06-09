import { useState, useEffect } from 'react'
import MoleculeCard from './MoleculeCard.jsx'

export default function ReactionViewer({ reaction }) {
  const [phase, setPhase] = useState('idle') // idle | reacting | done

  useEffect(() => {
    setPhase('idle')
  }, [reaction])

  const handlePlay = () => {
    if (phase === 'reacting') return
    if (phase === 'done') {
      setPhase('idle')
      setTimeout(() => setPhase('reacting'), 50)
    } else {
      setPhase('reacting')
    }
    setTimeout(() => setPhase('done'), 2200)
  }

  return (
    <div className="reaction-viewer">
      <div className="reaction-row">
        {reaction.reactants.map((r, i) => (
          <MoleculeCard
            key={`r-${i}-${r.formula}`}
            formula={r.formula}
            coeff={r.coeff}
            spinning={phase !== 'idle'}
            animState={phase === 'reacting' ? 'reacting' : phase === 'done' ? 'consumed' : ''}
          />
        ))}

        <div className={`reaction-arrow ${phase}`}>
          <span className="arrow-shaft" />
          <span className="arrow-head">▶</span>
        </div>

        {reaction.products.map((p, i) => (
          <MoleculeCard
            key={`p-${i}-${p.formula}`}
            formula={p.formula}
            coeff={p.coeff}
            spinning={phase === 'done'}
            animState={phase === 'done' ? 'formed' : 'pending'}
          />
        ))}
      </div>

      <button className="play-btn" onClick={handlePlay} disabled={phase === 'reacting'}>
        {phase === 'idle' && '▶ Play Reaction'}
        {phase === 'reacting' && 'Reacting…'}
        {phase === 'done' && '↺ Replay'}
      </button>
    </div>
  )
}
