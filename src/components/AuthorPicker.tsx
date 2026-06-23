'use client'

import { useState, useEffect, useRef } from 'react'
import { X, Plus } from 'lucide-react'
import { Input } from './ui/input'
import { Button } from './ui/button'
import type { Author } from '@/types'

interface AuthorPickerProps {
  authorId: string | null
  authorName: string
  onChange: (authorId: string | null, authorName: string) => void
}

export function AuthorPicker({ authorId, authorName, onChange }: AuthorPickerProps) {
  const [authors, setAuthors] = useState<Author[]>([])
  const [input, setInput] = useState(authorName)
  const [open, setOpen] = useState(false)
  const [creating, setCreating] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetch('/api/authors').then((r) => r.json()).then(setAuthors)
  }, [])

  useEffect(() => {
    setInput(authorName)
    if (authorName && !authorId && authors.length > 0) {
      const match = authors.find((a) => a.name.toLowerCase() === authorName.toLowerCase())
      if (match) onChange(match.id, match.name)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authorName, authors])

  const filtered = input.trim()
    ? authors.filter((a) => a.name.toLowerCase().includes(input.toLowerCase()))
    : []
  const exactMatch = authors.find((a) => a.name.toLowerCase() === input.trim().toLowerCase())
  const showCreate = open && input.trim() && !exactMatch

  function selectAuthor(author: Author) {
    onChange(author.id, author.name)
    setInput(author.name)
    setOpen(false)
  }

  async function handleCreate() {
    if (!input.trim() || creating) return
    setCreating(true)
    try {
      const res = await fetch('/api/authors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: input.trim() }),
      })
      if (res.ok) {
        const author: Author = await res.json()
        setAuthors((prev) => [...prev, author].sort((a, b) => a.name.localeCompare(b.name)))
        onChange(author.id, author.name)
        setInput(author.name)
        setOpen(false)
      }
    } finally {
      setCreating(false)
    }
  }

  function handleBlur(e: React.FocusEvent) {
    if (containerRef.current?.contains(e.relatedTarget as Node)) return
    if (exactMatch) {
      onChange(exactMatch.id, exactMatch.name)
      setInput(exactMatch.name)
    } else if (!input.trim()) {
      onChange(null, '')
    }
    setOpen(false)
  }

  return (
    <div ref={containerRef} className="relative">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Input
            value={input}
            onChange={(e) => {
              setInput(e.target.value)
              setOpen(true)
              if (authorId && e.target.value !== authorName) {
                onChange(null, e.target.value)
              }
            }}
            onFocus={() => setOpen(true)}
            onBlur={handleBlur}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                if (filtered.length === 1) selectAuthor(filtered[0])
                else if (exactMatch) selectAuthor(exactMatch)
                else if (showCreate) handleCreate()
              }
              if (e.key === 'Escape') setOpen(false)
            }}
            placeholder="Search or add author…"
            className={input ? 'pr-8' : ''}
          />
          {input && (
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => { onChange(null, ''); setInput(''); setOpen(false) }}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
        {showCreate && (
          <Button type="button" size="sm" onClick={handleCreate} disabled={creating} className="shrink-0">
            <Plus className="h-4 w-4 mr-1" />
            Add
          </Button>
        )}
      </div>

      {open && filtered.length > 0 && (
        <div className="absolute z-10 mt-1 w-full rounded-md border bg-popover shadow-md max-h-48 overflow-y-auto">
          {filtered.slice(0, 8).map((author) => (
            <button
              key={author.id}
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => selectAuthor(author)}
              className={`flex w-full items-center px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground text-left ${author.id === authorId ? 'font-medium' : ''}`}
            >
              {author.name}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
