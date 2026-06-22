'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import { ScanLine } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

const ISBNScanner = dynamic(
  () => import('@/components/ISBNScanner').then((m) => ({ default: m.ISBNScanner })),
  { ssr: false }
)

export default function ScanPage() {
  const router = useRouter()
  const [scanning, setScanning] = useState(false)
  const [looking, setLooking] = useState(false)
  const [result, setResult] = useState<string | null>(null)

  const handleScan = useCallback(async (isbn: string) => {
    setScanning(false)
    setResult(isbn)
    setLooking(true)
    try {
      const res = await fetch(`/api/lookup?isbn=${isbn}`)
      if (!res.ok) {
        toast.info(`ISBN ${isbn} not found in Open Library. You can add it manually.`)
        router.push(`/books/new`)
        return
      }
      toast.success('Book found! Review the details.')
      router.push(`/books/new?isbn=${isbn}`)
    } catch {
      toast.error('Lookup failed')
      router.push(`/books/new`)
    } finally {
      setLooking(false)
    }
  }, [router])

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] p-8 text-center">
      {scanning ? (
        <ISBNScanner onScan={handleScan} onClose={() => setScanning(false)} />
      ) : (
        <>
          <ScanLine className="h-20 w-20 text-muted-foreground mb-6" />
          <h1 className="text-2xl font-bold mb-2">Scan a Book</h1>
          <p className="text-muted-foreground mb-8 max-w-sm">
            Point your camera at the ISBN barcode on the back of a book to automatically look up its details.
          </p>
          {looking ? (
            <p className="text-muted-foreground">Looking up ISBN {result}…</p>
          ) : (
            <Button size="lg" onClick={() => setScanning(true)}>
              <ScanLine className="h-5 w-5 mr-2" />
              Start Scanning
            </Button>
          )}
        </>
      )}
    </div>
  )
}
