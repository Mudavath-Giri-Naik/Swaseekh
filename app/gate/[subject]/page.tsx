import { redirect } from 'next/navigation'

async function getSubject(slug: string) {
  try {
    const { connectDB } = await import('@/lib/mongodb')
    const SubjectModel = (await import('@/models/Subject')).default
    await connectDB()
    
    const subject = await SubjectModel.findOne({ slug }).lean()
    return subject
  } catch (err) {
    return null
  }
}

export default async function SubjectIndexPage({ params }: { params: { subject: string } }) {
  const subject = await getSubject(params.subject)
  
  if (!subject) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 text-center py-20">
        <p className="text-gray-400 text-lg">Content coming soon for this subject.</p>
      </div>
    )
  }

  const typedSubject = subject as any
  
  if (!typedSubject.topics || typedSubject.topics.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 text-center py-20">
        <p className="text-gray-400 text-lg">No topics available yet.</p>
      </div>
    )
  }

  // Redirect to full CCD at the top (using 'all' to avoid scrolling down to a specific topic)
  redirect(`/gate/${params.subject}/all`)
}
