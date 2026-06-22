import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { LocationCreateSchema } from '@/lib/validations'

export async function GET() {
  const locations = await prisma.location.findMany({
    include: { _count: { select: { books: true } } },
    orderBy: { name: 'asc' },
  })
  return NextResponse.json(locations)
}

export async function POST(request: NextRequest) {
  const body = await request.json()
  const parsed = LocationCreateSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  const location = await prisma.location.create({ data: parsed.data })
  return NextResponse.json(location, { status: 201 })
}
