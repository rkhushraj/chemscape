import { useState } from 'react'
import { TOPICS, CARDS } from './flashcards.js'
import QuizMode from './QuizMode.jsx'
import BalancerMode from './BalancerMode.jsx'
import PeriodicTableMode from './PeriodicTableMode.jsx'

const STORAGE_KEY = 'chemscape-study-progress'

function loadProgress() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {} } catch { return {} }
}
function saveProgress(p) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(p))
}

const TOPIC_ICONS = {
  'periodic-table': (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/>
      <rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>
    </svg>
  ),
  'electron-config': (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="2" fill="currentColor"/>
      <ellipse cx="12" cy="12" rx="10" ry="4"/>
      <ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(60 12 12)"/>
      <ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(120 12 12)"/>
    </svg>
  ),
  'bonding': (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="7" cy="12" r="3"/><circle cx="17" cy="12" r="3"/>
      <line x1="10" y1="12" x2="14" y2="12"/>
    </svg>
  ),
  'naming': (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/>
      <line x1="7" y1="7" x2="7.01" y2="7"/>
    </svg>
  ),
  'reactions': (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 3H5a2 2 0 0 0-2 2v4m6-6h10a2 2 0 0 1 2 2v4M9 3v18m0 0h10a2 2 0 0 0 2-2v-4M9 21H5a2 2 0 0 1-2-2v-4m0 0h18"/>
    </svg>
  ),
  'stoichiometry': (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="3" x2="12" y2="21"/><line x1="3" y1="12" x2="21" y2="12"/>
      <path d="M3 6l9 3 9-3"/><path d="M3 18l9-3 9 3"/>
    </svg>
  ),
}

