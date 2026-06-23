import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const AuthorCreateSchema = z.object({
  name: z.string().min(1),
})

export async function GET() {
  const authors = await prisma.author.findMany({
    include: { _count: { select: { books: true } } },
    orderBy: { name: 'asc' },
  })
  return NextResponse.json(authors)
}

export async function POST(request: NextRequest) {
  const body = await request.json()
  const parsed = AuthorCreateSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })

  try {
    const author = await prisma.author.create({
      data: { name: parsed.data.name },
      include: { _count: { select: { books: true } } },
    })
    return NextResponse.json(author, { status: 201 })
  } catch (error: unknown) {
    if ((error as { code?: string }).code === 'P2002') {
      const existing = await prisma.author.findUnique({
        where: { name: parsed.data.name },
        include: { _count: { select: { books: true } } },
      })
      return NextResponse.json(existing)
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
