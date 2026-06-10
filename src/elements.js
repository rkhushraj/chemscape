export const ATOMIC_NUMBERS = {
  H: 1, He: 2, Li: 3, Be: 4, B: 5, C: 6, N: 7, O: 8, F: 9, Ne: 10,
  Na: 11, Mg: 12, Al: 13, Si: 14, P: 15, S: 16, Cl: 17, Ar: 18,
  K: 19, Ca: 20, Sc: 21, Ti: 22, V: 23, Cr: 24, Mn: 25, Fe: 26, Co: 27, Ni: 28, Cu: 29, Zn: 30,
  Ga: 31, Ge: 32, As: 33, Se: 34, Br: 35, Kr: 36,
  Rb: 37, Sr: 38, Y: 39, Zr: 40, Nb: 41, Mo: 42, Tc: 43, Ru: 44, Rh: 45, Pd: 46, Ag: 47, Cd: 48,
  In: 49, Sn: 50, Sb: 51, Te: 52, I: 53, Xe: 54,
}

// Simplified Bohr-model shell capacities (2, 8, 8, 18, 18, 32, 32),
// matches noble gas totals (He=2, Ne=10, Ar=18, Kr=36, Xe=54).
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
}

// Mass number (protons + neutrons) of the most common isotope
export const MASS_NUMBERS = {
  H: 1, He: 4, Li: 7, Be: 9, B: 11, C: 12, N: 14, O: 16, F: 19, Ne: 20,
  Na: 23, Mg: 24, Al: 27, Si: 28, P: 31, S: 32, Cl: 35, Ar: 40,
  K: 39, Ca: 40, Sc: 45, Ti: 48, V: 51, Cr: 52, Mn: 55, Fe: 56, Co: 59, Ni: 59, Cu: 64, Zn: 65,
  Ga: 70, Ge: 73, As: 75, Se: 79, Br: 80, Kr: 84,
  Rb: 85, Sr: 88, Y: 89, Zr: 91, Nb: 93, Mo: 96, Tc: 98, Ru: 101, Rh: 103, Pd: 106, Ag: 108, Cd: 112,
  In: 115, Sn: 119, Sb: 122, Te: 128, I: 127, Xe: 131,
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
