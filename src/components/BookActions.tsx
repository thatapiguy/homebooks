'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Trash2, Pencil } from 'lucide-react'
import Link from 'next/link'
import { Button } from './ui/button'
import { StarRating } from './StarRating'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'

interface BookActionsProps {
  bookId: string
  initialRating: number | null
  initialStatus: string
}

export function BookActions({ bookId, initialRating, initialStatus }: BookActionsProps) {
  const router = useRouter()
  const [rating, setRating] = useState(initialRating)
  const [status, setStatus] = useState(initialStatus)

  async function update(data: Record<string, unknown>) {
    try {
      const res = await fetch(`/api/books/${bookId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) throw new Error()
      toast.success('Updated')
      router.refresh()
    } catch {
      toast.error('Failed to update')
    }
  }

  async function handleRating(newRating: number | null) {
    setRating(newRating)
    await update({ rating: newRating })
  }

  async function handleStatus(newStatus: string) {
    setStatus(newStatus)
    await update({ status: newStatus })
  }

  async function deleteBook() {
    if (!confirm('Delete this book? This cannot be undone.')) return
    try {
      const res = await fetch(`/api/books/${bookId}`, { method: 'DELETE' })
      if (!res.ok) throw new Error()
      toast.success('Book deleted')
      router.push('/library')
    } catch {
      toast.error('Failed to delete book')
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      <StarRating rating={rating} onChange={handleRating} size="lg" />

      <Select value={status} onValueChange={handleStatus}>
        <SelectTrigger className="w-36 h-9">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="want_to_read">Want to Read</SelectItem>
          <SelectItem value="reading">Reading</SelectItem>
          <SelectItem value="read">Read</SelectItem>
        </SelectContent>
      </Select>

      <Button asChild variant="outline" size="sm">
        <Link href={`/books/${bookId}/edit`}>
          <Pencil className="h-4 w-4 mr-1" />
          Edit
        </Link>
      </Button>

      <Button variant="ghost" size="sm" onClick={deleteBook} className="text-destructive hover:text-destructive">
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  )
}
