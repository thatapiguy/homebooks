import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { BookCreateSchema } from '@/lib/validations'

const bookInclude = {
  location: true,
  author: true,
  tags: { include: { tag: true } },
  _count: { select: { notes: true } },
}

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl
  const q = searchParams.get('q') ?? ''
  const status = searchParams.get('status')
  const locationId = searchParams.get('locationId')
  const tagId = searchParams.get('tagId')
  const sort = searchParams.get('sort') ?? 'createdAt'
  const order = (searchParams.get('order') ?? 'desc') as 'asc' | 'desc'

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

  const validSorts = ['title', 'year', 'rating', 'createdAt', 'updatedAt']
  let orderBy: Record<string, unknown> = { createdAt: order }
  if (validSorts.includes(sort)) {
    orderBy = { [sort]: order }
  } else if (sort === 'author') {
    orderBy = { author: { name: order } }
  }

  const books = await prisma.book.findMany({
    where,
    include: bookInclude,
    orderBy,
  })

  return NextResponse.json(books)
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const parsed = BookCreateSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
    }

    const { tagIds, ...data } = parsed.data

    const book = await prisma.book.create({
      data: {
        ...data,
        tags: tagIds.length > 0
          ? { create: tagIds.map((tagId) => ({ tagId })) }
          : undefined,
      },
      include: bookInclude,
    })

    return NextResponse.json(book, { status: 201 })
  } catch (error: unknown) {
    if ((error as { code?: string }).code === 'P2002') {
      return NextResponse.json({ error: 'A book with this ISBN already exists' }, { status: 409 })
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
