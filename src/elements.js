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
