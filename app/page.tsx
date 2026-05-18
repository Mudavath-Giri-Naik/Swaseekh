'use client'

import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { CursorImageTrail } from "@/components/unlumen-ui/cursor-image-trail"

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

// Educational / tech related local images
const IMAGES = [
  "/one.jpg",
  "/two.jpg",
  "/three.jpg",
  "/four.jpg",
  "/five.jpg",
  "/six.jpg",
  "/seven.jpg",
  "/eight.jpg",
];

const ITEMS = IMAGES.map((src, idx) => (
  // eslint-disable-next-line @next/next/no-img-element
  <img key={idx} src={src} alt={`trail-${idx}`} className="rounded-lg object-cover w-full h-full" />
));

export default function HomePage() {
  const { status } = useSession()
  const router = useRouter()

  const handleExamClick = (exam: ExamCard) => {
    if (!exam.active) return
    if (status === 'authenticated') {
      router.push(exam.href)
    } else {
      // Both 'unauthenticated' and 'loading' → send to login
      router.push('/login')
    }
  }

  return (
    <CursorImageTrail 
      items={ITEMS} 
      className="min-h-screen bg-white w-full flex flex-col items-center justify-center px-4"
    >
      {/* Header */}
      <div className="text-center mb-10 mt-[-10vh] z-10 relative pointer-events-auto">
        <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 tracking-tight px-2">
          Swaseekh.in
        </h1>
      </div>

      {/* Exam Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl w-full px-2" style={{ position: 'relative', zIndex: 50 }}>
        {exams.map((exam) =>
          exam.active ? (
            <button
              key={exam.name}
              type="button"
              onClick={() => handleExamClick(exam)}
              style={{ position: 'relative', zIndex: 51, pointerEvents: 'auto' }}
              className="group bg-white border-2 border-gray-200 rounded-xl p-6 sm:p-5 lg:p-6 text-center
                         hover:border-[#4A235A] hover:shadow-lg transition-all duration-200 cursor-pointer flex flex-col justify-center"
            >
              <h2 className="text-2xl font-bold text-gray-900 mb-1 group-hover:text-[#4A235A] transition-colors">
                {exam.name}
              </h2>
              <p className="text-sm text-gray-500">{exam.description}</p>
            </button>
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
    </CursorImageTrail>
  )
}
