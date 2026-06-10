export const ATOMIC_NUMBERS = {
  H: 1, He: 2, Li: 3, Be: 4, B: 5, C: 6, N: 7, O: 8, F: 9, Ne: 10,
  Na: 11, Mg: 12, Al: 13, Si: 14, P: 15, S: 16, Cl: 17, Ar: 18,
  K: 19, Ca: 20, Sc: 21, Ti: 22, V: 23, Cr: 24, Mn: 25, Fe: 26, Co: 27, Ni: 28, Cu: 29, Zn: 30,
  Ga: 31, Ge: 32, As: 33, Se: 34, Br: 35, Kr: 36,
  Rb: 37, Sr: 38, Y: 39, Zr: 40, Nb: 41, Mo: 42, Tc: 43, Ru: 44, Rh: 45, Pd: 46, Ag: 47, Cd: 48,
  In: 49, Sn: 50, Sb: 51, Te: 52, I: 53, Xe: 54,
  Cs: 55, Ba: 56, La: 57, Ce: 58, Pr: 59, Nd: 60, Pm: 61, Sm: 62, Eu: 63, Gd: 64,
  Tb: 65, Dy: 66, Ho: 67, Er: 68, Tm: 69, Yb: 70, Lu: 71,
  Hf: 72, Ta: 73, W: 74, Re: 75, Os: 76, Ir: 77, Pt: 78, Au: 79, Hg: 80,
  Tl: 81, Pb: 82, Bi: 83, Po: 84, At: 85, Rn: 86,
  Fr: 87, Ra: 88, Ac: 89, Th: 90, Pa: 91, U: 92, Np: 93, Pu: 94, Am: 95, Cm: 96,
  Bk: 97, Cf: 98, Es: 99, Fm: 100, Md: 101, No: 102, Lr: 103,
  Rf: 104, Db: 105, Sg: 106, Bh: 107, Hs: 108, Mt: 109, Ds: 110, Rg: 111, Cn: 112,
  Nh: 113, Fl: 114, Mc: 115, Lv: 116, Ts: 117, Og: 118,
}

// Simplified Bohr-model shell capacities (2, 8, 8, 18, 18, 32, 32),
// matches noble gas totals (He=2, Ne=10, Ar=18, Kr=36, Xe=54) and sums to 118.
const SHELL_CAPACITIES = [2, 8, 8, 18, 18, 32, 32]

export function getShellElectrons(atomicNumber) {
  const shells = []
  let remaining = atomicNumber
  for (const cap of SHELL_CAPACITIES) {
    if (remaining <= 0) break
    const electrons = Math.min(cap, remaining)
    shells.push(electrons)
    remaining -= electrons
  }
  return shells
}

export const ELEMENT_NAMES = {
  H: 'Hydrogen', He: 'Helium', Li: 'Lithium', Be: 'Beryllium', B: 'Boron', C: 'Carbon',
  N: 'Nitrogen', O: 'Oxygen', F: 'Fluorine', Ne: 'Neon',
  Na: 'Sodium', Mg: 'Magnesium', Al: 'Aluminum', Si: 'Silicon', P: 'Phosphorus', S: 'Sulfur',
  Cl: 'Chlorine', Ar: 'Argon',
  K: 'Potassium', Ca: 'Calcium', Sc: 'Scandium', Ti: 'Titanium', V: 'Vanadium', Cr: 'Chromium',
  Mn: 'Manganese', Fe: 'Iron', Co: 'Cobalt', Ni: 'Nickel', Cu: 'Copper', Zn: 'Zinc',
  Ga: 'Gallium', Ge: 'Germanium', As: 'Arsenic', Se: 'Selenium', Br: 'Bromine', Kr: 'Krypton',
  Rb: 'Rubidium', Sr: 'Strontium', Y: 'Yttrium', Zr: 'Zirconium', Nb: 'Niobium', Mo: 'Molybdenum',
  Tc: 'Technetium', Ru: 'Ruthenium', Rh: 'Rhodium', Pd: 'Palladium', Ag: 'Silver', Cd: 'Cadmium',
  In: 'Indium', Sn: 'Tin', Sb: 'Antimony', Te: 'Tellurium', I: 'Iodine', Xe: 'Xenon',
  Cs: 'Cesium', Ba: 'Barium', La: 'Lanthanum', Ce: 'Cerium', Pr: 'Praseodymium', Nd: 'Neodymium',
  Pm: 'Promethium', Sm: 'Samarium', Eu: 'Europium', Gd: 'Gadolinium',
  Tb: 'Terbium', Dy: 'Dysprosium', Ho: 'Holmium', Er: 'Erbium', Tm: 'Thulium', Yb: 'Ytterbium', Lu: 'Lutetium',
  Hf: 'Hafnium', Ta: 'Tantalum', W: 'Tungsten', Re: 'Rhenium', Os: 'Osmium', Ir: 'Iridium', Pt: 'Platinum',
  Au: 'Gold', Hg: 'Mercury',
  Tl: 'Thallium', Pb: 'Lead', Bi: 'Bismuth', Po: 'Polonium', At: 'Astatine', Rn: 'Radon',
  Fr: 'Francium', Ra: 'Radium', Ac: 'Actinium', Th: 'Thorium', Pa: 'Protactinium', U: 'Uranium',
  Np: 'Neptunium', Pu: 'Plutonium', Am: 'Americium', Cm: 'Curium',
  Bk: 'Berkelium', Cf: 'Californium', Es: 'Einsteinium', Fm: 'Fermium', Md: 'Mendelevium', No: 'Nobelium', Lr: 'Lawrencium',
  Rf: 'Rutherfordium', Db: 'Dubnium', Sg: 'Seaborgium', Bh: 'Bohrium', Hs: 'Hassium', Mt: 'Meitnerium',
  Ds: 'Darmstadtium', Rg: 'Roentgenium', Cn: 'Copernicium',
  Nh: 'Nihonium', Fl: 'Flerovium', Mc: 'Moscovium', Lv: 'Livermorium', Ts: 'Tennessine', Og: 'Oganesson',
}

