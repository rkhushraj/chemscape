export default function HomeScreen({ onExplore, onStudy }) {
  return (
    <div className="home-screen">
      <div className="home-content">
        <div className="home-logo">
          <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" width="56" height="56">
            <ellipse cx="24" cy="24" rx="22" ry="9" stroke="var(--accent)" strokeWidth="2.5" fill="none"/>
            <ellipse cx="24" cy="24" rx="22" ry="9" stroke="var(--accent)" strokeWidth="2.5" fill="none" transform="rotate(60 24 24)"/>
            <ellipse cx="24" cy="24" rx="22" ry="9" stroke="var(--accent)" strokeWidth="2.5" fill="none" transform="rotate(120 24 24)"/>
            <circle cx="24" cy="24" r="3.5" fill="var(--accent)"/>
          </svg>
        </div>
        <h1 className="home-title">ChemScape</h1>
        <p className="home-subtitle">What would you like to do?</p>

        <div className="home-choices">
          <button className="home-choice" onClick={onExplore}>
            <div className="home-choice-icon">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
            </div>
            <span className="home-choice-title">Explore</span>
            <span className="home-choice-desc">Look up atoms, compounds, and reactions in 3D</span>
          </button>

          <button className="home-choice" onClick={onStudy}>
            <div className="home-choice-icon">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
                <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
              </svg>
            </div>
            <span className="home-choice-title">Study</span>
            <span className="home-choice-desc">Flashcards, quizzes, equation balancing, and the periodic table</span>
          </button>
        </div>
      </div>

      <p className="home-credit">by Rohan Khushraj</p>
    </div>
  )
}
