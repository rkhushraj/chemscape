// Each equation: reactants and products as arrays of { formula, display }
// coefficients: correct answers in order [reactants..., products...]
// difficulty: 'easy' | 'medium' | 'hard'

export const BALANCER_EQUATIONS = [
  // ── Easy ────────────────────────────────────────────────────────
  {
    id: 'bal1', difficulty: 'easy',
    reactants: [{ display: 'H₂' }, { display: 'O₂' }],
    products:  [{ display: 'H₂O' }],
    coefficients: [2, 1, 2],
    hint: 'Water has 2 H and 1 O. You need 2 water molecules to use up 1 O₂.',
  },
  {
    id: 'bal2', difficulty: 'easy',
    reactants: [{ display: 'N₂' }, { display: 'H₂' }],
    products:  [{ display: 'NH₃' }],
    coefficients: [1, 3, 2],
    hint: 'Ammonia has 1 N and 3 H. You need 2 NH₃ to balance 1 N₂.',
  },
  {
    id: 'bal3', difficulty: 'easy',
    reactants: [{ display: 'HCl' }, { display: 'NaOH' }],
    products:  [{ display: 'NaCl' }, { display: 'H₂O' }],
    coefficients: [1, 1, 1, 1],
    hint: 'All species appear once — this equation is already balanced with coefficient 1.',
  },
  {
    id: 'bal4', difficulty: 'easy',
    reactants: [{ display: 'C' }, { display: 'O₂' }],
    products:  [{ display: 'CO₂' }],
    coefficients: [1, 1, 1],
    hint: 'Carbon combines directly with O₂ to form CO₂. Already balanced.',
  },
  {
    id: 'bal5', difficulty: 'easy',
    reactants: [{ display: 'Mg' }, { display: 'O₂' }],
    products:  [{ display: 'MgO' }],
    coefficients: [2, 1, 2],
    hint: 'MgO has 1 Mg and 1 O. You need 2 MgO to use 1 O₂ (2 oxygen atoms).',
  },
  {
    id: 'bal6', difficulty: 'easy',
    reactants: [{ display: 'Na' }, { display: 'Cl₂' }],
    products:  [{ display: 'NaCl' }],
    coefficients: [2, 1, 2],
    hint: 'Cl₂ has 2 chlorine atoms, so you need 2 NaCl and therefore 2 Na.',
  },
  {
    id: 'bal7', difficulty: 'easy',
    reactants: [{ display: 'H₂' }, { display: 'Cl₂' }],
    products:  [{ display: 'HCl' }],
    coefficients: [1, 1, 2],
    hint: 'H₂ + Cl₂ gives 2 HCl molecules — one H and one Cl each.',
  },

  // ── Medium ───────────────────────────────────────────────────────
  {
    id: 'bal8', difficulty: 'medium',
    reactants: [{ display: 'CH₄' }, { display: 'O₂' }],
    products:  [{ display: 'CO₂' }, { display: 'H₂O' }],
    coefficients: [1, 2, 1, 2],
    hint: 'CH₄ combustion: 1 carbon → 1 CO₂. 4 hydrogen → 2 H₂O. Count oxygen on right: 2+2=4, need 2 O₂.',
  },
  {
    id: 'bal9', difficulty: 'medium',
    reactants: [{ display: 'Fe' }, { display: 'O₂' }],
    products:  [{ display: 'Fe₂O₃' }],
    coefficients: [4, 3, 2],
    hint: 'Fe₂O₃ has 2 Fe and 3 O. LCM of 2 and 3 is 6 oxygens → need 2 Fe₂O₃ and 3 O₂, so 4 Fe.',
  },
  {
    id: 'bal10', difficulty: 'medium',
    reactants: [{ display: 'Al' }, { display: 'O₂' }],
    products:  [{ display: 'Al₂O₃' }],
    coefficients: [4, 3, 2],
    hint: 'Al₂O₃ has 2 Al and 3 O. To balance: 4 Al, 3 O₂, 2 Al₂O₃.',
  },
  {
    id: 'bal11', difficulty: 'medium',
    reactants: [{ display: 'P₄' }, { display: 'O₂' }],
    products:  [{ display: 'P₂O₅' }],
    coefficients: [1, 5, 2],
    hint: 'P₄ has 4 phosphorus atoms. P₂O₅ has 2 P, so need 2 of them. Then 5 O atoms → 5/2 O₂ → multiply by 2: P₄ + 5O₂ → 2P₂O₅ — but P₄ gives 4P not 2!',
  },
  {
    id: 'bal12', difficulty: 'medium',
    reactants: [{ display: 'KClO₃' }],
    products:  [{ display: 'KCl' }, { display: 'O₂' }],
    coefficients: [2, 2, 3],
    hint: 'Each KClO₃ has 3 oxygens. You need an even number for O₂ (pairs). 2 KClO₃ → 2 KCl + 3 O₂.',
  },
  {
    id: 'bal13', difficulty: 'medium',
    reactants: [{ display: 'C₃H₈' }, { display: 'O₂' }],
    products:  [{ display: 'CO₂' }, { display: 'H₂O' }],
    coefficients: [1, 5, 3, 4],
    hint: 'Propane combustion: 3C → 3CO₂, 8H → 4H₂O. Oxygen on right: 6+4=10 atoms = 5 O₂.',
  },
  {
    id: 'bal14', difficulty: 'medium',
    reactants: [{ display: 'Zn' }, { display: 'HCl' }],
    products:  [{ display: 'ZnCl₂' }, { display: 'H₂' }],
    coefficients: [1, 2, 1, 1],
    hint: 'ZnCl₂ needs 2 Cl, so you need 2 HCl. That gives 2H → 1 H₂.',
  },

  // ── Hard ─────────────────────────────────────────────────────────
  {
    id: 'bal15', difficulty: 'hard',
    reactants: [{ display: 'C₂H₅OH' }, { display: 'O₂' }],
    products:  [{ display: 'CO₂' }, { display: 'H₂O' }],
    coefficients: [1, 3, 2, 3],
    hint: 'Ethanol: 2C → 2CO₂, 6H → 3H₂O. Oxygen on right: 4+3=7 atoms. 7 is odd — multiply through by 2, then halve back: 1 C₂H₅OH + 3 O₂ → 2 CO₂ + 3 H₂O.',
  },
  {
    id: 'bal16', difficulty: 'hard',
    reactants: [{ display: 'Fe₂O₃' }, { display: 'CO' }],
    products:  [{ display: 'Fe' }, { display: 'CO₂' }],
    coefficients: [1, 3, 2, 3],
    hint: 'Fe₂O₃ gives 2 Fe. Each CO picks up 1 oxygen from Fe₂O₃ → 3 CO + 3 oxygens → 3 CO₂.',
  },
  {
    id: 'bal17', difficulty: 'hard',
    reactants: [{ display: 'Ca₃(PO₄)₂' }, { display: 'SiO₂' }, { display: 'C' }],
    products:  [{ display: 'CaSiO₃' }, { display: 'P₄' }, { display: 'CO' }],
    coefficients: [2, 6, 10, 6, 1, 10],
    hint: 'Start with P: Ca₃(PO₄)₂ has 2P, P₄ needs 4P → 2 Ca₃(PO₄)₂. Then balance Ca, Si, C, O.',
  },
  {
    id: 'bal18', difficulty: 'hard',
    reactants: [{ display: 'NH₃' }, { display: 'O₂' }],
    products:  [{ display: 'NO' }, { display: 'H₂O' }],
    coefficients: [4, 5, 4, 6],
    hint: 'N: 4 NH₃ → 4 NO. H: 4×3=12 H → 6 H₂O. O on right: 4+6=10 → 5 O₂.',
  },
]
