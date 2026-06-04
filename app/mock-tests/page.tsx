import { ClipboardCheck } from 'lucide-react'
import { AppHeader } from '@/components/app-header'

export default function MockTestsPage() {
  return (
    <div className="flex flex-col">
      <AppHeader title="Mock Tests" />
      <main className="mx-auto w-full max-w-7xl px-4 pb-12 pt-6 sm:px-6 sm:pt-8 lg:px-8">
        <div className="flex h-[60vh] flex-col items-center justify-center gap-4 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted">
            <ClipboardCheck className="h-8 w-8 text-muted-foreground" />
          </div>
          <div>
            <h2 className="text-xl font-semibold tracking-tight text-foreground">
              Coming Soon
            </h2>
            <p className="mt-1.5 text-sm text-muted-foreground">
              Mock tests are under construction. Check back soon.
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}
