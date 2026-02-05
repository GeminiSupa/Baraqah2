'use client'

import { useEffect, useState, RefCallback } from 'react'

interface UseIntersectionObserverOptions extends IntersectionObserverInit {
  threshold?: number | number[]
  root?: Element | null
  rootMargin?: string
}

export function useIntersectionObserver(
  options: UseIntersectionObserverOptions = {}
): { ref: RefCallback<HTMLElement>; isVisible: boolean } {
  const [ref, setRef] = useState<HTMLElement | null>(null)
  const [isVisible, setIsVisible] = useState(false)
  
  useEffect(() => {
    if (!ref) return
    
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting)
      },
      {
        threshold: options.threshold ?? 0.1,
        root: options.root ?? null,
        rootMargin: options.rootMargin ?? '0px',
      }
    )
    
    observer.observe(ref)
    return () => observer.disconnect()
  }, [ref, options.threshold, options.root, options.rootMargin])
  
  return { ref: setRef, isVisible }
}
