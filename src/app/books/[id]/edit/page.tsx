import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { prisma } from '@/lib/prisma'
import { BookForm } from '@/components/BookForm'

interface EditBookPageProps {
  params: Promise<{ id: string }>
}

export default async function EditBookPage({ params }: EditBookPageProps) {
  const { id } = await params

  const [book, locations] = await Promise.all([
    prisma.book.findUnique({
      where: { id },
      include: { location: true, tags: { include: { tag: true } }, notes: true },
    }),
    prisma.location.findMany({ orderBy: { name: 'asc' } }),
  ])

  if (!book) notFound()

  return (
    <div className="p-4 md:p-8">
      <Link href={`/books/${id}`} className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6">
        <ArrowLeft className="h-4 w-4" />
        Back to book
      </Link>

      <h1 className="text-2xl font-bold mb-6">Edit Book</h1>

      <BookForm book={book} locations={locations} />
    </div>
  )
}
