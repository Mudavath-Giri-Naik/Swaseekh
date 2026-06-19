import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { connectDB } from '@/lib/mongodb'
import Subject from '@/models/Subject'
import Question from '@/models/Question'
import UserQuestionAttempt from '@/models/UserQuestionAttempt'
import Concept from '@/models/Concept'

export async function GET(
  req: NextRequest,
  { params }: { params: { subjectId: string } }
) {
  try {
    await connectDB()
    const session = await getServerSession(authOptions)
    const userId = (session?.user as any)?.id

    const subject = await Subject.findOne({ _id: params.subjectId }).lean()
    if (!subject) {
      return NextResponse.json({ error: 'Subject not found' }, { status: 404 })
    }

    const subjectName = subject.name

    // 1. Fetch all PYQs for this subject
    const pyqs = await Question.find({ 'meta.subject': subjectName }).lean()
    const totalSubjectPyqs = pyqs.length

    // 2. Fetch total PYQs across all subjects
    const totalOverallPyqs = await Question.countDocuments()
    const subjectWeightage = totalOverallPyqs > 0 ? (totalSubjectPyqs / totalOverallPyqs) * 100 : 0

    // 3. Difficulty Split
    let easy = 0, medium = 0, hard = 0
    pyqs.forEach(q => {
      const d = (q.meta?.difficulty || '').toLowerCase()
      if (d === 'easy') easy++
      else if (d === 'medium') medium++
      else if (d === 'hard') hard++
    })
    
    // 4. Concepts tracking
    const conceptsInDB = await Concept.find({ 'meta.subject': subjectName }).lean()
    // Subtopics from PYQs as fallback if concepts table is empty
    const uniqueConcepts = new Set(pyqs.map(q => q.meta?.subtopic).filter(Boolean))
    const totalConcepts = Math.max(conceptsInDB.length, uniqueConcepts.size)

    // User attempts
    let attemptedConcepts = new Set<string>()
    let userAttemptsMap = new Map<string, any[]>() // conceptName -> attempts
    
    if (userId) {
      const attempts = await UserQuestionAttempt.find({ 
        userId, 
        subjectId: params.subjectId 
      }).lean()
      
      attempts.forEach(a => {
        // Find corresponding question to get concept
        const q = pyqs.find(p => p.id === a.questionId)
        if (q && q.meta?.subtopic) {
          attemptedConcepts.add(q.meta.subtopic)
          if (!userAttemptsMap.has(q.meta.subtopic)) {
            userAttemptsMap.set(q.meta.subtopic, [])
          }
          userAttemptsMap.get(q.meta.subtopic)!.push(a)
        }
      })
    }

    // Overall mastery
    let overallMastery = 0;
    if (userAttemptsMap.size > 0) {
      let totalAcc = 0;
      userAttemptsMap.forEach((attempts) => {
        const correct = attempts.filter(a => a.isCorrect).length;
        totalAcc += (correct / attempts.length) * 100;
      })
      overallMastery = totalAcc / userAttemptsMap.size;
    }

    // 5. Build concept-level stats
    const conceptStats = new Map<string, { count: number, years: Set<number>, questions: any[], totalSteps: number, pyqWithStepsCount: number }>()
    pyqs.forEach(q => {
      const concept = q.meta?.subtopic
      if (!concept) return
      
      if (!conceptStats.has(concept)) {
        conceptStats.set(concept, { count: 0, years: new Set(), questions: [], totalSteps: 0, pyqWithStepsCount: 0 })
      }
      
      const stats = conceptStats.get(concept)!
      stats.count++
      if (q.meta?.year) stats.years.add(q.meta.year)
      stats.questions.push(q)
      
      const steps = q.solution?.steps?.length || 0
      if (steps > 0) {
        stats.totalSteps += steps
        stats.pyqWithStepsCount++
      }
    })

    // 6. Repeat Pattern Score
    // Formula: Concepts where >1 PYQ across different years share similar tags/keywords
    let repeatingConcepts = 0
    let patternExamples: any[] = []
    
    conceptStats.forEach((stats, conceptName) => {
      if (stats.years.size > 1 && stats.count > 1) {
        repeatingConcepts++
        // Pick an example if we haven't picked enough
        if (patternExamples.length < 3) {
          // Find two questions from different years
          const q1 = stats.questions[0]
          const q2 = stats.questions.find(q => q.meta.year !== q1.meta.year)
          if (q1 && q2) {
            patternExamples.push({
              concept: conceptName,
              questions: [
                { id: q1.id, year: q1.meta.year, text: q1.question },
                { id: q2.id, year: q2.meta.year, text: q2.question }
              ]
            })
          }
        }
      }
    })
    const repeatPatternScore = totalConcepts > 0 ? (repeatingConcepts / totalConcepts) * 100 : 0

    // 7. Rankings & Arrays
    const conceptRanking = Array.from(conceptStats.entries()).map(([name, stats]) => {
      const weightage = totalSubjectPyqs > 0 ? (stats.count / totalSubjectPyqs) * 100 : 0
      const yearsAppeared = stats.years.size
      
      // Calculate year-wise trend for the last 10 years (2015-2024)
      const yearTrend = []
      for (let y = 2015; y <= 2024; y++) {
        yearTrend.push({
          year: y,
          count: stats.questions.filter(q => q.meta.year === y).length
        })
      }

      // Effort
      const avgEffort = stats.pyqWithStepsCount > 0 ? (stats.totalSteps / stats.pyqWithStepsCount) : 0

      // Accuracy
      let accuracy = 0
      if (userAttemptsMap.has(name)) {
        const attempts = userAttemptsMap.get(name)!
        const correct = attempts.filter(a => a.isCorrect).length
        accuracy = (correct / attempts.length) * 100
      }

      return {
        name,
        count: stats.count,
        weightage,
        yearsAppeared,
        yearTrend,
        avgEffort,
        accuracy,
        masteryGap: weightage - accuracy
      }
    }).sort((a, b) => b.weightage - a.weightage)

    // Calculate medians for Quick Wins / Grind Zone
    const medians = {
      weightage: 0,
      effort: 0
    }
    if (conceptRanking.length > 0) {
      const sortedW = [...conceptRanking].sort((a,b) => a.weightage - b.weightage)
      medians.weightage = sortedW[Math.floor(sortedW.length/2)].weightage
      
      const sortedE = [...conceptRanking].sort((a,b) => a.avgEffort - b.avgEffort)
      medians.effort = sortedE[Math.floor(sortedE.length/2)].avgEffort
    }

    const quickWins = conceptRanking.filter(c => c.weightage > medians.weightage && c.avgEffort <= medians.effort).slice(0, 5)
    const grindZone = conceptRanking.filter(c => c.weightage > medians.weightage && c.avgEffort > medians.effort).slice(0, 5)
    const masteryGaps = [...conceptRanking].sort((a, b) => b.masteryGap - a.masteryGap).slice(0, 5)

    const result = {
      subject: {
        id: subject._id,
        name: subject.name,
      },
      stats: {
        totalPyqs: totalSubjectPyqs,
        overallMastery,
        conceptsCovered: attemptedConcepts.size,
        totalConcepts,
        difficulty: {
          easy, medium, hard,
          total: easy + medium + hard
        },
        repeatPatternScore,
        subjectWeightage
      },
      rankings: conceptRanking,
      patternExamples,
      quickWins,
      grindZone,
      masteryGaps
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error('Analytics API error:', error)
    return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 })
  }
}
