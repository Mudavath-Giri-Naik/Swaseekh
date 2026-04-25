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
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
} from "@/components/ui/sidebar"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

export function SidebarToc() {
  const { 
    subjectTopics, subjectName, activeSectionId, 
    isQuestionsMode, selectedTopicId, setSelectedTopicId, 
    selectedSubtopicId, setSelectedSubtopicId, clearSubjectData,
    subjectQuestionCount
  } = useSidebarData()
  const { isMobile, setOpenMobile } = useSidebar()

  if (!subjectTopics || subjectTopics.length === 0) return null

  const handleClick = (id: string, slug: string, isSubtopic: boolean) => {
    if (isQuestionsMode) {
      if (isSubtopic) {
        setSelectedSubtopicId(id)
      } else {
        setSelectedTopicId(id)
        setSelectedSubtopicId(null) // reset subtopic when topic changes
      }
    } else {
      if (isMobile) setOpenMobile(false)
      const el = document.getElementById(isSubtopic ? `subtopic-${slug}` : `topic-${slug}`)
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "start" })
      }
    }
  }

  const getIsActive = (id: string, isSubtopic: boolean) => {
    if (isQuestionsMode) {
      return isSubtopic ? selectedSubtopicId === id : selectedTopicId === id
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
                  isActive={getIsActive(topic._id, false)}
                  onClick={() => handleClick(topic._id, topic.slug, false)}
                  className="font-medium flex justify-between w-full"
                >
                  <span className="truncate">{topic.name}</span>
                  {isQuestionsMode && (
                    <span className="text-[10px] opacity-60 shrink-0">({topic.questionCount})</span>
                  )}
                </SidebarMenuButton>
                {topic.subtopics && topic.subtopics.length > 0 && (
                  <SidebarMenuSub>
                    {isQuestionsMode && (
                      <SidebarMenuSubItem>
                        <SidebarMenuSubButton
                          isActive={getIsActive(topic._id, false) && selectedSubtopicId === null}
                          onClick={() => { setSelectedSubtopicId(null); setSelectedTopicId(topic._id); }}
                          className="cursor-pointer flex justify-between w-full"
                        >
                          <span className="truncate">All Subtopics</span>
                          <span className="text-[10px] opacity-60 shrink-0">({topic.questionCount})</span>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                    )}
                    {topic.subtopics.map((sub) => (
                      <SidebarMenuSubItem key={sub._id}>
                        <SidebarMenuSubButton
                          isActive={getIsActive(sub._id, true)}
                          onClick={() => handleClick(sub._id, sub.slug, true)}
                          className="cursor-pointer flex justify-between w-full"
                        >
                          <span className="truncate">{sub.name}</span>
                          {isQuestionsMode && (
                            <span className="text-[10px] opacity-60 shrink-0">({sub.questionCount})</span>
                          )}
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                    ))}
                  </SidebarMenuSub>
                )}
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>
    </>
  )
}
