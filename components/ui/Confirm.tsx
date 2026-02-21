'use client'

import React, { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'

export interface ConfirmOptions {
  title: string
  description?: string
  confirmText?: string
  cancelText?: string
  variant?: 'danger' | 'primary'
}

interface ConfirmContextValue {
  confirm: (options: ConfirmOptions) => Promise<boolean>
}

const ConfirmContext = createContext<ConfirmContextValue | null>(null)

export function ConfirmProvider({ children }: { children: React.ReactNode }) {
  const resolverRef = useRef<((value: boolean) => void) | null>(null)
  const [open, setOpen] = useState(false)
  const [options, setOptions] = useState<ConfirmOptions | null>(null)

  const confirm = useCallback((opts: ConfirmOptions) => {
    setOptions(opts)
    setOpen(true)
    return new Promise<boolean>((resolve) => {
      resolverRef.current = resolve
    })
  }, [])

  const close = useCallback((value: boolean) => {
    setOpen(false)
    resolverRef.current?.(value)
    resolverRef.current = null
    window.setTimeout(() => setOptions(null), 0)
  }, [])

  const value = useMemo(() => ({ confirm }), [confirm])

  return (
    <ConfirmContext.Provider value={value}>
      {children}

      <Modal
        isOpen={open}
        onClose={() => close(false)}
        title={options?.title}
        variant="center"
        size="md"
      >
        <div className="space-y-4">
          {options?.description && (
            <p className="text-sm text-iosGray-1">{options.description}</p>
          )}
          <div className="flex flex-col sm:flex-row gap-2 pt-2">
            <Button
              variant={options?.variant === 'danger' ? 'danger' : 'primary'}
              onClick={() => close(true)}
              fullWidth
            >
              {options?.confirmText ?? 'Confirm'}
            </Button>
            <Button variant="secondary" onClick={() => close(false)} fullWidth>
              {options?.cancelText ?? 'Cancel'}
            </Button>
          </div>
        </div>
      </Modal>
    </ConfirmContext.Provider>
  )
}

export function useConfirm() {
  const ctx = useContext(ConfirmContext)
  if (!ctx) throw new Error('useConfirm must be used within ConfirmProvider')
  return ctx
}

