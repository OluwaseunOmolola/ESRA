import { useEffect, useRef, useState } from 'react'

export type GeolocationStatus = 'idle' | 'pending' | 'granted' | 'denied' | 'unavailable'

const TIMEOUT_MS = 10000
const MAXIMUM_AGE_MS = 60000

interface GeolocationResult {
  location: number[]
  status: GeolocationStatus
}

export function useGeolocation(enabled: boolean) {
  const supported = typeof navigator !== 'undefined' && 'geolocation' in navigator
  const [result, setResult] = useState<GeolocationResult>({ location: [], status: 'idle' })
  const requested = useRef(false)

  useEffect(() => {
    if (!enabled || !supported || requested.current) return
    requested.current = true

    navigator.geolocation.getCurrentPosition(
      (position) =>
        setResult({
          location: [position.coords.latitude, position.coords.longitude],
          status: 'granted',
        }),
      (error) =>
        setResult({
          location: [],
          status: error.code === error.PERMISSION_DENIED ? 'denied' : 'unavailable',
        }),
      { enableHighAccuracy: false, timeout: TIMEOUT_MS, maximumAge: MAXIMUM_AGE_MS }
    )
  }, [enabled, supported])

  const status: GeolocationStatus = !supported
    ? 'unavailable'
    : result.status === 'idle'
      ? enabled
        ? 'pending'
        : 'idle'
      : result.status

  return { location: result.location, status }
}
