import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { BookForm } from '@/components/BookForm'

interface NewBookPageProps {
  searchParams: Promise<{ isbn?: string }>
}

export default async function NewBookPage({ searchParams }: NewBookPageProps) {
  const { isbn } = await searchParams
  const locations = await prisma.location.findMany({ orderBy: { name: 'asc' } })

  return (
    <div className="p-4 md:p-8">
      <Link href="/library" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6">
        <ArrowLeft className="h-4 w-4" />
        Back to library
      </Link>

      <h1 className="text-2xl font-bold mb-6">Add Book</h1>

      <BookForm locations={locations} initialIsbn={isbn ?? null} />
    </div>
  )
}
