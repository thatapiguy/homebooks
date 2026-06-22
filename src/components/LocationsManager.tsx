'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { Plus, Trash2, BookOpen, Pencil, Check, X } from 'lucide-react'
import Link from 'next/link'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import type { LocationWithCount } from '@/types'

interface LocationsManagerProps {
  initialLocations: LocationWithCount[]
}

export function LocationsManager({ initialLocations }: LocationsManagerProps) {
  const [locations, setLocations] = useState(initialLocations)
  const [name, setName] = useState('')
  const [room, setRoom] = useState('')
  const [saving, setSaving] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editName, setEditName] = useState('')

  async function create() {
    if (!name.trim()) return
    setSaving(true)
    try {
      const res = await fetch('/api/locations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), room: room.trim() || null }),
      })
      if (!res.ok) throw new Error()
      const loc = await res.json()
      setLocations((prev) => [...prev, { ...loc, _count: { books: 0 } }])
      setName('')
      setRoom('')
      toast.success('Location created')
    } catch {
      toast.error('Failed to create location')
    } finally {
      setSaving(false)
    }
  }

  async function save(id: string) {
    if (!editName.trim()) return
    try {
      const res = await fetch(`/api/locations/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: editName.trim() }),
      })
      if (!res.ok) throw new Error()
      const updated = await res.json()
      setLocations((prev) => prev.map((l) => l.id === id ? { ...l, ...updated } : l))
      setEditingId(null)
      toast.success('Location updated')
    } catch {
      toast.error('Failed to update location')
    }
  }

  async function remove(id: string) {
    if (!confirm('Delete this location? Books assigned here will be unassigned.')) return
    try {
      const res = await fetch(`/api/locations/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error()
      setLocations((prev) => prev.filter((l) => l.id !== id))
      toast.success('Location deleted')
    } catch {
      toast.error('Failed to delete location')
    }
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="rounded-lg border p-4 space-y-3">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Add Location</h2>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label htmlFor="loc-name" className="mb-1 block">Name *</Label>
            <Input
              id="loc-name"
              placeholder="e.g. Living Room Shelf A"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && create()}
            />
          </div>
          <div>
            <Label htmlFor="loc-room" className="mb-1 block">Room (optional)</Label>
            <Input
              id="loc-room"
              placeholder="e.g. Living Room"
              value={room}
              onChange={(e) => setRoom(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && create()}
            />
          </div>
        </div>
        <Button onClick={create} disabled={saving || !name.trim()} size="sm">
          <Plus className="h-4 w-4 mr-1" />
          Add Location
        </Button>
      </div>

      <div className="space-y-2">
        {locations.length === 0 ? (
          <p className="text-sm text-muted-foreground py-4">No locations yet. Add one above.</p>
        ) : (
          locations.map((loc) => (
            <div key={loc.id} className="flex items-center gap-3 rounded-lg border p-3">
              <div
                className="h-3 w-3 rounded-full flex-shrink-0"
                style={{ backgroundColor: loc.color }}
              />
              <div className="flex-1 min-w-0">
                {editingId === loc.id ? (
                  <div className="flex gap-2">
                    <Input
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') save(loc.id)
                        if (e.key === 'Escape') setEditingId(null)
                      }}
                      className="h-8"
                      autoFocus
                    />
                    <Button size="icon" className="h-8 w-8" onClick={() => save(loc.id)}>
                      <Check className="h-3 w-3" />
                    </Button>
                    <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => setEditingId(null)}>
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ) : (
                  <div>
                    <p className="font-medium text-sm">{loc.name}</p>
                    {loc.room && <p className="text-xs text-muted-foreground">{loc.room}</p>}
                  </div>
                )}
              </div>
              <Link
                href={`/library?locationId=${loc.id}`}
                className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
              >
                <BookOpen className="h-3 w-3" />
                {loc._count.books}
              </Link>
              {editingId !== loc.id && (
                <>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8"
                    onClick={() => { setEditingId(loc.id); setEditName(loc.name) }}
                  >
                    <Pencil className="h-3 w-3" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8 text-destructive hover:text-destructive"
                    onClick={() => remove(loc.id)}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  )
}
