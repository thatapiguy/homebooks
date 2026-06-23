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
  const videoRef = useRef<HTMLVideoElement>(null)
  const controlsRef = useRef<{ stop: () => void } | null>(null)
  const scannedRef = useRef(false)

  useEffect(() => {
    let active = true
    scannedRef.current = false

    async function startScanner() {
      try {
        const { BrowserMultiFormatReader } = await import('@zxing/browser')
        const { BarcodeFormat, DecodeHintType } = await import('@zxing/library')

        if (!active || !videoRef.current) return

        const hints = new Map()
        hints.set(DecodeHintType.POSSIBLE_FORMATS, [
          BarcodeFormat.EAN_13,
          BarcodeFormat.EAN_8,
          BarcodeFormat.CODE_128,
          BarcodeFormat.UPC_A,
          BarcodeFormat.UPC_E,
        ])
        hints.set(DecodeHintType.TRY_HARDER, true)

        const reader = new BrowserMultiFormatReader(hints)

        const controls = await reader.decodeFromConstraints(
          { video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } } },
          videoRef.current,
          (result, _err, frameControls) => {
            if (result && !scannedRef.current) {
              scannedRef.current = true
              frameControls.stop()
              onScan(result.getText())
            }
            // _err is just "no barcode found this frame" — not a real error
          }
        )
        controlsRef.current = controls
      } catch (err) {
        if (active) {
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
      active = false
      controlsRef.current?.stop()
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
            <div className="relative w-full max-w-sm rounded-lg overflow-hidden bg-gray-900">
              <video
                ref={videoRef}
                className="w-full"
                autoPlay
                muted
                playsInline
              />
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-72 h-24 border-2 border-white/60 rounded" />
              </div>
            </div>
            <p className="mt-6 text-sm text-white/70 text-center">
              Point the camera at the barcode on the back of the book
            </p>
          </>
        )}
      </div>
    </div>
  )
}
