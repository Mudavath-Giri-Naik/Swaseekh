"use client"

import { useSidebarData } from "@/components/sidebar-context"
import { useSidebar } from "@/components/ui/sidebar"
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

export function SidebarToc() {
  const { 
    subjectTopics, subjectName, activeSectionId, 
    isQuestionsMode, selectedTopicId, setSelectedTopicId, 
    clearSubjectData,
    subjectQuestionCount
  } = useSidebarData()
  const { isMobile, setOpenMobile } = useSidebar()

  if (!subjectTopics || subjectTopics.length === 0) return null

  const handleClick = (id: string, slug: string, isSubtopic: boolean) => {
    if (isQuestionsMode) {
      setSelectedTopicId(id)
    } else {
      if (isMobile) setOpenMobile(false)
      const el = document.getElementById(id) || document.getElementById(`topic-${slug}`)
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "start" })
      }
    }
  }

  const getIsActive = (id: string) => {
    if (isQuestionsMode) {
      return selectedTopicId === id
    }
    return activeSectionId === id
  }

  return (
    <>
      <SidebarGroup>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <Link href="/gate" onClick={() => clearSubjectData()}>
                <ArrowLeft className="h-4 w-4" />
                <span>Back to Syllabus</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarGroup>

      <SidebarGroup>
        <SidebarGroupLabel>
          <div className="flex items-center justify-between w-full">
            <span>{subjectName}</span>
            {isQuestionsMode && subjectQuestionCount !== null && (
              <span className="text-xs bg-sidebar-accent px-1.5 py-0.5 rounded-md text-sidebar-accent-foreground font-medium opacity-80">
                {subjectQuestionCount}
              </span>
            )}
          </div>
        </SidebarGroupLabel>
        <SidebarGroupContent>
          <SidebarMenu>
            {subjectTopics.map((topic) => (
              <SidebarMenuItem key={topic._id}>
                <SidebarMenuButton
                  isActive={getIsActive(topic._id)}
                  onClick={() => handleClick(topic._id, topic.slug, false)}
                  className="font-medium flex justify-between w-full"
                >
                  <span className="truncate">{topic.name}</span>
                  {isQuestionsMode && (
                    <span className="text-[10px] opacity-60 shrink-0">({topic.questionCount})</span>
                  )}
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>
    </>
  )
}
