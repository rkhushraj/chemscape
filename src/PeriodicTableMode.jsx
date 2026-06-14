import { useState } from 'react'
import { getShellElectrons, MASS_NUMBERS } from './elements.js'

// Category → color key
const CAT_COLOR = {
  'alkali':      '#f87171',
  'alkaline':    '#fb923c',
  'transition':  '#facc15',
  'post-trans':  '#a3e635',
  'metalloid':   '#34d399',
  'nonmetal':    '#38bdf8',
  'halogen':     '#818cf8',
  'noble':       '#e879f9',
  'lanthanide':  '#f472b6',
  'actinide':    '#94a3b8',
}
const CAT_LABEL = {
  'alkali':     'Alkali Metal',
  'alkaline':   'Alkaline Earth',
  'transition': 'Transition Metal',
  'post-trans': 'Post-transition Metal',
  'metalloid':  'Metalloid',
  'nonmetal':   'Nonmetal',
  'halogen':    'Halogen',
  'noble':      'Noble Gas',
  'lanthanide': 'Lanthanide',
  'actinide':   'Actinide',
}

// period, group, category for each element
const TABLE = [
  {sym:'H',  z:1,  name:'Hydrogen',     p:1, g:1,  cat:'nonmetal'},
  {sym:'He', z:2,  name:'Helium',        p:1, g:18, cat:'noble'},
  {sym:'Li', z:3,  name:'Lithium',       p:2, g:1,  cat:'alkali'},
  {sym:'Be', z:4,  name:'Beryllium',     p:2, g:2,  cat:'alkaline'},
  {sym:'B',  z:5,  name:'Boron',         p:2, g:13, cat:'metalloid'},
  {sym:'C',  z:6,  name:'Carbon',        p:2, g:14, cat:'nonmetal'},
  {sym:'N',  z:7,  name:'Nitrogen',      p:2, g:15, cat:'nonmetal'},
  {sym:'O',  z:8,  name:'Oxygen',        p:2, g:16, cat:'nonmetal'},
  {sym:'F',  z:9,  name:'Fluorine',      p:2, g:17, cat:'halogen'},
  {sym:'Ne', z:10, name:'Neon',          p:2, g:18, cat:'noble'},
  {sym:'Na', z:11, name:'Sodium',        p:3, g:1,  cat:'alkali'},
  {sym:'Mg', z:12, name:'Magnesium',     p:3, g:2,  cat:'alkaline'},
  {sym:'Al', z:13, name:'Aluminum',      p:3, g:13, cat:'post-trans'},
  {sym:'Si', z:14, name:'Silicon',       p:3, g:14, cat:'metalloid'},
  {sym:'P',  z:15, name:'Phosphorus',    p:3, g:15, cat:'nonmetal'},
  {sym:'S',  z:16, name:'Sulfur',        p:3, g:16, cat:'nonmetal'},
  {sym:'Cl', z:17, name:'Chlorine',      p:3, g:17, cat:'halogen'},
  {sym:'Ar', z:18, name:'Argon',         p:3, g:18, cat:'noble'},
  {sym:'K',  z:19, name:'Potassium',     p:4, g:1,  cat:'alkali'},
  {sym:'Ca', z:20, name:'Calcium',       p:4, g:2,  cat:'alkaline'},
  {sym:'Sc', z:21, name:'Scandium',      p:4, g:3,  cat:'transition'},
  {sym:'Ti', z:22, name:'Titanium',      p:4, g:4,  cat:'transition'},
  {sym:'V',  z:23, name:'Vanadium',      p:4, g:5,  cat:'transition'},
  {sym:'Cr', z:24, name:'Chromium',      p:4, g:6,  cat:'transition'},
  {sym:'Mn', z:25, name:'Manganese',     p:4, g:7,  cat:'transition'},
  {sym:'Fe', z:26, name:'Iron',          p:4, g:8,  cat:'transition'},
  {sym:'Co', z:27, name:'Cobalt',        p:4, g:9,  cat:'transition'},
  {sym:'Ni', z:28, name:'Nickel',        p:4, g:10, cat:'transition'},
  {sym:'Cu', z:29, name:'Copper',        p:4, g:11, cat:'transition'},
  {sym:'Zn', z:30, name:'Zinc',          p:4, g:12, cat:'transition'},
  {sym:'Ga', z:31, name:'Gallium',       p:4, g:13, cat:'post-trans'},
  {sym:'Ge', z:32, name:'Germanium',     p:4, g:14, cat:'metalloid'},
  {sym:'As', z:33, name:'Arsenic',       p:4, g:15, cat:'metalloid'},
  {sym:'Se', z:34, name:'Selenium',      p:4, g:16, cat:'nonmetal'},
  {sym:'Br', z:35, name:'Bromine',       p:4, g:17, cat:'halogen'},
  {sym:'Kr', z:36, name:'Krypton',       p:4, g:18, cat:'noble'},
  {sym:'Rb', z:37, name:'Rubidium',      p:5, g:1,  cat:'alkali'},
  {sym:'Sr', z:38, name:'Strontium',     p:5, g:2,  cat:'alkaline'},
  {sym:'Y',  z:39, name:'Yttrium',       p:5, g:3,  cat:'transition'},
  {sym:'Zr', z:40, name:'Zirconium',     p:5, g:4,  cat:'transition'},
  {sym:'Nb', z:41, name:'Niobium',       p:5, g:5,  cat:'transition'},
  {sym:'Mo', z:42, name:'Molybdenum',    p:5, g:6,  cat:'transition'},
  {sym:'Tc', z:43, name:'Technetium',    p:5, g:7,  cat:'transition'},
  {sym:'Ru', z:44, name:'Ruthenium',     p:5, g:8,  cat:'transition'},
  {sym:'Rh', z:45, name:'Rhodium',       p:5, g:9,  cat:'transition'},
  {sym:'Pd', z:46, name:'Palladium',     p:5, g:10, cat:'transition'},
  {sym:'Ag', z:47, name:'Silver',        p:5, g:11, cat:'transition'},
  {sym:'Cd', z:48, name:'Cadmium',       p:5, g:12, cat:'transition'},
  {sym:'In', z:49, name:'Indium',        p:5, g:13, cat:'post-trans'},
  {sym:'Sn', z:50, name:'Tin',           p:5, g:14, cat:'post-trans'},
  {sym:'Sb', z:51, name:'Antimony',      p:5, g:15, cat:'metalloid'},
  {sym:'Te', z:52, name:'Tellurium',     p:5, g:16, cat:'metalloid'},
  {sym:'I',  z:53, name:'Iodine',        p:5, g:17, cat:'halogen'},
  {sym:'Xe', z:54, name:'Xenon',         p:5, g:18, cat:'noble'},
  {sym:'Cs', z:55, name:'Cesium',        p:6, g:1,  cat:'alkali'},
  {sym:'Ba', z:56, name:'Barium',        p:6, g:2,  cat:'alkaline'},
  {sym:'La', z:57, name:'Lanthanum',     p:6, g:3,  cat:'lanthanide'},
  {sym:'Ce', z:58, name:'Cerium',        p:8, g:4,  cat:'lanthanide'},
  {sym:'Pr', z:59, name:'Praseodymium',  p:8, g:5,  cat:'lanthanide'},
  {sym:'Nd', z:60, name:'Neodymium',     p:8, g:6,  cat:'lanthanide'},
  {sym:'Pm', z:61, name:'Promethium',    p:8, g:7,  cat:'lanthanide'},
  {sym:'Sm', z:62, name:'Samarium',      p:8, g:8,  cat:'lanthanide'},
  {sym:'Eu', z:63, name:'Europium',      p:8, g:9,  cat:'lanthanide'},
  {sym:'Gd', z:64, name:'Gadolinium',    p:8, g:10, cat:'lanthanide'},
  {sym:'Tb', z:65, name:'Terbium',       p:8, g:11, cat:'lanthanide'},
  {sym:'Dy', z:66, name:'Dysprosium',    p:8, g:12, cat:'lanthanide'},
  {sym:'Ho', z:67, name:'Holmium',       p:8, g:13, cat:'lanthanide'},
  {sym:'Er', z:68, name:'Erbium',        p:8, g:14, cat:'lanthanide'},
  {sym:'Tm', z:69, name:'Thulium',       p:8, g:15, cat:'lanthanide'},
  {sym:'Yb', z:70, name:'Ytterbium',     p:8, g:16, cat:'lanthanide'},
  {sym:'Lu', z:71, name:'Lutetium',      p:8, g:17, cat:'lanthanide'},
  {sym:'Hf', z:72, name:'Hafnium',       p:6, g:4,  cat:'transition'},
  {sym:'Ta', z:73, name:'Tantalum',      p:6, g:5,  cat:'transition'},
  {sym:'W',  z:74, name:'Tungsten',      p:6, g:6,  cat:'transition'},
  {sym:'Re', z:75, name:'Rhenium',       p:6, g:7,  cat:'transition'},
  {sym:'Os', z:76, name:'Osmium',        p:6, g:8,  cat:'transition'},
  {sym:'Ir', z:77, name:'Iridium',       p:6, g:9,  cat:'transition'},
  {sym:'Pt', z:78, name:'Platinum',      p:6, g:10, cat:'transition'},
  {sym:'Au', z:79, name:'Gold',          p:6, g:11, cat:'transition'},
  {sym:'Hg', z:80, name:'Mercury',       p:6, g:12, cat:'transition'},
  {sym:'Tl', z:81, name:'Thallium',      p:6, g:13, cat:'post-trans'},
  {sym:'Pb', z:82, name:'Lead',          p:6, g:14, cat:'post-trans'},
  {sym:'Bi', z:83, name:'Bismuth',       p:6, g:15, cat:'post-trans'},
  {sym:'Po', z:84, name:'Polonium',      p:6, g:16, cat:'post-trans'},
  {sym:'At', z:85, name:'Astatine',      p:6, g:17, cat:'halogen'},
  {sym:'Rn', z:86, name:'Radon',         p:6, g:18, cat:'noble'},
  {sym:'Fr', z:87, name:'Francium',      p:7, g:1,  cat:'alkali'},
  {sym:'Ra', z:88, name:'Radium',        p:7, g:2,  cat:'alkaline'},
  {sym:'Ac', z:89, name:'Actinium',      p:7, g:3,  cat:'actinide'},
  {sym:'Th', z:90, name:'Thorium',       p:9, g:4,  cat:'actinide'},
  {sym:'Pa', z:91, name:'Protactinium',  p:9, g:5,  cat:'actinide'},
  {sym:'U',  z:92, name:'Uranium',       p:9, g:6,  cat:'actinide'},
  {sym:'Np', z:93, name:'Neptunium',     p:9, g:7,  cat:'actinide'},
  {sym:'Pu', z:94, name:'Plutonium',     p:9, g:8,  cat:'actinide'},
  {sym:'Am', z:95, name:'Americium',     p:9, g:9,  cat:'actinide'},
  {sym:'Cm', z:96, name:'Curium',        p:9, g:10, cat:'actinide'},
  {sym:'Bk', z:97, name:'Berkelium',     p:9, g:11, cat:'actinide'},
  {sym:'Cf', z:98, name:'Californium',   p:9, g:12, cat:'actinide'},
  {sym:'Es', z:99, name:'Einsteinium',   p:9, g:13, cat:'actinide'},
  {sym:'Fm', z:100,name:'Fermium',       p:9, g:14, cat:'actinide'},
  {sym:'Md', z:101,name:'Mendelevium',   p:9, g:15, cat:'actinide'},
  {sym:'No', z:102,name:'Nobelium',      p:9, g:16, cat:'actinide'},
  {sym:'Lr', z:103,name:'Lawrencium',    p:9, g:17, cat:'actinide'},
  {sym:'Rf', z:104,name:'Rutherfordium', p:7, g:4,  cat:'transition'},
  {sym:'Db', z:105,name:'Dubnium',       p:7, g:5,  cat:'transition'},
  {sym:'Sg', z:106,name:'Seaborgium',    p:7, g:6,  cat:'transition'},
  {sym:'Bh', z:107,name:'Bohrium',       p:7, g:7,  cat:'transition'},
  {sym:'Hs', z:108,name:'Hassium',       p:7, g:8,  cat:'transition'},
  {sym:'Mt', z:109,name:'Meitnerium',    p:7, g:9,  cat:'transition'},
  {sym:'Ds', z:110,name:'Darmstadtium',  p:7, g:10, cat:'transition'},
  {sym:'Rg', z:111,name:'Roentgenium',   p:7, g:11, cat:'transition'},
  {sym:'Cn', z:112,name:'Copernicium',   p:7, g:12, cat:'transition'},
  {sym:'Nh', z:113,name:'Nihonium',      p:7, g:13, cat:'post-trans'},
  {sym:'Fl', z:114,name:'Flerovium',     p:7, g:14, cat:'post-trans'},
  {sym:'Mc', z:115,name:'Moscovium',     p:7, g:15, cat:'post-trans'},
  {sym:'Lv', z:116,name:'Livermorium',   p:7, g:16, cat:'post-trans'},
  {sym:'Ts', z:117,name:'Tennessine',    p:7, g:17, cat:'halogen'},
  {sym:'Og', z:118,name:'Oganesson',     p:7, g:18, cat:'noble'},
]

