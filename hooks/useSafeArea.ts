'use client'

import { useEffect, useState } from 'react'

export function useSafeArea() {
  const [insets, setInsets] = useState({ top: 0, bottom: 0, left: 0, right: 0 })
  
  useEffect(() => {
    if (typeof window === 'undefined') return
    
    const updateInsets = () => {
      const root = document.documentElement
      setInsets({
        top: parseInt(
          getComputedStyle(root).getPropertyValue('env(safe-area-inset-top)') || '0'
        ),
        bottom: parseInt(
          getComputedStyle(root).getPropertyValue('env(safe-area-inset-bottom)') || '0'
        ),
        left: parseInt(
          getComputedStyle(root).getPropertyValue('env(safe-area-inset-left)') || '0'
        ),
        right: parseInt(
          getComputedStyle(root).getPropertyValue('env(safe-area-inset-right)') || '0'
        )
      })
    }
    
    updateInsets()
    window.addEventListener('resize', updateInsets)
    window.addEventListener('orientationchange', updateInsets)
    
    return () => {
      window.removeEventListener('resize', updateInsets)
      window.removeEventListener('orientationchange', updateInsets)
    }
  }, [])
  
  return insets
}