// Mass number (protons + neutrons) of the most common (or most stable known) isotope
export const MASS_NUMBERS = {
  H: 1, He: 4, Li: 7, Be: 9, B: 11, C: 12, N: 14, O: 16, F: 19, Ne: 20,
  Na: 23, Mg: 24, Al: 27, Si: 28, P: 31, S: 32, Cl: 35, Ar: 40,
  K: 39, Ca: 40, Sc: 45, Ti: 48, V: 51, Cr: 52, Mn: 55, Fe: 56, Co: 59, Ni: 59, Cu: 64, Zn: 65,
  Ga: 70, Ge: 73, As: 75, Se: 79, Br: 80, Kr: 84,
  Rb: 85, Sr: 88, Y: 89, Zr: 91, Nb: 93, Mo: 96, Tc: 98, Ru: 101, Rh: 103, Pd: 106, Ag: 108, Cd: 112,
  In: 115, Sn: 119, Sb: 122, Te: 128, I: 127, Xe: 131,
  Cs: 133, Ba: 137, La: 139, Ce: 140, Pr: 141, Nd: 144, Pm: 145, Sm: 150, Eu: 152, Gd: 157,
  Tb: 159, Dy: 163, Ho: 165, Er: 167, Tm: 169, Yb: 173, Lu: 175,
  Hf: 178, Ta: 181, W: 184, Re: 186, Os: 190, Ir: 192, Pt: 195, Au: 197, Hg: 201,
  Tl: 204, Pb: 207, Bi: 209, Po: 209, At: 210, Rn: 222,
  Fr: 223, Ra: 226, Ac: 227, Th: 232, Pa: 231, U: 238, Np: 237, Pu: 244, Am: 243, Cm: 247,
  Bk: 247, Cf: 251, Es: 252, Fm: 257, Md: 258, No: 259, Lr: 266,
  Rf: 267, Db: 268, Sg: 269, Bh: 270, Hs: 269, Mt: 278, Ds: 281, Rg: 282, Cn: 285,
  Nh: 286, Fl: 289, Mc: 290, Lv: 293, Ts: 294, Og: 294,
}

const NAME_TO_SYMBOL = Object.fromEntries(
  Object.entries(ELEMENT_NAMES).map(([symbol, name]) => [name.toLowerCase(), symbol])
)

// Resolves a search query (symbol, name, or atomic number) to an element record
export function findElement(query) {
  const trimmed = query.trim()
  if (!trimmed) return null

  let symbol = null
  if (/^\d+$/.test(trimmed)) {
    const num = parseInt(trimmed, 10)
    symbol = Object.keys(ATOMIC_NUMBERS).find(s => ATOMIC_NUMBERS[s] === num) ?? null
  } else if (ATOMIC_NUMBERS[trimmed[0].toUpperCase() + trimmed.slice(1).toLowerCase()] != null) {
    symbol = trimmed[0].toUpperCase() + trimmed.slice(1).toLowerCase()
  } else {
    symbol = NAME_TO_SYMBOL[trimmed.toLowerCase()] ?? null
  }

  if (!symbol || ATOMIC_NUMBERS[symbol] == null) return null

  const atomicNumber = ATOMIC_NUMBERS[symbol]
  const massNumber = MASS_NUMBERS[symbol] ?? atomicNumber * 2
  return {
    symbol,
    name: ELEMENT_NAMES[symbol],
    atomicNumber,
    massNumber,
    neutrons: massNumber - atomicNumber,
    shells: getShellElectrons(atomicNumber),
  }
}
