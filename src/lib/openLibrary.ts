export interface OpenLibraryBook {
  title: string
  author: string | null
  publisher: string | null
  year: number | null
  description: string | null
  coverUrl: string | null
  pageCount: number | null
  isbn: string | null
  isbn13: string | null
}

export async function lookupByISBN(isbn: string): Promise<OpenLibraryBook | null> {
  try {
    const url = `https://openlibrary.org/api/books?bibkeys=ISBN:${isbn}&jscmd=data&format=json`
    const res = await fetch(url, { next: { revalidate: 86400 } })
    if (!res.ok) return null
    const data = await res.json()
    const key = `ISBN:${isbn}`
    if (!data[key]) return null
    const book = data[key]

    const author = Array.isArray(book.authors) && book.authors.length > 0
      ? book.authors.map((a: { name: string }) => a.name).join(', ')
      : null

    const publisher = Array.isArray(book.publishers) && book.publishers.length > 0
      ? book.publishers[0].name
      : null

    const yearStr = book.publish_date?.match(/\d{4}/)?.[0]
    const year = yearStr ? parseInt(yearStr, 10) : null

    let description: string | null = null
    if (book.description) {
      description = typeof book.description === 'string'
        ? book.description
        : book.description.value ?? null
    } else if (book.first_sentence?.value) {
      description = book.first_sentence.value
    }

    const isbn10 = Array.isArray(book.identifiers?.isbn_10) ? book.identifiers.isbn_10[0] ?? null : null
    const isbn13 = Array.isArray(book.identifiers?.isbn_13) ? book.identifiers.isbn_13[0] ?? isbn : isbn.length === 13 ? isbn : null

    return {
      title: book.title ?? 'Unknown Title',
      author,
      publisher,
      year,
      description,
      coverUrl: `https://covers.openlibrary.org/b/isbn/${isbn}-L.jpg`,
      pageCount: book.number_of_pages ?? null,
      isbn: isbn10 ?? (isbn.length === 10 ? isbn : null),
      isbn13,
    }
  } catch {
    return null
  }
}
