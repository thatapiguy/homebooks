'use client'

import { useState, useEffect } from 'react'
import { Plus } from 'lucide-react'
import { TagBadge } from './TagBadge'
import { Input } from './ui/input'
import { Button } from './ui/button'
import type { Tag } from '@/types'

interface TagPickerProps {
  selectedTagIds: string[]
  onChange: (tagIds: string[]) => void
}

export function TagPicker({ selectedTagIds, onChange }: TagPickerProps) {
  const [allTags, setAllTags] = useState<Tag[]>([])
  const [input, setInput] = useState('')
  const [creating, setCreating] = useState(false)

  useEffect(() => {
    fetch('/api/tags').then((r) => r.json()).then(setAllTags)
  }, [])

  const selectedTags = allTags.filter((t) => selectedTagIds.includes(t.id))
  const availableTags = allTags.filter(
    (t) => !selectedTagIds.includes(t.id) && t.name.toLowerCase().includes(input.toLowerCase())
  )

  function toggleTag(tag: Tag) {
    if (selectedTagIds.includes(tag.id)) {
      onChange(selectedTagIds.filter((id) => id !== tag.id))
    } else {
      onChange([...selectedTagIds, tag.id])
    }
  }

  async function createTag() {
    if (!input.trim()) return
    setCreating(true)
    try {
      const res = await fetch('/api/tags', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: input.trim() }),
      })
      if (!res.ok) {
        // Tag might already exist; find it
        const found = allTags.find((t) => t.name.toLowerCase() === input.trim().toLowerCase())
        if (found) {
          toggleTag(found)
          setInput('')
        }
        return
      }
      const tag: Tag = await res.json()
      setAllTags((prev) => [...prev, tag])
      onChange([...selectedTagIds, tag.id])
      setInput('')
    } finally {
      setCreating(false)
    }
  }

  const noMatch = input.trim() && availableTags.length === 0 && !selectedTags.find(t => t.name.toLowerCase() === input.toLowerCase())

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-1 min-h-6">
        {selectedTags.map((tag) => (
          <TagBadge key={tag.id} tag={tag} onRemove={() => toggleTag(tag)} />
        ))}
      </div>

      <div className="flex gap-2">
        <Input
          placeholder="Search or create tag…"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), noMatch && createTag())}
          className="h-9"
        />
        {noMatch && (
          <Button type="button" size="sm" onClick={createTag} disabled={creating} className="h-9">
            <Plus className="h-4 w-4 mr-1" />
            Create
          </Button>
        )}
      </div>

      {input && availableTags.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {availableTags.slice(0, 10).map((tag) => (
            <button
              key={tag.id}
              type="button"
              onClick={() => { toggleTag(tag); setInput('') }}
              className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium text-white opacity-70 hover:opacity-100 transition-opacity"
              style={{ backgroundColor: tag.color }}
            >
              + {tag.name}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
