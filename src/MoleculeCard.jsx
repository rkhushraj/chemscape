import { useState, useEffect } from 'react'
import MolViewer from './MolViewer.jsx'
import { fetchCompound } from './pubchem.js'

export default function MoleculeCard({ formula, coeff, spinning, animState }) {
  const [state, setState] = useState({ loading: true, error: null, mol: null })

  useEffect(() => {
    let cancelled = false
    setState({ loading: true, error: null, mol: null })
    fetchCompound(formula)
      .then(mol => { if (!cancelled) setState({ loading: false, error: null, mol }) })
      .catch(e => { if (!cancelled) setState({ loading: false, error: e.message, mol: null }) })
    return () => { cancelled = true }
  }, [formula])

  return (
    <div className={`mol-card ${animState}`}>
      {coeff > 1 && <span className="mol-coeff">{coeff}×</span>}
      <div className="mol-card-viewer">
        {state.loading && <span className="spinner" />}
        {state.error && <div className="mol-card-error">Not found</div>}
        {state.mol && (
          <MolViewer
            sdf={state.mol.sdf}
            viewMode="ball-stick"
            showLabels={true}
            spinning={spinning}
          />
        )}
      </div>
      <div className="mol-card-name">{formula}</div>
    </div>
  )
}
