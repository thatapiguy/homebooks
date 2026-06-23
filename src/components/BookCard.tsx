import Image from 'next/image'
import Link from 'next/link'
import { MapPin, FileText } from 'lucide-react'
import { StarRating } from './StarRating'
import { TagBadge } from './TagBadge'
import { BookStatusBadge } from './BookStatusBadge'
import { truncate } from '@/lib/utils'
import type { BookSummary } from '@/types'

interface BookCardProps {
  book: BookSummary
}

export function BookCard({ book }: BookCardProps) {
  return (
    <Link href={`/books/${book.id}`} className="group block">
      <div className="flex flex-col overflow-hidden rounded-lg border bg-card shadow-sm transition-shadow hover:shadow-md">
        <div className="relative aspect-[2/3] w-full overflow-hidden bg-muted">
          {book.coverUrl ? (
            <Image
              src={book.coverUrl}
              alt={`Cover of ${book.title}`}
              fill
              className="object-cover transition-transform group-hover:scale-105"
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
              unoptimized
            />
          ) : (
            <div className="flex h-full items-center justify-center bg-gradient-to-br from-slate-200 to-slate-300 p-4">
              <div className="text-center">
                <div className="mb-2 text-3xl">📚</div>
                <p className="text-xs font-medium text-slate-600 leading-tight">
                  {truncate(book.title, 40)}
                </p>
              </div>
            </div>
          )}
          <div className="absolute top-2 right-2">
            <BookStatusBadge status={book.status} />
          </div>
        </div>

        <div className="flex flex-col gap-1 p-3">
          <h3 className="line-clamp-2 text-sm font-semibold leading-tight">
            {book.title}
          </h3>
          {book.author && (
            <p className="line-clamp-1 text-xs text-muted-foreground">{book.author.name}</p>
          )}

          {book.rating && (
            <StarRating rating={book.rating} readonly size="sm" />
          )}

          {book.location && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <MapPin className="h-3 w-3 flex-shrink-0" />
              <span className="line-clamp-1">{book.location.name}</span>
            </div>
          )}

          {book.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-1">
              {book.tags.slice(0, 2).map(({ tag }: { tag: { id: string; name: string; color: string } }) => (
                <TagBadge key={tag.id} tag={tag} />
              ))}
              {book.tags.length > 2 && (
                <span className="text-xs text-muted-foreground">+{book.tags.length - 2}</span>
              )}
            </div>
          )}

          {book._count.notes > 0 && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <FileText className="h-3 w-3" />
              <span>{book._count.notes} note{book._count.notes !== 1 ? 's' : ''}</span>
            </div>
          )}
        </div>
      </div>
    </Link>
  )
}
