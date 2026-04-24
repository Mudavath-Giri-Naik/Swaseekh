'use client'

import Link from 'next/link'

interface ExamCard {
  name: string
  description: string
  href: string
  active: boolean
}

const exams: ExamCard[] = [
  {
    name: 'GATE',
    description: 'Graduate Aptitude Test',
    href: '/gate',
    active: true,
  },
  {
    name: 'NEET',
    description: 'Coming Soon',
    href: '/neet',
    active: false,
  },
  {
    name: 'UPSC',
    description: 'Coming Soon',
    href: '/upsc',
    active: false,
  },
  {
    name: 'JEE',
    description: 'Coming Soon',
    href: '/jee',
    active: false,
  },
]

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-4">
      {/* Header */}
      <div className="text-center mb-10 mt-[-10vh]">
        <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 tracking-tight px-2">
          Swaseekh.com
        </h1>
      </div>

      {/* Exam Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl w-full px-2">
        {exams.map((exam) =>
          exam.active ? (
            <Link
              key={exam.name}
              href={exam.href}
              className="group relative bg-white border-2 border-gray-200 rounded-xl p-6 sm:p-5 lg:p-6 text-center
                         hover:border-[#4A235A] hover:shadow-lg transition-all duration-200 cursor-pointer flex flex-col justify-center"
            >
              <h2 className="text-2xl font-bold text-gray-900 mb-1 group-hover:text-[#4A235A] transition-colors">
                {exam.name}
              </h2>
              <p className="text-sm text-gray-500">{exam.description}</p>
            </Link>
          ) : (
            <div
              key={exam.name}
              className="relative bg-gray-50 border-2 border-gray-100 rounded-xl p-6 sm:p-5 lg:p-6 text-center
                         opacity-60 cursor-not-allowed flex flex-col justify-center"
            >
              <span className="absolute top-2 right-2 text-[10px] font-semibold bg-gray-200 text-gray-500 px-2 py-0.5 rounded-full">
                Coming Soon
              </span>
              <h2 className="text-2xl font-bold text-gray-400 mb-1">
                {exam.name}
              </h2>
              <p className="text-sm text-gray-400">{exam.description}</p>
            </div>
          )
        )}
      </div>
    </div>
  )
}
