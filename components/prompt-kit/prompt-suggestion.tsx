"use client"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import React from "react"

interface PromptSuggestionProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link"
  size?: "default" | "sm" | "lg" | "icon"
  highlight?: string
  className?: string
}

export function PromptSuggestion({
  children,
  variant = "outline",
  size = "lg",
  highlight,
  className,
  ...props
}: PromptSuggestionProps) {
  // Helper function to highlight text
  const highlightText = (text: string, searchTerm: string) => {
    if (!searchTerm) return text
    
    const regex = new RegExp(`(${searchTerm})`, 'gi')
    const parts = text.split(regex)
    
    return parts.map((part, index) => {
      if (part.toLowerCase() === searchTerm.toLowerCase()) {
        return (
          <mark
            key={index}
            className="bg-yellow-200 dark:bg-yellow-900/50 text-foreground"
          >
            {part}
          </mark>
        )
      }
      return part
    })
  }

  // If highlight is provided, we're in highlight mode
  const isHighlightMode = highlight !== undefined
  const effectiveVariant = isHighlightMode ? "ghost" : variant
  const effectiveSize = isHighlightMode ? "sm" : size

  const content = typeof children === 'string' && highlight 
    ? highlightText(children, highlight)
    : children

  return (
    <Button
      variant={effectiveVariant}
      size={effectiveSize}
      className={cn(
        // Base styles for prompt suggestions
        "justify-start text-wrap break-words",
        // Normal mode (pill-shaped buttons)
        !isHighlightMode && [
          "rounded-full border-dashed",
          "hover:border-solid hover:bg-accent",
          "transition-all duration-200"
        ],
        // Highlight mode styles
        isHighlightMode && [
          "rounded-md text-left",
          "hover:bg-accent/50"
        ],
        className
      )}
      {...props}
    >
      {content}
    </Button>
  )
}

// Alternative simpler version for basic use cases
export function PromptPill({
  children,
  onClick,
  className,
  ...props
}: {
  children: React.ReactNode
  onClick?: () => void
  className?: string
} & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <Button
      variant="outline"
      size="sm"
      onClick={onClick}
      className={cn(
        "rounded-full border-dashed px-3 py-1",
        "hover:border-solid hover:bg-accent",
        "text-sm transition-all duration-200",
        className
      )}
      {...props}
    >
      {children}
    </Button>
  )
}
