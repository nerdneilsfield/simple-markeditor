import { useState, useEffect } from 'react'

export const useIsMobile = (): boolean => {
  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window === 'undefined') return false
    return window.matchMedia('(pointer: coarse)').matches
  })

  useEffect(() => {
    if (typeof window === 'undefined') return

    const mediaQuery = window.matchMedia('(pointer: coarse)')
    const handleChange = (e: MediaQueryListEvent) => setIsMobile(e.matches)

    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [])

  return isMobile
}

export const useIsTablet = (): boolean => {
  const [isTablet, setIsTablet] = useState(() => {
    if (typeof window === 'undefined') return false
    return window.matchMedia(
      '(min-width: 768px) and (max-width: 1024px) and (orientation: portrait)'
    ).matches
  })

  useEffect(() => {
    if (typeof window === 'undefined') return

    const mediaQuery = window.matchMedia(
      '(min-width: 768px) and (max-width: 1024px) and (orientation: portrait)'
    )
    const handleChange = (e: MediaQueryListEvent) => setIsTablet(e.matches)

    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [])

  return isTablet
}
