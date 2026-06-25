'use client'

import { useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Download, Upload, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from './ui/button'

function parseCSV(text: string): Record<string, string>[] {
  const lines = text.split(/\r?\n/)
  const nonEmpty = lines.filter((l) => l.trim())
  if (nonEmpty.length < 2) return []

  function parseLine(line: string): string[] {
    const cells: string[] = []
    let i = 0
    while (i <= line.length) {
      if (line[i] === '"') {
        let field = ''
        i++
        while (i < line.length) {
          if (line[i] === '"' && line[i + 1] === '"') {
            field += '"'
            i += 2
          } else if (line[i] === '"') {
            i++
            break
          } else {
            field += line[i++]
          }
        }
        cells.push(field)
        if (line[i] === ',') i++
      } else {
        const end = line.indexOf(',', i)
        if (end === -1) {
          cells.push(line.slice(i))
          break
        }
        cells.push(line.slice(i, end))
        i = end + 1
      }
    }
    return cells
  }

  // Normalize header names → field keys
  const headerMap: Record<string, string> = {
    title: 'title',
    author: 'author',
    isbn10: 'isbn',
    isbn: 'isbn',
    isbn13: 'isbn13',
    publisher: 'publisher',
    year: 'year',
    pages: 'pages',
    status: 'status',
    rating: 'rating',
    location: 'location',
    tags: 'tags',
    coverurl: 'coverUrl',
    description: 'description',
  }

  const rawHeaders = parseLine(nonEmpty[0])
  const fieldKeys = rawHeaders.map((h) => {
    const normalized = h.toLowerCase().replace(/[^a-z0-9]/g, '')
    return headerMap[normalized] ?? normalized
  })

  return nonEmpty.slice(1).map((line) => {
    const cells = parseLine(line)
    const row: Record<string, string> = {}
    fieldKeys.forEach((key, idx) => {
      row[key] = cells[idx] ?? ''
    })
    return row
  })
}

export function LibraryActions() {
  const router = useRouter()
  const fileRef = useRef<HTMLInputElement>(null)
  const [importing, setImporting] = useState(false)

  async function handleImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    e.target.value = ''
    setImporting(true)
    try {
      const text = await file.text()
      const rows = parseCSV(text)
      if (rows.length === 0) {
        toast.error('No data rows found in CSV')
        return
      }
      const res = await fetch('/api/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(rows),
      })
      const result = await res.json()
      if (!res.ok) {
        toast.error('Import failed')
        return
      }
      const msg = `Imported ${result.imported} book${result.imported !== 1 ? 's' : ''}${result.skipped > 0 ? `, skipped ${result.skipped} duplicate${result.skipped !== 1 ? 's' : ''}` : ''}`
      toast.success(msg)
      if (result.errors?.length > 0) {
        toast.warning(`${result.errors.length} row(s) had errors — check console`)
        console.warn('Import errors:', result.errors)
      }
      router.refresh()
    } catch {
      toast.error('Failed to read CSV file')
    } finally {
      setImporting(false)
    }
  }

  return (
    <div className="flex gap-2">
      <Button variant="outline" size="sm" asChild>
        <a href="/api/export" download="homebooks.csv">
          <Download className="h-4 w-4 mr-1" />
          Export
        </a>
      </Button>
      <Button variant="outline" size="sm" onClick={() => fileRef.current?.click()} disabled={importing}>
        {importing ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <Upload className="h-4 w-4 mr-1" />}
        Import
      </Button>
      <input ref={fileRef} type="file" accept=".csv" className="hidden" onChange={handleImport} />
    </div>
  )
}
