
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

// Add the missing components needed for CaseDetails.tsx
interface TimelineConnectorProps {
  className?: string
}

export function TimelineConnector({ className }: TimelineConnectorProps) {
  return (
    <div className={cn("absolute h-full w-0.5 left-5 top-5 bg-border", className)} />
  )
}

interface TimelineHeaderProps {
  children: React.ReactNode
  className?: string
}

export function TimelineHeader({ children, className }: TimelineHeaderProps) {
  return (
    <div className={cn("flex items-center", className)}>
      {children}
    </div>
  )
}

interface TimelineBodyProps {
  children: React.ReactNode
  className?: string
}

export function TimelineBody({ children, className }: TimelineBodyProps) {
  return (
    <div className={cn("mt-2 ml-14", className)}>
      {children}
    </div>
  )
}

// Export all components through Timeline for dot notation access
Timeline.Item = TimelineItem
Timeline.Icon = TimelineIcon
Timeline.Content = TimelineContent
Timeline.Title = TimelineTitle
Timeline.Description = TimelineDescription
Timeline.Connector = TimelineConnector
Timeline.Header = TimelineHeader
Timeline.Body = TimelineBody
