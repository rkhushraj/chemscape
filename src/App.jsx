import { useState, useRef, useCallback, useEffect } from 'react'
import MolViewer from './MolViewer.jsx'
import ReactionViewer from './ReactionViewer.jsx'
import AtomViewer from './AtomViewer.jsx'
import { fetchCompound, fetchCompoundInfo } from './pubchem.js'
import { parseReaction, EXAMPLE_REACTIONS } from './reactions.js'
import { findElement } from './elements.js'
import FormulaText, { ReactionText } from './Formula.jsx'
import ChatWidget from './ChatWidget.jsx'
import './App.css'

const VIEW_MODES = [
  { id: 'ball-stick',     label: 'Ball & Stick' },
  { id: 'cpk',            label: 'Space-Fill' },
  { id: 'surface',        label: 'Surface' },
  { id: 'electron-shells', label: 'Electron Shells' },
]

const SUGGESTIONS = ['Water', 'H2O', 'Caffeine', 'CO2', 'Aspirin', 'O2', 'Glucose', 'NH3', 'Ethanol', 'ATP', 'Penicillin', 'Dopamine']

const ATOM_SUGGESTIONS = ['Hydrogen', 'Carbon', 'Oxygen', 'Sodium', 'Iron', 'Chlorine', 'Neon', 'Calcium']

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
  const [showLegend, setShowLegend] = useState(true)
  const [legend, setLegend] = useState([])
  const viewerRef = useRef(null)

  const [reactionInput, setReactionInput] = useState('')
  const [reaction, setReaction] = useState(null)
  const [reactionError, setReactionError] = useState(null)

  const [atomQuery, setAtomQuery] = useState('')
  const [atomResult, setAtomResult] = useState(null)
  const [atomError, setAtomError] = useState(null)
  const atomViewerRef = useRef(null)

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
      setReactionError('Enter a reaction, e.g. "A + B -> C + D", or just the reactants, e.g. "A + B"')
      setReaction(null)
      return
    }
    if (!parsed.products) {
      setReactionError("Hmm, we don't recognize that reaction! Either write out the full equation again or just put the reactants.")
      setReaction(null)
      return
    }
    setReactionError(null)
    setReaction(parsed)
  }

  const handleAtomSubmit = (e) => {
    e.preventDefault()
    searchAtom(atomQuery)
  }

  const searchAtom = (q) => {
    const element = findElement(q)
    if (!element) {
      setAtomError(`Couldn't find an element matching "${q}" — try a name, symbol, or atomic number!`)
      setAtomResult(null)
      return
    }
    setAtomError(null)
    setAtomResult(element)
  }

  return (
    <>
    <div className="app">
      <div className="sidebar">
        <div className="brand">
          <div className="element-tile brand-icon">
            <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
              <ellipse cx="24" cy="24" rx="20" ry="8" stroke="currentColor" strokeWidth="2.5" />
              <ellipse cx="24" cy="24" rx="20" ry="8" stroke="currentColor" strokeWidth="2.5" transform="rotate(60 24 24)" />
              <ellipse cx="24" cy="24" rx="20" ry="8" stroke="currentColor" strokeWidth="2.5" transform="rotate(120 24 24)" />
              <circle cx="24" cy="24" r="4" fill="currentColor" />
            </svg>
          </div>
          <div className="brand-text">
            <span className="brand-name">ChemScape</span>
            <span className="brand-credit">by Rohan Khushraj</span>
          </div>
          <button
            className="theme-toggle"
            onClick={() => setTheme(t => t === 'dark' ? 'light' : 'dark')}
            aria-label="Toggle light/dark theme"
            title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {theme === 'dark' ? (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#f8d76b" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="5" fill="#f8d76b" fillOpacity="0.25"/>
                <line x1="12" y1="1" x2="12" y2="3"/>
                <line x1="12" y1="21" x2="12" y2="23"/>
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
                <line x1="1" y1="12" x2="3" y2="12"/>
                <line x1="21" y1="12" x2="23" y2="12"/>
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
              </svg>
            ) : (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
              </svg>
            )}
          </button>
        </div>

        <div className="mode-switch">
          <button
            className={mode === 'atom' ? 'active' : ''}
            onClick={() => setMode('atom')}
          >
            Atom
          </button>
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
            placeholder="Enter a compound or formula…"
            value={query}
            onChange={e => setQuery(e.target.value)}
            autoFocus
          />
          <button className="search-btn" type="submit" disabled={loading}>
            {loading ? <span className="spinner" /> : 'Search'}
          </button>
        </form>
        )}

        {mode === 'compound' && error && (
          <div className="error-box">
            {error}
            {!error.includes('large protein') && (
              <p className="error-hint">This compound may be unstable, extremely rare, or not yet in our database.</p>
            )}
          </div>
        )}

        {mode === 'compound' && !mol && !loading && !error && (
          <div className="suggestions">
            <p className="suggestions-label">Try</p>
            <div className="suggestions-grid">
              {SUGGESTIONS.map(s => (
                <button key={s} className="suggestion-chip" onClick={() => { setQuery(s); search(s) }}>
                  <span><FormulaText formula={s} /></span>
                </button>
              ))}
            </div>
          </div>
        )}

        {mode === 'atom' && (
          <>
            <form onSubmit={handleAtomSubmit} className="search-form">
              <input
                className="search-input"
                type="text"
                placeholder="Enter an element name/symbol…"
                value={atomQuery}
                onChange={e => setAtomQuery(e.target.value)}
                autoFocus
              />
              <button className="search-btn" type="submit">
                Search
              </button>
            </form>

            {atomError && <div className="error-box">{atomError}</div>}

            {!atomResult && !atomError && (
              <div className="suggestions">
                <p className="suggestions-label">Try</p>
                <div className="suggestions-grid">
                  {ATOM_SUGGESTIONS.map(s => (
                    <button key={s} className="suggestion-chip" onClick={() => { setAtomQuery(s); searchAtom(s) }}>
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {atomResult && (
              <button className="reset-btn" onClick={() => atomViewerRef.current?.resetView()}>
                Reset View
              </button>
            )}

            {atomResult && (
              <div className="info-panel">
                <p className="section-label">{atomResult.name}</p>
                <div className="info-grid">
                  <InfoRow label="Symbol" value={atomResult.symbol} />
                  <InfoRow label="Atomic Number" value={atomResult.atomicNumber} />
                  <InfoRow label="Mass Number" value={atomResult.massNumber} />
                  <InfoRow label="Protons" value={atomResult.atomicNumber} />
                  <InfoRow label="Neutrons" value={atomResult.neutrons} />
                  <InfoRow label="Electrons" value={atomResult.atomicNumber} />
                  <InfoRow label="Electron Shells" value={atomResult.shells.join(', ')} />
                  <InfoRow label="Valence Electrons" value={atomResult.shells[atomResult.shells.length - 1]} />
                  <InfoRow label="Core Electrons" value={atomResult.atomicNumber - atomResult.shells[atomResult.shells.length - 1]} />
                </div>
              </div>
            )}
          </>
        )}

        {mode === 'reaction' && (
          <>
            <form onSubmit={handleReactionSubmit} className="search-form">
              <input
                className="search-input"
                type="text"
                placeholder="Enter a reaction…"
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
                    <ReactionText text={r} />
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
              <span className="toggle-label">Element Legend</span>
              <button
                className={`toggle-btn ${showLegend ? 'on' : ''}`}
                onClick={() => setShowLegend(v => !v)}
                aria-pressed={showLegend}
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
              {info.MolecularFormula && <InfoRow label="Formula" value={<FormulaText formula={info.MolecularFormula} />} />}
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
              <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                <line x1="24" y1="24" x2="38" y2="14" stroke="currentColor" strokeWidth="2.5" />
                <line x1="24" y1="24" x2="12" y2="34" stroke="currentColor" strokeWidth="2.5" />
                <line x1="24" y1="24" x2="34" y2="38" stroke="currentColor" strokeWidth="2.5" />
                <circle cx="24" cy="24" r="8" fill="currentColor" />
                <circle cx="38" cy="14" r="5" fill="currentColor" opacity="0.7" />
                <circle cx="12" cy="34" r="5" fill="currentColor" opacity="0.7" />
                <circle cx="34" cy="38" r="5" fill="currentColor" opacity="0.7" />
              </svg>
            </div>
            <p>Search for any compound or element to explore its 2D structure</p>
            <p className="coming-soon">3D structures coming soon!</p>
          </div>
        )}
        {mode === 'compound' && loading && (
          <div className="empty-state">
            <div className="loading-ring" />
            <p>Summoning molecule…</p>
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
                  Showing valence (outermost) electrons only — like a Lewis dot structure
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
            <MolViewer ref={viewerRef} sdf={mol.sdf} viewMode={viewMode} is2d={mol.is2d} theme={theme} onLegendChange={setLegend} />
            {showLegend && viewMode !== 'electron-shells' && legend.length > 0 && (
              <div className="element-legend">
                {legend.map(({ elem, count, color }) => (
                  <span key={elem}>
                    <i className="dot" style={{ background: color }} />
                    {elem}{count > 1 ? ` × ${count}` : ''}
                  </span>
                ))}
              </div>
            )}
          </>
        )}

        {mode === 'atom' && !atomResult && (
          <div className="empty-state">
            <div className="element-tile empty-icon">
              <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                <ellipse cx="24" cy="24" rx="20" ry="8" stroke="currentColor" strokeWidth="2.5" />
                <ellipse cx="24" cy="24" rx="20" ry="8" stroke="currentColor" strokeWidth="2.5" transform="rotate(60 24 24)" />
                <ellipse cx="24" cy="24" rx="20" ry="8" stroke="currentColor" strokeWidth="2.5" transform="rotate(120 24 24)" />
                <circle cx="24" cy="24" r="4" fill="currentColor" />
              </svg>
            </div>
            <p>Search for an element to see its 3D atomic structure</p>
          </div>
        )}
        {mode === 'atom' && atomResult && (
          <>
            <AtomViewer
              ref={atomViewerRef}
              protons={atomResult.atomicNumber}
              neutrons={atomResult.neutrons}
              shells={atomResult.shells}
              theme={theme}
            />
            <div className="element-legend">
              <span><i className="dot dot-proton" /> Proton</span>
              <span><i className="dot dot-neutron" /> Neutron</span>
              <span><i className="dot dot-shell-electron" /> Electron</span>
            </div>
          </>
        )}

        {mode === 'reaction' && !reaction && (
          <div className="empty-state">
            <div className="element-tile empty-icon">⇌</div>
            <p>Enter the reactants and we'll predict the products, or write out the full equation!</p>
            <p className="coming-soon">No states of matter needed</p>
          </div>
        )}
        {mode === 'reaction' && reaction && (
          <ReactionViewer reaction={reaction} theme={theme} />
        )}
      </div>
    </div>
    <ChatWidget context={{
      mode,
      compound: mode === 'compound' ? (info?.IUPACName || query || null) : null,
      atom: mode === 'atom' ? (atomResult?.name || null) : null,
      reaction: mode === 'reaction' ? (reactionInput || null) : null,
    }} />
    </>
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

