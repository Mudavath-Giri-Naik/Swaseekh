'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

/* ─── Types ─────────────────────────────────────────────────────────────── */

interface SubjectFromDB {
  _id: string
  name: string
  slug: string
  questionCount: number
  ccdStatus: 'completed' | 'in-progress' | 'not-started'
}

/* ─── Topic phrase: a clickable chunk inside each subject description ──── */

interface TopicPhrase {
  text: string   // display text e.g. "Propositional and first order logic"
  slug: string   // maps to taxonomy.topicId → used in /gate/[subject]/[slug]
}

interface SubjectEntry {
  name: string
  slug: string
  topics: TopicPhrase[]
}

interface SyllabusSection {
  number: number
  title: string
  subjects: SubjectEntry[]
}

/* ─── Complete syllabus data with topic-level slugs ──────────────────────── */

const syllabus: SyllabusSection[] = [
  {
    number: 1,
    title: 'Engineering Mathematics',
    subjects: [
      {
        name: 'Discrete Mathematics',
        slug: 'discrete-mathematics',
        topics: [
          { text: 'Propositional and first order logic', slug: 'mathematical-logic' },
          { text: 'Sets, relations, functions, partial orders and lattices', slug: 'set-theory-algebra' },
          { text: 'Monoids, Groups', slug: 'set-theory-algebra' },
          { text: 'Graphs: connectivity, matching, colouring', slug: 'graph-theory' },
          { text: 'Combinatorics: counting, recurrence relations, generating functions', slug: 'combinatorics' },
        ],
      },
      {
        name: 'Linear Algebra',
        slug: 'linear-algebra',
        topics: [
          { text: 'Matrices, determinants, system of linear equations, eigenvalues and eigenvectors, LU decomposition', slug: 'matrices-and-determinants' },
        ],
      },
      {
        name: 'Calculus',
        slug: 'calculus',
        topics: [
          { text: 'Limits, continuity and differentiability', slug: 'limits-continuity' },
          { text: 'Maxima and minima', slug: 'maxima-minima' },
          { text: 'Mean value theorem', slug: 'mean-value-theorem' },
          { text: 'Integration', slug: 'integration' },
        ],
      },
      {
        name: 'Probability and Statistics',
        slug: 'probability-statistics',
        topics: [
          { text: 'Random variables', slug: 'random-variables' },
          { text: 'Uniform, normal, exponential, Poisson and binomial distributions', slug: 'distributions' },
          { text: 'Mean, median, mode and standard deviation', slug: 'descriptive-statistics' },
          { text: 'Conditional probability and Bayes theorem', slug: 'conditional-probability' },
        ],
      },
    ],
  },
  {
    number: 2,
    title: 'Digital Logic',
    subjects: [
      {
        name: 'Digital Logic',
        slug: 'digital-logic',
        topics: [
          { text: 'Boolean algebra', slug: 'boolean-algebra' },
          { text: 'Combinational and sequential circuits', slug: 'combinational-sequential-circuits' },
          { text: 'Minimization', slug: 'minimization' },
          { text: 'Number representations and computer arithmetic (fixed and floating point)', slug: 'number-representations' },
        ],
      },
    ],
  },
  {
    number: 3,
    title: 'Computer Organization and Architecture',
    subjects: [
      {
        name: 'Computer Organization and Architecture',
        slug: 'computer-organization',
        topics: [
          { text: 'Machine instructions and addressing modes', slug: 'machine-instructions' },
          { text: 'ALU, data\u2011path and control unit', slug: 'alu-datapath' },
          { text: 'Instruction pipelining, pipeline hazards', slug: 'pipelining' },
          { text: 'Memory hierarchy: cache, main memory and secondary storage; I/O interface (interrupt and DMA mode)', slug: 'memory-hierarchy' },
        ],
      },
    ],
  },
  {
    number: 4,
    title: 'Programming and Data Structures',
    subjects: [
      {
        name: 'Programming and Data Structures',
        slug: 'programming-ds',
        topics: [
          { text: 'Programming in C', slug: 'programming-in-c' },
          { text: 'Recursion', slug: 'recursion' },
          { text: 'Arrays, stacks, queues, linked lists, trees, binary search trees, binary heaps, graphs', slug: 'data-structures' },
        ],
      },
    ],
  },
  {
    number: 5,
    title: 'Algorithms',
    subjects: [
      {
        name: 'Algorithms',
        slug: 'algorithms',
        topics: [
          { text: 'Searching, sorting, hashing', slug: 'searching-sorting' },
          { text: 'Asymptotic worst case time and space complexity', slug: 'complexity-analysis' },
          { text: 'Algorithm design techniques: greedy, dynamic programming and divide\u2011and\u2011conquer', slug: 'algorithm-design' },
          { text: 'Graph traversals, minimum spanning trees, shortest paths', slug: 'graph-algorithms' },
        ],
      },
    ],
  },
  {
    number: 6,
    title: 'Theory of Computation',
    subjects: [
      {
        name: 'Theory of Computation',
        slug: 'theory-of-computation',
        topics: [
          { text: 'Regular expressions and finite automata', slug: 'regular-languages' },
          { text: 'Context-free grammars and push-down automata', slug: 'context-free-languages' },
          { text: 'Regular and context-free languages, pumping lemma', slug: 'pumping-lemma' },
          { text: 'Turing machines and undecidability', slug: 'turing-machines' },
        ],
      },
    ],
  },
  {
    number: 7,
    title: 'Compiler Design',
    subjects: [
      {
        name: 'Compiler Design',
        slug: 'compiler-design',
        topics: [
          { text: 'Lexical analysis, parsing, syntax-directed translation', slug: 'lexical-analysis' },
          { text: 'Runtime environments', slug: 'runtime-environments' },
          { text: 'Intermediate code generation', slug: 'code-generation' },
          { text: 'Local optimization, Data flow analyses: constant propagation, liveness analysis, common sub expression elimination', slug: 'optimization' },
        ],
      },
    ],
  },
  {
    number: 8,
    title: 'Operating System',
    subjects: [
      {
        name: 'Operating System',
        slug: 'operating-systems',
        topics: [
          { text: 'System calls, processes, threads, inter\u2011process communication, concurrency and synchronization', slug: 'process-management' },
          { text: 'Deadlock', slug: 'deadlock' },
          { text: 'CPU and I/O scheduling', slug: 'scheduling' },
          { text: 'Memory management and virtual memory', slug: 'memory-management' },
          { text: 'File systems', slug: 'file-systems' },
        ],
      },
    ],
  },
  {
    number: 9,
    title: 'Databases',
    subjects: [
      {
        name: 'Databases',
        slug: 'databases',
        topics: [
          { text: 'ER\u2011model', slug: 'er-model' },
          { text: 'Relational model: relational algebra, tuple calculus, SQL', slug: 'relational-model' },
          { text: 'Integrity constraints, normal forms', slug: 'normalization' },
          { text: 'File organization, indexing (e.g., B and B+ trees)', slug: 'indexing' },
          { text: 'Transactions and concurrency control', slug: 'transactions' },
        ],
      },
    ],
  },
]

