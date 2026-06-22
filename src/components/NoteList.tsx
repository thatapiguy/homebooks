'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { Trash2, Quote, FileText, Plus } from 'lucide-react'
import { Button } from './ui/button'
import { Textarea } from './ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { Input } from './ui/input'
import { Label } from './ui/label'
import type { Note } from '@/types'

interface NoteListProps {
  bookId: string
  initialNotes: Note[]
}

export function NoteList({ bookId, initialNotes }: NoteListProps) {
  const [notes, setNotes] = useState(initialNotes)
  const [adding, setAdding] = useState(false)
  const [content, setContent] = useState('')
  const [type, setType] = useState<'note' | 'quote'>('note')
  const [page, setPage] = useState('')
  const [saving, setSaving] = useState(false)

  async function addNote() {
    if (!content.trim()) return
    setSaving(true)
    try {
      const res = await fetch(`/api/books/${bookId}/notes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: content.trim(),
          type,
          pageNumber: page ? parseInt(page, 10) : null,
        }),
      })
      if (!res.ok) throw new Error()
      const note = await res.json()
      setNotes([note, ...notes])
      setContent('')
      setPage('')
      setAdding(false)
      toast.success('Note added')
    } catch {
      toast.error('Failed to add note')
    } finally {
      setSaving(false)
    }
  }

  async function deleteNote(id: string) {
    try {
      const res = await fetch(`/api/books/${bookId}/notes/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error()
      setNotes(notes.filter((n) => n.id !== id))
      toast.success('Note deleted')
    } catch {
      toast.error('Failed to delete note')
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Notes & Quotes</h2>
        <Button size="sm" variant="outline" onClick={() => setAdding(!adding)}>
          <Plus className="h-4 w-4 mr-1" />
          Add
        </Button>
      </div>

      {adding && (
        <div className="rounded-lg border p-4 space-y-3 bg-muted/30">
          <div className="flex gap-3">
            <div className="flex-1">
              <Label className="mb-1.5 block">Type</Label>
              <Select value={type} onValueChange={(v) => setType(v as 'note' | 'quote')}>
                <SelectTrigger className="h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="note">Note</SelectItem>
                  <SelectItem value="quote">Quote</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="w-24">
              <Label className="mb-1.5 block">Page</Label>
              <Input
                type="number"
                placeholder="Optional"
                value={page}
                onChange={(e) => setPage(e.target.value)}
                className="h-9"
              />
            </div>
          </div>
          <Textarea
            placeholder={type === 'quote' ? 'Enter a memorable quote…' : 'Enter your note…'}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={3}
          />
          <div className="flex gap-2">
            <Button size="sm" onClick={addNote} disabled={saving || !content.trim()}>
              {saving ? 'Saving…' : 'Save'}
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setAdding(false)}>
              Cancel
            </Button>
          </div>
        </div>
      )}

      {notes.length === 0 && !adding ? (
        <p className="text-sm text-muted-foreground text-center py-6">
          No notes yet. Add a note or memorable quote.
        </p>
      ) : (
        <div className="space-y-3">
          {notes.map((note) => (
            <div key={note.id} className="group relative rounded-lg border p-4">
              <div className="flex items-start gap-3">
                <div className="mt-0.5 flex-shrink-0 text-muted-foreground">
                  {note.type === 'quote' ? (
                    <Quote className="h-4 w-4" />
                  ) : (
                    <FileText className="h-4 w-4" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  {note.type === 'quote' ? (
                    <blockquote className="border-l-2 border-primary pl-3 text-sm italic">
                      {note.content}
                    </blockquote>
                  ) : (
                    <p className="text-sm">{note.content}</p>
                  )}
                  {note.pageNumber && (
                    <p className="mt-1 text-xs text-muted-foreground">Page {note.pageNumber}</p>
                  )}
                </div>
              </div>
              <button
                onClick={() => deleteNote(note.id)}
                className="absolute right-3 top-3 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
                aria-label="Delete note"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
