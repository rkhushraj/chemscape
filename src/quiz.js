export const QUIZ_TOPICS = [
  { id: 'periodic-table', label: 'Periodic Table' },
  { id: 'electron-config', label: 'Electron Configuration' },
  { id: 'bonding', label: 'Chemical Bonding' },
  { id: 'naming', label: 'Naming Compounds' },
  { id: 'reactions', label: 'Chemical Reactions' },
  { id: 'stoichiometry', label: 'Stoichiometry' },
]

export const QUIZ_QUESTIONS = [
  // ── Periodic Table ──────────────────────────────────────────────
  { id: 'qt1',  topic: 'periodic-table', q: 'Which element has the symbol "Fe"?', options: ['Iron', 'Fluorine', 'Francium', 'Fermium'], answer: 0 },
  { id: 'qt2',  topic: 'periodic-table', q: 'How many elements are in Period 2 of the periodic table?', options: ['2', '8', '18', '32'], answer: 1 },
  { id: 'qt3',  topic: 'periodic-table', q: 'Which of these is a metalloid?', options: ['Sodium', 'Chlorine', 'Silicon', 'Copper'], answer: 2 },
  { id: 'qt4',  topic: 'periodic-table', q: 'What is the most abundant element in Earth\'s crust?', options: ['Silicon', 'Iron', 'Oxygen', 'Aluminum'], answer: 2 },
  { id: 'qt5',  topic: 'periodic-table', q: 'Which group contains the alkaline earth metals?', options: ['Group 1', 'Group 2', 'Group 17', 'Group 18'], answer: 1 },
  { id: 'qt6',  topic: 'periodic-table', q: 'The element with atomic number 6 is:', options: ['Carbon', 'Calcium', 'Chromium', 'Cobalt'], answer: 0 },
  { id: 'qt7',  topic: 'periodic-table', q: 'Which property generally increases going DOWN a group?', options: ['Ionization energy', 'Electronegativity', 'Atomic radius', 'Nuclear charge'], answer: 2 },
  { id: 'qt8',  topic: 'periodic-table', q: 'What is the symbol for Potassium?', options: ['Po', 'Pt', 'K', 'P'], answer: 2 },
  { id: 'qt9',  topic: 'periodic-table', q: 'Which period contains the element Chlorine (Cl)?', options: ['Period 2', 'Period 3', 'Period 4', 'Period 5'], answer: 1 },
  { id: 'qt10', topic: 'periodic-table', q: 'Which element is a liquid at room temperature (besides mercury)?', options: ['Bromine', 'Iodine', 'Cesium', 'Gallium'], answer: 0 },
  { id: 'qt11', topic: 'periodic-table', q: 'How many protons does an oxygen atom have?', options: ['6', '7', '8', '16'], answer: 2 },
  { id: 'qt12', topic: 'periodic-table', q: 'Elements in the same group have the same number of:', options: ['Protons', 'Neutrons', 'Valence electrons', 'Electron shells'], answer: 2 },

  // ── Electron Configurationuration ──────────────────────────────────────
  { id: 'qe1',  topic: 'electron-config', q: 'What is the maximum number of electrons in the second shell?', options: ['2', '4', '8', '18'], answer: 2 },
  { id: 'qe2',  topic: 'electron-config', q: 'Which element has the configuration 2, 8, 2?', options: ['Magnesium', 'Calcium', 'Neon', 'Carbon'], answer: 0 },
  { id: 'qe3',  topic: 'electron-config', q: 'How many electrons can the 3d subshell hold?', options: ['2', '6', '10', '14'], answer: 2 },
  { id: 'qe4',  topic: 'electron-config', q: 'An atom with 7 valence electrons will most likely:', options: ['Lose 7 electrons', 'Gain 1 electron', 'Lose 1 electron', 'Form 7 bonds'], answer: 1 },
  { id: 'qe5',  topic: 'electron-config', q: 'What is the electron configuration of Neon (Z=10)?', options: ['2, 8', '2, 6', '2, 8, 2', '2, 4'], answer: 0 },
  { id: 'qe6',  topic: 'electron-config', q: 'Which orbital fills first according to the Aufbau principle?', options: ['3p', '3d', '4s', '4p'], answer: 2 },
  { id: 'qe7',  topic: 'electron-config', q: 'An atom of phosphorus (Z=15) has how many valence electrons?', options: ['3', '5', '6', '15'], answer: 1 },
  { id: 'qe8',  topic: 'electron-config', q: 'What is the shape of a p orbital?', options: ['Sphere', 'Dumbbell', 'Cloverleaf', 'Donut'], answer: 1 },
  { id: 'qe9',  topic: 'electron-config', q: 'How many electrons does a neutral calcium atom (Z=20) have in total?', options: ['2', '8', '18', '20'], answer: 3 },
  { id: 'qe10', topic: 'electron-config', q: 'Which atom is isoelectronic with Na⁺?', options: ['Mg²⁺', 'Li⁺', 'K⁺', 'Ca²⁺'], answer: 0 },

  // ── Chemical Bonding ────────────────────────────────────────────
  { id: 'qb1',  topic: 'bonding', q: 'Which compound contains an ionic bond?', options: ['CO₂', 'H₂O', 'NaCl', 'CH₄'], answer: 2 },
  { id: 'qb2',  topic: 'bonding', q: 'A bond between two atoms with electronegativity difference of 0.3 is:', options: ['Ionic', 'Polar covalent', 'Nonpolar covalent', 'Metallic'], answer: 2 },
  { id: 'qb3',  topic: 'bonding', q: 'How many bonds does nitrogen form in N₂?', options: ['Single bond', 'Double bond', 'Triple bond', 'No bond'], answer: 2 },
  { id: 'qb4',  topic: 'bonding', q: 'Which molecule is polar?', options: ['CO₂', 'Cl₂', 'H₂O', 'CH₄'], answer: 2 },
  { id: 'qb5',  topic: 'bonding', q: 'What type of bond holds water molecules together (intermolecular)?', options: ['Ionic bonds', 'Covalent bonds', 'Hydrogen bonds', 'Metallic bonds'], answer: 2 },
  { id: 'qb6',  topic: 'bonding', q: 'Which of these substances has the highest melting point due to its bonding?', options: ['Ice (H₂O)', 'Table salt (NaCl)', 'Methane (CH₄)', 'Oxygen (O₂)'], answer: 1 },
  { id: 'qb7',  topic: 'bonding', q: 'In a Lewis structure, a lone pair of electrons is:', options: ['Shared between two atoms', 'Non-bonding electrons on one atom', 'A triple bond', 'A positive ion'], answer: 1 },
  { id: 'qb8',  topic: 'bonding', q: 'The shape of a water molecule (H₂O) is:', options: ['Linear', 'Trigonal planar', 'Bent', 'Tetrahedral'], answer: 2 },
  { id: 'qb9',  topic: 'bonding', q: 'Which property do metals have due to metallic bonding?', options: ['Brittleness', 'Electrical conductivity', 'Low melting point', 'Transparency'], answer: 1 },
  { id: 'qb10', topic: 'bonding', q: 'In which type of solid are atoms arranged in a repeating lattice?', options: ['Molecular solid', 'Covalent network solid', 'Ionic solid', 'Both B and C'], answer: 3 },

  // ── Naming Compounds ───────────────────────────────────────────
  { id: 'qn1',  topic: 'naming', q: 'What is the correct name for CaCl₂?', options: ['Calcium dichloride', 'Calcium chloride', 'Calcium(II) chloride', 'Dicalcium chloride'], answer: 1 },
  { id: 'qn2',  topic: 'naming', q: 'What is the formula for iron(III) oxide?', options: ['FeO', 'Fe₂O₃', 'Fe₃O₂', 'FeO₃'], answer: 1 },
  { id: 'qn3',  topic: 'naming', q: 'The prefix "hexa-" means:', options: ['4', '5', '6', '7'], answer: 2 },
  { id: 'qn4',  topic: 'naming', q: 'What is the name of NO₂?', options: ['Nitrogen oxide', 'Dinitrogen oxide', 'Nitrogen dioxide', 'Nitrogen(II) oxide'], answer: 2 },
  { id: 'qn5',  topic: 'naming', q: 'The sulfate ion has the formula:', options: ['SO₃²⁻', 'SO₄²⁻', 'S₂O₃²⁻', 'HSO₄⁻'], answer: 1 },
  { id: 'qn6',  topic: 'naming', q: 'What is the name of H₃PO₄?', options: ['Hydrogen phosphide', 'Phosphoric acid', 'Phosphorous acid', 'Triphosphoric acid'], answer: 1 },
  { id: 'qn7',  topic: 'naming', q: 'Which ion has a charge of 2+?', options: ['Na⁺', 'Al³⁺', 'Ca²⁺', 'Cl⁻'], answer: 2 },
  { id: 'qn8',  topic: 'naming', q: 'The correct name for N₂O₄ is:', options: ['Nitrogen oxide', 'Dinitrogen tetroxide', 'Nitrogen tetroxide', 'Dinitrogen oxide'], answer: 1 },
  { id: 'qn9',  topic: 'naming', q: 'What is the formula for ammonium sulfate?', options: ['(NH₄)₂SO₄', 'NH₄SO₄', '(NH₄)₂SO₃', 'NH₄HSO₄'], answer: 0 },
  { id: 'qn10', topic: 'naming', q: 'The "-ite" suffix in an ion name (e.g. nitrite) indicates:', options: ['More oxygen than -ate', 'Less oxygen than -ate', 'No oxygen', 'A positive ion'], answer: 1 },

  // ── Chemical Reactions ─────────────────────────────────────────
  { id: 'qr1',  topic: 'reactions', q: 'What type of reaction is: 2H₂O → 2H₂ + O₂?', options: ['Synthesis', 'Decomposition', 'Combustion', 'Single displacement'], answer: 1 },
  { id: 'qr2',  topic: 'reactions', q: 'In a single displacement reaction, a more reactive metal will:', options: ['Form an alloy', 'Displace a less reactive metal from solution', 'Combine with oxygen', 'Release only heat'], answer: 1 },
  { id: 'qr3',  topic: 'reactions', q: 'Complete combustion of a hydrocarbon always produces:', options: ['CO and H₂', 'CO₂ and H₂O', 'C and H₂O', 'CO₂ and H₂'], answer: 1 },
  { id: 'qr4',  topic: 'reactions', q: 'Which of these is a sign that a chemical change has occurred?', options: ['Melting ice', 'Dissolving salt in water', 'Formation of a precipitate', 'Crushing a can'], answer: 2 },
  { id: 'qr5',  topic: 'reactions', q: 'In the reaction NaOH + HCl → NaCl + H₂O, NaOH acts as a:', options: ['Acid', 'Salt', 'Base', 'Catalyst'], answer: 2 },
  { id: 'qr6',  topic: 'reactions', q: 'Which equation is correctly balanced?', options: ['H₂ + O₂ → H₂O', '2H₂ + O₂ → 2H₂O', 'H₂ + O₂ → 2H₂O', '4H₂ + O₂ → 2H₂O'], answer: 1 },
  { id: 'qr7',  topic: 'reactions', q: 'What is the role of a catalyst in a chemical reaction?', options: ['It increases the amount of product', 'It lowers activation energy without being consumed', 'It increases the temperature', 'It changes the equilibrium position'], answer: 1 },
  { id: 'qr8',  topic: 'reactions', q: 'A reaction that absorbs heat from its surroundings is called:', options: ['Exothermic', 'Endothermic', 'Thermodynamic', 'Isothermal'], answer: 1 },
  { id: 'qr9',  topic: 'reactions', q: 'What type of reaction is: AgNO₃ + NaCl → AgCl↓ + NaNO₃?', options: ['Synthesis', 'Combustion', 'Double displacement', 'Decomposition'], answer: 2 },
  { id: 'qr10', topic: 'reactions', q: 'Which factor does NOT speed up a chemical reaction?', options: ['Increasing temperature', 'Adding a catalyst', 'Decreasing concentration of reactants', 'Increasing surface area'], answer: 2 },

  // ── Stoichiometry ──────────────────────────────────────────────
  { id: 'qs1',  topic: 'stoichiometry', q: 'How many moles are in 44 g of CO₂? (C=12, O=16)', options: ['0.5 mol', '1 mol', '2 mol', '44 mol'], answer: 1 },
  { id: 'qs2',  topic: 'stoichiometry', q: 'In the reaction 2H₂ + O₂ → 2H₂O, how many moles of H₂O form from 4 mol H₂?', options: ['1 mol', '2 mol', '4 mol', '8 mol'], answer: 2 },
  { id: 'qs3',  topic: 'stoichiometry', q: 'What is the molar mass of NaOH? (Na=23, O=16, H=1)', options: ['24 g/mol', '39 g/mol', '40 g/mol', '56 g/mol'], answer: 2 },
  { id: 'qs4',  topic: 'stoichiometry', q: 'If the theoretical yield is 50 g and actual yield is 40 g, what is the percent yield?', options: ['40%', '60%', '80%', '125%'], answer: 2 },
  { id: 'qs5',  topic: 'stoichiometry', q: 'How many atoms are in 1 mole of a substance?', options: ['6.022 × 10²¹', '6.022 × 10²³', '6.022 × 10²⁵', '1000'], answer: 1 },
  { id: 'qs6',  topic: 'stoichiometry', q: 'In a reaction, you have 3 mol A and 1 mol B. The reaction needs 2:1 (A:B). What is the limiting reagent?', options: ['A', 'B', 'Neither — both run out equally', 'Cannot be determined'], answer: 1 },
  { id: 'qs7',  topic: 'stoichiometry', q: 'What is the mass of 2 moles of water (H₂O)? (H=1, O=16)', options: ['9 g', '18 g', '36 g', '20 g'], answer: 2 },
  { id: 'qs8',  topic: 'stoichiometry', q: 'The mole ratio in a balanced equation comes from:', options: ['The state symbols', 'The coefficients', 'The subscripts', 'The products only'], answer: 1 },
  { id: 'qs9',  topic: 'stoichiometry', q: 'How many grams is 0.5 mol of O₂? (O=16)', options: ['8 g', '16 g', '32 g', '64 g'], answer: 1 },
  { id: 'qs10', topic: 'stoichiometry', q: 'The number of molecules in 2 mol of N₂ is:', options: ['6.022 × 10²³', '1.204 × 10²⁴', '3.011 × 10²³', '2.408 × 10²⁴'], answer: 1 },
]
