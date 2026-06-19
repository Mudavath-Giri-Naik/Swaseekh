import { connectDB } from '@/lib/mongodb'
import UserModel from '@/models/User'
import { Users, Mail, BadgeCheck, Clock, Crown } from 'lucide-react'

export const dynamic = 'force-dynamic'

function formatDate(dateStr: any) {
  if (!dateStr) return 'N/A'
  const date = new Date(dateStr)
  return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(date)
}

function formatDateTime(dateStr: any) {
  if (!dateStr) return 'N/A'
  const date = new Date(dateStr)
  return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: 'numeric' }).format(date)
}

export default async function AdminUsersPage() {
  await connectDB()
  
  // Fetch all users sorted by newest first
  const users = await UserModel.find({}).sort({ createdAt: -1 }).lean()
  
  const totalUsers = users.length
  const proUsers = users.filter((u) => u.plan === 'pro').length

  return (
    <div className="flex-1 space-y-6 p-6">
      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Registered Users</h2>
          <p className="text-muted-foreground mt-1">
            View and manage all students signed up on Swaseekh.
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border bg-card text-card-foreground shadow-sm p-6 flex flex-col gap-2">
          <div className="flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="tracking-tight text-sm font-medium">Total Users</h3>
            <Users className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="text-2xl font-bold">{totalUsers}</div>
        </div>
        <div className="rounded-xl border bg-card text-card-foreground shadow-sm p-6 flex flex-col gap-2">
          <div className="flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="tracking-tight text-sm font-medium">Pro Subscribers</h3>
            <Crown className="h-4 w-4 text-[#F26419]" />
          </div>
          <div className="text-2xl font-bold">{proUsers}</div>
        </div>
      </div>

      {/* Users Table */}
      <div className="rounded-md border bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="h-12 px-4 align-middle font-medium text-slate-500">Name</th>
                <th className="h-12 px-4 align-middle font-medium text-slate-500">Email</th>
                <th className="h-12 px-4 align-middle font-medium text-slate-500">Plan</th>
                <th className="h-12 px-4 align-middle font-medium text-slate-500 hidden md:table-cell">Joined</th>
                <th className="h-12 px-4 align-middle font-medium text-slate-500 hidden lg:table-cell">Last Login</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {users.map((user) => (
                <tr key={(user._id as any).toString()} className="transition-colors hover:bg-slate-50/50">
                  <td className="p-4 align-middle">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center shrink-0 overflow-hidden border">
                        {user.image ? (
                          <img src={user.image} alt={user.name || 'User'} className="h-full w-full object-cover" />
                        ) : (
                          <span className="text-xs font-semibold text-slate-500">
                            {user.name?.charAt(0)?.toUpperCase() || 'U'}
                          </span>
                        )}
                      </div>
                      <span className="font-medium text-slate-900">{user.name || 'Unknown'}</span>
                    </div>
                  </td>
                  <td className="p-4 align-middle text-slate-600">
                    <div className="flex items-center gap-1.5">
                      <Mail className="h-3 w-3 text-slate-400" />
                      {user.email}
                    </div>
                  </td>
                  <td className="p-4 align-middle">
                    <div className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold border ${user.plan === 'pro' ? 'border-orange-200 bg-orange-100 text-[#F26419]' : 'border-slate-200 bg-slate-100 text-slate-700'}`}>
                      {user.plan === 'pro' ? 'Pro' : 'Free'}
                    </div>
                  </td>
                  <td className="p-4 align-middle text-slate-500 hidden md:table-cell">
                    {formatDate(user.createdAt)}
                  </td>
                  <td className="p-4 align-middle text-slate-500 hidden lg:table-cell">
                    {user.lastLoginAt ? (
                      <div className="flex items-center gap-1.5">
                        <Clock className="h-3 w-3" />
                        {formatDateTime(user.lastLoginAt)}
                      </div>
                    ) : (
                      'N/A'
                    )}
                  </td>
                </tr>
              ))}
              
              {users.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-500">
                    No users found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
