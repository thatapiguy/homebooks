import type { Book, Location, Tag, Note, BookTag } from '../generated/prisma/client'

export type BookWithRelations = Book & {
  location: Location | null
  tags: Array<BookTag & { tag: Tag }>
  notes: Note[]
  _count?: { notes: number }
}

export type BookSummary = Book & {
  location: Location | null
  tags: Array<BookTag & { tag: Tag }>
  _count: { notes: number }
}

export type LocationWithCount = Location & {
  _count: { books: number }
}

export type TagWithCount = Tag & {
  _count: { books: number }
}

export type { Book, Location, Tag, Note, BookTag }

