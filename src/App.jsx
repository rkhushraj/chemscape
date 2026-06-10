import { useState, useRef, useCallback, useEffect } from 'react'
import MolViewer from './MolViewer.jsx'
import ReactionViewer from './ReactionViewer.jsx'
import { fetchCompound, fetchCompoundInfo } from './pubchem.js'
import { parseReaction, EXAMPLE_REACTIONS } from './reactions.js'
import './App.css'

const VIEW_MODES = [
  { id: 'ball-stick',     label: 'Ball & Stick' },
  { id: 'cpk',            label: 'Space-Fill' },
  { id: 'surface',        label: 'Surface' },
  { id: 'electron-shells', label: 'Electron Shells' },
]

const SUGGESTIONS = ['Water', 'Caffeine', 'Aspirin', 'Glucose', 'Ethanol', 'ATP', 'Penicillin', 'Dopamine']

export default function App() {
  const [theme, setTheme] = useState(() => localStorage.getItem('chemscape-theme') || 'dark')
  const [mode, setMode] = useState('compound') // 'compound' | 'reaction'

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('chemscape-theme', theme)
  }, [theme])

  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [mol, setMol] = useState(null)   // { sdf, cid, is2d }
  const [info, setInfo] = useState(null)
  const [viewMode, setViewMode] = useState('ball-stick')
  const [showLabels, setShowLabels] = useState(true)
  const viewerRef = useRef(null)

  const [reactionInput, setReactionInput] = useState('')
  const [reaction, setReaction] = useState(null)
  const [reactionError, setReactionError] = useState(null)

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

  const handleReactionSubmit = (e) => {
    e.preventDefault()
    runReaction(reactionInput)
  }

  const runReaction = (input) => {
    const parsed = parseReaction(input)
    if (!parsed) {
      setReactionError('Use the format: Reactant + Reactant -> Product + Product')
      setReaction(null)
      return
    }
    setReactionError(null)
    setReaction(parsed)
  }

  return (
    <div className="app">
      <div className="sidebar">
        <div className="brand">
          <div className="element-tile brand-icon">
            <span className="element-tile-num">8</span>
            <span className="element-tile-sym">O</span>
          </div>
          <span className="brand-name">ChemScape</span>
          <button
            className="theme-toggle"
            onClick={() => setTheme(t => t === 'dark' ? 'light' : 'dark')}
            aria-label="Toggle light/dark theme"
            title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>
        </div>

        <div className="mode-switch">
          <button
            className={mode === 'compound' ? 'active' : ''}
            onClick={() => setMode('compound')}
          >
            Compound
          </button>
          <button
            className={mode === 'reaction' ? 'active' : ''}
            onClick={() => setMode('reaction')}
          >
            Reaction
          </button>
        </div>

        {mode === 'compound' && (
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
        )}

        {mode === 'compound' && error && <div className="error-box">{error}</div>}

        {mode === 'compound' && !mol && !loading && !error && (
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

        {mode === 'reaction' && (
          <>
            <form onSubmit={handleReactionSubmit} className="search-form">
              <input
                className="search-input"
                type="text"
                placeholder="CH4 + 2 O2 -> CO2 + 2 H2O"
                value={reactionInput}
                onChange={e => setReactionInput(e.target.value)}
                autoFocus
              />
              <button className="search-btn" type="submit">
                Visualize
              </button>
            </form>

            {reactionError && <div className="error-box">{reactionError}</div>}

            <div className="suggestions">
              <p className="suggestions-label">Try</p>
              <div className="suggestions-grid suggestions-col">
                {EXAMPLE_REACTIONS.map(r => (
                  <button
                    key={r}
                    className="suggestion-chip"
                    onClick={() => { setReactionInput(r); runReaction(r) }}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>
          </>
        )}

        {mode === 'compound' && mol && (
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

            <label className="toggle-row">
              <span className="toggle-label">Atom Labels</span>
              <button
                className={`toggle-btn ${showLabels ? 'on' : ''}`}
                onClick={() => setShowLabels(v => !v)}
                aria-pressed={showLabels}
              >
                <span className="toggle-knob" />
              </button>
            </label>

            <button className="reset-btn" onClick={() => viewerRef.current?.resetView()}>
              Reset View
            </button>
          </>
        )}

        {mode === 'compound' && info && (
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
        {mode === 'compound' && !mol && !loading && (
          <div className="empty-state">
            <div className="element-tile empty-icon">
              <span className="element-tile-num">8</span>
              <span className="element-tile-sym">O</span>
            </div>
            <p>Search for any compound or element to explore its 2D structure</p>
            <p className="coming-soon">3D structures coming soon!</p>
          </div>
        )}
        {mode === 'compound' && loading && (
          <div className="empty-state">
            <div className="loading-ring" />
            <p>Fetching structure…</p>
          </div>
        )}
        {mode === 'compound' && mol && (
          <>
            <div className="notice-stack">
              {mol.is2d && (
                <div className="notice-banner">
                  No 3D data available — showing 2D projection
                </div>
              )}
              {viewMode === 'electron-shells' && (
                <div className="notice-banner">
                  Showing valence (outermost) electrons only — like a Lewis structure
                </div>
              )}
            </div>
            {viewMode === 'electron-shells' && (
              <div className="electron-legend">
                <span><i className="dot dot-atomic" /> Lone pair / valence electrons</span>
                <span><i className="dot dot-bond" /> Shared covalent pairs</span>
                <span><i className="dot dot-sea" /> Delocalized (metallic) electrons</span>
                <span><i className="dot dot-transfer" /> Electron transferring (ionic)</span>
                <span><i className="charge charge-pos">+</i> / <i className="charge charge-neg">−</i> Ionic charge</span>
              </div>
            )}
            <MolViewer ref={viewerRef} sdf={mol.sdf} viewMode={viewMode} is2d={mol.is2d} showLabels={showLabels} theme={theme} />
          </>
        )}

        {mode === 'reaction' && !reaction && (
          <div className="empty-state">
            <div className="empty-icon">⇌</div>
            <p>Enter a reaction to see reactants transform into products</p>
          </div>
        )}
        {mode === 'reaction' && reaction && (
          <ReactionViewer reaction={reaction} />
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
