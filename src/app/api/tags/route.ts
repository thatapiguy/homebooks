import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { TagCreateSchema } from '@/lib/validations'

export async function GET() {
  const tags = await prisma.tag.findMany({
    include: { _count: { select: { books: true } } },
    orderBy: { name: 'asc' },
  })
  return NextResponse.json(tags)
}

export async function POST(request: NextRequest) {
  const body = await request.json()
  const parsed = TagCreateSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  try {
    const tag = await prisma.tag.create({ data: parsed.data })
    return NextResponse.json(tag, { status: 201 })
  } catch (error: unknown) {
    if ((error as { code?: string }).code === 'P2002') {
      return NextResponse.json({ error: 'Tag already exists' }, { status: 409 })
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
