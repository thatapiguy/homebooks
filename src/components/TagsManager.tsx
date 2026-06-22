'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { Plus, Trash2, BookOpen } from 'lucide-react'
import Link from 'next/link'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { TagBadge } from './TagBadge'
import type { TagWithCount } from '@/types'

const TAG_COLORS = [
  '#6366f1', '#8b5cf6', '#ec4899', '#ef4444', '#f97316',
  '#eab308', '#10b981', '#14b8a6', '#06b6d4', '#3b82f6',
]

interface TagsManagerProps {
  initialTags: TagWithCount[]
}

export function TagsManager({ initialTags }: TagsManagerProps) {
  const [tags, setTags] = useState(initialTags)
  const [name, setName] = useState('')
  const [color, setColor] = useState(TAG_COLORS[0])
  const [saving, setSaving] = useState(false)

  async function create() {
    if (!name.trim()) return
    setSaving(true)
    try {
      const res = await fetch('/api/tags', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), color }),
      })
      if (!res.ok) {
        const err = await res.json()
        toast.error(err.error ?? 'Failed to create tag')
        return
      }
      const tag = await res.json()
      setTags((prev) => [...prev, { ...tag, _count: { books: 0 } }])
      setName('')
      toast.success('Tag created')
    } catch {
      toast.error('Failed to create tag')
    } finally {
      setSaving(false)
    }
  }

  async function remove(id: string) {
    if (!confirm('Delete this tag? It will be removed from all books.')) return
    try {
      const res = await fetch(`/api/tags/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error()
      setTags((prev) => prev.filter((t) => t.id !== id))
      toast.success('Tag deleted')
    } catch {
      toast.error('Failed to delete tag')
    }
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="rounded-lg border p-4 space-y-3">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Create Tag</h2>
        <div className="flex gap-3 items-end">
          <div className="flex-1">
            <Label htmlFor="tag-name" className="mb-1 block">Name</Label>
            <Input
              id="tag-name"
              placeholder="e.g. Sci-Fi, Kids, Gift"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && create()}
            />
          </div>
          <div>
            <Label className="mb-1 block">Color</Label>
            <div className="flex gap-1.5">
              {TAG_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className="h-7 w-7 rounded-full border-2 transition-transform hover:scale-110"
                  style={{
                    backgroundColor: c,
                    borderColor: color === c ? 'white' : 'transparent',
                    outline: color === c ? `2px solid ${c}` : 'none',
                  }}
                  title={c}
                />
              ))}
            </div>
          </div>
        </div>
        <Button onClick={create} disabled={saving || !name.trim()} size="sm">
          <Plus className="h-4 w-4 mr-1" />
          Create Tag
        </Button>
      </div>

      <div className="space-y-2">
        {tags.length === 0 ? (
          <p className="text-sm text-muted-foreground py-4">No tags yet. Create one above.</p>
        ) : (
          tags.map((tag) => (
            <div key={tag.id} className="flex items-center gap-3 rounded-lg border p-3">
              <TagBadge tag={tag} />
              <div className="flex-1" />
              <Link
                href={`/library?tagId=${tag.id}`}
                className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
              >
                <BookOpen className="h-3 w-3" />
                {tag._count.books} book{tag._count.books !== 1 ? 's' : ''}
              </Link>
              <Button
                size="icon"
                variant="ghost"
                className="h-8 w-8 text-destructive hover:text-destructive"
                onClick={() => remove(tag.id)}
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
