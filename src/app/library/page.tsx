import { Suspense } from 'react'
import Link from 'next/link'
import { Plus } from 'lucide-react'
import { prisma } from '@/lib/prisma'
import { BookGrid, BookGridSkeleton } from '@/components/BookGrid'
import { SearchBar } from '@/components/SearchBar'
import { LibraryActions } from '@/components/LibraryActions'
import { Button } from '@/components/ui/button'

export const dynamic = 'force-dynamic'

interface LibraryPageProps {
  searchParams: Promise<{
    q?: string
    status?: string
    locationId?: string
    tagId?: string
    authorId?: string
    sort?: string
    order?: string
  }>
}

async function BooksSection({ searchParams }: LibraryPageProps) {
  const params = await searchParams
  const { q = '', status, locationId, tagId, authorId, sort = 'createdAt', order = 'desc' } = params

  const where: Record<string, unknown> = {}
  if (q) {
    where.OR = [
      { title: { contains: q } },
      { author: { is: { name: { contains: q } } } },
      { isbn: { contains: q } },
      { isbn13: { contains: q } },
    ]
  }
  if (status) where.status = status
  if (locationId) where.locationId = locationId
  if (tagId) where.tags = { some: { tagId } }
  if (authorId) where.authorId = authorId

  const validSorts = ['title', 'year', 'rating', 'createdAt', 'updatedAt']
  const orderDir = order === 'asc' ? 'asc' : 'desc'
  let orderBy: Record<string, unknown> = { createdAt: orderDir }
  if (validSorts.includes(sort)) {
    orderBy = { [sort]: orderDir }
  } else if (sort === 'author') {
    orderBy = { author: { name: orderDir } }
  }

  const books = await prisma.book.findMany({
    where,
    include: {
      location: true,
      author: true,
      tags: { include: { tag: true } },
      _count: { select: { notes: true } },
    },
    orderBy,
  })

  return (
    <div>
      <p className="text-sm text-muted-foreground mb-4">
        {books.length} book{books.length !== 1 ? 's' : ''}
      </p>
      <BookGrid books={books} />
    </div>
  )
}

export default async function LibraryPage({ searchParams }: LibraryPageProps) {
  const [locations, tags] = await Promise.all([
    prisma.location.findMany({ include: { _count: { select: { books: true } } }, orderBy: { name: 'asc' } }),
    prisma.tag.findMany({ include: { _count: { select: { books: true } } }, orderBy: { name: 'asc' } }),
  ])

  return (
    <div className="p-4 md:p-8">
      <div className="mb-6 flex items-center justify-between gap-4">
        <h1 className="text-2xl font-bold">My Library</h1>
        <div className="flex items-center gap-2">
          <LibraryActions />
          <Button asChild size="sm" className="hidden md:flex">
            <Link href="/books/new">
              <Plus className="h-4 w-4" />
              Add Book
            </Link>
          </Button>
        </div>
      </div>

      <div className="mb-6">
        <Suspense>
          <SearchBar locations={locations} tags={tags} />
        </Suspense>
      </div>

      <Suspense fallback={<BookGridSkeleton />}>
        <BooksSection searchParams={searchParams} />
      </Suspense>
    </div>
  )
}
