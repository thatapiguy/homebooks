import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

function csvCell(value: string | null | undefined): string {
  if (value == null) return ''
  const s = String(value)
  if (s.includes(',') || s.includes('"') || s.includes('\n') || s.includes('\r')) {
    return `"${s.replace(/"/g, '""')}"`
  }
  return s
}

export async function GET() {
  const books = await prisma.book.findMany({
    include: {
      author: true,
      location: true,
      tags: { include: { tag: true } },
    },
    orderBy: { title: 'asc' },
  })

  const headers = ['Title', 'Author', 'ISBN-10', 'ISBN-13', 'Publisher', 'Year', 'Pages', 'Status', 'Rating', 'Location', 'Tags', 'Cover URL', 'Description']

  const rows = books.map((book) => [
    csvCell(book.title),
    csvCell(book.author?.name),
    csvCell(book.isbn),
    csvCell(book.isbn13),
    csvCell(book.publisher),
    csvCell(book.year?.toString()),
    csvCell(book.pageCount?.toString()),
    csvCell(book.status),
    csvCell(book.rating?.toString()),
    csvCell(book.location?.name),
    csvCell(book.tags.map((bt) => bt.tag.name).join(';')),
    csvCell(book.coverUrl),
    csvCell(book.description),
  ])

  const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n')

  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': 'attachment; filename="homebooks-export.csv"',
    },
  })
}
