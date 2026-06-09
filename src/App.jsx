import { useState, useRef, useCallback } from 'react'
import MolViewer from './MolViewer.jsx'
import { fetchCompound, fetchCompoundInfo } from './pubchem.js'
import './App.css'

const VIEW_MODES = [
  { id: 'ball-stick', label: 'Ball & Stick' },
  { id: 'cpk',        label: 'Space-Fill' },
  { id: 'wireframe',  label: 'Wireframe' },
  { id: 'surface',    label: 'Surface' },
]

const SUGGESTIONS = ['Water', 'Caffeine', 'Aspirin', 'Glucose', 'Ethanol', 'ATP', 'Penicillin', 'Dopamine']

export default function App() {
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [mol, setMol] = useState(null)   // { sdf, cid, is2d }
  const [info, setInfo] = useState(null)
  const [viewMode, setViewMode] = useState('ball-stick')
  const viewerRef = useRef(null)

  const search = useCallback(async (q) => {
    const trimmed = q.trim()
    if (!trimmed) return
    setLoading(true)
    setError(null)
    setMol(null)
    setInfo(null)
    try {
      const result = await fetchCompound(trimmed)
      setMol(result)
      const props = await fetchCompoundInfo(result.cid)
      setInfo(props)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [])

  const handleSubmit = (e) => {
    e.preventDefault()
    search(query)
  }

  return (
    <div className="app">
      <div className="sidebar">
        <div className="brand">
          <span className="brand-icon">⬡</span>
          <span className="brand-name">ChemScape</span>
        </div>

        <form onSubmit={handleSubmit} className="search-form">
          <input
            className="search-input"
            type="text"
            placeholder="Water, H2O, caffeine…"
            value={query}
            onChange={e => setQuery(e.target.value)}
            autoFocus
          />
          <button className="search-btn" type="submit" disabled={loading}>
            {loading ? <span className="spinner" /> : 'Search'}
          </button>
        </form>

        {error && <div className="error-box">{error}</div>}

        {!mol && !loading && !error && (
          <div className="suggestions">
            <p className="suggestions-label">Try</p>
            <div className="suggestions-grid">
              {SUGGESTIONS.map(s => (
                <button key={s} className="suggestion-chip" onClick={() => { setQuery(s); search(s) }}>
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {mol && (
          <>
            <div className="view-modes">
              <p className="section-label">View Mode</p>
              {VIEW_MODES.map(v => (
                <button
                  key={v.id}
                  className={`mode-btn ${viewMode === v.id ? 'active' : ''}`}
                  onClick={() => setViewMode(v.id)}
                >
                  {v.label}
                </button>
              ))}
            </div>

            <button className="reset-btn" onClick={() => viewerRef.current?.resetView()}>
              Reset View
            </button>
          </>
        )}

        {info && (
          <div className="info-panel">
            <p className="section-label">Properties</p>
            <div className="info-grid">
              {info.MolecularFormula && <InfoRow label="Formula" value={info.MolecularFormula} />}
              {info.MolecularWeight && <InfoRow label="MW" value={`${info.MolecularWeight} g/mol`} />}
              {info.IUPACName && <InfoRow label="IUPAC" value={info.IUPACName} />}
              {info.XLogP != null && <InfoRow label="LogP" value={info.XLogP} />}
              {info.HBondDonorCount != null && <InfoRow label="H-Bond Donors" value={info.HBondDonorCount} />}
              {info.HBondAcceptorCount != null && <InfoRow label="H-Bond Acceptors" value={info.HBondAcceptorCount} />}
              {info.RotatableBondCount != null && <InfoRow label="Rotatable Bonds" value={info.RotatableBondCount} />}
            </div>
            <a
              className="pubchem-link"
              href={`https://pubchem.ncbi.nlm.nih.gov/compound/${mol.cid}`}
              target="_blank"
              rel="noreferrer"
            >
              View on PubChem ↗
            </a>
          </div>
        )}
      </div>

      <div className="viewer-area">
        {!mol && !loading && (
          <div className="empty-state">
            <div className="empty-icon">⬡</div>
            <p>Search for any compound or element to explore its 3D structure</p>
          </div>
        )}
        {loading && (
          <div className="empty-state">
            <div className="loading-ring" />
            <p>Fetching structure…</p>
          </div>
        )}
        {mol && (
          <>
            {mol.is2d && (
              <div className="notice-banner">
                No 3D data available — showing 2D projection
              </div>
            )}
            <MolViewer ref={viewerRef} sdf={mol.sdf} viewMode={viewMode} is2d={mol.is2d} />
          </>
        )}
      </div>
    </div>
  )
}

function InfoRow({ label, value }) {
  return (
    <div className="info-row">
      <span className="info-label">{label}</span>
      <span className="info-value">{value}</span>
    </div>
  )
}
