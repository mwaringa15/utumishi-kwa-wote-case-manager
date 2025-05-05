
import * as React from "react"
import { cn } from "@/lib/utils"

interface TimelineProps {
  children: React.ReactNode
  className?: string
}

export function Timeline({ children, className }: TimelineProps) {
  return (
    <div className={cn("space-y-4", className)}>
      {children}
    </div>
  )
}

interface TimelineItemProps {
  children: React.ReactNode
  className?: string
}

export function TimelineItem({ children, className }: TimelineItemProps) {
  return (
    <div className={cn("flex gap-3", className)}>
      {children}
    </div>
  )
}

interface TimelineIconProps {
  children: React.ReactNode
  className?: string
}

export function TimelineIcon({ children, className }: TimelineIconProps) {
  return (
    <div className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-full border bg-background", className)}>
      {children}
    </div>
  )
}

interface TimelineContentProps {
  children: React.ReactNode
  className?: string
}

export function TimelineContent({ children, className }: TimelineContentProps) {
  return (
    <div className={cn("flex-1 space-y-1", className)}>
      {children}
    </div>
  )
}

interface TimelineTitleProps {
  children: React.ReactNode
  className?: string
}

export function TimelineTitle({ children, className }: TimelineTitleProps) {
  return (
    <div className={cn("font-medium leading-none", className)}>
      {children}
    </div>
  )
}

interface TimelineDescriptionProps {
  children: React.ReactNode
  className?: string
}

export function TimelineDescription({ children, className }: TimelineDescriptionProps) {
  return (
    <div className={cn("text-sm text-muted-foreground", className)}>
      {children}
    </div>
  )
}

Timeline.Item = TimelineItem
Timeline.Icon = TimelineIcon
Timeline.Content = TimelineContent
Timeline.Title = TimelineTitle
Timeline.Description = TimelineDescription
