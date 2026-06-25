import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

interface ImportRow {
  title?: string
  author?: string
  isbn?: string
  isbn13?: string
  publisher?: string
  year?: string
  pages?: string
  status?: string
  rating?: string
  location?: string
  tags?: string
  coverUrl?: string
  description?: string
}

function toStatus(s: string | undefined): string {
  if (!s) return 'want_to_read'
  const map: Record<string, string> = {
    want_to_read: 'want_to_read',
    'want to read': 'want_to_read',
    reading: 'reading',
    read: 'read',
  }
  return map[s.toLowerCase()] ?? 'want_to_read'
}

export async function POST(req: NextRequest) {
  const rows: ImportRow[] = await req.json()

  let imported = 0
  let skipped = 0
  const errors: string[] = []

  for (const row of rows) {
    const title = row.title?.trim()
    if (!title) { skipped++; continue }

    try {
      // Skip duplicates by ISBN
      if (row.isbn13?.trim()) {
        const existing = await prisma.book.findUnique({ where: { isbn13: row.isbn13.trim() } })
        if (existing) { skipped++; continue }
      } else if (row.isbn?.trim()) {
        const existing = await prisma.book.findUnique({ where: { isbn: row.isbn.trim() } })
        if (existing) { skipped++; continue }
      }

      // Find or create author
      let authorId: string | null = null
      if (row.author?.trim()) {
        const author = await prisma.author.upsert({
          where: { name: row.author.trim() },
          create: { name: row.author.trim() },
          update: {},
        })
        authorId = author.id
      }

      // Find or create location (no unique constraint — match by name)
      let locationId: string | null = null
      if (row.location?.trim()) {
        const existing = await prisma.location.findFirst({ where: { name: row.location.trim() } })
        if (existing) {
          locationId = existing.id
        } else {
          const loc = await prisma.location.create({ data: { name: row.location.trim() } })
          locationId = loc.id
        }
      }

      // Find or create tags (semicolon-separated)
      const tagNames = (row.tags ?? '').split(';').map((t) => t.trim()).filter(Boolean)
      const tagIds: string[] = []
      for (const name of tagNames) {
        const tag = await prisma.tag.upsert({
          where: { name },
          create: { name },
          update: {},
        })
        tagIds.push(tag.id)
      }

      const year = row.year ? parseInt(row.year, 10) : null
      const pages = row.pages ? parseInt(row.pages, 10) : null
      const rating = row.rating ? parseInt(row.rating, 10) : null

      await prisma.book.create({
        data: {
          title,
          isbn: row.isbn?.trim() || null,
          isbn13: row.isbn13?.trim() || null,
          authorId,
          publisher: row.publisher?.trim() || null,
          year: year && !isNaN(year) ? year : null,
          pageCount: pages && !isNaN(pages) ? pages : null,
          status: toStatus(row.status),
          rating: rating && rating >= 1 && rating <= 5 ? rating : null,
          locationId,
          coverUrl: row.coverUrl?.trim() || null,
          description: row.description?.trim() || null,
          tags: tagIds.length > 0 ? { create: tagIds.map((tagId) => ({ tagId })) } : undefined,
        },
      })

      imported++
    } catch (err) {
      errors.push(`"${title}": ${err instanceof Error ? err.message : 'Unknown error'}`)
    }
  }

  return NextResponse.json({ imported, skipped, errors })
}
