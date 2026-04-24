import { redirect } from 'next/navigation'

async function getSubject(slug: string) {
  try {
    // In server components we should query DB directly or use absolute fetch URL.
    // For simplicity, since the layout handles fetching subject UI, we can just fetch here
    // or query DB. Wait, this is a Server Component, so we can use MongoDB directly.
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
    // The layout will show "Not Found / Coming Soon" anyway
    return null
  }
  
  const firstTopic = subject.topics?.[0]
  if (firstTopic) {
    redirect(`/gate/${subject.slug}/${firstTopic.slug}`)
  }
  
  // If subject exists but has no topics
  return (
    <div className="bg-white rounded-xl border border-gray-200 text-center py-20">
      <p className="text-gray-400 text-lg">Content coming soon for this subject.</p>
    </div>
  )
}
