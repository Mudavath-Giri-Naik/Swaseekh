'use client'

interface FilterBarProps {
  years: number[]
  selectedYear: string
  selectedDifficulty: string
  selectedType: string
  onYearChange: (v: string) => void
  onDifficultyChange: (v: string) => void
  onTypeChange: (v: string) => void
}

export default function FilterBar({
  years,
  selectedYear,
  selectedDifficulty,
  selectedType,
  onYearChange,
  onDifficultyChange,
  onTypeChange,
}: FilterBarProps) {
  const selectClass =
    'px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-700 bg-white ' +
    'focus:outline-none focus:border-[#4A235A] focus:ring-1 focus:ring-[#4A235A]/20 transition-colors'

  return (
    <div className="flex flex-wrap gap-3">
      {/* Year */}
      <select
        value={selectedYear}
        onChange={(e) => onYearChange(e.target.value)}
        className={selectClass}
      >
        <option value="">All Years</option>
        {years.map((y) => (
          <option key={y} value={String(y)}>
            GATE {y}
          </option>
        ))}
      </select>

      {/* Difficulty */}
      <select
        value={selectedDifficulty}
        onChange={(e) => onDifficultyChange(e.target.value)}
        className={selectClass}
      >
        <option value="">All Difficulties</option>
        <option value="easy">Easy</option>
        <option value="medium">Medium</option>
        <option value="hard">Hard</option>
      </select>

      {/* Type */}
      <select
        value={selectedType}
        onChange={(e) => onTypeChange(e.target.value)}
        className={selectClass}
      >
        <option value="">All Types</option>
        <option value="MCQ">MCQ</option>
        <option value="MSQ">MSQ</option>
        <option value="NAT">NAT</option>
      </select>
    </div>
  )
}
