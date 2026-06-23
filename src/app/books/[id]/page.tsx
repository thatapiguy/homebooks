import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowLeft, MapPin, BookOpen, Calendar, Hash } from 'lucide-react'
import { prisma } from '@/lib/prisma'
import { TagBadge } from '@/components/TagBadge'
import { NoteList } from '@/components/NoteList'
import { BookActions } from '@/components/BookActions'
import { Separator } from '@/components/ui/separator'
import { formatYear } from '@/lib/utils'

interface BookDetailPageProps {
  params: Promise<{ id: string }>
}

export default async function BookDetailPage({ params }: BookDetailPageProps) {
  const { id } = await params
  const book = await prisma.book.findUnique({
    where: { id },
    include: {
      location: true,
      author: true,
      tags: { include: { tag: true } },
      notes: { orderBy: { createdAt: 'desc' } },
    },
  })

  if (!book) notFound()

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto">
      <Link href="/library" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6">
        <ArrowLeft className="h-4 w-4" />
        Back to library
      </Link>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Cover */}
        <div className="flex-shrink-0">
          <div className="relative w-48 h-72 rounded-lg overflow-hidden shadow-lg mx-auto md:mx-0">
            {book.coverUrl ? (
              <Image
                src={book.coverUrl}
                alt={`Cover of ${book.title}`}
                fill
                className="object-cover"
                unoptimized
              />
            ) : (
              <div className="flex h-full items-center justify-center bg-gradient-to-br from-slate-200 to-slate-300">
                <div className="text-center p-4">
                  <div className="text-4xl mb-2">📚</div>
                  <p className="text-xs font-medium text-slate-600">{book.title}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0 space-y-4">
          <div>
            <h1 className="text-2xl font-bold leading-tight mb-1">{book.title}</h1>
            {book.author && (
              <p className="text-muted-foreground">{book.author.name}</p>
            )}
          </div>

          <BookActions
            bookId={book.id}
            initialRating={book.rating}
            initialStatus={book.status}
          />

          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
            {book.location && (
              <div className="flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                <span>{book.location.name}</span>
              </div>
            )}
            {book.year && (
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                <span>{formatYear(book.year)}</span>
              </div>
            )}
            {book.pageCount && (
              <div className="flex items-center gap-1">
                <BookOpen className="h-4 w-4" />
                <span>{book.pageCount} pages</span>
              </div>
            )}
            {(book.isbn13 || book.isbn) && (
              <div className="flex items-center gap-1">
                <Hash className="h-4 w-4" />
                <span>{book.isbn13 ?? book.isbn}</span>
              </div>
            )}
          </div>

          {book.publisher && (
            <p className="text-sm text-muted-foreground">
              Published by {book.publisher}
            </p>
          )}

          {book.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {book.tags.map(({ tag }: { tag: { id: string; name: string; color: string } }) => (
                <TagBadge key={tag.id} tag={tag} />
              ))}
            </div>
          )}

          {book.description && (
            <div>
              <h3 className="text-sm font-semibold mb-1 text-muted-foreground uppercase tracking-wide">Description</h3>
              <p className="text-sm leading-relaxed line-clamp-6">{book.description}</p>
            </div>
          )}
        </div>
      </div>

      <Separator className="my-8" />

      <NoteList bookId={book.id} initialNotes={book.notes} />
    </div>
  )
}
