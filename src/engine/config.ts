// Single tuning surface for the generator — every gameplay-affecting constant lives here
// (repo rule: tunable constants in one place; engine purity forbids importing state/).

export const MAX_GRID = 21
export const BACKTRACK_K = 3
export const DEFAULT_CANDIDATES = 32

/** spotScore weights */
export const W_CROSSING = 3
export const W_COMPACTNESS = 1.5
export const W_BALANCE = 1
export const P_LONG_AXIS = 0.5

/** candidate selection */
export const NEAR_BEST_BAND = 0.95
export const EARLY_EXIT_XPERWORD = 1.6
/** weighted top-3 spot pick probabilities (cumulative) */
export const SPOT_PICK_P1 = 0.6
export const SPOT_PICK_P2 = 0.85
/** order-noise amplitude + scarce-word priority bump */
export const ORDER_NOISE = 8
export const PRIORITY_BUMP = 15

/** quality phrase thresholds (recalibrated 2026-08-12, see build log slice a) */
export const LOOSE_DENSITY = 0.28
export const LOOSE_BALANCE = 0.5
