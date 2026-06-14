import { useState, useEffect } from 'react'
import { QUIZ_TOPICS, QUIZ_QUESTIONS } from './quiz.js'

const STORAGE_KEY = 'chemscape-quiz-scores'

function loadScores() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {} } catch { return {} }
}
function saveScores(s) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(s))
}

function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

const TOPIC_ICONS = {
  'periodic-table': (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/>
      <rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>
    </svg>
  ),
  'electron-config': (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="2" fill="currentColor"/>
      <ellipse cx="12" cy="12" rx="10" ry="4"/>
      <ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(60 12 12)"/>
      <ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(120 12 12)"/>
    </svg>
  ),
  'bonding': (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="7" cy="12" r="3"/><circle cx="17" cy="12" r="3"/>
      <line x1="10" y1="12" x2="14" y2="12"/>
    </svg>
  ),
  'naming': (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/>
      <line x1="7" y1="7" x2="7.01" y2="7"/>
    </svg>
  ),
  'reactions': (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 3H5a2 2 0 0 0-2 2v4m6-6h10a2 2 0 0 1 2 2v4M9 3v18m0 0h10a2 2 0 0 0 2-2v-4M9 21H5a2 2 0 0 1-2-2v-4m0 0h18"/>
    </svg>
  ),
  'stoichiometry': (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="3" x2="12" y2="21"/><line x1="3" y1="12" x2="21" y2="12"/>
      <path d="M3 6l9 3 9-3"/><path d="M3 18l9-3 9 3"/>
    </svg>
  ),
}

export default function QuizMode({ onClose }) {
  const [scores, setScores] = useState(loadScores)
  const [activeTopic, setActiveTopic] = useState(null)
  const [questions, setQuestions] = useState([])
  const [index, setIndex] = useState(0)
  const [selected, setSelected] = useState(null)
  const [results, setResults] = useState([]) // {correct: bool} per question
  const [done, setDone] = useState(false)

  function startTopic(id) {
    const qs = shuffle(QUIZ_QUESTIONS.filter(q => q.topic === id))
    setActiveTopic(id)
    setQuestions(qs)
    setIndex(0)
    setSelected(null)
    setResults([])
    setDone(false)
  }

  function choose(optIndex) {
    if (selected !== null) return
    setSelected(optIndex)
  }

  function next() {
    const correct = selected === questions[index].answer
    const newResults = [...results, { correct }]
    if (index + 1 < questions.length) {
      setResults(newResults)
      setIndex(i => i + 1)
      setSelected(null)
    } else {
      setResults(newResults)
      const score = newResults.filter(r => r.correct).length
      const total = questions.length
      const prev = scores[activeTopic]
      const isBetter = !prev || score > prev.score
      const updated = { ...scores, [activeTopic]: isBetter ? { score, total, date: Date.now() } : prev }
      setScores(updated)
      saveScores(updated)
      setDone(true)
    }
  }

  function getTopicBest(id) {
    return scores[id] || null
  }

  // ── Results screen ─────────────────────────────────────────────
  if (done) {
    const score = results.filter(r => r.correct).length
    const total = questions.length
    const pct = Math.round((score / total) * 100)
    return (
      <div className="study-page">
        <div className="study-topbar">
          <button className="study-topbar-back" onClick={() => setActiveTopic(null)}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>
            </svg>
            Topics
          </button>
          <span className="study-topbar-title">Results</span>
          <span />
        </div>
        <div className="quiz-results">
          <div className={`quiz-score-circle ${pct >= 80 ? 'great' : pct >= 50 ? 'ok' : 'low'}`}>
            <span className="quiz-score-pct">{pct}%</span>
            <span className="quiz-score-label">{score}/{total} correct</span>
          </div>
          <p className="quiz-results-msg">
            {pct === 100 ? 'Perfect score! Outstanding work.' : pct >= 80 ? 'Great job! Almost perfect.' : pct >= 50 ? 'Good effort — keep practicing.' : 'Keep studying — you\'ll get there!'}
          </p>
          <div className="quiz-review">
            {questions.map((q, i) => (
              <div key={q.id} className={`quiz-review-item ${results[i]?.correct ? 'correct' : 'wrong'}`}>
                <div className="quiz-review-icon">
                  {results[i]?.correct
                    ? <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                    : <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                  }
                </div>
                <div className="quiz-review-text">
                  <p className="quiz-review-q">{q.q}</p>
                  {!results[i]?.correct && <p className="quiz-review-ans">Answer: {q.options[q.answer]}</p>}
                </div>
              </div>
            ))}
          </div>
          <div className="study-done-btns">
            <button className="study-outline-btn" onClick={() => startTopic(activeTopic)}>Retry</button>
            <button className="study-solid-btn" onClick={() => { setActiveTopic(null); setDone(false) }}>Back to topics</button>
          </div>
        </div>
      </div>
    )
  }

  // ── Question screen ────────────────────────────────────────────
  if (activeTopic) {
    const q = questions[index]
    const pct = Math.round((index / questions.length) * 100)
    return (
      <div className="study-page">
        <div className="study-topbar">
          <button className="study-topbar-back" onClick={() => setActiveTopic(null)}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>
            </svg>
            Topics
          </button>
          <span className="study-topbar-title">{QUIZ_TOPICS.find(t => t.id === activeTopic)?.label}</span>
          <span className="study-topbar-counter">{index + 1}/{questions.length}</span>
        </div>
        <div className="study-pbar-wrap">
          <div className="study-pbar-fill" style={{ width: `${pct}%` }} />
        </div>
        <div className="quiz-area">
          <p className="quiz-question">{q.q}</p>
          <div className="quiz-options">
            {q.options.map((opt, i) => {
              let cls = 'quiz-option'
              if (selected !== null) {
                if (i === q.answer) cls += ' correct'
                else if (i === selected) cls += ' wrong'
                else cls += ' dim'
              }
              return (
                <button key={i} className={cls} onClick={() => choose(i)}>
                  <span className="quiz-option-letter">{String.fromCharCode(65 + i)}</span>
                  {opt}
                </button>
              )
            })}
          </div>
          {selected !== null && (
            <div className="quiz-feedback">
              <p className={selected === q.answer ? 'quiz-feedback-correct' : 'quiz-feedback-wrong'}>
                {selected === q.answer ? 'Correct!' : `Incorrect — the answer is "${q.options[q.answer]}"`}
              </p>
              <button className="study-solid-btn" onClick={next}>
                {index + 1 < questions.length ? 'Next question' : 'See results'}
              </button>
            </div>
          )}
        </div>
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
        <span className="study-topbar-title">Quiz</span>
        <span />
      </div>
      <div className="study-grid-header">
        <h2>Choose a topic</h2>
        <p>Multiple choice — 10 questions per topic</p>
      </div>
      <div className="topic-grid">
        {QUIZ_TOPICS.map(t => {
          const best = getTopicBest(t.id)
          const pct = best ? Math.round((best.score / best.total) * 100) : 0
          return (
            <button key={t.id} className="topic-card" onClick={() => startTopic(t.id)}>
              <div className="topic-icon">{TOPIC_ICONS[t.id]}</div>
              <span className="topic-name">{t.label}</span>
              <div className="topic-pbar">
                <div className="topic-pbar-fill" style={{ width: `${pct}%` }} />
              </div>
              <span className="topic-pbar-label">{best ? `Best: ${best.score}/${best.total}` : 'Not attempted'}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
