'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { ScanLine, Loader2, Camera } from 'lucide-react'
import dynamic from 'next/dynamic'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Textarea } from './ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { StarRating } from './StarRating'
import { TagPicker } from './TagPicker'
import { AuthorPicker } from './AuthorPicker'
import type { BookWithRelations, Location } from '@/types'

const ISBNScanner = dynamic(() => import('./ISBNScanner').then((m) => ({ default: m.ISBNScanner })), {
  ssr: false,
})

interface BookFormProps {
  book?: BookWithRelations
  locations: Location[]
  initialIsbn?: string | null
}

type FormData = {
  isbn: string
  isbn13: string
  title: string
  authorId: string | null
  authorName: string
  publisher: string
  year: string
  description: string
  coverUrl: string
  pageCount: string
  rating: number | null
  status: string
  locationId: string
  tagIds: string[]
}

export function BookForm({ book, locations, initialIsbn }: BookFormProps) {
  const router = useRouter()
  const isEdit = !!book
  const didAutoLookup = useRef(false)
  const scanNext = useRef(false)
  const formRef = useRef<HTMLFormElement>(null)

  const [showScanner, setShowScanner] = useState(false)
  const [lookingUp, setLookingUp] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState<FormData>({
    isbn: book?.isbn ?? (initialIsbn?.length === 10 ? initialIsbn : ''),
    isbn13: book?.isbn13 ?? (initialIsbn?.length === 13 ? initialIsbn : ''),
    title: book?.title ?? '',
    authorId: book?.authorId ?? null,
    authorName: book?.author?.name ?? '',
    publisher: book?.publisher ?? '',
    year: book?.year?.toString() ?? '',
    description: book?.description ?? '',
    coverUrl: book?.coverUrl ?? '',
    pageCount: book?.pageCount?.toString() ?? '',
    rating: book?.rating ?? null,
    status: book?.status ?? 'want_to_read',
    locationId: book?.locationId ?? '',
    tagIds: book?.tags.map((bt: { tagId: string }) => bt.tagId) ?? [],
  })

  const set = (key: keyof FormData) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((prev) => ({ ...prev, [key]: e.target.value }))

  async function lookupISBN(isbn: string) {
    if (!isbn) return
    setLookingUp(true)
    try {
      const res = await fetch(`/api/lookup?isbn=${isbn}`)
      if (!res.ok) {
        // Store the scanned ISBN even if Open Library doesn't have it
        setForm((prev) => ({
          ...prev,
          isbn: isbn.length === 10 ? isbn : prev.isbn,
          isbn13: isbn.length === 13 ? isbn : prev.isbn13,
        }))
        toast.info('Book not found in Open Library — enter details manually')
        return
      }
      const data = await res.json()
      setForm((prev) => ({
        ...prev,
        isbn: data.isbn ?? (isbn.length === 10 ? isbn : prev.isbn),
        isbn13: data.isbn13 ?? (isbn.length === 13 ? isbn : prev.isbn13),
        title: data.title || prev.title,
        authorId: null,
        authorName: data.author || prev.authorName,
        publisher: data.publisher || prev.publisher,
        year: data.year?.toString() || prev.year,
        description: data.description || prev.description,
        coverUrl: data.coverUrl || prev.coverUrl,
        pageCount: data.pageCount?.toString() || prev.pageCount,
      }))
      toast.success('Book details loaded — review and save')
    } catch {
      toast.error('Failed to look up book')
    } finally {
      setLookingUp(false)
    }
  }

  useEffect(() => {
    if (initialIsbn && !isEdit && !didAutoLookup.current) {
      didAutoLookup.current = true
      lookupISBN(initialIsbn)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleScan = useCallback((isbn: string) => {
    setShowScanner(false)
    setForm((prev) => ({
      ...prev,
      isbn: isbn.length === 10 ? isbn : prev.isbn,
      isbn13: isbn.length === 13 ? isbn : prev.isbn13,
    }))
    lookupISBN(isbn)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.title.trim()) {
      toast.error('Title is required')
      return
    }
    setSaving(true)
    try {
      let resolvedAuthorId = form.authorId

      // If a name was typed but no author selected yet, find-or-create on submit
      if (!resolvedAuthorId && form.authorName.trim()) {
        const res = await fetch('/api/authors', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: form.authorName.trim() }),
        })
        if (res.ok) {
          const author = await res.json()
          resolvedAuthorId = author.id
        }
      }

      const payload = {
        isbn: form.isbn || null,
        isbn13: form.isbn13 || null,
        title: form.title,
        authorId: resolvedAuthorId || null,
        publisher: form.publisher || null,
        year: form.year ? parseInt(form.year, 10) : null,
        description: form.description || null,
        coverUrl: form.coverUrl || null,
        pageCount: form.pageCount ? parseInt(form.pageCount, 10) : null,
        rating: form.rating,
        status: form.status,
        locationId: form.locationId || null,
        tagIds: form.tagIds,
      }

      const url = isEdit ? `/api/books/${book.id}` : '/api/books'
      const method = isEdit ? 'PATCH' : 'POST'
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        const err = await res.json()
        toast.error(err.error ?? 'Failed to save book')
        return
      }

      const saved = await res.json()
      toast.success(isEdit ? 'Book updated' : 'Book added to library')
      if (scanNext.current) {
        scanNext.current = false
        router.push('/scan')
      } else {
        router.push(`/books/${saved.id}`)
      }
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      {showScanner && (
        <ISBNScanner onScan={handleScan} onClose={() => setShowScanner(false)} />
      )}

      <form ref={formRef} onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
        {/* ISBN */}
        <div className="rounded-lg border p-4 space-y-3">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">ISBN Lookup</h2>
          <div className="flex gap-2">
            <Input
              placeholder="ISBN-10 or ISBN-13"
              value={form.isbn13 || form.isbn}
              onChange={(e) => {
                const v = e.target.value.replace(/\D/g, '')
                setForm((prev) => ({
                  ...prev,
                  isbn: v.length === 10 ? v : prev.isbn,
                  isbn13: v.length === 13 ? v : prev.isbn13,
                }))
              }}
            />
            <Button
              type="button"
              variant="outline"
              onClick={() => lookupISBN(form.isbn13 || form.isbn)}
              disabled={lookingUp || (!form.isbn && !form.isbn13)}
            >
              {lookingUp ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Lookup'}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowScanner(true)}
              title="Scan barcode"
            >
              <ScanLine className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Core info */}
        <div className="space-y-4">
          <div>
            <Label htmlFor="title">Title *</Label>
            <Input id="title" value={form.title} onChange={set('title')} className="mt-1" required />
          </div>

          <div>
            <Label>Author</Label>
            <div className="mt-1">
              <AuthorPicker
                authorId={form.authorId}
                authorName={form.authorName}
                onChange={(authorId, authorName) => setForm((p) => ({ ...p, authorId, authorName }))}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="publisher">Publisher</Label>
              <Input id="publisher" value={form.publisher} onChange={set('publisher')} className="mt-1" />
            </div>
            <div>
              <Label htmlFor="year">Year</Label>
              <Input id="year" type="number" value={form.year} onChange={set('year')} className="mt-1" min={1000} max={2200} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="pageCount">Pages</Label>
              <Input id="pageCount" type="number" value={form.pageCount} onChange={set('pageCount')} className="mt-1" min={1} />
            </div>
            <div>
              <Label htmlFor="coverUrl">Cover URL</Label>
              <Input id="coverUrl" value={form.coverUrl} onChange={set('coverUrl')} className="mt-1" placeholder="https://…" />
            </div>
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" value={form.description} onChange={set('description')} className="mt-1" rows={3} />
          </div>
        </div>

        {/* Status & Rating */}
        <div className="space-y-4">
          <div>
            <Label>Status</Label>
            <Select value={form.status} onValueChange={(v) => setForm((p) => ({ ...p, status: v }))}>
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="want_to_read">Want to Read</SelectItem>
                <SelectItem value="reading">Reading</SelectItem>
                <SelectItem value="read">Read</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Rating</Label>
            <div className="mt-2">
              <StarRating rating={form.rating} onChange={(r) => setForm((p) => ({ ...p, rating: r }))} size="lg" />
            </div>
          </div>
        </div>

        {/* Location */}
        <div>
          <Label>Location</Label>
          <Select value={form.locationId || 'none'} onValueChange={(v) => setForm((p) => ({ ...p, locationId: v === 'none' ? '' : v }))}>
            <SelectTrigger className="mt-1">
              <SelectValue placeholder="Select location…" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">No location</SelectItem>
              {locations.map((loc) => (
                <SelectItem key={loc.id} value={loc.id}>
                  {loc.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Tags */}
        <div>
          <Label>Tags</Label>
          <div className="mt-2">
            <TagPicker
              selectedTagIds={form.tagIds}
              onChange={(ids) => setForm((p) => ({ ...p, tagIds: ids }))}
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-3 pt-2">
          <Button type="submit" disabled={saving}>
            {saving ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Saving…</> : isEdit ? 'Save Changes' : 'Add to Library'}
          </Button>
          {!isEdit && (
            <Button
              type="button"
              variant="outline"
              disabled={saving}
              onClick={() => {
                scanNext.current = true
                formRef.current?.requestSubmit()
              }}
            >
              <Camera className="h-4 w-4 mr-2" />
              Save & Scan Next
            </Button>
          )}
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Cancel
          </Button>
        </div>
      </form>
    </>
  )
}
