import { prisma } from '@/lib/prisma'
import { LocationsManager } from '@/components/LocationsManager'

export const dynamic = 'force-dynamic'

export default async function LocationsPage() {
  const locations = await prisma.location.findMany({
    include: { _count: { select: { books: true } } },
    orderBy: { name: 'asc' },
  })

  return (
    <div className="p-4 md:p-8">
      <h1 className="text-2xl font-bold mb-6">Locations</h1>
      <p className="text-muted-foreground mb-6 text-sm">
        Organize your books by shelf and room so you can always find them.
      </p>
      <LocationsManager initialLocations={locations} />
    </div>
  )
}
