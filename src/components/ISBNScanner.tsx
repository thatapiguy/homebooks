'use client'

import { useEffect, useRef, useState } from 'react'
import { X, Camera } from 'lucide-react'
import { Button } from './ui/button'

interface ISBNScannerProps {
  onScan: (isbn: string) => void
  onClose: () => void
}

export function ISBNScanner({ onScan, onClose }: ISBNScannerProps) {
  const [error, setError] = useState<string | null>(null)
  const [scanning, setScanning] = useState(false)
  const scannerRef = useRef<{ stop: () => Promise<void> } | null>(null)
  const stoppedRef = useRef(false)
  const divId = 'isbn-scanner-region'

  useEffect(() => {
    let cancelled = false
    stoppedRef.current = false

    async function startScanner() {
      try {
        const { Html5Qrcode } = await import('html5-qrcode')
        if (cancelled) return

        const scanner = new Html5Qrcode(divId)
        scannerRef.current = scanner
        setScanning(true)

        await scanner.start(
          { facingMode: 'environment' },
          {
            fps: 10,
            qrbox: { width: 280, height: 100 },
            aspectRatio: 1.7,
          },
          (decodedText) => {
            if (stoppedRef.current) return
            stoppedRef.current = true
            scanner.stop().catch(() => {})
            onScan(decodedText)
          },
          undefined
        )
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : 'Camera access denied. Please allow camera access and try again.'
          )
        }
      }
    }

    startScanner()

    return () => {
      cancelled = true
      if (!stoppedRef.current) {
        stoppedRef.current = true
        scannerRef.current?.stop().catch(() => {})
      }
    }
  }, [onScan])

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-black">
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center gap-2 text-white">
          <Camera className="h-5 w-5" />
          <span className="font-medium">Scan ISBN Barcode</span>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose} className="text-white hover:bg-white/20">
          <X className="h-5 w-5" />
        </Button>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-4">
        {error ? (
          <div className="text-center text-white space-y-4">
            <p className="text-red-400">{error}</p>
            <Button variant="outline" onClick={onClose}>Go Back</Button>
          </div>
        ) : (
          <>
            <div
              id={divId}
              className="w-full max-w-sm rounded-lg overflow-hidden"
            />
            {scanning && (
              <p className="mt-6 text-sm text-white/70 text-center">
                Point the camera at the barcode on the back of the book
              </p>
            )}
          </>
        )}
      </div>
    </div>
  )
}
