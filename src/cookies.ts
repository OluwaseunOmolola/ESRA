const COOKIE_NAME = 'esra_submitted'
const MAX_AGE_SECONDS = 60 * 60 * 24 * 365

function readCookie(name: string): string | null {
  for (const part of document.cookie.split(';')) {
    const [key, ...rest] = part.trim().split('=')
    if (key === name) return rest.join('=')
  }
  return null
}

function writeCookie(name: string, value: string, maxAge: number) {
  const secure = location.protocol === 'https:' ? '; Secure' : ''
  document.cookie = `${name}=${value}; Path=/; Max-Age=${maxAge}; SameSite=Lax${secure}`
}

export function hasSubmitted(): boolean {
  return readCookie(COOKIE_NAME) === '1'
}

export function markSubmitted(): void {
  writeCookie(COOKIE_NAME, '1', MAX_AGE_SECONDS)
}

export function clearSubmitted(): void {
  writeCookie(COOKIE_NAME, '', 0)
}
