"use client"

import { FolderPlusIcon } from "@phosphor-icons/react"
import { useQuery } from "@tanstack/react-query"
import { useState } from "react"
import { DialogCreateProject } from "./dialog-create-project"
import { SidebarProjectItem } from "./sidebar-project-item"

type Project = {
  id: string
  name: string
  user_id: string
  created_at: string
}

export function SidebarProject() {
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const { data: projects = [], isLoading } = useQuery<Project[]>({
    queryKey: ["projects"],
    queryFn: async () => {
      try {
        const response = await fetch("/api/projects")
        if (!response.ok) {
          // If projects API doesn't exist (N8N backend), return empty array
          return []
        }
        return response.json()
      } catch (error) {
        // If fetch fails (N8N backend), return empty array
        console.log("Projects API not available, using N8N backend")
        return []
      }
    },
  })

  return (
    <div className="mb-5">
      {/* New Project button hidden for N8N backend */}
      {/* 
      <button
        className="hover:bg-accent/80 hover:text-foreground text-primary group/new-chat relative inline-flex w-full items-center rounded-md bg-transparent px-2 py-2 text-sm transition-colors"
        type="button"
        onClick={() => setIsDialogOpen(true)}
      >
        <div className="flex items-center gap-2">
          <FolderPlusIcon size={20} />
          New project
        </div>
      </button>
      */}

      {isLoading ? null : (
        <div className="space-y-1">
          {Array.isArray(projects) && projects.map((project) => (
            <SidebarProjectItem key={project.id} project={project} />
          ))}
        </div>
      )}

      {/* Dialog hidden for N8N backend */}
      {/* <DialogCreateProject isOpen={isDialogOpen} setIsOpen={setIsDialogOpen} /> */}
    </div>
  )
}
