import { cn } from '@/lib/utils'
import { STATUS_LABELS, STATUS_COLORS } from '@/lib/utils'

interface BookStatusBadgeProps {
  status: string
  className?: string
}

export function BookStatusBadge({ status, className }: BookStatusBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium',
        STATUS_COLORS[status] ?? 'bg-slate-100 text-slate-700',
        className
      )}
    >
      {STATUS_LABELS[status] ?? status}
    </span>
  )
}
