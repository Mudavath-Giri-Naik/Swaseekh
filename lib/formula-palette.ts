// Soft pastel palette for formula badges — cycled deterministically by id
// so the same formula always gets the same color across the app.
export const FORMULA_PALETTES = [
  { bg: 'bg-blue-50',   text: 'text-blue-700',   hover: 'hover:bg-blue-100',   ring: 'ring-blue-300' },
  { bg: 'bg-green-50',  text: 'text-green-700',  hover: 'hover:bg-green-100',  ring: 'ring-green-300' },
  { bg: 'bg-sky-50',    text: 'text-sky-700',    hover: 'hover:bg-sky-100',    ring: 'ring-sky-300' },
  { bg: 'bg-purple-50', text: 'text-purple-700', hover: 'hover:bg-purple-100', ring: 'ring-purple-300' },
  { bg: 'bg-rose-50',   text: 'text-rose-700',   hover: 'hover:bg-rose-100',   ring: 'ring-rose-300' },
  { bg: 'bg-amber-50',  text: 'text-amber-700',  hover: 'hover:bg-amber-100',  ring: 'ring-amber-300' },
  { bg: 'bg-teal-50',   text: 'text-teal-700',   hover: 'hover:bg-teal-100',   ring: 'ring-teal-300' },
  { bg: 'bg-indigo-50', text: 'text-indigo-700', hover: 'hover:bg-indigo-100', ring: 'ring-indigo-300' },
]

export function formulaBadgePalette(id: string) {
  let h = 0
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0
  return FORMULA_PALETTES[h % FORMULA_PALETTES.length]
}
