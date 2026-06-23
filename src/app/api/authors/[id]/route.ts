import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const AuthorUpdateSchema = z.object({
  name: z.string().min(1),
})

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await request.json()
  const parsed = AuthorUpdateSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })

  try {
    const author = await prisma.author.update({
      where: { id },
      data: parsed.data,
      include: { _count: { select: { books: true } } },
    })
    return NextResponse.json(author)
  } catch {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  try {
    await prisma.author.delete({ where: { id } })
    return new NextResponse(null, { status: 204 })
  } catch {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }
}
