// Soft pastel palette for formula badges — cycled deterministically by id
// so the same formula always gets the same color across the app.
//
// LIGHT MODE: each formula gets its own pastel background tint (gives the
//   light list its colorful look).
// DARK MODE:  every chip uses the SAME translucent white background, and
//   only the text color varies per palette. This keeps the dark theme
//   from looking like a row of bright pills while still letting users
//   distinguish formulas at a glance.
export const FORMULA_PALETTES = [
  { bg: 'bg-blue-50 dark:bg-white/[0.06]',     text: 'text-blue-700 dark:text-blue-300',       hover: 'hover:bg-blue-100 dark:hover:bg-white/[0.09]',     ring: 'ring-blue-300 dark:ring-blue-400/40' },
  { bg: 'bg-emerald-50 dark:bg-white/[0.06]',  text: 'text-emerald-700 dark:text-emerald-300', hover: 'hover:bg-emerald-100 dark:hover:bg-white/[0.09]', ring: 'ring-emerald-300 dark:ring-emerald-400/40' },
  { bg: 'bg-sky-50 dark:bg-white/[0.06]',      text: 'text-sky-700 dark:text-sky-300',         hover: 'hover:bg-sky-100 dark:hover:bg-white/[0.09]',     ring: 'ring-sky-300 dark:ring-sky-400/40' },
  { bg: 'bg-purple-50 dark:bg-white/[0.06]',   text: 'text-purple-700 dark:text-purple-300',   hover: 'hover:bg-purple-100 dark:hover:bg-white/[0.09]', ring: 'ring-purple-300 dark:ring-purple-400/40' },
  { bg: 'bg-rose-50 dark:bg-white/[0.06]',     text: 'text-rose-700 dark:text-rose-300',       hover: 'hover:bg-rose-100 dark:hover:bg-white/[0.09]',     ring: 'ring-rose-300 dark:ring-rose-400/40' },
  { bg: 'bg-amber-50 dark:bg-white/[0.06]',    text: 'text-amber-700 dark:text-amber-300',     hover: 'hover:bg-amber-100 dark:hover:bg-white/[0.09]',   ring: 'ring-amber-300 dark:ring-amber-400/40' },
  { bg: 'bg-teal-50 dark:bg-white/[0.06]',     text: 'text-teal-700 dark:text-teal-300',       hover: 'hover:bg-teal-100 dark:hover:bg-white/[0.09]',     ring: 'ring-teal-300 dark:ring-teal-400/40' },
  { bg: 'bg-indigo-50 dark:bg-white/[0.06]',   text: 'text-indigo-700 dark:text-indigo-300',   hover: 'hover:bg-indigo-100 dark:hover:bg-white/[0.09]', ring: 'ring-indigo-300 dark:ring-indigo-400/40' },
]

export function formulaBadgePalette(id: string) {
  let h = 0
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0
  return FORMULA_PALETTES[h % FORMULA_PALETTES.length]
}
