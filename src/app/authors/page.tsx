import { prisma } from '@/lib/prisma'
import { AuthorsManager } from '@/components/AuthorsManager'

export const dynamic = 'force-dynamic'

export default async function AuthorsPage() {
  const authors = await prisma.author.findMany({
    include: { _count: { select: { books: true } } },
    orderBy: { name: 'asc' },
  })

  return (
    <div className="p-4 md:p-8">
      <h1 className="text-2xl font-bold mb-6">Authors</h1>
      <p className="text-muted-foreground mb-6 text-sm">
        Authors are created automatically when you add books, or add them manually here.
      </p>
      <AuthorsManager initialAuthors={authors} />
    </div>
  )
}
