'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import { 
  ChevronLeft, BookOpen, Target, Activity, Flame, Clock, 
  BarChart3, PlayCircle, LibraryBig, Layers
} from 'lucide-react'

interface SubjectStats {
  subject: {
    _id: string
    name: string
    weightage: number
  }
  totalConcepts: number
  totalPyqs: number
  topics: Array<{
    _id: string
    name: string
    weightage: number
    stats: { totalConcepts: number; totalPyqs: number }
    userProgress: {
      conceptsReadCount: number
      pyqsAttemptedCount: number
      pyqsCorrectCount: number
      accuracy: number
    }
    concepts: Array<{
      _id: string
      title: string
      pyqs: Array<{
        _id: string
        qid: string
        question: string
        meta: {
          year: number
          marks: number
          type: string
          difficulty: string
          subject: string
          topic: string
          subtopic: string
        }
      }>
    }>
  }>
  userProgress: {
    overallAccuracy: number
    attemptedPyqs: number
    conceptsDecodeViewed: number
    timeSpentSeconds: number
    currentStreak: number
    lastViewedTopicId: string | null
    commonDistractor: string | null
    yearWisePyqs: Record<number, number>
  }
}

const dashboardCache = new Map<string, SubjectStats>()

export default function SubjectDashboard({ params }: { params: { subjectId: string } }) {
  const router = useRouter()
  const [data, setData] = useState<SubjectStats | null>(dashboardCache.get(params.subjectId) || null)
  const [loading, setLoading] = useState(!dashboardCache.has(params.subjectId))
  const [selectedTopicId, setSelectedTopicId] = useState<string | null>(null)

  useEffect(() => {
    if (dashboardCache.has(params.subjectId)) return;

    fetch(`/api/dashboard/subject/${params.subjectId}`)
      .then(res => res.json())
      .then(d => {
        dashboardCache.set(params.subjectId, d)
        setData(d)
        setLoading(false)
        if (d.topics && d.topics.length > 0) {
          setSelectedTopicId(d.topics[0]._id)
        }
      })
      .catch(e => {
        console.error(e)
        setLoading(false)
      })
  }, [params.subjectId])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[80vh]">
        <div className="w-8 h-8 border-2 border-t-[#4A235A] rounded-full animate-spin" />
      </div>
    )
  }

  if (!data || !data.subject) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-xl font-bold text-red-600">Subject Not Found</h2>
        <Button onClick={() => router.push('/gate')} className="mt-4">Back to Syllabus</Button>
      </div>
    )
  }

  const { subject, topics, userProgress, totalConcepts, totalPyqs } = data
  const topicsCompleted = topics.filter(t => t.stats.totalConcepts > 0 && t.userProgress.conceptsReadCount === t.stats.totalConcepts).length
  const overallProgress = topics.length > 0 ? Math.round((topicsCompleted / topics.length) * 100) : 0

  // Set initial topic id if from cache
  useEffect(() => {
    if (data && !selectedTopicId && data.topics.length > 0) {
      setSelectedTopicId(data.topics[0]._id)
    }
  }, [data, selectedTopicId])

  // Calculate weakest topic
  const topicsWithAttempts = topics.filter(t => t.userProgress.pyqsAttemptedCount > 0)
  const weakestTopic = topicsWithAttempts.length > 0 
    ? topicsWithAttempts.reduce((prev, curr) => (curr.userProgress.accuracy < prev.userProgress.accuracy ? curr : prev))
    : null

  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600)
    const mins = Math.floor((seconds % 3600) / 60)
    if (hrs > 0) return `${hrs}h ${mins}m`
    return `${mins}m`
  }

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-6 space-y-6 pb-20">
      
      {/* 1. Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => router.push('/gate')}>
            <ChevronLeft className="w-5 h-5" />
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl md:text-3xl font-bold text-[#1A1A2E]">{subject.name}</h1>
              {subject.weightage > 0 && (
                <Badge variant="secondary" className="bg-[#4A235A]/10 text-[#4A235A]">
                  {subject.weightage} Marks Weightage
                </Badge>
              )}
            </div>
            <p className="text-muted-foreground mt-1">
              {topicsCompleted} of {topics.length} topics completed
            </p>
          </div>
        </div>
        
        {/* Progress Ring (simplified to progress bar for alignment) */}
        <div className="flex items-center gap-3 bg-white p-3 rounded-xl border shadow-sm min-w-[200px]">
          <div className="flex-1">
            <div className="flex justify-between text-sm mb-1">
              <span className="font-medium text-[#4A235A]">Mastery</span>
              <span className="font-bold">{overallProgress}%</span>
            </div>
            <Progress value={overallProgress} className="h-2" />
          </div>
        </div>
      </div>

      {/* 6. Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Button 
          variant="outline" 
          className="h-auto py-4 flex flex-col items-center justify-center gap-2 bg-white hover:bg-slate-50 border-[#EBE5DE]"
          onClick={() => {
            if (userProgress.lastViewedTopicId) {
              const t = topics.find(t => t._id === userProgress.lastViewedTopicId)
              if (t) router.push(`/gate/questions?subject=${encodeURIComponent(subject.name)}&topic=${encodeURIComponent(t.name)}`)
            } else {
              router.push('/gate') // fallback
            }
          }}
          disabled={!userProgress.lastViewedTopicId}
        >
          <PlayCircle className="w-5 h-5 text-[#F26419]" />
          <span className="font-semibold text-[#1A1A2E]">Resume Session</span>
        </Button>
        <Button 
          variant="outline" 
          className="h-auto py-4 flex flex-col items-center justify-center gap-2 bg-white hover:bg-slate-50 border-[#EBE5DE]"
          onClick={() => {
            if (weakestTopic) {
              router.push(`/gate/questions?subject=${encodeURIComponent(subject.name)}&topic=${encodeURIComponent(weakestTopic.name)}`)
            }
          }}
          disabled={!weakestTopic}
        >
          <Target className="w-5 h-5 text-red-500" />
          <span className="font-semibold text-[#1A1A2E]">Practice Weakest Topic</span>
        </Button>
        <Button 
          variant="outline" 
          className="h-auto py-4 flex flex-col items-center justify-center gap-2 bg-white hover:bg-slate-50 border-[#EBE5DE]"
          onClick={() => router.push(`/gate/questions?subject=${encodeURIComponent(subject.name)}`)}
        >
          <LibraryBig className="w-5 h-5 text-[#4A235A]" />
          <span className="font-semibold text-[#1A1A2E]">Full Subject Mock</span>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* 3. PYQ Intelligence Panel */}
        <Card className="md:col-span-2 border-[#EBE5DE] shadow-sm">
          <CardHeader className="pb-3 border-b">
            <CardTitle className="text-lg flex items-center gap-2 text-[#1A1A2E]">
              <BarChart3 className="w-5 h-5 text-[#F26419]" /> PYQ Intelligence
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                <p className="text-sm text-muted-foreground mb-1">PYQs Attempted</p>
                <p className="text-2xl font-bold text-[#1A1A2E]">
                  {userProgress.attemptedPyqs} <span className="text-sm font-normal text-muted-foreground">/ {totalPyqs}</span>
                </p>
              </div>
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                <p className="text-sm text-muted-foreground mb-1">Overall Accuracy</p>
                <p className="text-2xl font-bold text-[#1A1A2E]">{userProgress.overallAccuracy}%</p>
              </div>
            </div>

            {userProgress.commonDistractor && (
              <div className="bg-red-50 text-red-800 p-4 rounded-xl border border-red-100 mb-6">
                <div className="flex items-start gap-2">
                  <Activity className="w-5 h-5 mt-0.5 text-red-600" />
                  <div>
                    <h4 className="font-semibold mb-1">Common Trap Pattern</h4>
                    <p className="text-sm">You frequently fall for <strong>{userProgress.commonDistractor}</strong> distractors in this subject. Pay extra attention to these during practice.</p>
                  </div>
                </div>
              </div>
            )}

            {/* Year-wise sparkline (simplified representation) */}
            <div>
              <p className="text-sm font-semibold mb-3">PYQ Year Distribution</p>
              <div className="flex items-end gap-1 h-16">
                {Object.entries(userProgress.yearWisePyqs).sort(([a],[b]) => Number(a) - Number(b)).slice(-15).map(([year, count]) => {
                  const maxCount = Math.max(...Object.values(userProgress.yearWisePyqs))
                  const height = maxCount > 0 ? `${(count / maxCount) * 100}%` : '0%'
                  return (
                    <div key={year} className="flex-1 flex flex-col justify-end group relative">
                      <div className="bg-[#4A235A]/20 hover:bg-[#4A235A] transition-colors rounded-t-sm w-full" style={{ height }} />
                      <div className="opacity-0 group-hover:opacity-100 absolute -top-8 left-1/2 -translate-x-1/2 bg-black text-white text-xs py-1 px-2 rounded z-10 whitespace-nowrap pointer-events-none">
                        {year}: {count} Qs
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Right Column: Stats Strip & Decode */}
        <div className="space-y-6">
          
          {/* 7. Stats Strip */}
          <div className="grid grid-cols-2 gap-4">
            <Card className="border-[#EBE5DE] shadow-sm bg-gradient-to-br from-white to-orange-50/50">
              <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                <Flame className="w-6 h-6 text-[#F26419] mb-2" />
                <p className="text-2xl font-bold text-[#1A1A2E]">{userProgress.currentStreak}</p>
                <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Day Streak</p>
              </CardContent>
            </Card>
            <Card className="border-[#EBE5DE] shadow-sm bg-gradient-to-br from-white to-purple-50/50">
              <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                <Clock className="w-6 h-6 text-[#4A235A] mb-2" />
                <p className="text-2xl font-bold text-[#1A1A2E]">{formatTime(userProgress.timeSpentSeconds)}</p>
                <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Time Spent</p>
              </CardContent>
            </Card>
          </div>

          {/* 4. Decode Layer Engagement */}
          <Card className="border-[#EBE5DE] shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground uppercase tracking-wider font-bold flex items-center gap-2">
                <Layers className="w-4 h-4" /> Decode Insights
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline gap-2 mb-2">
                <span className="text-3xl font-bold text-[#4A235A]">{userProgress.conceptsDecodeViewed}</span>
                <span className="text-muted-foreground">/ {totalConcepts}</span>
              </div>
              <Progress value={totalConcepts > 0 ? (userProgress.conceptsDecodeViewed / totalConcepts) * 100 : 0} className="h-1.5" />
              <p className="text-xs text-muted-foreground mt-3 leading-relaxed">
                Concepts where you've viewed the etymology and intuition layer. 
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* 5. Topic Explorer */}
      <h2 className="text-xl font-bold text-[#1A1A2E] mt-10 mb-4 flex items-center gap-2">
        <Target className="w-5 h-5 text-[#8B0000]" /> Explore Topics & Concepts
      </h2>
      
      {/* Topic Badges */}
      <div className="flex flex-wrap gap-2 mb-6">
        {topics.map(topic => (
          <button
            key={topic._id}
            onClick={() => setSelectedTopicId(topic._id)}
            className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors border ${
              selectedTopicId === topic._id
                ? 'bg-[#4A235A] text-white border-[#4A235A]'
                : 'bg-white text-muted-foreground border-slate-200 hover:border-[#4A235A] hover:text-[#4A235A]'
            }`}
          >
            {topic.name} <span className="opacity-70 font-normal ml-1 text-xs">({topic.weightage}%)</span>
          </button>
        ))}
      </div>

      {/* Selected Topic Content */}
      {selectedTopicId && (() => {
        const selectedTopic = topics.find(t => t._id === selectedTopicId)
        if (!selectedTopic) return null

        return (
          <div className="bg-white border border-[#EBE5DE] rounded-xl overflow-hidden shadow-sm">
            <div className="bg-slate-50 border-b px-5 py-4 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-[#1A1A2E]">{selectedTopic.name}</h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {selectedTopic.stats.totalConcepts} Concepts • {selectedTopic.stats.totalPyqs} Questions • {selectedTopic.userProgress.accuracy}% Accuracy
                </p>
              </div>
              <Button 
                size="sm" 
                variant="outline"
                className="border-[#4A235A] text-[#4A235A] hover:bg-[#4A235A] hover:text-white transition-colors"
                onClick={() => router.push(`/gate/questions?subject=${encodeURIComponent(subject.name)}&topic=${encodeURIComponent(selectedTopic.name)}`)}
              >
                Practice Entire Topic
              </Button>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="bg-slate-50 text-slate-500 border-b">
                  <tr>
                    <th className="px-5 py-3 font-semibold">Concept & Questions</th>
                    <th className="px-5 py-3 font-semibold text-center">Type</th>
                    <th className="px-5 py-3 font-semibold text-center">Marks</th>
                    <th className="px-5 py-3 font-semibold text-center">Year</th>
                    <th className="px-5 py-3 text-right font-semibold">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {selectedTopic.concepts && selectedTopic.concepts.length > 0 ? (
                    selectedTopic.concepts.map(concept => (
                      <React.Fragment key={concept._id}>
                        {/* Concept Header Row */}
                        <tr className="bg-slate-50/50">
                          <td colSpan={5} className="px-5 py-3 font-semibold text-[#1A1A2E] text-[15px] border-b border-slate-200">
                            <div className="flex items-center gap-2">
                              <BookOpen className="w-4 h-4 text-[#4A235A]" />
                              {concept.title}
                              <Badge variant="secondary" className="ml-2 font-normal text-xs bg-slate-200 text-slate-600">
                                {concept.pyqs?.length || 0} PYQs
                              </Badge>
                            </div>
                          </td>
                        </tr>
                        
                        {/* PYQs rows for this concept */}
                        {concept.pyqs && concept.pyqs.length > 0 ? (
                          concept.pyqs.map(pyq => (
                            <tr key={pyq._id} className="hover:bg-slate-50/30 transition-colors text-sm group">
                              <td className="px-5 py-4 text-[#1A1A2E] max-w-[400px] truncate">
                                {/* Strip HTML tags for preview and show just a snippet */}
                                <div className="truncate text-muted-foreground text-xs font-serif" dangerouslySetInnerHTML={{ __html: pyq.question.replace(/<[^>]+>/g, '').substring(0, 100) + '...' }} />
                              </td>
                              <td className="px-5 py-4 text-center">
                                <span className="text-xs font-semibold bg-blue-50 text-blue-700 px-2 py-0.5 rounded">{pyq.meta.type || 'MCQ'}</span>
                              </td>
                              <td className="px-5 py-4 text-center">
                                <span className="text-xs font-medium bg-slate-100 text-slate-700 px-2 py-0.5 rounded">{pyq.meta.marks || 1} M</span>
                              </td>
                              <td className="px-5 py-4 text-center">
                                <span className="text-xs font-semibold">{pyq.meta.year || 'N/A'}</span>
                              </td>
                              <td className="px-5 py-4 text-right">
                                <Button 
                                  size="sm" 
                                  variant="ghost"
                                  className="h-8 opacity-0 group-hover:opacity-100 transition-opacity text-[#4A235A] hover:text-[#4A235A] hover:bg-[#4A235A]/10"
                                  onClick={() => router.push(`/gate/questions?subject=${encodeURIComponent(subject.name)}&topic=${encodeURIComponent(selectedTopic.name)}&concept=${encodeURIComponent(concept.title)}&qid=${pyq.qid}`)}
                                >
                                  Solve
                                </Button>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={5} className="px-5 py-4 text-sm text-muted-foreground italic pl-10 border-b border-slate-50">
                              No PYQs available for this concept yet.
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="px-5 py-8 text-center text-muted-foreground">
                        No concepts defined for this topic yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )
      })()}

    </div>
  )
}
