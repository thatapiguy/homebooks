import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { BookUpdateSchema } from '@/lib/validations'

const bookInclude = {
  location: true,
  tags: { include: { tag: true } },
  notes: { orderBy: { createdAt: 'desc' as const } },
  _count: { select: { notes: true } },
}

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const book = await prisma.book.findUnique({ where: { id }, include: bookInclude })
  if (!book) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(book)
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await request.json()
    const parsed = BookUpdateSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
    }

    const { tagIds, ...data } = parsed.data

    // Replace all tags if tagIds provided
    if (tagIds !== undefined) {
      await prisma.bookTag.deleteMany({ where: { bookId: id } })
    }

    const book = await prisma.book.update({
      where: { id },
      data: {
        ...data,
        ...(tagIds !== undefined && tagIds.length > 0
          ? { tags: { create: tagIds.map((tagId) => ({ tagId })) } }
          : {}),
      },
      include: bookInclude,
    })

    return NextResponse.json(book)
  } catch (error: unknown) {
    if ((error as { code?: string }).code === 'P2025') {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    await prisma.book.delete({ where: { id } })
    return new NextResponse(null, { status: 204 })
  } catch {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }
}