export default function StudyPage({ onClose }) {
  const [studyMode, setStudyMode] = useState(null) // null | 'flashcards' | 'quiz'

  if (studyMode === 'quiz') return <QuizMode onClose={() => setStudyMode(null)} />
  if (studyMode === 'flashcards') return <FlashcardMode onClose={() => setStudyMode(null)} />
  if (studyMode === 'balancer') return <BalancerMode onClose={() => setStudyMode(null)} />
  if (studyMode === 'periodic') return <PeriodicTableMode onClose={() => setStudyMode(null)} />

  return (
    <div className="study-page study-home">
      <div className="study-brand" onClick={onClose} style={{ cursor: 'pointer' }}>
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
      </div>
      <div className="study-hero">
        <div className="study-hero-icon">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
            <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
            <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
          </svg>
        </div>
        <h1 className="study-hero-title">Study Mode</h1>
        <p className="study-hero-sub">How do you want to study today?</p>
      </div>
      <div className="study-home-body">
        <div />
        <div className="study-mode-grid">
          <button className="study-mode-card" onClick={() => setStudyMode('flashcards')}>
            <div className="study-mode-icon">
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <rect x="4" y="6" width="16" height="12" rx="2"/>
                <path d="M2 9h2M2 12h2M2 15h2" strokeWidth="1.5"/>
                <path d="M20 9h2M20 12h2M20 15h2" strokeWidth="1.5"/>
                <line x1="8" y1="11" x2="16" y2="11"/>
                <line x1="8" y1="14" x2="13" y2="14"/>
              </svg>
            </div>
            <div className="study-mode-text">
              <span className="study-mode-title">Flashcards</span>
              <span className="study-mode-desc">Flip through cards and track what you know</span>
            </div>
            <svg className="study-mode-arrow" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
            </svg>
          </button>
          <button className="study-mode-card" onClick={() => setStudyMode('quiz')}>
            <div className="study-mode-icon">
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"/>
                <rect x="9" y="3" width="6" height="4" rx="1"/>
                <polyline points="9 12 11 14 15 10"/>
                <line x1="9" y1="17" x2="15" y2="17"/>
              </svg>
            </div>
            <div className="study-mode-text">
              <span className="study-mode-title">Quiz</span>
              <span className="study-mode-desc">Multiple choice questions to test your knowledge</span>
            </div>
            <svg className="study-mode-arrow" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
            </svg>
          </button>
          <button className="study-mode-card" onClick={() => setStudyMode('balancer')}>
            <div className="study-mode-icon">
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="12" x2="19" y2="12"/>
                <path d="M3 6h4l2 3-2 3H3"/>
                <path d="M21 6h-4l-2 3 2 3h4"/>
                <line x1="12" y1="3" x2="12" y2="6"/>
                <line x1="12" y1="18" x2="12" y2="21"/>
              </svg>
            </div>
            <div className="study-mode-text">
              <span className="study-mode-title">Equation Balancer</span>
              <span className="study-mode-desc">Balance chemical equations by adding the right coefficients</span>
            </div>
            <svg className="study-mode-arrow" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
            </svg>
          </button>
          <button className="study-mode-card" onClick={() => setStudyMode('periodic')}>
            <div className="study-mode-icon">
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="5" height="5" rx="1"/>
                <rect x="10" y="3" width="5" height="5" rx="1"/>
                <rect x="17" y="3" width="4" height="5" rx="1"/>
                <rect x="3" y="10" width="5" height="5" rx="1"/>
                <rect x="10" y="10" width="5" height="5" rx="1"/>
                <rect x="3" y="17" width="5" height="4" rx="1"/>
                <rect x="10" y="17" width="5" height="4" rx="1"/>
                <rect x="17" y="10" width="4" height="5" rx="1"/>
              </svg>
            </div>
            <div className="study-mode-text">
              <span className="study-mode-title">Periodic Table</span>
              <span className="study-mode-desc">Browse elements and take a find-the-element challenge</span>
            </div>
            <svg className="study-mode-arrow" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}

function FlashcardMode({ onClose }) {
  const [progress, setProgress] = useState(loadProgress)
  const [activeTopic, setActiveTopic] = useState(null)
  const [cardIndex, setCardIndex] = useState(0)
  const [flipped, setFlipped] = useState(false)
  const [done, setDone] = useState(false)

  const topicCards = activeTopic ? CARDS.filter(c => c.topic === activeTopic) : []
  const card = topicCards[cardIndex]

  function mark(status) {
    const next = { ...progress, [card.id]: status }
    setProgress(next)
    saveProgress(next)
    if (cardIndex + 1 < topicCards.length) {
      setCardIndex(i => i + 1)
      setFlipped(false)
    } else {
      setDone(true)
    }
  }

  function startTopic(id) {
    setActiveTopic(id)
    setCardIndex(0)
    setFlipped(false)
    setDone(false)
  }

  function resetTopic() {
    const next = { ...progress }
    topicCards.forEach(c => delete next[c.id])
    setProgress(next)
    saveProgress(next)
    setCardIndex(0)
    setFlipped(false)
    setDone(false)
  }

  function getTopicStats(topicId) {
    const cards = CARDS.filter(c => c.topic === topicId)
    const known = cards.filter(c => progress[c.id] === 'got').length
    return { total: cards.length, known }
  }

  // ── Flashcard view ────────────────────────────────────────────
  if (activeTopic) {
    const topic = TOPICS.find(t => t.id === activeTopic)
    const stats = getTopicStats(activeTopic)
    const pct = Math.round((cardIndex / topicCards.length) * 100)

    return (
      <div className="study-page">
        <div className="study-topbar">
          <button className="study-topbar-back" onClick={() => setActiveTopic(null)}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>
            </svg>
            Topics
          </button>
          <span className="study-topbar-title">{topic.label}</span>
          <span className="study-topbar-counter">{Math.min(cardIndex + 1, topicCards.length)}/{topicCards.length}</span>
        </div>

        <div className="study-pbar-wrap">
          <div className="study-pbar-fill" style={{ width: `${pct}%` }} />
        </div>

        {done ? (
          <div className="study-done">
            <div className="study-done-check">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
            </div>
            <h2>Topic complete</h2>
            <p>{stats.known} of {stats.total} marked as known</p>
            <div className="study-done-btns">
              <button className="study-outline-btn" onClick={resetTopic}>Restart</button>
              <button className="study-solid-btn" onClick={() => setActiveTopic(null)}>Back to topics</button>
            </div>
          </div>
        ) : (
          <div className="flashcard-area">
            <div className="fc-wrap">
              <div className={`fc ${flipped ? 'fc-flipped' : ''}`} onClick={() => setFlipped(f => !f)}>
                <div className="fc-inner">
                  <div className="fc-front">
                    <span className="fc-tag">Question</span>
                    <p className="fc-text">{card.q}</p>
                    <span className="fc-tap">Tap to reveal answer</span>
                  </div>
                  <div className="fc-back">
                    <span className="fc-tag fc-tag-answer">Answer</span>
                    <p className="fc-text">{card.a}</p>
                  </div>
                </div>
              </div>
            </div>

            {flipped ? (
              <div className="fc-actions">
                <button className="fc-btn-no" onClick={() => mark('still')}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                  </svg>
                  Still learning
                </button>
                <button className="fc-btn-yes" onClick={() => mark('got')}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                  I know this
                </button>
              </div>
            ) : (
              <p className="fc-hint">Tap the card to flip it</p>
            )}
          </div>
        )}
      </div>
    )
  }

  // ── Topic grid ────────────────────────────────────────────────
  return (
    <div className="study-page">
      <div className="study-topbar">
        <button className="study-topbar-back" onClick={onClose}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>
          </svg>
          Back
        </button>
        <span className="study-topbar-title">Flashcards</span>
        <span />
      </div>

      <div className="study-grid-header">
        <h2>Choose a topic</h2>
        <p>Chemistry flashcards</p>
      </div>

      <div className="topic-grid">
        {TOPICS.map(t => {
          const { known, total } = getTopicStats(t.id)
          const pct = Math.round((known / total) * 100)
          return (
            <button key={t.id} className="topic-card" onClick={() => startTopic(t.id)}>
              <div className="topic-icon">{TOPIC_ICONS[t.id]}</div>
              <span className="topic-name">{t.label}</span>
              <div className="topic-pbar">
                <div className="topic-pbar-fill" style={{ width: `${pct}%` }} />
              </div>
              <span className="topic-pbar-label">{known}/{total} known</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
