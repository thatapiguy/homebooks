'use client'

import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { useCallback } from 'react'
import { Search, X } from 'lucide-react'
import { Input } from './ui/input'
import { Button } from './ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import type { LocationWithCount, TagWithCount } from '@/types'

interface SearchBarProps {
  locations: LocationWithCount[]
  tags: TagWithCount[]
}

export function SearchBar({ locations, tags }: SearchBarProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const updateParam = useCallback(
    (key: string, value: string | null) => {
      const params = new URLSearchParams(searchParams.toString())
      if (value && value !== 'all') {
        params.set(key, value)
      } else {
        params.delete(key)
      }
      router.push(`${pathname}?${params.toString()}`)
    },
    [router, pathname, searchParams]
  )

  const q = searchParams.get('q') ?? ''
  const status = searchParams.get('status') ?? ''
  const locationId = searchParams.get('locationId') ?? ''
  const tagId = searchParams.get('tagId') ?? ''
  const authorId = searchParams.get('authorId') ?? ''
  const sort = searchParams.get('sort') ?? ''

  const hasFilters = q || status || locationId || tagId || authorId

  return (
    <div className="flex flex-col gap-3">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search by title, author, or ISBN…"
          className="pl-9 pr-9"
          value={q}
          onChange={(e) => updateParam('q', e.target.value || null)}
        />
        {q && (
          <button
            onClick={() => updateParam('q', null)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        <Select value={status || 'all'} onValueChange={(v) => updateParam('status', v)}>
          <SelectTrigger className="w-36 h-9">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="want_to_read">Want to Read</SelectItem>
            <SelectItem value="reading">Reading</SelectItem>
            <SelectItem value="read">Read</SelectItem>
          </SelectContent>
        </Select>

        <Select value={locationId || 'all'} onValueChange={(v) => updateParam('locationId', v)}>
          <SelectTrigger className="w-40 h-9">
            <SelectValue placeholder="Location" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All locations</SelectItem>
            {locations.map((loc) => (
              <SelectItem key={loc.id} value={loc.id}>
                {loc.name} ({loc._count.books})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={tagId || 'all'} onValueChange={(v) => updateParam('tagId', v)}>
          <SelectTrigger className="w-36 h-9">
            <SelectValue placeholder="Tag" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All tags</SelectItem>
            {tags.map((tag) => (
              <SelectItem key={tag.id} value={tag.id}>
                {tag.name} ({tag._count.books})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={sort || 'createdAt'} onValueChange={(v) => updateParam('sort', v)}>
          <SelectTrigger className="w-36 h-9">
            <SelectValue placeholder="Sort" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="createdAt">Date added</SelectItem>
            <SelectItem value="title">Title</SelectItem>
            <SelectItem value="author">Author</SelectItem>
            <SelectItem value="rating">Rating</SelectItem>
            <SelectItem value="year">Year</SelectItem>
          </SelectContent>
        </Select>

        {hasFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push(pathname)}
            className="h-9"
          >
            <X className="h-4 w-4 mr-1" />
            Clear
          </Button>
        )}
      </div>
    </div>
  )
}
