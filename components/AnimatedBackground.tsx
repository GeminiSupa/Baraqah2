'use client'

import { useReducedMotion } from '@/hooks/useReducedMotion'
import { useIntersectionObserver } from '@/hooks/useIntersectionObserver'
import { cn } from '@/lib/utils'

interface AnimatedBackgroundProps {
  intensity?: 'full' | 'subtle' | 'minimal'
  className?: string
}

export function AnimatedBackground({ 
  intensity = 'subtle', 
  className = '' 
}: AnimatedBackgroundProps) {
  const prefersReducedMotion = useReducedMotion()
  const { ref, isVisible } = useIntersectionObserver({ threshold: 0.1 })
  
  // Return static gradient if reduced motion
  if (prefersReducedMotion) {
    return (
      <div 
        className={cn(
          'fixed inset-0 -z-10 bg-gradient-to-br from-teal-50 via-purple-50 to-pink-50',
          className
        )}
        aria-hidden="true"
      />
    )
  }
  
  const particleCount = intensity === 'full' ? 30 : intensity === 'subtle' ? 15 : 5
  
  return (
    <div 
      ref={ref}
      className={cn('fixed inset-0 -z-10', className)}
      aria-hidden="true"
    >
      {/* CSS Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-teal-50 via-purple-50 to-pink-50 animate-gradient-shift" />
      
      {/* Subtle Particles (only when visible) */}
      {isVisible && (
        <div className="absolute inset-0">
          {Array.from({ length: particleCount }).map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-iosBlue/20 rounded-full animate-float"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 5}s`,
                animationDuration: `${10 + Math.random() * 10}s`
              }}
            />
          ))}
        </div>
      )}
    </div>
  )
}
