'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

/* ─── Types ─────────────────────────────────────────────────────────────── */

interface SubjectFromDB {
  _id: string
  name: string
  slug: string
  questionCount: number
  ccdStatus: 'completed' | 'in-progress' | 'not-started'
}

/* ─── Topic phrase: a clickable chunk inside each subject description ──── */

export type TopicSegment = string | { text: string; slug: string }

interface TopicPhrase {
  segments: TopicSegment[]
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
          { segments: [ { text: 'Propositional', slug: 'propositional-logic' }, ' and ', { text: 'first order logic', slug: 'first-order-logic' } ] },
          { segments: [ { text: 'Sets', slug: 'set-theory' }, ', ', { text: 'relations', slug: 'relations' }, ', ', { text: 'functions', slug: 'functions' }, ', ', { text: 'partial orders', slug: 'partial-orders' }, ' and ', { text: 'lattices', slug: 'lattice' } ] },
          { segments: [ { text: 'Monoids', slug: 'monoids' }, ', ', { text: 'Groups', slug: 'groups' } ] },
          { segments: [ { text: 'Graphs', slug: 'graph-theory' }, ': ', { text: 'connectivity', slug: 'graph-connectivity' }, ', ', { text: 'matching', slug: 'graph-matching' }, ', ', { text: 'colouring', slug: 'graph-coloring' } ] },
          { segments: [ { text: 'Combinatorics', slug: 'combinatorics' }, ': ', { text: 'counting', slug: 'counting' }, ', ', { text: 'recurrence relations', slug: 'recurrence-relation' }, ', ', { text: 'generating functions', slug: 'generating-functions' } ] },
        ],
      },
      {
        name: 'Linear Algebra',
        slug: 'linear-algebra',
        topics: [
          { segments: [ { text: 'Matrices', slug: 'matrices' }, ', ', { text: 'determinants', slug: 'determinants' }, ', ', { text: 'system of linear equations', slug: 'system-of-linear-equations' }, ', ', { text: 'eigenvalues and eigenvectors', slug: 'eigenvalues-and-eigenvectors' }, ', ', { text: 'LU decomposition', slug: 'lu-decomposition' } ] },
        ],
      },
      {
        name: 'Calculus',
        slug: 'calculus',
        topics: [
          { segments: [ { text: 'Limits, continuity and differentiability', slug: 'limits-continuity' } ] },
          { segments: [ { text: 'Maxima and minima', slug: 'maxima-minima' } ] },
          { segments: [ { text: 'Mean value theorem', slug: 'mean-value-theorem' } ] },
          { segments: [ { text: 'Integration', slug: 'integration' } ] },
        ],
      },
      {
        name: 'Probability and Statistics',
        slug: 'probability-statistics',
        topics: [
          { segments: [ { text: 'Random variables', slug: 'random-variables' } ] },
          { segments: [ { text: 'Uniform', slug: 'uniform-distribution' }, ', ', { text: 'normal', slug: 'normal-distribution' }, ', ', { text: 'exponential', slug: 'exponential-distribution' }, ', ', { text: 'Poisson', slug: 'poisson-distribution' }, ' and ', { text: 'binomial distributions', slug: 'binomial-distribution' } ] },
          { segments: [ { text: 'Mean, median, mode and standard deviation', slug: 'descriptive-statistics' } ] },
          { segments: [ { text: 'Conditional probability and Bayes theorem', slug: 'conditional-probability' } ] },
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
          { segments: [ { text: 'Boolean algebra', slug: 'boolean-algebra' } ] },
          { segments: [ { text: 'Combinational', slug: 'combinational-circuits' }, ' and ', { text: 'sequential circuits', slug: 'sequential-circuits' } ] },
          { segments: [ { text: 'Minimization', slug: 'minimization' } ] },
          { segments: [ { text: 'Number representations and computer arithmetic', slug: 'number-representations' }, ' (fixed and floating point)' ] },
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
          { segments: [ { text: 'Machine instructions', slug: 'machine-instructions' }, ' and ', { text: 'addressing modes', slug: 'addressing-modes' } ] },
          { segments: [ { text: 'ALU', slug: 'alu' }, ', ', { text: 'data\u2011path and control unit', slug: 'datapath-control' } ] },
          { segments: [ { text: 'Instruction pipelining', slug: 'pipelining' }, ', ', { text: 'pipeline hazards', slug: 'pipeline-hazards' } ] },
          { segments: [ { text: 'Memory hierarchy', slug: 'memory-hierarchy' }, ': ', { text: 'cache', slug: 'cache' }, ', ', { text: 'main memory', slug: 'main-memory' }, ' and ', { text: 'secondary storage', slug: 'secondary-storage' }, '; ', { text: 'I/O interface', slug: 'io-interface' }, ' (interrupt and DMA mode)' ] },
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
          { segments: [ { text: 'Programming in C', slug: 'programming-in-c' } ] },
          { segments: [ { text: 'Recursion', slug: 'recursion' } ] },
          { segments: [ { text: 'Arrays', slug: 'arrays' }, ', ', { text: 'stacks', slug: 'stacks' }, ', ', { text: 'queues', slug: 'queues' }, ', ', { text: 'linked lists', slug: 'linked-lists' }, ', ', { text: 'trees', slug: 'trees' }, ', ', { text: 'binary search trees', slug: 'binary-search-trees' }, ', ', { text: 'binary heaps', slug: 'binary-heaps' }, ', ', { text: 'graphs', slug: 'graphs' } ] },
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
          { segments: [ { text: 'Searching', slug: 'searching' }, ', ', { text: 'sorting', slug: 'sorting' }, ', ', { text: 'hashing', slug: 'hashing' } ] },
          { segments: [ { text: 'Asymptotic worst case time and space complexity', slug: 'complexity-analysis' } ] },
          { segments: [ { text: 'Algorithm design techniques', slug: 'algorithm-design' }, ': ', { text: 'greedy', slug: 'greedy' }, ', ', { text: 'dynamic programming', slug: 'dynamic-programming' }, ' and ', { text: 'divide\u2011and\u2011conquer', slug: 'divide-and-conquer' } ] },
          { segments: [ { text: 'Graph traversals', slug: 'graph-traversals' }, ', ', { text: 'minimum spanning trees', slug: 'minimum-spanning-trees' }, ', ', { text: 'shortest paths', slug: 'shortest-paths' } ] },
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
          { segments: [ { text: 'Regular expressions', slug: 'regular-expressions' }, ' and ', { text: 'finite automata', slug: 'finite-automata' } ] },
          { segments: [ { text: 'Context-free grammars', slug: 'context-free-grammars' }, ' and ', { text: 'push-down automata', slug: 'push-down-automata' } ] },
          { segments: [ { text: 'Regular and context-free languages', slug: 'regular-cf-languages' }, ', ', { text: 'pumping lemma', slug: 'pumping-lemma' } ] },
          { segments: [ { text: 'Turing machines', slug: 'turing-machines' }, ' and ', { text: 'undecidability', slug: 'undecidability' } ] },
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
          { segments: [ { text: 'Lexical analysis', slug: 'lexical-analysis' }, ', ', { text: 'parsing', slug: 'parsing' }, ', ', { text: 'syntax-directed translation', slug: 'syntax-directed-translation' } ] },
          { segments: [ { text: 'Runtime environments', slug: 'runtime-environments' } ] },
          { segments: [ { text: 'Intermediate code generation', slug: 'code-generation' } ] },
          { segments: [ { text: 'Local optimization', slug: 'local-optimization' }, ', ', { text: 'Data flow analyses', slug: 'data-flow-analyses' }, ': ', { text: 'constant propagation', slug: 'constant-propagation' }, ', ', { text: 'liveness analysis', slug: 'liveness-analysis' }, ', ', { text: 'common sub expression elimination', slug: 'common-subexpression-elimination' } ] },
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
          { segments: [ { text: 'System calls', slug: 'system-calls' }, ', ', { text: 'processes', slug: 'processes' }, ', ', { text: 'threads', slug: 'threads' }, ', ', { text: 'inter\u2011process communication', slug: 'ipc' }, ', ', { text: 'concurrency', slug: 'concurrency' }, ' and ', { text: 'synchronization', slug: 'synchronization' } ] },
          { segments: [ { text: 'Deadlock', slug: 'deadlock' } ] },
          { segments: [ { text: 'CPU and I/O scheduling', slug: 'scheduling' } ] },
          { segments: [ { text: 'Memory management', slug: 'memory-management' }, ' and ', { text: 'virtual memory', slug: 'virtual-memory' } ] },
          { segments: [ { text: 'File systems', slug: 'file-systems' } ] },
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
          { segments: [ { text: 'ER\u2011model', slug: 'er-model' } ] },
          { segments: [ { text: 'Relational model', slug: 'relational-model' }, ': ', { text: 'relational algebra', slug: 'relational-algebra' }, ', ', { text: 'tuple calculus', slug: 'tuple-calculus' }, ', ', { text: 'SQL', slug: 'sql' } ] },
          { segments: [ { text: 'Integrity constraints', slug: 'integrity-constraints' }, ', ', { text: 'normal forms', slug: 'normalization' } ] },
          { segments: [ { text: 'File organization', slug: 'file-organization' }, ', ', { text: 'indexing', slug: 'indexing' }, ' (e.g., B and B+ trees)' ] },
          { segments: [ { text: 'Transactions', slug: 'transactions' }, ' and ', { text: 'concurrency control', slug: 'concurrency-control' } ] },
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
                      href={(() => {
                        if (subj.topics.length > 0) {
                          const firstLinkSegment = subj.topics[0].segments.find(s => typeof s !== 'string') as {text: string, slug: string} | undefined
                          if (firstLinkSegment) {
                            return `/gate/${subj.slug}/${firstLinkSegment.slug}`
                          }
                        }
                        return `/gate/${subj.slug}`
                      })()}
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

                    {/* Topic phrases — each is a clickable link based on segments */}
                    {subj.topics.map((topic, idx) => (
                      <span key={`topic-${idx}`}>
                        {topic.segments.map((segment, sIdx) => {
                          if (typeof segment === 'string') {
                            return <span key={`seg-${sIdx}`} className="text-black">{segment}</span>
                          } else {
                            return (
                              <Link
                                key={`seg-${sIdx}`}
                                href={`/gate/${subj.slug}/${segment.slug}`}
                                className="text-black hover:text-[#4A235A] hover:underline transition-colors cursor-pointer"
                                style={{ textDecorationColor: '#4A235A' }}
                              >
                                {segment.text}
                              </Link>
                            )
                          }
                        })}
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
