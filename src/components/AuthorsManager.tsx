'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Pencil, Trash2, Check, X, Plus, User, BookOpen } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from './ui/button'
import { Input } from './ui/input'
import type { AuthorWithCount } from '@/types'

interface AuthorsManagerProps {
  initialAuthors: AuthorWithCount[]
}

export function AuthorsManager({ initialAuthors }: AuthorsManagerProps) {
  const [authors, setAuthors] = useState(initialAuthors)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editName, setEditName] = useState('')
  const [newName, setNewName] = useState('')
  const [creating, setCreating] = useState(false)
  const [saving, setSaving] = useState(false)

  async function handleCreate() {
    if (!newName.trim()) return
    setCreating(true)
    try {
      const res = await fetch('/api/authors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newName.trim() }),
      })
      if (!res.ok) { toast.error('Failed to create author'); return }
      const author: AuthorWithCount = await res.json()
      setAuthors((prev) => [...prev, author].sort((a, b) => a.name.localeCompare(b.name)))
      setNewName('')
      toast.success('Author created')
    } finally {
      setCreating(false)
    }
  }

  async function handleSave(id: string) {
    if (!editName.trim()) return
    setSaving(true)
    try {
      const res = await fetch(`/api/authors/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: editName.trim() }),
      })
      if (!res.ok) { toast.error('Failed to update author'); return }
      const updated: AuthorWithCount = await res.json()
      setAuthors((prev) => prev.map((a) => (a.id === id ? updated : a)).sort((a, b) => a.name.localeCompare(b.name)))
      setEditingId(null)
      toast.success('Author updated')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id: string, name: string, bookCount: number) {
    if (bookCount > 0 && !confirm(`"${name}" has ${bookCount} book${bookCount !== 1 ? 's' : ''}. Delete anyway? Books will keep their data.`)) return
    const res = await fetch(`/api/authors/${id}`, { method: 'DELETE' })
    if (!res.ok) { toast.error('Failed to delete author'); return }
    setAuthors((prev) => prev.filter((a) => a.id !== id))
    toast.success('Author deleted')
  }

  return (
    <div className="space-y-4 max-w-lg">
      <div className="flex gap-2">
        <Input
          placeholder="New author name…"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleCreate())}
        />
        <Button onClick={handleCreate} disabled={creating || !newName.trim()}>
          <Plus className="h-4 w-4 mr-1" />
          Add
        </Button>
      </div>

      {authors.length === 0 ? (
        <p className="text-sm text-muted-foreground py-4">No authors yet. Authors are created when you add books.</p>
      ) : (
        <ul className="divide-y rounded-lg border">
          {authors.map((author) => (
            <li key={author.id} className="flex items-center gap-3 px-4 py-3">
              <User className="h-4 w-4 text-muted-foreground shrink-0" />

              {editingId === author.id ? (
                <Input
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') { e.preventDefault(); handleSave(author.id) }
                    if (e.key === 'Escape') setEditingId(null)
                  }}
                  className="h-7 text-sm"
                  autoFocus
                />
              ) : (
                <span className="flex-1 text-sm">
                  {author.name}
                  <span className="ml-2 text-xs text-muted-foreground">
                    {author._count.books} book{author._count.books !== 1 ? 's' : ''}
                  </span>
                </span>
              )}

              <div className="flex items-center gap-1 ml-auto">
                {editingId === author.id ? (
                  <>
                    <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => handleSave(author.id)} disabled={saving}>
                      <Check className="h-3.5 w-3.5" />
                    </Button>
                    <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => setEditingId(null)}>
                      <X className="h-3.5 w-3.5" />
                    </Button>
                  </>
                ) : (
                  <>
                    {author._count.books > 0 && (
                      <Button size="icon" variant="ghost" className="h-7 w-7" asChild title="View books">
                        <Link href={`/library?authorId=${author.id}`}>
                          <BookOpen className="h-3.5 w-3.5" />
                        </Link>
                      </Button>
                    )}
                    <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => { setEditingId(author.id); setEditName(author.name) }}>
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive hover:text-destructive" onClick={() => handleDelete(author.id, author.name, author._count.books)}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
