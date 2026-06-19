'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { Button } from '@/components/ui/button'
import { ExternalLink, BookOpen, Target, PieChart as PieChartIcon, Sidebar } from 'lucide-react'
import { useSidebar } from '@/components/ui/sidebar'

import { globalCache } from '@/lib/global-cache'

// Remove module-level Map, we will use sessionStorage for reliable cross-navigation caching.

export default function SubjectAnalyticsDashboard({ params }: { params: { subjectId: string } }) {
  const router = useRouter()
  const { toggleSidebar } = useSidebar()
  const [data, setData] = useState<any>(() => {
    if (typeof window !== 'undefined') {
      try {
        const cached = sessionStorage.getItem(`analytics_${params.subjectId}`)
        if (cached) return JSON.parse(cached)
      } catch (e) {}
    }
    return null
  })
  const [loading, setLoading] = useState(() => {
    if (typeof window !== 'undefined') {
      return !sessionStorage.getItem(`analytics_${params.subjectId}`)
    }
    return true
  })
  const [selectedConcept, setSelectedConcept] = useState<string | null>(null)

  useEffect(() => {
    if (data) return // Already loaded synchronously from sessionStorage

    // Pause any massive background prefetching to give this request priority
    globalCache.pauseBackgroundSync()

    fetch(`/api/dashboard/subject/${params.subjectId}/analytics`)
      .then(res => res.json())
      .then(d => {
        sessionStorage.setItem(`analytics_${params.subjectId}`, JSON.stringify(d))
        setData(d)
        setLoading(false)
      })
      .catch(e => {
        console.error(e)
        setLoading(false)
      })
  }, [params.subjectId, data])

  useEffect(() => {
    if (data && !selectedConcept && data.rankings && data.rankings.length > 0) {
      setSelectedConcept(data.rankings[0].name)
    }
  }, [data, selectedConcept])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[80vh]">
        <div className="w-6 h-6 border-2 border-t-[#5D3FD3] rounded-full animate-spin" />
      </div>
    )
  }

  if (!data || !data.subject) {
    return (
      <div className="p-4 text-center">
        <h2 className="text-lg font-bold text-red-600">Subject Not Found</h2>
        <Button onClick={() => router.push('/gate')} className="mt-3 bg-[#5D3FD3] h-8 text-xs">Back to Syllabus</Button>
      </div>
    )
  }

  const { stats, rankings, patternExamples, quickWins, grindZone, masteryGaps } = data
  const hasDifficultyTags = stats.difficulty.total > 0

  const activeConceptData = rankings.find((r: any) => r.name === selectedConcept)

  const getRepeatLabel = (score: number) => {
    if (score > 70) return { label: 'Very High', color: 'text-[#5D3FD3]', desc: 'Strong repetition' }
    if (score >= 40) return { label: 'Moderate', color: 'text-[#F26419]', desc: 'Moderate repetition' }
    return { label: 'Low', color: 'text-[#888]', desc: 'Low repetition' }
  }
  const repeatInfo = getRepeatLabel(stats.repeatPatternScore)

  return (
    <div className="max-w-[1400px] mx-auto p-3 lg:space-y-3 space-y-4 bg-[#FAFAFA] min-h-screen lg:h-[calc(100vh-2rem)] flex flex-col text-[#1A1A2E] overflow-y-auto lg:overflow-hidden">
      
      {/* 1. HEADER - COMPACT */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between bg-white rounded-xl p-3 shadow-sm border border-[#EBEBEB] shrink-0 gap-3 lg:gap-0">
        <div className="flex items-center gap-3">
          <button onClick={toggleSidebar} className="w-8 h-8 flex items-center justify-center text-[#888] hover:text-[#1A1A2E] hover:bg-[#F5F5F5] transition-colors rounded-md border border-transparent hover:border-[#EBEBEB]" title="Toggle Sidebar">
            <Sidebar size={16} />
          </button>
          <div className="w-10 h-10 rounded-lg bg-[#5D3FD3] text-white flex items-center justify-center text-lg font-serif italic shadow-sm shadow-[#5D3FD3]/20">
            f(x)
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight leading-tight">{data.subject.name}</h1>
            <p className="text-[#666] text-[10px]">Subject Analytics Dashboard</p>
          </div>
        </div>

        <div className="flex flex-wrap lg:flex-nowrap gap-3 w-full lg:w-auto">
          <div className="flex items-center gap-3 border border-[#EBEBEB] rounded-lg px-3 py-1.5 flex-1 lg:flex-none">
            <div className="w-7 h-7 rounded-md bg-[#F5F3FF] text-[#5D3FD3] flex items-center justify-center">
              <BookOpen size={14} />
            </div>
            <div>
              <div className="text-lg font-bold leading-none">{stats.totalPyqs}</div>
              <div className="text-[#666] text-[9px]">Questions Analyzed</div>
            </div>
            <a href="#" className="text-[#5D3FD3] text-[9px] font-medium ml-2 hover:underline flex items-center gap-0.5">Proof <ExternalLink size={10} /></a>
          </div>

          <div className="flex items-center gap-3 border border-[#EBEBEB] rounded-lg px-3 py-1.5 flex-1 lg:flex-none">
            <div className="relative w-8 h-8 flex items-center justify-center">
              <svg viewBox="0 0 36 36" className="w-full h-full transform -rotate-90">
                <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#F5F3FF" strokeWidth="4" />
                <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#5D3FD3" strokeWidth="4" strokeDasharray={`${stats.overallMastery}, 100`} />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center text-[10px] font-bold">{Math.round(stats.overallMastery)}%</div>
            </div>
            <div>
              <div className="text-xs font-bold leading-tight">Overall Mastery</div>
              <div className="text-[#666] text-[9px] max-w-[100px] leading-tight">Mastered {Math.round(stats.overallMastery)}%</div>
            </div>
            <a href="#" className="text-[#5D3FD3] text-[9px] font-medium hover:underline flex items-center gap-0.5">Proof <ExternalLink size={10} /></a>
          </div>
        </div>
      </div>

      {/* 2. TOP STATS STRIP - COMPACT */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 shrink-0">
        {/* Concepts Covered */}
        <div className="bg-white rounded-xl p-3 shadow-sm border border-[#EBEBEB] flex flex-col justify-center">
          <div className="flex justify-between items-start mb-1.5">
            <h3 className="font-semibold text-[11px]">Concepts Covered</h3>
            <a href="#" className="text-[#5D3FD3] text-[9px] flex items-center gap-0.5 hover:underline">Proof <ExternalLink size={8} /></a>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-[#F5F3FF] text-[#5D3FD3] flex items-center justify-center"><BookOpen size={14} /></div>
            <div>
              <div className="text-lg font-bold tracking-tight leading-none">
                {stats.conceptsCovered} <span className="text-xs text-[#888] font-medium">/ {stats.totalConcepts}</span>
              </div>
              <div className="text-[9px] text-[#666] mt-0.5">{stats.totalConcepts > 0 ? Math.round((stats.conceptsCovered/stats.totalConcepts)*100) : 0}% of concepts</div>
            </div>
          </div>
        </div>

        {/* Difficulty Split */}
        <div className="bg-white rounded-xl p-3 shadow-sm border border-[#EBEBEB] flex flex-col justify-center">
           <div className="flex justify-between items-start mb-1">
            <h3 className="font-semibold text-[11px]">Difficulty Split</h3>
            <a href="#" className="text-[#5D3FD3] text-[9px] flex items-center gap-0.5 hover:underline">Proof <ExternalLink size={8} /></a>
          </div>
          {hasDifficultyTags ? (
            <div className="flex items-center gap-2 h-[36px]">
              <div className="w-[36px] h-[36px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={[
                      { name: 'Easy', value: stats.difficulty.easy, color: '#00B67A' },
                      { name: 'Medium', value: stats.difficulty.medium, color: '#F26419' },
                      { name: 'Hard', value: stats.difficulty.hard, color: '#EF4444' }
                    ]} dataKey="value" innerRadius={12} outerRadius={18} paddingAngle={2}>
                      {[
                        { name: 'Easy', value: stats.difficulty.easy, color: '#00B67A' },
                        { name: 'Medium', value: stats.difficulty.medium, color: '#F26419' },
                        { name: 'Hard', value: stats.difficulty.hard, color: '#EF4444' }
                      ].map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex flex-col justify-center text-[9px] gap-0.5 flex-1">
                <div className="flex justify-between items-center"><div className="flex items-center gap-1"><div className="w-1.5 h-1.5 rounded-full bg-[#00B67A]" /> Easy</div><span className="text-[#666]">{Math.round((stats.difficulty.easy/stats.difficulty.total)*100)}%</span></div>
                <div className="flex justify-between items-center"><div className="flex items-center gap-1"><div className="w-1.5 h-1.5 rounded-full bg-[#F26419]" /> Med</div><span className="text-[#666]">{Math.round((stats.difficulty.medium/stats.difficulty.total)*100)}%</span></div>
                <div className="flex justify-between items-center"><div className="flex items-center gap-1"><div className="w-1.5 h-1.5 rounded-full bg-[#EF4444]" /> Hard</div><span className="text-[#666]">{Math.round((stats.difficulty.hard/stats.difficulty.total)*100)}%</span></div>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-[36px] text-[9px] text-[#888] bg-[#F5F5F5] rounded">
              Needs difficulty tags
            </div>
          )}
        </div>

        {/* Repeat Pattern Score */}
        <div className="bg-white rounded-xl p-3 shadow-sm border border-[#EBEBEB] flex flex-col justify-center">
          <div className="flex justify-between items-start mb-1.5">
            <h3 className="font-semibold text-[11px]">Repeat Pattern Score</h3>
            <a href="#" className="text-[#5D3FD3] text-[9px] flex items-center gap-0.5 hover:underline">Proof <ExternalLink size={8} /></a>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-[#F5F3FF] text-[#5D3FD3] flex items-center justify-center"><Target size={14} /></div>
            <div>
              <div className="text-lg font-bold tracking-tight leading-none">
                {Math.round(stats.repeatPatternScore)} <span className="text-xs text-[#888] font-medium">/ 100</span>
              </div>
              <div className={`text-[10px] font-bold mt-0.5 leading-tight ${repeatInfo.color}`}>{repeatInfo.label}</div>
            </div>
          </div>
        </div>

        {/* Subject Weightage */}
        <div className="bg-white rounded-xl p-3 shadow-sm border border-[#EBEBEB] flex flex-col justify-center">
          <div className="flex justify-between items-start mb-1.5">
            <h3 className="font-semibold text-[11px]">Subject Weightage</h3>
            <a href="#" className="text-[#5D3FD3] text-[9px] flex items-center gap-0.5 hover:underline">Proof <ExternalLink size={8} /></a>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-[#F5F3FF] text-[#5D3FD3] flex items-center justify-center"><PieChartIcon size={14} /></div>
            <div>
              <div className="text-lg font-bold tracking-tight leading-none">
                {stats.subjectWeightage.toFixed(1)}%
              </div>
              <div className="text-[9px] text-[#666] mt-0.5">of total weightage</div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. MIDDLE SECTION: Weightage Ranking + Year Trend - FLUID HEIGHT */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 flex-none lg:flex-1 lg:min-h-0">
        
        {/* Left: Concept Ranking */}
        <div className="bg-white rounded-xl p-3 shadow-sm border border-[#EBEBEB] flex flex-col h-full overflow-hidden min-h-[250px] lg:min-h-0">
          <div className="flex justify-between items-center mb-2 shrink-0">
            <div className="flex items-center gap-1.5">
              <h3 className="font-bold text-xs">Concept Weightage Ranking</h3>
              <span className="text-[9px] text-[#888] font-medium">(By frequency)</span>
            </div>
            <a href="#" className="text-[#5D3FD3] text-[9px] font-medium hover:underline flex items-center gap-0.5">Proof <ExternalLink size={8} /></a>
          </div>

          <div className="flex text-[9px] text-[#888] mb-1.5 px-1 shrink-0">
            <div className="w-6">#</div>
            <div className="flex-1"></div>
            <div className="w-16 text-right">% of Qs</div>
            <div className="w-16"></div>
          </div>

          <div className="flex-1 overflow-hidden space-y-1.5 pr-1">
            {rankings.slice(0, 5).map((r: any, idx: number) => {
              const maxWeightage = rankings[0]?.weightage || 100
              const barWidth = `${(r.weightage / maxWeightage) * 100}%`
              const isSelected = selectedConcept === r.name
              return (
                <div 
                  key={r.name} 
                  className={`flex items-center px-1.5 py-1 -mx-1.5 rounded-md cursor-pointer transition-colors ${isSelected ? 'bg-[#F5F3FF]' : 'hover:bg-[#F9F9F9]'}`}
                  onClick={() => setSelectedConcept(r.name)}
                >
                  <div className="w-6">
                    <div className="w-4 h-4 rounded-full bg-[#F5F3FF] text-[#5D3FD3] flex items-center justify-center text-[9px] font-bold">
                      {idx + 1}
                    </div>
                  </div>
                  <div className="flex-1 pr-2 min-w-0">
                    <div className="font-semibold text-[11px] mb-0.5 truncate">{r.name}</div>
                    <div className="w-full h-1.5 bg-[#F0F0F0] rounded-full overflow-hidden">
                      <div className="h-full bg-[#5D3FD3] rounded-full transition-all duration-500" style={{ width: barWidth }} />
                    </div>
                  </div>
                  <div className="w-16 text-right flex flex-col items-end justify-center">
                    <span className="font-bold text-[11px] leading-tight">{r.weightage.toFixed(1)}%</span>
                    <span className="text-[8px] text-[#888] leading-tight">{r.count} Qs</span>
                  </div>
                  <div className="w-16 flex justify-end">
                    <a href="#" className="text-[#5D3FD3] text-[9px] font-medium hover:underline flex items-center gap-0.5" onClick={e => e.stopPropagation()}>Proof <ExternalLink size={8} /></a>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Right: Year-wise Trend */}
        <div className="bg-white rounded-xl p-3 shadow-sm border border-[#EBEBEB] flex flex-col h-full overflow-hidden min-h-[250px] lg:min-h-0">
          <div className="flex justify-between items-start mb-1.5 shrink-0">
            <div>
              <h3 className="font-bold text-xs leading-tight">Year-wise Frequency Trend</h3>
              <p className="text-[10px] font-medium text-[#5D3FD3] leading-tight truncate max-w-[200px]">Top Concept: <span className="text-[#1A1A2E]">{selectedConcept}</span></p>
            </div>
            <div className="bg-[#F5F3FF] border border-[#5D3FD3]/20 text-[#5D3FD3] text-[9px] font-semibold px-2 py-0.5 rounded flex items-center gap-1">
              Proof: {activeConceptData?.yearsAppeared || 0}/10 yrs
            </div>
          </div>

          <div className="flex-1 w-full min-h-0 pt-2 pb-1">
            {activeConceptData && activeConceptData.yearTrend.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={activeConceptData.yearTrend} margin={{ top: 10, right: 0, left: -30, bottom: 0 }}>
                  <XAxis dataKey="year" axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: '#888' }} dy={5} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: '#888' }} />
                  <Tooltip 
                    cursor={{ fill: '#F9F9F9' }}
                    contentStyle={{ borderRadius: '6px', border: 'none', boxShadow: '0 2px 4px -1px rgb(0 0 0 / 0.1)', fontSize: '10px', padding: '4px 8px' }}
                  />
                  <Bar dataKey="count" fill="#9D84F5" radius={[2, 2, 0, 0]} barSize={20} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
               <div className="flex h-full items-center justify-center text-[10px] text-[#888]">No trend data</div>
            )}
          </div>
        </div>

      </div>

      {/* 4. REPEATING PATTERNS - COMPACT */}
      <div className="bg-white rounded-xl p-3 shadow-sm border border-[#EBEBEB] shrink-0">
        <div className="flex justify-between items-center mb-2">
          <div className="flex items-center gap-1.5">
            <h3 className="font-bold text-xs">Repeating Pattern Detected</h3>
            <a href="#" className="text-[#5D3FD3] text-[9px] font-medium hover:underline flex items-center gap-0.5">Proof <ExternalLink size={8} /></a>
          </div>
          <a href="#" className="text-[#5D3FD3] text-[9px] font-medium hover:underline flex items-center gap-0.5">View More <ExternalLink size={8} /></a>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {patternExamples.length > 0 ? patternExamples.slice(0,3).map((pattern: any, idx: number) => (
             <div key={idx} className="border border-[#EBEBEB] rounded-lg p-2 flex flex-col hover:border-[#5D3FD3]/30 transition-colors">
               <div className="flex items-start gap-2 mb-1.5">
                 <div className="bg-[#5D3FD3] text-white text-[9px] font-bold px-1.5 py-0.5 rounded leading-none mt-0.5">
                   {pattern.questions[0].year}
                 </div>
                 <p className="text-[10px] text-[#333] leading-snug line-clamp-2">
                   {pattern.questions[0].text}
                 </p>
               </div>
               <div className="mt-auto pt-1 flex items-center text-[#5D3FD3] text-[9px] font-medium hover:underline cursor-pointer gap-1">
                 Similar Pattern ({pattern.questions[1].year})
               </div>
             </div>
          )) : (
             <div className="col-span-3 text-center p-3 text-[10px] text-[#888] bg-[#F9F9F9] rounded-lg">
                No patterns detected.
             </div>
          )}
        </div>
      </div>

      {/* 5. BOTTOM ROW: Quick Wins, Grind Zone, Mastery Gap - COMPACT */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 shrink-0">
        
        {/* Quick Win Concepts */}
        <div className="bg-white rounded-xl p-3 shadow-sm border border-[#EBEBEB]">
          <div className="flex justify-between items-center mb-2">
            <div className="flex items-center gap-1.5">
              <h3 className="font-bold text-[11px] text-[#00B67A]">Quick Win Concepts</h3>
              <span className="text-[8px] bg-[#E5F7F1] text-[#00B67A] px-1 py-0.5 rounded border border-[#00B67A]/20 leading-none">Low Effort</span>
            </div>
            <a href="#" className="text-[#5D3FD3] text-[8px] hover:underline flex items-center gap-0.5">Proof <ExternalLink size={8} /></a>
          </div>

          <div className="flex text-[8px] text-[#888] mb-1.5 border-b border-[#F0F0F0] pb-1">
            <div className="flex-1">Concept</div>
            <div className="w-12 text-center">Wt.</div>
            <div className="w-12 text-right">Acc.</div>
          </div>

          <div className="space-y-1.5">
            {quickWins.length > 0 ? quickWins.slice(0,3).map((c: any) => (
              <div key={c.name} className="flex items-center justify-between text-[10px]">
                <div className="flex-1 font-semibold truncate pr-1" title={c.name}>{c.name}</div>
                <div className="w-12 flex items-center gap-1">
                  <span className="font-bold text-[9px] w-6">{c.weightage.toFixed(1)}%</span>
                  <div className="w-4 h-1 bg-[#F0F0F0] rounded-full overflow-hidden">
                    <div className="h-full bg-[#00B67A]" style={{ width: `${Math.min(c.weightage * 3, 100)}%` }} />
                  </div>
                </div>
                <div className="w-12 text-right font-bold text-[9px]">{Math.round(c.accuracy)}%</div>
              </div>
            )) : <div className="text-[9px] text-[#888]">No data.</div>}
          </div>
        </div>

        {/* Grind Zone Concepts */}
        <div className="bg-white rounded-xl p-3 shadow-sm border border-[#EBEBEB]">
          <div className="flex justify-between items-center mb-2">
            <div className="flex items-center gap-1.5">
              <h3 className="font-bold text-[11px] text-[#F26419]">Grind Zone</h3>
              <span className="text-[8px] bg-[#FEF0E8] text-[#F26419] px-1 py-0.5 rounded border border-[#F26419]/20 leading-none">High Effort</span>
            </div>
            <a href="#" className="text-[#5D3FD3] text-[8px] hover:underline flex items-center gap-0.5">Proof <ExternalLink size={8} /></a>
          </div>

          <div className="flex text-[8px] text-[#888] mb-1.5 border-b border-[#F0F0F0] pb-1">
            <div className="flex-1">Concept</div>
            <div className="w-12 text-center">Wt.</div>
            <div className="w-12 text-right">Acc.</div>
          </div>

          <div className="space-y-1.5">
             {grindZone.length > 0 ? grindZone.slice(0,3).map((c: any) => (
              <div key={c.name} className="flex items-center justify-between text-[10px]">
                <div className="flex-1 font-semibold truncate pr-1" title={c.name}>{c.name}</div>
                <div className="w-12 flex items-center gap-1">
                  <span className="font-bold text-[9px] w-6">{c.weightage.toFixed(1)}%</span>
                  <div className="w-4 h-1 bg-[#F0F0F0] rounded-full overflow-hidden">
                    <div className="h-full bg-[#F26419]" style={{ width: `${Math.min(c.weightage * 3, 100)}%` }} />
                  </div>
                </div>
                <div className="w-12 text-right font-bold text-[9px]">{Math.round(c.accuracy)}%</div>
              </div>
            )) : <div className="text-[9px] text-[#888]">No data.</div>}
          </div>
        </div>

        {/* Mastery Gap */}
        <div className="bg-white rounded-xl p-3 shadow-sm border border-[#EBEBEB]">
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-bold text-[11px] text-[#EF4444]">Mastery Gap</h3>
            <div className="flex items-center gap-2">
               <div className="flex items-center gap-0.5 text-[8px] text-[#666]"><div className="w-1 h-1 rounded-full bg-[#5D3FD3]"></div> Wt.</div>
               <div className="flex items-center gap-0.5 text-[8px] text-[#666]"><div className="w-1 h-1 rounded-full bg-[#EF4444]"></div> Acc.</div>
            </div>
          </div>

          <div className="flex text-[8px] text-[#888] mb-1.5 border-b border-[#F0F0F0] pb-1">
            <div className="w-20">Concept</div>
            <div className="flex-1"></div>
            <div className="w-8"></div>
          </div>

          <div className="space-y-1.5">
             {masteryGaps.length > 0 ? masteryGaps.slice(0,3).map((c: any) => {
               const maxW = masteryGaps[0]?.weightage || 100
               return (
                <div key={c.name} className="flex items-center text-[10px]">
                  <div className="w-20 font-semibold truncate pr-1 text-[9px]" title={c.name}>{c.name}</div>
                  <div className="flex-1 flex flex-col gap-0.5 pl-1">
                    <div className="w-full h-1 bg-[#F0F0F0] rounded-full overflow-hidden">
                      <div className="h-full bg-[#5D3FD3] rounded-full" style={{ width: `${(c.weightage / maxW) * 100}%` }} />
                    </div>
                    <div className="w-full h-1 bg-[#F0F0F0] rounded-full overflow-hidden">
                      <div className="h-full bg-[#EF4444]" style={{ width: `${c.accuracy}%` }} />
                    </div>
                  </div>
                  <div className="w-8 flex flex-col items-end text-[8px] font-bold gap-px">
                    <span className="text-[#5D3FD3] leading-none">{c.weightage.toFixed(1)}%</span>
                    <span className="text-[#EF4444] leading-none">{Math.round(c.accuracy)}%</span>
                  </div>
                </div>
               )
             }) : <div className="text-[9px] text-[#888]">No data.</div>}
          </div>
        </div>

      </div>

    </div>
  )
}
