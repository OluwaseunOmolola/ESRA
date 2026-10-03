import { useCallback, useRef, useState } from 'react'

export type GeolocationStatus = 'idle' | 'pending' | 'granted' | 'denied' | 'unavailable'

const TIMEOUT_MS = 10000
const MAXIMUM_AGE_MS = 60000

export function useGeolocation() {
  const supported = typeof navigator !== 'undefined' && 'geolocation' in navigator
  const [location, setLocation] = useState<number[]>([])
  const [status, setStatus] = useState<GeolocationStatus>('idle')
  const requested = useRef(false)

  const request = useCallback(() => {
    if (!supported || requested.current) return
    requested.current = true
    setStatus('pending')

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation([position.coords.latitude, position.coords.longitude])
        setStatus('granted')
      },
      (error) => {
        setLocation([])
        setStatus(error.code === error.PERMISSION_DENIED ? 'denied' : 'unavailable')
      },
      { enableHighAccuracy: false, timeout: TIMEOUT_MS, maximumAge: MAXIMUM_AGE_MS }
    )
  }, [supported])

  const reset = useCallback(() => {
    requested.current = false
    setLocation([])
    setStatus('idle')
  }, [])

  return { location, status: supported ? status : 'unavailable', supported, request, reset }
}