/* ─── Component ──────────────────────────────────────────────────────────── */

export default function GateSyllabusPage() {
  const [subjectMap, setSubjectMap] = useState<Record<string, SubjectFromDB>>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/subjects')
      .then((res) => res.json())
      .then((data) => {
        const map: Record<string, SubjectFromDB> = {}
        if (data.subjects) {
          for (const s of data.subjects) {
            map[s.slug] = s
          }
        }
        setSubjectMap(map)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="min-h-screen bg-white">
      {/* Back to home */}
      <div className="max-w-[900px] mx-auto px-6 sm:px-10 pt-4">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Home
        </Link>
      </div>

      {/* Document container */}
      <div className="max-w-[900px] mx-auto px-6 sm:px-10 py-6 font-serif">
        {/* Top bar */}
        <div className="flex items-center justify-between mb-4">
          <span className="text-base font-bold text-black underline">
            GATE 2026
          </span>
          <span className="text-sm text-black font-semibold">
            IIT Guwahati | Organizing Institute
          </span>
        </div>

        {/* Purple header bar */}
        <div
          className="flex items-center gap-0 mb-8 rounded-sm overflow-hidden"
          style={{ backgroundColor: '#4A235A' }}
        >
          <div className="px-4 py-3 border-r border-white/20">
            <span className="text-white font-bold text-lg tracking-wide">CS</span>
          </div>
          <div className="px-4 py-3">
            <span className="text-white font-bold text-base sm:text-lg">
              Computer Science and Information Technology
            </span>
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="w-6 h-6 border-2 border-gray-300 border-t-[#4A235A] rounded-full animate-spin" />
          </div>
        )}

        {/* Syllabus sections */}
        {!loading &&
          syllabus.map((section) => (
            <div key={section.number} className="mb-6">
              {/* Section heading */}
              <h2
                className="text-base font-bold mb-2"
                style={{ color: '#8B0000' }}
              >
                Section {section.number}: {section.title}
              </h2>

              {/* Subject entries */}
              {section.subjects.map((subj) => {
                const dbData = subjectMap[subj.slug]
                const hasQuestions = dbData && dbData.questionCount > 0

                return (
                  <p
                    key={subj.slug}
                    className="text-[15px] leading-[1.8] text-black mb-3"
                  >


                    {/* Subject name link */}
                    <Link
                      href={`/gate/${subj.slug}`}
                      className="font-semibold hover:underline"
                      style={{ color: '#C0392B' }}
                    >
                      {subj.name}
                    </Link>

                    {/* Question count badge */}
                    {hasQuestions && (
                      <span className="text-xs text-gray-400 ml-1.5 font-sans">
                        [{dbData.questionCount} Qs]
                      </span>
                    )}

                    {/* Colon separator */}
                    <span className="text-black">: </span>

                    {/* Topic phrases — each is a clickable link */}
                    {subj.topics.map((topic, idx) => (
                      <span key={`${topic.slug}-${idx}`}>
                        <Link
                          href={`/gate/${subj.slug}/${topic.slug}`}
                          className="text-black hover:text-[#4A235A] hover:underline transition-colors cursor-pointer"
                          style={{ textDecorationColor: '#4A235A' }}
                        >
                          {topic.text}
                        </Link>
                        {/* Period separator between topics */}
                        {idx < subj.topics.length - 1 ? (
                          <span className="text-black">. </span>
                        ) : (
                          <span className="text-black">.</span>
                        )}
                      </span>
                    ))}
                  </p>
                )
              })}
            </div>
          ))}
      </div>
    </div>
  )
}
