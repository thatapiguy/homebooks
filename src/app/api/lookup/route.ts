import { NextRequest, NextResponse } from 'next/server'
import { lookupByISBN } from '@/lib/openLibrary'

export async function GET(request: NextRequest) {
  const isbn = request.nextUrl.searchParams.get('isbn')
  if (!isbn) {
    return NextResponse.json({ error: 'ISBN is required' }, { status: 400 })
  }

  const book = await lookupByISBN(isbn.replace(/[-\s]/g, ''))
  if (!book) {
    return NextResponse.json({ error: 'Book not found' }, { status: 404 })
  }

  return NextResponse.json(book)
}
