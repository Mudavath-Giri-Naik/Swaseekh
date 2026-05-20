import { CheckCircle2, Search } from 'lucide-react'

/**
 * Big product-preview card pinned to the bottom of the hero.
 * Designed to extend past the viewport so the section's overflow-hidden
 * clips its bottom edge — like CodeDale's "Our Work" mock row.
 */
export default function ProductPreview() {
  return (
    <div className="mx-auto w-full max-w-5xl px-4">
      <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_24px_60px_-20px_rgba(15,23,42,0.22)]">
        {/* Browser chrome */}
        <div className="flex items-center gap-1.5 border-b border-slate-200 bg-slate-50/80 px-4 py-2.5">
          <span className="h-2.5 w-2.5 rounded-full bg-rose-400" />
          <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
          <div className="ml-3 flex flex-1 justify-center">
            <span className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 bg-white px-3 py-0.5 text-[10px] font-medium text-slate-500">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              swaseekh.com/gate/algorithms/sorting/quick-sort
            </span>
          </div>
        </div>

        {/* App body */}
        <div className="grid grid-cols-12 gap-4 p-4 md:p-5">
          {/* Sidebar */}
          <aside className="col-span-4 hidden flex-col gap-1 md:col-span-3 md:flex">
            <div className="mb-1.5 flex items-center gap-1.5 rounded-md border border-slate-200 bg-slate-50 px-2 py-1 text-[10px] text-slate-500">
              <Search size={10} />
              Search subjects
            </div>
            <div className="mb-1 text-[9px] font-semibold uppercase tracking-wider text-slate-400">
              Subjects
            </div>
            {[
              { name: 'Algorithms', active: true, count: 142 },
              { name: 'Operating Systems', count: 98 },
              { name: 'DBMS', count: 114 },
              { name: 'Computer Networks', count: 87 },
              { name: 'Theory of Computation', count: 56 },
              { name: 'Compiler Design', count: 41 },
              { name: 'Computer Organization', count: 73 },
            ].map((s) => (
              <div
                key={s.name}
                className={`flex items-center justify-between rounded-lg px-2.5 py-1.5 text-[11px] ${
                  s.active
                    ? 'bg-indigo-50 font-semibold text-indigo-700'
                    : 'text-slate-600'
                }`}
              >
                <span className="truncate">{s.name}</span>
                <span className="ml-2 text-[9px] text-slate-400">{s.count}</span>
              </div>
            ))}
          </aside>

          {/* Main */}
          <main className="col-span-12 space-y-3 md:col-span-9">
            <div className="text-[10px] text-slate-400">
              Algorithms › Sorting › Quick Sort
            </div>

            <div className="flex items-baseline justify-between gap-3">
              <h3 className="text-base font-bold tracking-tight text-slate-900 md:text-lg">
                Quick Sort
              </h3>
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[9px] font-semibold text-emerald-700">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                12 PYQs mapped
              </span>
            </div>

            <p className="text-[11px] leading-relaxed text-slate-600">
              Divide-and-conquer sorting. Picks a pivot, partitions the array
              around it, recursively sorts the two halves. Average{' '}
              <span className="font-mono font-semibold text-indigo-600">
                O(n log n)
              </span>{' '}
              · worst case{' '}
              <span className="font-mono font-semibold text-rose-600">
                O(n²)
              </span>
              .
            </p>

            {/* PYQ chips */}
            <div className="flex flex-wrap gap-1.5">
              {[
                'GATE 2024 · Q12',
                'GATE 2023 · Q8',
                'GATE 2022 · Q15',
                'GATE 2021 · Q9',
                'GATE 2019 · Q21',
              ].map((p) => (
                <span
                  key={p}
                  className="rounded-full border border-indigo-200 bg-indigo-50/60 px-2 py-0.5 text-[10px] font-medium text-indigo-700"
                >
                  {p}
                </span>
              ))}
            </div>

            {/* Two-col: code + key points */}
            <div className="grid grid-cols-5 gap-3">
              {/* Code snippet */}
              <div className="col-span-3 rounded-lg border border-slate-200 bg-slate-50 p-3">
                <div className="mb-1.5 text-[9px] font-semibold uppercase tracking-wider text-slate-400">
                  pseudo
                </div>
                <pre className="font-mono text-[10px] leading-[1.7] text-slate-700">
{`def quicksort(arr, lo, hi):
  if lo < hi:
    p = partition(arr, lo, hi)
    quicksort(arr, lo, p - 1)
    quicksort(arr, p + 1, hi)`}
                </pre>
              </div>

              {/* Key takeaways */}
              <div className="col-span-2 space-y-1.5 rounded-lg border border-slate-200 bg-white p-3">
                <div className="text-[9px] font-semibold uppercase tracking-wider text-slate-400">
                  key points
                </div>
                {[
                  'In-place',
                  'Not stable',
                  'Cache-friendly',
                  'Median pivot best',
                ].map((k) => (
                  <div
                    key={k}
                    className="flex items-center gap-1.5 text-[10px] text-slate-700"
                  >
                    <CheckCircle2 size={10} className="text-emerald-500" />
                    {k}
                  </div>
                ))}
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}