// Elements used in challenges (first 54 — most commonly studied)
const CHALLENGE_POOL = TABLE.filter(e => e.z <= 54)

function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function makeQuestion(el) {
  const type = Math.random()
  if (type < 0.45) return { text: `Find: ${el.name}`, target: el.sym }
  if (type < 0.75) return { text: `Find element #${el.z}`, target: el.sym }
  return { text: `Find the ${CAT_LABEL[el.cat]} in Period ${el.p}, Group ${el.g}`, target: el.sym }
}

function makeFollowup(el) {
  const type = Math.floor(Math.random() * 4)
  const others = shuffle(TABLE.filter(e => e.sym !== el.sym))

  if (type === 0) {
    const wrongs = shuffle([...new Set(others.map(e => e.z))]).slice(0, 3)
    const options = shuffle([el.z, ...wrongs])
    return { text: `What is ${el.name}'s atomic number?`, options: options.map(String), answer: options.indexOf(el.z) }
  }
  if (type === 1) {
    const wrongs = shuffle([...new Set(others.map(e => e.p).filter(p => p !== el.p && p <= 7))]).slice(0, 3)
    const opts = wrongs.length < 3 ? [...wrongs, ...([1,2,3,4,5,6,7].filter(p => p !== el.p && !wrongs.includes(p))).slice(0, 3 - wrongs.length)] : wrongs
    const options = shuffle([el.p, ...opts.slice(0,3)])
    return { text: `Which period is ${el.name} in?`, options: options.map(String), answer: options.indexOf(el.p) }
  }
  if (type === 2) {
    const wrongs = shuffle([...new Set(others.map(e => e.g).filter(g => g !== el.g))]).slice(0, 3)
    const options = shuffle([el.g, ...wrongs])
    return { text: `Which group is ${el.name} in?`, options: options.map(String), answer: options.indexOf(el.g) }
  }
  if (type === 3) {
    const wrongCats = shuffle(Object.keys(CAT_LABEL).filter(c => c !== el.cat)).slice(0, 3)
    const catOptions = shuffle([el.cat, ...wrongCats])
    return { text: `What type of element is ${el.name}?`, options: catOptions.map(c => CAT_LABEL[c]), answer: catOptions.indexOf(el.cat) }
  }

  // Extended types — protons, neutrons, valence, core electrons
  const shells = getShellElectrons(el.z)
  const valence = shells[shells.length - 1]
  const core = el.z - valence
  const neutrons = (MASS_NUMBERS[el.sym] || Math.round(el.z * 1.25)) - el.z

  const extType = Math.floor(Math.random() * 4)

  if (extType === 0) {
    // Protons
    const wrongs = shuffle([el.z - 2, el.z - 1, el.z + 1, el.z + 2].filter(n => n > 0 && n !== el.z)).slice(0, 3)
    const options = shuffle([el.z, ...wrongs])
    return { text: `How many protons does ${el.name} have?`, options: options.map(String), answer: options.indexOf(el.z) }
  }
  if (extType === 1) {
    // Neutrons
    const wrongs = shuffle([neutrons - 2, neutrons - 1, neutrons + 1, neutrons + 2].filter(n => n > 0 && n !== neutrons)).slice(0, 3)
    const options = shuffle([neutrons, ...wrongs])
    return { text: `How many neutrons does ${el.name} have? (most common isotope)`, options: options.map(String), answer: options.indexOf(neutrons) }
  }
  if (extType === 2) {
    // Valence electrons
    const wrongs = shuffle([...new Set([1,2,3,4,5,6,7,8].filter(v => v !== valence))]).slice(0, 3)
    const options = shuffle([valence, ...wrongs])
    return { text: `How many valence electrons does ${el.name} have?`, options: options.map(String), answer: options.indexOf(valence) }
  }
  // Core electrons
  const wrongCores = shuffle([core - 2, core - 1, core + 1, core + 2].filter(n => n >= 0 && n !== core)).slice(0, 3)
  const options = shuffle([core, ...wrongCores])
  return { text: `How many core electrons does ${el.name} have?`, options: options.map(String), answer: options.indexOf(core) }
}

