import { prisma } from '@/lib/prisma'
import { TagsManager } from '@/components/TagsManager'

export const dynamic = 'force-dynamic'

export default async function TagsPage() {
  const tags = await prisma.tag.findMany({
    include: { _count: { select: { books: true } } },
    orderBy: { name: 'asc' },
  })

  return (
    <div className="p-4 md:p-8">
      <h1 className="text-2xl font-bold mb-6">Tags</h1>
      <p className="text-muted-foreground mb-6 text-sm">
        Create and manage tags to categorize your books.
      </p>
      <TagsManager initialTags={tags} />
    </div>
  )
}
