import { useState, useRef, useEffect } from 'react'
import { askAI } from './ai.js'

const SUGGESTED_PROMPTS = [
  'What is this used for?',
  'Explain this to me simply',
  'Why does this reaction happen?',
  'Quiz me on this',
]

export default function ChatWidget({ context }) {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState([
    { role: 'assistant', text: 'Hi! I\'m ChemScape AI. Ask me anything about chemistry — or about what you\'re currently viewing.' }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef(null)

  useEffect(() => {
    if (open) bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, open])

  async function send(text) {
    const msg = (text ?? input).trim()
    if (!msg || loading) return
    setInput('')
    setMessages(prev => [...prev, { role: 'user', text: msg }])
    setLoading(true)
    try {
      const reply = await askAI(msg, context)
      setMessages(prev => [...prev, { role: 'assistant', text: reply }])
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', text: 'Sorry, something went wrong. Please try again.' }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      {/* Floating button */}
      <button
        className="chat-fab"
        onClick={() => setOpen(o => !o)}
        aria-label="Open AI chat"
      >
        {open ? (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"/>
            <line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        ) : (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
          </svg>
        )}
        {!open && <span className="chat-fab-label">Ask AI</span>}
      </button>

      {/* Chat popup */}
      {open && (
        <div className="chat-popup">
          <div className="chat-header">
            <div className="chat-header-info">
              <span className="chat-avatar">⚗</span>
              <div>
                <p className="chat-title">ChemScape AI</p>
                <p className="chat-subtitle">Chemistry tutor</p>
              </div>
            </div>
            <button className="chat-close" onClick={() => setOpen(false)}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>

          {context && (context.compound || context.atom || context.reaction) && (
            <div className="chat-context-bar">
              <span className="chat-context-dot" />
              Viewing: <strong>{context.compound || context.atom || context.reaction}</strong>
            </div>
          )}

          <div className="chat-messages">
            {messages.map((m, i) => (
              <div key={i} className={`chat-bubble ${m.role}`}>
                {m.text}
              </div>
            ))}
            {loading && (
              <div className="chat-bubble assistant chat-typing">
                <span/><span/><span/>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {messages.length === 1 && (
            <div className="chat-suggestions">
              {SUGGESTED_PROMPTS.map(p => (
                <button key={p} className="chat-suggestion-chip" onClick={() => send(p)}>
                  {p}
                </button>
              ))}
            </div>
          )}

          <form className="chat-input-row" onSubmit={e => { e.preventDefault(); send() }}>
            <input
              className="chat-input"
              placeholder="Ask a chemistry question…"
              value={input}
              onChange={e => setInput(e.target.value)}
              disabled={loading}
            />
            <button className="chat-send" type="submit" disabled={!input.trim() || loading}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="22" y1="2" x2="11" y2="13"/>
                <polygon points="22 2 15 22 11 13 2 9 22 2"/>
              </svg>
            </button>
          </form>
        </div>
      )}
    </>
  )
}