export default function PeriodicTableMode({ onClose }) {
  const [mode, setMode] = useState('browse') // 'browse' | 'challenge'
  const [selected, setSelected] = useState(null)

  // Challenge state
  const [queue, setQueue] = useState([])
  const [qIndex, setQIndex] = useState(0)
  const [phase, setPhase] = useState('find') // 'find' | 'followup'
  const [clickedSym, setClickedSym] = useState(null)  // which element was clicked
  const [foundCorrect, setFoundCorrect] = useState(false)
  const [followup, setFollowup] = useState(null)       // { text, options, answer }
  const [followupSel, setFollowupSel] = useState(null) // index chosen
  const [score, setScore] = useState({ correct: 0, total: 0 })
  const [done, setDone] = useState(false)

  function startChallenge() {
    const pool = shuffle(CHALLENGE_POOL).slice(0, 15).map(el => ({
      ...el,
      findText: Math.random() < 0.5 ? `Find: ${el.name}` : `Find element #${el.z}`,
    }))
    setQueue(pool)
    setQIndex(0)
    setPhase('find')
    setClickedSym(null)
    setFoundCorrect(false)
    setFollowup(null)
    setFollowupSel(null)
    setScore({ correct: 0, total: 0 })
    setDone(false)
    setMode('challenge')
  }

  function handleClick(sym) {
    if (mode === 'browse') { setSelected(s => s === sym ? null : sym); return }
    if (phase !== 'find' || clickedSym !== null) return
    const el = queue[qIndex]
    const correct = sym === el.sym
    setClickedSym(sym)
    setFoundCorrect(correct)
    // Generate follow-up about the correct element regardless
    setFollowup(makeFollowup(el))
  }

  function handleFollowup(optIndex) {
    if (followupSel !== null) return
    setFollowupSel(optIndex)
    const bothCorrect = foundCorrect && optIndex === followup.answer
    const followupCorrect = optIndex === followup.answer
    setScore(s => ({ correct: s.correct + (followupCorrect ? 1 : 0), total: s.total + 1 }))
  }

  function nextQuestion() {
    if (qIndex + 1 >= queue.length) {
      setDone(true)
    } else {
      setQIndex(i => i + 1)
      setPhase('find')
      setClickedSym(null)
      setFoundCorrect(false)
      setFollowup(null)
      setFollowupSel(null)
    }
  }

  function advanceToFollowup() {
    setPhase('followup')
  }

  const currentEl = queue[qIndex]
  const sel = mode === 'browse' ? selected : null
  const selEl = sel ? TABLE.find(e => e.sym === sel) : null

  // ── Done screen ────────────────────────────────────────────────
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
          <span className="study-topbar-title">Periodic Table</span>
          <span />
        </div>
        <div className="quiz-results">
          <div className={`quiz-score-circle ${pct >= 80 ? 'great' : pct >= 50 ? 'ok' : 'low'}`}>
            <span className="quiz-score-pct">{pct}%</span>
            <span className="quiz-score-label">{score.correct}/{score.total} correct</span>
          </div>
          <p className="quiz-results-msg">
            {pct === 100 ? 'Perfect! You know the table by heart.' : pct >= 80 ? 'Great — you really know your elements!' : pct >= 50 ? 'Getting there! Keep exploring.' : 'Try browsing the table first, then challenge yourself.'}
          </p>
          <div className="study-done-btns">
            <button className="study-outline-btn" onClick={startChallenge}>Try again</button>
            <button className="study-solid-btn" onClick={() => { setMode('browse'); setDone(false) }}>Back to table</button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="study-page pt-page">
      <div className="study-topbar">
        <button className="study-topbar-back" onClick={onClose}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>
          </svg>
          Back
        </button>
        <span className="study-topbar-title">Periodic Table</span>
        {mode === 'browse'
          ? <button className="pt-challenge-btn" onClick={startChallenge}>Challenge →</button>
          : <span className="study-topbar-counter">{qIndex + 1}/{queue.length}</span>
        }
      </div>

      {/* Challenge UI */}
      {mode === 'challenge' && currentEl && (
        <>
          <div className="study-pbar-wrap">
            <div className="study-pbar-fill" style={{ width: `${Math.round((qIndex / queue.length) * 100)}%` }} />
          </div>

          {/* Phase 1 — Find the element */}
          {phase === 'find' && (
            <div className={`pt-question-bar ${clickedSym ? (foundCorrect ? 'q-correct' : 'q-wrong') : ''}`}>
              {clickedSym === null ? (
                <>
                  <span className="pt-phase-tag">Step 1 — Find it</span>
                  <span className="pt-question-text">{queue[qIndex]?.findText}</span>
                </>
              ) : (
                <>
                  {foundCorrect
                    ? <span className="pt-feedback-correct"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>Found {currentEl.name}!</span>
                    : <span className="pt-feedback-wrong"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>{TABLE.find(e=>e.sym===clickedSym)?.name} was wrong — it was {currentEl.name} ({currentEl.sym})</span>
                  }
                  <button className="pt-next-btn" onClick={advanceToFollowup}>Next step →</button>
                </>
              )}
            </div>
          )}

          {/* Phase 2 — Follow-up question */}
          {phase === 'followup' && followup && (
            <div className={`pt-followup-bar ${followupSel !== null ? (followupSel === followup.answer ? 'q-correct' : 'q-wrong') : ''}`}>
              <div className="pt-followup-top">
                <span className="pt-phase-tag">Step 2 — Answer this</span>
                <span className="pt-question-text">{followup.text}</span>
              </div>
              <div className="pt-followup-options">
                {followup.options.map((opt, i) => {
                  let cls = 'pt-fopt'
                  if (followupSel !== null) {
                    if (i === followup.answer) cls += ' fopt-correct'
                    else if (i === followupSel) cls += ' fopt-wrong'
                    else cls += ' fopt-dim'
                  }
                  return (
                    <button key={i} className={cls} onClick={() => handleFollowup(i)}>
                      {opt}
                    </button>
                  )
                })}
              </div>
              {followupSel !== null && (
                <button className="pt-next-btn" onClick={nextQuestion}>
                  {qIndex + 1 < queue.length ? 'Next element →' : 'See results'}
                </button>
              )}
            </div>
          )}
        </>
      )}

      <div className="pt-scroll">
        {/* Legend */}
        <div className="pt-legend">
          {Object.entries(CAT_LABEL).map(([key, label]) => (
            <span key={key} className="pt-legend-item">
              <span className="pt-legend-dot" style={{ background: CAT_COLOR[key] }} />
              {label}
            </span>
          ))}
        </div>

        {/* Grid */}
        <div className="pt-grid">
          {/* Period labels */}
          {[1,2,3,4,5,6,7].map(p => (
            <span key={p} className="pt-period-label" style={{ gridRow: p, gridColumn: 19 }}>{p}</span>
          ))}
          {/* Lanthanide/Actinide row labels */}
          <span className="pt-period-label" style={{ gridRow: 8, gridColumn: 19 }}>Ln</span>
          <span className="pt-period-label" style={{ gridRow: 9, gridColumn: 19 }}>An</span>

          {/* Spacer rows */}
          <div className="pt-spacer" style={{ gridRow: '7 / 8', gridColumn: '1 / 19', height: 6 }} />

          {TABLE.map(el => {
            const isTarget = mode === 'challenge' && phase === 'find' && currentEl?.sym === el.sym
            const isClicked = phase === 'find' && clickedSym === el.sym
            const isCorrectAnswer = phase === 'find' && clickedSym !== null && el.sym === currentEl?.sym
            const isBrowseSelected = mode === 'browse' && selected === el.sym

            let extraClass = ''
            if (mode === 'challenge' && phase === 'find') {
              if (isClicked && isTarget) extraClass = 'pt-el-correct'
              else if (isClicked && !isTarget) extraClass = 'pt-el-wrong'
              else if (isCorrectAnswer) extraClass = 'pt-el-reveal'
              else if (clickedSym !== null) extraClass = 'pt-el-dim'
            }
            if (isBrowseSelected) extraClass = 'pt-el-selected'

            return (
              <button
                key={el.sym}
                className={`pt-el ${extraClass}`}
                style={{
                  gridRow: el.p,
                  gridColumn: el.g,
                  '--el-color': CAT_COLOR[el.cat],
                }}
                onClick={() => handleClick(el.sym)}
                onMouseEnter={() => setHovered(el.sym)}
                onMouseLeave={() => setHovered(null)}
                title={`${el.name} (${el.sym}) — Z=${el.z}`}
              >
                <span className="pt-el-z">{el.z}</span>
                <span className="pt-el-sym">{el.sym}</span>
              </button>
            )
          })}
        </div>

        {/* Browse info panel */}
        {mode === 'browse' && selEl && (
          <div className="pt-info-panel">
            <div className="pt-info-tile" style={{ '--el-color': CAT_COLOR[selEl.cat] }}>
              <span className="pt-info-z">{selEl.z}</span>
              <span className="pt-info-sym">{selEl.sym}</span>
            </div>
            <div className="pt-info-text">
              <span className="pt-info-name">{selEl.name}</span>
              <span className="pt-info-meta">Period {selEl.p} · Group {selEl.g} · {CAT_LABEL[selEl.cat]}</span>
            </div>
          </div>
        )}

        {mode === 'browse' && !selEl && (
          <p className="pt-browse-hint">Click any element to see its details, and then tap Challenge to test yourself!</p>
        )}
      </div>
    </div>
  )
}
