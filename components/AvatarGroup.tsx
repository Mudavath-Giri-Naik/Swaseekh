'use client'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'

const users = [
  { id: '1', name: 'Aarav Sharma', avatar: 'https://i.pravatar.cc/150?img=11' },
  { id: '2', name: 'Ishita Reddy', avatar: 'https://i.pravatar.cc/150?img=47' },
  { id: '3', name: 'Rohan Iyer', avatar: 'https://i.pravatar.cc/150?img=33' },
  { id: '4', name: 'Priya Nair', avatar: 'https://i.pravatar.cc/150?img=45' },
  { id: '5', name: 'Karthik Menon', avatar: 'https://i.pravatar.cc/150?img=53' },
]

export default function AvatarGroup() {
  return (
    <TooltipProvider delayDuration={120}>
      <div className="flex -space-x-2">
        {users.map((user) => (
          <Tooltip key={user.id}>
            <TooltipTrigger asChild>
              <Avatar className="h-7 w-7 cursor-pointer ring-2 ring-white transition-transform hover:z-10 hover:scale-110">
                <AvatarImage src={user.avatar} alt={user.name} />
                <AvatarFallback>{user.name[0]}</AvatarFallback>
              </Avatar>
            </TooltipTrigger>
            <TooltipContent className="bg-slate-900 text-white">
              {user.name}
            </TooltipContent>
          </Tooltip>
        ))}
      </div>
    </TooltipProvider>
  )
}
