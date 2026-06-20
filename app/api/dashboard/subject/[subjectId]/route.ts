import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { connectDB } from '@/lib/mongodb'
import SubjectModel from '@/models/Subject'
import TopicModel from '@/models/Topic'
import ConceptModel from '@/models/Concept'
import QuestionModel from '@/models/Question'
import UserTopicProgressModel from '@/models/UserTopicProgress'
import UserQuestionAttemptModel from '@/models/UserQuestionAttempt'
import UserSubjectProgressModel from '@/models/UserSubjectProgress'

export async function GET(
  request: Request,
  { params }: { params: { subjectId: string } }
) {
  try {
    await connectDB()
    const session = await getServerSession(authOptions)
    const userId = session?.user ? (session.user as any).id : null

    const subjectId = params.subjectId

    // 1. Fetch Subject
    const subject = await SubjectModel.findOne({ _id: subjectId }).lean()
    if (!subject) {
      // It might be slugified in the URL, let's try to match by name
      // but wait, standard is using exact _id. We'll fallback to regex if needed.
      return NextResponse.json({ error: 'Subject not found' }, { status: 404 })
    }

    // 2. Fetch Topics for this subject, sorted by weightage desc
    const topics = await TopicModel.find({ subjectId }).sort({ weightage: -1, order: 1 }).lean()

    // 3. Fetch Concepts counts per topic
    const concepts = await ConceptModel.find({ subjectId }).lean()
    
    // 4. Fetch PYQs for this subject
    // Question model uses meta.subject to store subject name. Let's try to match by subject name
    const pyqs = await QuestionModel.find({ 'meta.subject': subject.name }).lean()

    // Aggregate counts
    let totalPyqs = pyqs.length
    let totalConcepts = concepts.length

    // Topic stats map
    const topicStats: Record<string, { totalConcepts: number; totalPyqs: number }> = {}
    topics.forEach(t => {
      topicStats[t._id] = { totalConcepts: 0, totalPyqs: 0 }
    })

    concepts.forEach(c => {
      if (topicStats[c.topicId]) {
        topicStats[c.topicId].totalConcepts++
      }
    })

    pyqs.forEach(q => {
      // topic name matching. We need to match q.meta.topic to Topic.name
      const topic = topics.find(t => t.name === q.meta.topic)
      if (topic) {
        topicStats[topic._id].totalPyqs++
      }
    })

    let userProgress = {
      overallAccuracy: 0,
      attemptedPyqs: 0,
      conceptsDecodeViewed: 0,
      timeSpentSeconds: 0,
      currentStreak: 0,
      lastViewedTopicId: null as string | null,
      topicProgress: {} as Record<string, any>,
      commonDistractor: null as string | null,
      yearWisePyqs: {} as Record<number, number>
    }

    // Calculate year-wise pyqs trend
    pyqs.forEach(q => {
      const year = q.meta.year
      if (year) {
        userProgress.yearWisePyqs[year] = (userProgress.yearWisePyqs[year] || 0) + 1
      }
    })

    if (userId) {
      // Fetch User Progress
      const topicProgressDocs = await UserTopicProgressModel.find({ userId, subjectId }).lean()
      const attempts = await UserQuestionAttemptModel.find({ userId, subjectId }).lean()
      const subjectProgress = await UserSubjectProgressModel.findOne({ userId, subjectId }).lean()

      if (subjectProgress) {
        userProgress.lastViewedTopicId = subjectProgress.lastViewedTopicId || null
      }

      let totalCorrect = 0
      let totalAttempted = attempts.length
      userProgress.attemptedPyqs = totalAttempted

      const distractorCounts: Record<string, number> = {}

      attempts.forEach(a => {
        if (a.isCorrect) totalCorrect++
        if (!a.isCorrect && a.distractorType) {
          distractorCounts[a.distractorType] = (distractorCounts[a.distractorType] || 0) + 1
        }
      })

      if (totalAttempted > 0) {
        userProgress.overallAccuracy = Math.round((totalCorrect / totalAttempted) * 100)
      }

      if (Object.keys(distractorCounts).length > 0) {
        userProgress.commonDistractor = Object.keys(distractorCounts).reduce((a, b) => distractorCounts[a] > distractorCounts[b] ? a : b)
      }

      topicProgressDocs.forEach(tp => {
        userProgress.timeSpentSeconds += tp.timeSpentSeconds
        userProgress.conceptsDecodeViewed += (tp.decodeViewedConceptIds || []).length
        userProgress.currentStreak = Math.max(userProgress.currentStreak, tp.currentStreak)

        userProgress.topicProgress[tp.topicId] = {
          conceptsReadCount: tp.conceptsReadCount,
          pyqsAttemptedCount: tp.pyqsAttemptedCount,
          pyqsCorrectCount: tp.pyqsCorrectCount,
          accuracy: tp.pyqsAttemptedCount > 0 ? Math.round((tp.pyqsCorrectCount / tp.pyqsAttemptedCount) * 100) : 0
        }
      })
    }

    // Assemble final response
    const dashboardData = {
      subject,
      topics: topics.map(t => {
        const topicConcepts = concepts.filter(c => c.topicId === t._id.toString() || c.topicId === t._id)
        
        return {
          ...t,
          stats: topicStats[t._id],
          userProgress: userProgress.topicProgress[t._id] || {
            conceptsReadCount: 0,
            pyqsAttemptedCount: 0,
            pyqsCorrectCount: 0,
            accuracy: 0
          },
          concepts: topicConcepts.map(c => {
            const conceptPyqs = pyqs.filter(q => q.meta?.topic === t.name && q.meta?.subtopic === c.title)
            return {
              ...c,
              pyqs: conceptPyqs
            }
          })
        }
      }),
      totalConcepts,
      totalPyqs,
      userProgress
    }

    return NextResponse.json(dashboardData)
  } catch (error) {
    console.error('[SubjectDashboardAPI] error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
